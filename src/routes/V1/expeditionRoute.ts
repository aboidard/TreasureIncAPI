import { Router } from 'express';
import logger from '../../config/logger'
import { respond } from '../../services/engine'
import userService from '../../services/userService'

const router = Router();

// body {location, caseId, cost}: reveals a case, answers {rarity, money}; 402 when the balance is too low
router.post('/user/:publicKey/expedition/dig/', (req, res) => {
    logger.info("request dig case")
    respond(res, userService.digCase(req.params.publicKey, req.get('X-PRIVATE-KEY'),
        req.body?.location, req.body?.caseId, req.body?.cost))
})

// body {location, difficulty, caseId?}: pays for the expedition, answers {expeditionId, money, itemCount};
// 402 when the balance is too low
router.post('/user/:publicKey/expedition/', (req, res) => {
    logger.info("request add expedition")
    respond(res, userService.startExpedition(req.params.publicKey, req.get('X-PRIVATE-KEY'),
        req.body?.location, req.body?.difficulty, req.body?.caseId))
})

export default router
