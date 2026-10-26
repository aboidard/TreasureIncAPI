import { Router } from 'express';
import logger from '../../config/logger'
import { respond } from '../../services/engine'
import userService from '../../services/userService'

const router = Router();

// body {cost}: takes the cost from the balance, answers {money}; 402 when the balance is too low
router.post('/user/:publicKey/expedition/', (req, res) => {
    logger.info("request add expedition")
    respond(res, userService.startExpedition(req.params.publicKey, req.get('X-PRIVATE-KEY'), req.body?.cost))
})

export default router
