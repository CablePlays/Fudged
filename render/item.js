import express from 'express'
import { INVENTORY_ITEMS } from '../server/general.js'

const router = express.Router()

const itemIdRouter = express.Router()

router.use('/', (req, res, next) => {
    const { query } = req
    const { id: itemId } = query

    const item = INVENTORY_ITEMS[itemId]

    if (item == null) {
        res.redirect('/shop')
        return
    }

    req.item = item
    req.itemId = itemId

    next()
}, itemIdRouter)

itemIdRouter.get('/', (req, res) => {
    const { item } = req
    const { placeholders } = res

    const { name, price } = item
    placeholders.name = name
    placeholders.price = price + 'g'

    res.setTitle(`Purchasing ${name}`)
    res.ren('item')
})

itemIdRouter.get('/purchased', (req, res) => {
    const { item } = req
    const { placeholders } = res

    placeholders.item = item.name
    res.ren('item-purchased')
})

export default router