import { Router } from 'express';
import logger from '../../config/logger'
import { respond } from '../../services/engine'
import characterService from '../../services/characterService'

const router = Router();

// The routes below answer the characters of the user:
// [{num, name, rank, stats, skills, combat, level, xp, xpNext, copies, expeditionId, equipment: {"<slot>": item}}].
// expeditionId is null unless the character is on an expedition; the slot numbers are those of the engine README.
const characters = (payload) => payload.characters

router.get('/user/:publicKey/characters/', (req, res) => {
    logger.info("request get characters")
    respond(res, characterService.getCharacters(req.params.publicKey, req.get('X-PRIVATE-KEY')), characters)
})

// body {slot, itemId}: puts an item of the inventory in a slot of the character; 400 when the item does not fit
// the slot, 404 when it is not in the inventory, 409 while the character is on an expedition
router.post('/user/:publicKey/characters/:num/equip/', (req, res) => {
    logger.info("request equip item")
    respond(res, characterService.equipItem(req.params.publicKey, req.get('X-PRIVATE-KEY'),
        parseInt(req.params.num), req.body?.slot, req.body?.itemId), characters)
})

// body {slot}: empties a slot of the character, the item goes back to the inventory; 409 while the character is on
// an expedition
router.post('/user/:publicKey/characters/:num/unequip/', (req, res) => {
    logger.info("request unequip item")
    respond(res, characterService.unequipItem(req.params.publicKey, req.get('X-PRIVATE-KEY'),
        parseInt(req.params.num), req.body?.slot), characters)
})

// the portals the characters are summoned from: [{id, name, cost, currency, multi, rates: [{rank, percent}],
// characters}]; cost is the price of one draw in gems (currency "gems")
router.get('/portals/', (req, res) => {
    logger.info("request get portals")
    respond(res, characterService.getPortals(), (payload) => payload.portals)
})

// body {portal, count}: draws 1 or "multi" characters in the portal, paid in gems, answers {draws, gems, characters}
// where draws is [{num, name, rank, stats, isNew, copies}] in the order they were made and gems the new balance of
// gems; 402 {gems} when the user has not enough gems,
// 404 when the portal does not exist
router.post('/user/:publicKey/recruit/', (req, res) => {
    logger.info("request recruit")
    respond(res, characterService.recruit(req.params.publicKey, req.get('X-PRIVATE-KEY'),
        req.body?.portal, req.body?.count))
})

export default router
