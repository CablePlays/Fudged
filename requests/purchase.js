import crypto from 'crypto'
import express from 'express'
import config from '../config.json' assert { type: 'json' }
import { requireSignedIn } from './middleware.js'
import database, { getDatabase, getUser, isUser } from '../server/database.js'
import { ITEMS } from '../server/general.js'

const router = express.Router()

router.post('/', requireSignedIn, async (req, res) => {
    const { body, userId } = req
    const { itemId, quantity } = body

    if (![0, 1, 2].includes(itemId)) {
        res.res(400, 'invalid_item_id')
        return
    }

    const { max, name, price } = ITEMS[itemId]

    if (quantity < 1 || quantity > max) {
        res.res(400, 'invalid_quantity')
        return
    }

    const totalPrice = price * quantity * 100
    const { redirectUrl } = await fetch('https://payments.yoco.com/api/checkouts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.yocoPrivateKey}`
        },
        body: JSON.stringify({
            amount: totalPrice,
            currency: 'ZAR',
            cancelUrl: 'http://localhost/pay/cancel',
            successUrl: 'http://localhost/pay/success',
            failureUrl: 'http://localhost/pay/failure',
            lineItems: [
                {
                    displayName: name,
                    quantity,
                    pricingDetails: {
                        price: price * 100
                    }
                }
            ],
            metadata: {
                itemId,
                quantity,
                userId
            }
        })
    }).then(res => res.json())

    res.res(200, { url: redirectUrl })
})

function addPurchase(userId, itemId, quantity) {
    const db = getDatabase()
    const userDb = getUser(userId)

    const orders = db.get(database.PATH_ORDERS) ?? []
    const { mass, price } = ITEMS[itemId]

    // order

    let lastId = -1

    for (let order of orders) {
        if (order.id > lastId) {
            lastId = order.id
        }
    }

    orders.push({
        id: lastId + 1,
        userId,
        date: new Date().toLocaleDateString(),
        itemId,
        quantity,
        itemPrice: price,
        fulfilled: false
    })

    db.set(database.PATH_ORDERS, orders)

    // mass

    const totalMass = mass * quantity
    db.set(database.PATH_MASS_SOLD, db.get((database.PATH_MASS_SOLD) ?? 0) + totalMass)
    userDb.set(database.PATH_USER_GRAMS, (userDb.get(database.PATH_USER_GRAMS) ?? 0) + totalMass)
}

router.post('/yoco-webhook', (req, res) => {
    const { body, headers, rawBody } = req
    const { itemId, quantity, userId } = body.payload.metadata

    const id = headers['webhook-id']
    const timestamp = headers['webhook-timestamp']

    if (Date.now() - parseInt(timestamp) > 3 * 60) {
        // possible replay attack
        res.res(401)
        return
    }

    const signedContent = `${id}.${timestamp}.${rawBody}`
    const secretBytes = Buffer.from(secret.split('_')[1], 'base64')

    const expectedSignature = crypto
        .createHmac('sha256', secretBytes)
        .update(signedContent)
        .digest('base64')

    const signature = headers['webhook-signature'].split(' ')[0].split(',')[1]

    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) {
        // invalid origin
        res.send(403)
        return
    }

    // handle purchase

    if (!isUser(userId)) {
        res.res(204)
        return
    }

    addPurchase(userId, itemId, quantity)
    res.res(204)
})

export default router