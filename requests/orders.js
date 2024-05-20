import express from 'express'
import database, { getDatabase } from '../server/database.js'

const router = express.Router()

router.get('/', (req, res) => {
    const { query } = req
    let { fulfilled, user: userId } = query
    fulfilled = (fulfilled == null) ? null : (fulfilled === 'true')
    userId = parseInt(userId)

    let orders = getDatabase().get(database.PATH_ORDERS) ?? []
    orders = orders.filter(order =>
        (isNaN(userId) || order.userId === userId) && (fulfilled == null || order.fulfilled === fulfilled))

    res.res(200, { orders })
})

export default router