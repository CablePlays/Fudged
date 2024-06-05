import express from 'express'
import database, { getDatabase, getUser, getUserInfo, isUser } from '../../server/database.js'
import { requireAdmin, requireSelf } from '../middleware.js'

import petsRouter from './pets.js'

const router = express.Router()

router.get('/', requireAdmin, (req, res) => {
    const users = getDatabase().get(database.PATH_USERS) ?? {}

    for (let userId in users) {
        users[userId] = getUserInfo(userId, true)
    }

    res.res(200, { users })
})

const userRouter = express.Router()

router.use('/:targetUserId', (req, res, next) => {
    const { params } = req
    let { targetUserId } = params
    targetUserId = parseInt(targetUserId)

    if (!isUser(targetUserId)) {
        res.res(404, 'invalid_user')
        return
    }

    req.targetUserId = targetUserId
    next()
}, userRouter)

userRouter.put('/', requireSelf, (req, res) => {
    const { body, targetUserId } = req
    const { grade, name, phoneNumber, surname } = body

    if (!Number.isInteger(grade) || grade < 1 || grade > 13) {
        res.res(400, 'invalid_grade')
        return
    }

    const db = getUser(targetUserId)

    db.set(database.PATH_USER_GRADE, grade)
    db.set(database.PATH_USER_NAME, name)
    db.set(database.PATH_USER_PHONE_NUMBER, phoneNumber?.trim())
    db.set(database.PATH_USER_SURNAME, surname)

    res.res(204)
})

userRouter.post('/grams', requireAdmin, (req, res) => {
    const { body, targetUserId } = req
    const { amount } = body

    if (!Number.isInteger(amount)) {
        res.res(400, 'invalid_amount')
        return
    }

    const userDb = getUser(targetUserId)
    const grams = userDb.get(database.PATH_USER_GRAMS) ?? 0
    const newGrams = grams + amount

    userDb.set(database.PATH_USER_GRAMS, newGrams)
    res.res(200, { grams: newGrams })
})

userRouter.get('/inventory', requireSelf, (req, res) => {
    const { targetUserId } = req
    const inventory = getUser(targetUserId).get(database.PATH_USER_INVENTORY) ?? {}
    res.res(200, { inventory })
})

userRouter.use('/pets', petsRouter)

export default router