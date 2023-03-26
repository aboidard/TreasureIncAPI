import express from 'express'

import logger from '../../config/logger'
import Expedition from '../../models/expedition'

const router = express.Router();

router.post('/user/:publicKey/expedition/', (req, res) => {
    logger.info("request add expedition")
    if (req.body === undefined || req.body.length === 0) {
        res.status(204).end()
    } else {
        logger.info(`req.body ${req.body}`)
        Expedition.create(req.params.publicKey, req.body, function () {
            res.status(200).send()
        })
    }
})

export default router