import express from 'express'
import database, { getUser } from '../../server/database.js'
import { INVENTORY_ITEMS } from '../../server/general.js'
import { requireSelf } from '../middleware.js'

const router = express.Router()

router.get('/', requireSelf, (req, res) => {
    const { targetUserId } = req
    const userDb = getUser(targetUserId)
    const pets = userDb.get(database.PATH_USER_PETS) ?? []

    res.res(200, { pets })
})

router.post('/', requireSelf, (req, res) => {
    const { body, targetUserId } = req
    const { itemId } = body

    const item = INVENTORY_ITEMS[itemId]

    if (item == null) {
        res.res(400, 'invalid_item')
        return
    }

    const userDb = getUser(targetUserId)
    const itemPath = `${database.PATH_USER_INVENTORY}.${itemId}`
    const itemAmount = userDb.get(itemPath) ?? 0

    if (itemAmount <= 0) {
        res.res(400, 'insufficient_items')
        return
    }

    userDb.set(itemPath, itemAmount - 1)

    const pets = userDb.get(database.PATH_USER_PETS) ?? []
    pets.push({ id: item.petId })
    userDb.set(database.PATH_USER_PETS, pets)

    res.res(204)
})

export default router