import express from 'express'
import database, { getDatabase } from '../server/database.js'

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

    let orders = getDatabase().get(database.PATH_ORDERS) ?? []
    orders = orders.filter(order =>
        (isNaN(targetUserId) || order.userId === targetUserId) && (fulfilled == null || order.fulfilled === fulfilled))

    res.res(200, { orders })
})

export default router