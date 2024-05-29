import express from 'express'
import cookieParser from 'cookie-parser'
import renderRouter from './render/index.js'
import requestsRouter from './requests/index.js'
// import { createWebhook, deleteWebhook, getWebhooks } from './server/webhook-manager.js'

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
    console.info(`Server listening on port ${PORT}`)
})

class Dog {
    constructor(name, breed) {
        console.log('constructor')
        this.name = name
        this.breed = breed
    }

    bark() {
        console.log('bark!')
    }

    info() {
        return this.name + ' is a ' + this.breed
    }
}

const d = new Dog('Fudge', 'Poodle')
d.bark()
console.log(d.info())