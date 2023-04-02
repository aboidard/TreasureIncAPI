
import express from 'express'
import logger from '../../config/logger'
import Items from '../../models/items'
import itemService from '../../services/itemService'

const router = express.Router();

router.get('/user/:publicKey/items/', (req, res) => {
    logger.info("request get items")
    //let private_key = req.get('X-PRIVATE-KEY')

    Items.get(req.params.publicKey, req.query.page, req.query.limit, function (items) {
        if (items != undefined) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(items.getItemsJson())
        }
        res.status(204).end()
    })
})


router.post('/user/:publicKey/items/', (req, res) => {
    logger.info("request post items")
    if (req.body === undefined || req.body.length === 0) {
        res.status(204).end()
    } else {
        logger.info(`req.body ${req.body}`)
        //Items.post(req.params.publicKey, req.body, function (items) {
        itemService.addItem(req.params.publicKey, req.body.nb, function (payload) {
            if (payload.status == 201) {
                res.setHeader('Content-Type', 'application/json');
                res.status(201).send(payload.items.getItemsJson())
            }
            res.status(payload.status).end(payload.message)
        })
    }
})

router.post('/user/:publicKey/sellitems/', (req, res) => {
    logger.info("request delete items")
    if (req.body === undefined || req.body.length === 0) {
        res.status(204).end()
    } else {
        logger.info(`req.body ${req.body}`)
        Items.delete(req.params.publicKey, req.body, function () {
            res.status(200).send()
            logger.info("request delete items")
        })
    }
})

export default router