import { Router } from 'express';
import logger from '../../config/logger'
import { respond } from '../../services/engine'
import itemService from '../../services/itemService'

const router = Router();

// JSON array of the items of the inventory (those equipped on a character are left out); ?page (0-based) & ?limit
// for one page, every item otherwise. An equipable item has its "stats": {slot, for, con, luk, spe1...}
router.get('/user/:publicKey/items/', (req, res) => {
    logger.info("request get items")
    respond(res, itemService.getItems(req.params.publicKey, req.get('X-PRIVATE-KEY'),
        parseInt(req.query.page as string), parseInt(req.query.limit as string)), (payload) => payload.items)
})

// body {expeditionId}: opens the chest of the expedition, answers 201 with {items, xp}: the new items and what the
// expedition brought to its character (null when nobody led it); 404 once it is opened
router.post('/user/:publicKey/items/', (req, res) => {
    logger.info("request post items")
    respond(res, itemService.addItems(req.params.publicKey, req.get('X-PRIVATE-KEY'), req.body?.expeditionId),
        (payload) => ({ items: payload.items, xp: payload.xp ?? null }), 201)
})

// body [{id}, ...]: sells the items, answers {totalPrice, money}
router.post('/user/:publicKey/sellitems/', (req, res) => {
    logger.info("request sell items")
    respond(res, itemService.sellItems(req.params.publicKey, req.get('X-PRIVATE-KEY'), req.body))
})

export default router
