import crypto from 'crypto'
import express from 'express'
import { OAuth2Client } from 'google-auth-library'
import getRawBody from 'raw-body'
import cookies from '../server/cookies.js'
import database, { getUser, getUserId, isSigninValid, newUser } from '../server/database.js'
import config from '../config.json' assert { type: "json" }

import ordersRouter from './orders.js'
import purchaseRouter from './purchase.js'
import usersRouter from './users/index.js'

const router = express.Router()

const authClient = new OAuth2Client()

router.use('/', (req, res, next) => { // provide response method
    res.res = (responseCode, extra) => {
        if (extra == null) {
            res.sendStatus(responseCode)
        } else if (typeof extra === 'string') {
            res.status(responseCode).json({ error: extra })
        } else if (typeof extra === 'object') {
            res.status(responseCode).json(extra)
        } else {
            throw new Error('Invalid type of extra: ' + typeof extra)
        }
    }

    next()
})

router.use('/', (req, res, next) => { // handle body
    const { headers } = req

    getRawBody(req, {
        length: headers['content-length'],
        encoding: 'utf-8'
    }, (err, rawBody) => {
        if (err) {
            next(err)
            return
        }

        req.rawBody = rawBody

        if (headers['content-type'] === 'application/json') {
            req.body = JSON.parse(rawBody)
        }

        next()
    })
})

router.use('/', (req, res, next) => { // provide user information
    if (isSigninValid(req)) {
        req.signedIn = true
        req.userId = cookies.getUserId(req)
        req.admin = (req.userId === config.adminUserId)
    } else {
        req.signedIn = false
    }

    next()
})

router.put('/handle-signin', async (req, res) => {
    const { token } = req.body
    let ticket

    try {
        ticket = await authClient.verifyIdToken({
            idToken: token,
            audience: '641450297486-vpsfada80jv9t99aq9ec6sv5iiafujr6.apps.googleusercontent.com'
        })
    } catch (error) {
        console.warn('Invalid JWT: ' + error.message)
        res.res(500)
        return
    }

    const { email, given_name, family_name, picture } = ticket.getPayload()
    let userId = getUserId(email)
    let isNewUser = false

    if (userId == null) {
        userId = newUser(email)
        isNewUser = true
    }

    const userDb = getUser(userId)
    userDb.set(database.PATH_USER_PICTURE, picture)

    if (isNewUser) {
        userDb.set(database.PATH_USER_NAME, given_name)
        userDb.set(database.PATH_USER_SURNAME, family_name)
    }

    let sessionToken = userDb.get(database.PATH_USER_SESSION_TOKEN)

    if (!sessionToken) {
        sessionToken = crypto.randomBytes(8).toString('hex')
        userDb.set(database.PATH_USER_SESSION_TOKEN, sessionToken)
    }

    res.cookie(cookies.COOKIE_USER, userId)
    res.cookie(cookies.COOKIE_SESSION_TOEN, sessionToken)
    res.res(200, { newUser: isNewUser })
})

router.use('/orders', ordersRouter)
router.use('/purchase', purchaseRouter)
router.use('/users', usersRouter)

router.use('/', (req, res) => { // not found
    res.res(404)
})

export default router