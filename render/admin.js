import createError from 'http-errors'
import express from 'express'
import database, { getDatabase, getUser, getUserInfo, isUser } from '../server/database.js'

const router = express.Router()

router.use('/', (req, res, next) => {
    const { admin } = req

    if (admin) {
        res.setTitleAdmin = title => res.setTitle(`${title} - Admin`)
        next()
    } else {
        next(createError(403))
    }
})

router.get('/', (req, res) => {
    res.setTitle('Admin')
    res.ren('admin/admin')
})

router.get('/create-order', (req, res) => {
    res.setTitleAdmin('Create Order')
    res.ren('admin/create-order')
})

router.get('/general', (req, res) => {
    const { placeholders } = res

    placeholders.massSold = getDatabase().get(database.PATH_MASS_SOLD) ?? 0

    res.setTitleAdmin('General')
    res.ren('admin/general')
})

router.get('/orders', (req, res) => {
    res.setTitleAdmin('Orders')
    res.ren('admin/orders')
})

router.get('/users', (req, res) => {
    res.setTitleAdmin('Users')
    res.ren('admin/users')
})

router.get('/users/:userId', (req, res) => {
    const { params } = req
    const { placeholders } = res
    let { userId } = params
    userId = parseInt(userId)

    if (!isUser(userId)) {
        res.setTitleAdmin('User - Not Found')
        res.send('Invalid user: ' + userId)
        return
    }

    const userInfo = getUserInfo(userId)
    const userName = `${userInfo.name} ${userInfo.surname}`

    placeholders.userName = userName
    placeholders.grams = getUser(userId).get(database.PATH_USER_GRAMS) ?? 0
    res.setTitleAdmin(`User - ${userName}`)
    res.ren('admin/user')
})

export default router