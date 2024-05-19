import express from 'express'
import cookieParser from 'cookie-parser'
import renderRouter from './render/index.js'
import requestsRouter from './requests/index.js'

const PORT = 80
const REQUESTS_PATH = '/requests'

const app = express()

app.set('views', 'views')
app.set('view engine', 'pug')
app.use(cookieParser())

app.use('/', express.static('public'))

app.use(REQUESTS_PATH, (req, res, next) => {
    setTimeout(next, 200)
}, requestsRouter)
app.use('/', express.json(), renderRouter)

app.listen(PORT, () => {
    console.info(`Listening on port ${PORT}`)
})

import temp from './server/temp.js'