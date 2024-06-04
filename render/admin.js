import createError from 'http-errors'
import express from 'express'

const router = express.Router()

router.use('/', (req, res, next) => {
    const { admin } = req

    if (admin) {
        next()
    } else {
        next(createError(403))
    }
})

router.get('/', (req, res) => {
    res.setTitle('Admin')
    res.ren('admin/admin')
})

router.get('/create-order', (req, res) => {
    res.setTitle('Create Order')
    res.ren('admin/create-order')
})

router.get('/orders', (req, res) => {
    res.setTitle('Orders')
    res.ren('admin/orders')
})

router.get('/users', (req, res) => {
    res.setTitle('Users')
    res.ren('admin/users')
})

export default router