import { Router } from 'express';
import logger from '../../config/logger'
import User from '../../models/user'

const router = Router();

router.get('/login/:publicKey', (req, res) => {

    let private_key = req.get('X-PRIVATE-KEY')

    logger.info(`request login ${req.params.publicKey} ${private_key}`)

    User.get(req.params.publicKey, private_key as string, function (user) {
        if (user != undefined) {
            res.status(200).send(user.getUserJson())
        }
        res.status(404).end()
    })
})

router.get('/users', (req, res) => {

    //let private_key = req.get('X-PRIVATE-KEY')

    logger.info(`request users`)

    User.getAll(function (arrayUsers) {
        if (arrayUsers != undefined) {
            res.status(200).send(arrayUsers)
        }
        res.status(404).end()
    })
})

router.get('/user/create/', (req, res) => {
    logger.info("request get new user")

    User.create(function (user) {
        if (user != undefined) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(user.getUserJson())
        }
        res.status(204).end()
    })
})

export default router