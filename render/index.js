import express from 'express'
import cookies from '../server/cookies.js'
import database, { getDatabase, getUser, getUserInfo, isSigninValid } from '../server/database.js'
import { requireSignedIn } from './middleware.js'
import { ITEMS } from '../server/general.js'

import itemRouter from './item.js'

const router = express.Router()

router.use('/', (req, res, next) => { // verify signin
    if (cookies.isSignedIn(req) && !isSigninValid(req)) {
        cookies.signOut(res)
        res.redirect('/')
    } else {
        next()
    }
})

async function advancedRender(req, res, path, statusCode = 200) {
    const { placeholders, title } = res
    const userId = cookies.getUserId(req)
    const signedIn = cookies.isSignedIn(req)

    /* Placeholders */

    placeholders.title = title

    const generateDisplays = condition => {
        return {
            block: (condition ? "block" : "none"),
            flex: (condition ? "flex" : "none"),
            inlineBlock: (condition ? "inline-block" : "none")
        }
    }

    const displays = {
        signedIn: {
            false: generateDisplays(!signedIn),
            true: generateDisplays(signedIn)
        }
    }

    placeholders.displays = displays
    placeholders.user = (userId == null) ? {} : getUserInfo(userId, true)

    res.status(statusCode).render(path, placeholders)
}

router.use('/', (req, res, next) => { // provide advanced render, placeholders & titles related
    res.placeholders = {}
    res.placeholders.loading = 'Loading...'

    const defaultTitle = 'Dogwave Fudge'
    res.title = defaultTitle
    res.setTitle = title => res.title = `${title} | ${defaultTitle}`

    res.ren = (path, statusCode) => advancedRender(req, res, path, statusCode)
    next()
})

router.use('/', (req, res, next) => { // provide user information
    if (isSigninValid(req)) {
        req.signedIn = true
        req.userId = cookies.getUserId(req)
    } else {
        req.signedIn = false
    }

    next()
})

router.get('/', (req, res) => {
    const { placeholders } = res
    placeholders.massSold = ((getDatabase().get(database.PATH_MASS_SOLD) ?? 0) / 1000).toFixed(2)

    res.setTitle('Home')
    res.ren('home')
})

router.get('/checkout/:itemId', requireSignedIn, (req, res) => {
    const { params } = req
    const { placeholders } = res
    const { itemId } = params

    const item = ITEMS[itemId]

    if (item == null) {
        res.redirect('/shop')
        return
    }

    placeholders.item = item.name

    res.setTitle('Checkout')
    res.ren('checkout')
})

router.get('/details', requireSignedIn, (req, res) => {
    res.setTitle('Details')
    res.ren('details')
})

router.get('/orders', requireSignedIn, (req, res) => {
    res.setTitle('Orders')
    res.ren('orders')
})

router.get('/pets', requireSignedIn, (req, res) => {
    res.setTitle('Pets')
    res.ren('pets')
})

router.get('/privacy-policy', requireSignedIn, (req, res) => {
    res.setTitle('Privacy Policy')
    res.ren('privacy-policy')
})

router.get('/shop', (req, res) => {
    res.setTitle('Shop')
    res.ren('shop')
})

router.get('/signin', (req, res) => {
    res.setTitle('Signin')
    res.ren('signin')
})

router.get('/tab', requireSignedIn, (req, res) => {
    const { userId } = req
    const { placeholders } = res

    const tab = getUser(userId).get(database.PATH_USER_TAB) ?? 0
    placeholders.tab = tab.toFixed(2)
    placeholders.buttonDisplay = tab > 0 ? 'block' : 'none'
    placeholders.infoDisplay = tab > 0 ? 'none' : 'block'

    res.setTitle('Tab')
    res.ren('tab')
})

router.use('/item', itemRouter)

router.use('/', (req, res) => {
    res.setTitle('404')
    res.ren('errors/not-found')
})

export default router