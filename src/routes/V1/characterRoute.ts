import { Router } from 'express';
import logger from '../../config/logger'
import { respond } from '../../services/engine'
import characterService from '../../services/characterService'

const router = Router();

// Every route answers the characters of the user: [{num, expeditionId, equipment: {"<slot>": item}}].
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

export default router
