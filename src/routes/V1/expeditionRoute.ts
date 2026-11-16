import { Router } from 'express';
import logger from '../../config/logger'
import { respond } from '../../services/engine'
import userService from '../../services/userService'

const router = Router();

// body {location, caseId, cost}: reveals a case, answers {rarity, money}; 402 when the balance is too low,
// 409 when every character is on an expedition
router.post('/user/:publicKey/expedition/dig/', (req, res) => {
    logger.info("request dig case")
    respond(res, userService.digCase(req.params.publicKey, req.get('X-PRIVATE-KEY'),
        req.body?.location, req.body?.caseId, req.body?.cost))
})

// body {location, difficulty, character, caseId?}: pays for the expedition led by the character (its number),
// answers {expeditionId, character, money, itemCount, xp, run}; 402 when the balance is too low, 409 when the
// character is already on an expedition. run is what happens to the character on the way, decided by the engine:
// {maxHp, floorsCompleted, dead, floors: [{encounters: [{type, position, hp, duration, monster?, fight?}], healed, hpEnd}]}
router.post('/user/:publicKey/expedition/', (req, res) => {
    logger.info("request add expedition")
    respond(res, userService.startExpedition(req.params.publicKey, req.get('X-PRIVATE-KEY'),
        req.body?.location, req.body?.difficulty, req.body?.caseId, req.body?.character))
})

export default router
