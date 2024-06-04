import express from 'express'
import database, { getDatabase, getUser, getUserInfo, isUser } from '../server/database.js'
import { ITEMS, createOrder } from '../server/general.js'
import { requireAdmin } from './middleware.js'

const router = express.Router()

router.get('/', (req, res) => {
    const { admin, query, userId } = req
    let { fulfilled, user: targetUserId } = query
    fulfilled = (fulfilled == null) ? null : (fulfilled === 'true')
    targetUserId = parseInt(targetUserId)

    if (!admin && targetUserId !== userId) {
        res.res(400, 'not_self')
        return
    }

    const ordersObj = getDatabase().get(database.PATH_ORDERS) ?? {}
    let orders = []

    for (let orderId in ordersObj) {
        orders.push({ id: parseInt(orderId), ...ordersObj[orderId] })
    }

    orders = orders.filter(order =>
        (isNaN(targetUserId) || order.userId === targetUserId) && (fulfilled == null || order.fulfilled === fulfilled))
    orders.forEach(order => order.userInfo = getUserInfo(order.userId, true))

    res.res(200, { orders })
})

router.post('/', requireAdmin, (req, res) => {
    const { body } = req
    const { userId, itemId, quantity, fulfilled, tab, reward } = body

    if (!isUser(userId)) {
        res.res(400, 'invalid_user')
        return
    }

    const item = ITEMS[itemId]

    if (item == null) {
        res.res(400, 'invalid_item')
        return
    }
    if (!Number.isInteger(parseInt(quantity)) || quantity < 1 || quantity > item.max) {
        res.res(400, 'invalid_quantity')
        return
    }
    if (typeof fulfilled !== 'boolean' || typeof tab !== 'boolean' || typeof reward !== 'boolean') {
        res.res(400)
        return
    }

    createOrder(userId, itemId, quantity, tab ? 'tab' : 'offline', { fulfilled, reward })

    if (tab) {
        const totalPrice = item.price * quantity
        const userDb = getUser(userId)
        const tab = userDb.get(database.PATH_USER_TAB) ?? 0
        userDb.set(database.PATH_USER_TAB, tab + totalPrice)
    }

    res.res(204)
})

const orderRouter = express.Router()

router.use('/:orderId', (req, res, next) => {
    const { params } = req
    const { orderId } = params

    const orders = getDatabase().get(database.PATH_ORDERS) ?? {}
    const order = orders[orderId]

    if (order == null) {
        res.res(400, 'invalid_order')
    } else {
        req.orderId = orderId
        next()
    }
}, orderRouter)

orderRouter.put('/', (req, res) => {
    const { body, orderId } = req
    const { fulfilled } = body

    if (typeof fulfilled !== 'boolean') {
        res.res(400, 'fulfilled_invalid')
        return
    }

    getDatabase().set(`${database.PATH_ORDERS}.${orderId}.fulfilled`, fulfilled)
    res.res(204)
})

export default router