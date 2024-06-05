import { FSDB } from 'file-system-db'
import fs from 'fs'
import path from 'path'
import cookies from './cookies.js'

const DIRECTORY = "./database"
const USER_DIRECTORY = path.join(DIRECTORY, "users")
const compact = process.env.NODE_ENV !== 'development'

/* Database */

const PATH_MASS_SOLD = 'massSold'
const PATH_ORDERS = 'orders'
const PATH_USERS = 'users'

export function getDatabase() {
    return new FSDB(path.join(DIRECTORY, 'database.json'), compact)
}

export function getUserId(email) {
    const users = getDatabase().get(PATH_USERS) ?? {}

    for (let userId in users) {
        if (users[userId] === email) {
            return parseInt(userId)
        }
    }

    return null
}

export function isUser(userId) {
    return Number.isInteger(userId) && getDatabase().has(PATH_USERS + '.' + userId)
}

function getNextUserId() {
    const users = getDatabase().get(PATH_USERS) ?? {}
    let biggestId = -1

    for (let userId in users) {
        userId = parseInt(userId)

        if (userId > biggestId) {
            biggestId = userId
        }
    }

    return biggestId + 1
}

export function newUser(email) {
    const userId = getNextUserId()
    getDatabase().set(PATH_USERS + '.' + userId, email)
    return userId
}

/* Users */

const PATH_USER_GRADE = 'grade'
const PATH_USER_GRAMS = 'grams'
const PATH_USER_INVENTORY = 'inventory'
const PATH_USER_NAME = 'name'
const PATH_USER_PETS = 'pets'
const PATH_USER_PHONE_NUMBER = 'phoneNumber'
const PATH_USER_PICTURE = 'picture'
const PATH_USER_SESSION_TOKEN = 'sessionToken'
const PATH_USER_SURNAME = 'surname'
const PATH_USER_TAB = 'tab'

const USER_FILE_PREFIX = 'user'

function getUserFileName(userId) {
    return USER_FILE_PREFIX + userId
}

export function getUser(userId) {
    return new FSDB(path.join(USER_DIRECTORY, getUserFileName(userId)), compact)
}

export function getUserInfo(userId, includePrivate = false) {
    const db = getUser(userId)

    const userInfo = {
        id: userId,
        grade: db.get(PATH_USER_GRADE),
        name: db.get(PATH_USER_NAME),
        picture: db.get(PATH_USER_PICTURE),
        surname: db.get(PATH_USER_SURNAME)
    }

    if (includePrivate) {
        userInfo.grams = db.get(PATH_USER_GRAMS) ?? 0
        userInfo.phoneNumber = db.get(PATH_USER_PHONE_NUMBER)
    }

    return userInfo
}

export function isSigninValid(req) {
    const userId = cookies.getUserId(req)
    return userId != null && isUser(userId) && (cookies.getSessionToken(req) === getUser(userId).get(PATH_USER_SESSION_TOKEN))
}

export async function forEachUser(consumer) {
    await new Promise(r => fs.readdir(USER_DIRECTORY, async (error, files) => {
        if (error) {
            console.error(error)
        } else {
            const asyncTasks = []

            for (let fileName of files) {
                const userId = parseInt(fileName.substring(USER_FILE_PREFIX.length, fileName.length - '.json'.length))
                const db = new FSDB(path.join(USER_DIRECTORY, fileName), compact)
                const promise = consumer(userId, db)

                if (promise instanceof Promise) {
                    asyncTasks.push(promise)
                }
            }

            if (asyncTasks.length > 0) {
                await Promise.all(asyncTasks)
            }
        }

        r()
    }))
}

export default {
    PATH_MASS_SOLD,
    PATH_ORDERS,
    PATH_USERS,

    PATH_USER_GRADE,
    PATH_USER_GRAMS,
    PATH_USER_INVENTORY,
    PATH_USER_NAME,
    PATH_USER_PETS,
    PATH_USER_PHONE_NUMBER,
    PATH_USER_PICTURE,
    PATH_USER_SESSION_TOKEN,
    PATH_USER_SURNAME,
    PATH_USER_TAB
}