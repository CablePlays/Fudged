import express from 'express'
import cookieParser from 'cookie-parser'
import renderRouter from './render/index.js'
import requestsRouter from './requests/index.js'

const PORT = 4000
const REQUESTS_PATH = '/requests'

const app = express()

app.set('view engine', 'pug')
app.set('views', 'views')
app.use(cookieParser())

app.use('/', express.static('public'))

app.use(REQUESTS_PATH, requestsRouter)
app.use('/', express.json(), renderRouter)

app.listen(PORT, () => {
    console.info(`Server listning on port ${PORT}`)
})