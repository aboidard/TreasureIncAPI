
import { Router } from 'express';
import logger from '../../config/logger'
import Items from '../../models/items'
import itemService from '../../services/itemService'

const router = Router();

router.get('/user/:publicKey/items/', (req, res) => {
    logger.info("request get items")
    //let private_key = req.get('X-PRIVATE-KEY')

    Items.get(req.params.publicKey as string, parseInt(req.query.page as string), parseInt(req.query.limit as string), function (items) {
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
        res.status(204).end();
        return;
    }
    logger.info(`req.body ${req.body}`);
    itemService.addItem(req.params.publicKey, req.body.nb, function (result) {
        if (result.status == 201) {
            res.setHeader('Content-Type', 'application/json');
            res.status(201).send(result.payload.items);
        } else {
            res.status(result.status).end(result.message);
        }
    })
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