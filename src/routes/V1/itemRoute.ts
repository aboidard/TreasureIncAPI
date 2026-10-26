import { Router } from 'express';
import logger from '../../config/logger'
import { respond } from '../../services/engine'
import itemService from '../../services/itemService'

const router = Router();

// JSON array of items; ?page (0-based) & ?limit for one page, every item otherwise
router.get('/user/:publicKey/items/', (req, res) => {
    logger.info("request get items")
    respond(res, itemService.getItems(req.params.publicKey, req.get('X-PRIVATE-KEY'),
        parseInt(req.query.page as string), parseInt(req.query.limit as string)), (payload) => payload.items)
})

// body {nb}: generates nb items, answers 201 with the new items
router.post('/user/:publicKey/items/', (req, res) => {
    logger.info("request post items")
    respond(res, itemService.addItems(req.params.publicKey, req.get('X-PRIVATE-KEY'), req.body?.nb),
        (payload) => payload.items, 201)
})

// body [{id}, ...]: sells the items, answers {totalPrice, money}
router.post('/user/:publicKey/sellitems/', (req, res) => {
    logger.info("request sell items")
    respond(res, itemService.sellItems(req.params.publicKey, req.get('X-PRIVATE-KEY'), req.body))
})

export default router
