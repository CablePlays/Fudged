import cookieParser from 'cookie-parser'
import express from 'express'

import apiRouter from './api/index.js'
import cookies from './server/cookies.js'
import renderRouter from './render/index.js'
import requestsRouter from './requests/index.js'
import { isSigninValid } from './server/database.js'
import { isAdmin } from './server/general.js'
import { createWebhook, deleteWebhook, getWebhooks } from './server/webhook-manager.js'
import config from './config.json' assert { type: 'json' }

const PORT = 4000
const REQUESTS_PATH = '/requests'

const app = express()

app.set('view engine', 'pug')
app.set('views', 'views')
app.use(cookieParser())

app.use('/', express.static('public'))
app.use('/robots.txt', express.static('robots.txt'))
app.use('/sitemap.xml', express.static('sitemap.xml'))

app.use('/', (req, res, next) => { // provide user information
    if (isSigninValid(req)) {
        req.signedIn = true
        req.userId = cookies.getUserId(req)
        req.admin = isAdmin(req.userId)
    } else {
        req.signedIn = false
        req.admin = false
    }

    next()
})

if (process.env.NODE_ENV === 'development') { // artificial latency
    app.use(REQUESTS_PATH, (req, res, next) => {
        setTimeout(next, 500)
    })
}

app.use(REQUESTS_PATH, requestsRouter)
app.use('/api', express.json(), apiRouter)
app.use('/', express.json(), renderRouter)

app.listen(PORT, () => {
    console.info(`Server listening on port ${PORT}`)
})