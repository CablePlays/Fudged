import express from 'express'
import cookieParser from 'cookie-parser'
import renderRouter from './render/index.js'
import requestsRouter from './requests/index.js'
import { getUser } from './server/database.js'

const PORT = 80
const REQUESTS_PATH = '/requests'

const app = express()

app.set('views', 'views')
app.set('view engine', 'pug')
app.use(express.json())
app.use(cookieParser())

app.use('/', express.static('public'))

app.use('/', (req, res, next) => {
    const { hostname } = req

    console.log(hostname)

    next()
})

app.use(REQUESTS_PATH, (req, res, next) => {
    setTimeout(next, 200)
}, requestsRouter)
app.use('/', renderRouter)

app.listen(PORT, () => {
    console.info(`Listening on port ${PORT}`)
})

// fetch('https://payments.yoco.com/api/webhooks', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer sk_test_e72ab711V44x34Qb8b74cc480de3'
//     },
//     body: JSON.stringify({
//         name: 'webtest',
//         url: 'https://eoplxf93d5h24go.m.pipedream.net'
//     })
// }).then(res => console.log(res.status))

// fetch('https://payments.yoco.com/api/checkouts', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer sk_test_e72ab711V44x34Qb8b74cc480de3'
//     },
//     body: JSON.stringify({
//         amount: 1200,
//         currency: 'ZAR',
//         cancelUrl: 'http://localhost/pay/cancel',
//         successUrl: 'http://localhost/pay/success',
//         failureUrl: 'http://localhost/pay/failure',
//         totalDiscount: 150,
//         totalTaxAmount: 200,
//         subtotalAmount: 1150,
//         metadata: {
//             a: 'testdata'
//         }
//     })
// }).then(res => res.json()).then(data => console.log(data))