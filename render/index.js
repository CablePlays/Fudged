import express from 'express'
import cookies from '../server/cookies.js'
import { isSigninValid, getUserInfo } from '../server/database.js'
import { requireSignedIn } from './middleware.js'

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
    placeholders.user = (userId == null) ? {} : getUserInfo(userId)

    res.status(statusCode).render(path, placeholders)
}

router.use('/', (req, res, next) => { // provide advanced render, placeholders & titles related
    res.placeholders = {}

    const defaultTitle = 'Dogwave Fudge'
    res.title = defaultTitle
    res.setTitle = title => res.title = `${title} | ${defaultTitle}`

    res.ren = (path, statusCode) => advancedRender(req, res, path, statusCode)
    next()
})

router.get('/', (req, res) => {
    res.setTitle('Home')
    res.ren('home')
})

router.get('/account', requireSignedIn, (req, res) => {
    res.setTitle('Account')
    res.ren('account')
})

router.get('/checkout/:itemId', (req, res) => {
    const { params } = req
    const { placeholders } = res
    const itemId = parseInt(params.itemId)

    if (![0, 1, 2].includes(itemId)) {
        res.redirect('/shop')
        return
    }

    placeholders.item = ['Packet', 'Jar', 'Batch'][itemId]

    res.setTitle('Checkout')
    res.ren('checkout')
})

router.get('/pets', requireSignedIn, (req, res) => {
    res.setTitle('Pets')
    res.ren('pets')
})

router.get('/shop', (req, res) => {
    res.setTitle('Shop')
    res.ren('shop')
})

router.get('/signin', (req, res) => {
    res.setTitle('Signin')
    res.ren('signin')
})

export default router