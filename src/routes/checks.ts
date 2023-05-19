import * as dotenv from 'dotenv'
import { Router } from 'express';
import logger from '../config/logger'
import { healthcheck } from '../services/healthcheck'

dotenv.config()
const router = Router();
const version: string = process.env.VERSION as string;

router.get('/version', (req, res) => {
    logger.info("request version")
    res.status(200).send({ version: version })
})

router.get('/healthcheck', (_, res) => {
    healthcheck(version, function (status, message) {
        res.status(status).send(message)
    })
})

export default router