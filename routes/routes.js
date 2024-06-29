import express from 'express'
import productRoutes from './products.routes.js'

export function routerApi (app) {
    const router = express.Router()
    app.use('/api/v1', router)
    router.use('/products', productRoutes)
}