import { Router } from 'express';
import logger from '../../config/logger'
import { respond } from '../../services/engine'
import userService from '../../services/userService';

const router = Router();

router.get('/login/:publicKey', (req, res) => {
    logger.info(`request login ${req.params.publicKey}`)
    respond(res, userService.login(req.params.publicKey, req.get('X-PRIVATE-KEY')), (payload) => payload.user)
})

router.get('/user/create/', (req, res) => {
    logger.info("request get new user")
    respond(res, userService.createUser(), (payload) => payload.user)
})

export default router
