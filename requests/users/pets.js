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

    if (item == null || item.petId == null) {
        res.res(400, 'invalid_item')
        return
    }

    const { petId: petTypeId } = item

    const userDb = getUser(targetUserId)
    const itemPath = `${database.PATH_USER_INVENTORY}.${itemId}`
    const itemAmount = userDb.get(itemPath) ?? 0

    if (itemAmount <= 0) {
        res.res(403, 'insufficient_items')
        return
    }

    userDb.set(itemPath, itemAmount - 1)

    const pets = userDb.get(database.PATH_USER_PETS) ?? {}
    const instanceIds = Object.keys(pets)
    let petInstanceId

    for (let i = 0; true; i++) {
        if (!instanceIds.includes(i + '')) {
            petInstanceId = i
            break
        }
    }

    pets[petInstanceId] = { id: petTypeId }
    userDb.set(database.PATH_USER_PETS, pets)

    res.res(200, { id: petInstanceId })
})

router.post('/:petId/age', requireSelf, (req, res) => {
    const { body, params, targetUserId } = req
    const { itemId } = body
    const { petId } = params

    const userDb = getUser(targetUserId)
    const pets = userDb.get(database.PATH_USER_PETS) ?? {}
    const pet = pets[petId]

    if (pet == null) {
        res.res(404, 'invalid_pet')
        return
    }

    const item = INVENTORY_ITEMS[itemId]

    if (item == null || item.food == null) {
        res.res(400, 'invalid_item')
        return
    }

    const path = `${database.PATH_USER_INVENTORY}.${itemId}`
    const amount = userDb.get(path)

    if (amount <= 0) {
        res.res(403, 'insufficient_items')
        return
    }

    userDb.set(path, amount - 1)
    const { age = 0 } = pet
    pet.age = Math.min(age + item.food, 100)
    userDb.set(`${database.PATH_USER_PETS}.${petId}`, pet)

    res.res(204)
})

export default router