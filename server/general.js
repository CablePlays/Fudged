import database, { getDatabase, getUser } from "./database.js"

export const INVENTORY_ITEMS = {
    basicDogFood: {
        food: 10,
        name: 'Basic Dog Food',
        price: 35
    },
    brownEgg: {
        name: 'Brown Egg',
        petId: 'brownDog',
        price: 150
    },
    buffedDogFood: {
        food: 20,
        name: 'Buffed Dog Food',
        price: 65
    },
    primeDogFood: {
        food: 30,
        name: 'Prime Dog Food',
        price: 95
    },
    whiteEgg: {
        name: 'White Egg',
        petId: 'whiteDog',
        price: 150
    }
}

export const ITEMS = {
    batch: {
        mass: 1500,
        max: 1,
        name: 'Batch',
        price: 200
    },
    jar: {
        mass: 1000,
        max: 2,
        name: 'Jar',
        price: 100
    },
    packet: {
        mass: 50,
        max: 20,
        name: 'Packet',
        price: 12
    }
}

export function createOrder(userId, itemId, quantity, rewardGrams) {
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
    db.set(database.PATH_MASS_SOLD, (db.get(database.PATH_MASS_SOLD) ?? 0) + totalMass)

    if (rewardGrams) {
        userDb.set(database.PATH_USER_GRAMS, (userDb.get(database.PATH_USER_GRAMS) ?? 0) + totalMass)
    }
}