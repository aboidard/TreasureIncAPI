import { Router } from 'express';
import logger from '../../config/logger'
import { respond } from '../../services/engine'
import giftService from '../../services/giftService'

const router = Router();

// the gift box of the user, the latest gifts first: {count, gifts: [{id, title, reward: {money, gems, items, rarity},
// createdAt, expiresAt}]}; count is how many gifts wait, rarity and expiresAt may be null.
// The gifts are sent by Maestro (POST /admin/gifts): the API cannot send any.
router.get('/user/:publicKey/gifts/', (req, res) => {
    logger.info("request get gifts")
    respond(res, giftService.getGifts(req.params.publicKey, req.get('X-PRIVATE-KEY')))
})

// takes a gift, answers {gift, title, money, gems, reward: {money, gems, items: [item]}, gifts} where money and gems
// are the new balances and gifts what is left in the box (as above); 404 when the gift is not one of the user's,
// 409 when it was already taken, 410 when it has expired
router.post('/user/:publicKey/gifts/:gift/claim/', (req, res) => {
    logger.info("request claim gift")
    const gift = /^\d+$/.test(req.params.gift) ? parseInt(req.params.gift) : -1
    respond(res, giftService.claimGift(req.params.publicKey, req.get('X-PRIVATE-KEY'), gift))
})

export default router
