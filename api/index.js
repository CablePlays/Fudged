import express from 'express'
import database, { getDatabase } from '../server/database.js'

const router = express.Router()

router.get('/stats', (req, res) => {
    const db = getDatabase()
    const ordersObj = db.get(database.PATH_ORDERS) ?? {}
    let orderCount = 0

    for (let orderId in ordersObj) {
        const order = ordersObj[orderId]

        if (!order.fulfilled) {
            orderCount++
        }
    }

    const massSold = db.get(database.PATH_MASS_SOLD) ?? 0

    res.json({ massSold, orderCount })
})

export default router