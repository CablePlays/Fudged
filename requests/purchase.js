import crypto from 'crypto'
import express from 'express'
import config from '../config.json' assert { type: 'json' }
import { requireSignedIn } from './middleware.js'
import database, { getUser, isUser } from '../server/database.js'
import { INVENTORY_ITEMS, ITEMS, createOrder } from '../server/general.js'

const router = express.Router()

router.post('/', requireSignedIn, async (req, res) => {
    const { body, userId } = req
    const { itemId, quantity } = body

    const item = ITEMS[itemId]

    if (item == null) {
        res.res(400, 'invalid_item_id')
        return
    }

    const { max, name, price } = item

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > max) {
        res.res(400, 'invalid_quantity')
        return
    }

    const totalPrice = price * quantity * 100
    const completedUrl = `${config.host}/orders`
    const response = await fetch('https://payments.yoco.com/api/checkouts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.yocoPrivateKey}`
        },
        body: JSON.stringify({
            amount: totalPrice,
            currency: 'ZAR',
            cancelUrl: completedUrl,
            successUrl: completedUrl,
            failureUrl: completedUrl,
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
    })

    if (!response.ok) {
        res.res(500)
        return
    }

    const { redirectUrl } = await response.json()
    res.res(200, { url: redirectUrl })
})

router.post('/yoco-webhook', (req, res) => {
    const { body, headers, rawBody } = req
    const { itemId, quantity, userId } = body.payload.metadata

    const id = headers['webhook-id']
    const timestamp = headers['webhook-timestamp']

    if (Date.now() - parseInt(timestamp) * 1000 > 3 * 60 * 1000) {
        // possible replay attack
        res.res(401)
        return
    }

    const signedContent = `${id}.${timestamp}.${rawBody}`
    const secretBytes = Buffer.from(config.webhookSecret.split('_')[1], 'base64')

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

    createOrder(userId, itemId, quantity, 'online', { reward: true })
    res.res(204)
})

router.post('/inventory', requireSignedIn, (req, res) => {
    const { body, userId } = req
    const { itemId } = body

    const item = INVENTORY_ITEMS[itemId]

    if (item == null) {
        res.res(400, 'invalid_item')
        return
    }

    const { price } = item
    const userDb = getUser(userId)
    const balance = userDb.get(database.PATH_USER_GRAMS) ?? 0

    if (balance < price) {
        res.res(401, 'insufficient_balance')
        return
    }

    userDb.set(database.PATH_USER_GRAMS, balance - price)

    const path = `${database.PATH_USER_INVENTORY}.${itemId}`
    const currentQuantity = userDb.get(path) ?? 0
    userDb.set(path, currentQuantity + 1)

    res.res(204)
})

export default router