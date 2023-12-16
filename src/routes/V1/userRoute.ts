import { Router } from 'express';
import logger from '../../config/logger'
import userService from '../../services/userService';

const router = Router();

router.get('/login/:publicKey', (req, res) => {
    let private_key = req.get('X-PRIVATE-KEY')
    logger.info(`request login ${req.params.publicKey} ${private_key}`)

    userService.login(req.params.publicKey, private_key as string, function (result) {
        if (result.status == 200) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(result.payload.user);
        } else {
            res.status(result.status).end(result.message);
        }
    })
})

/*router.get('/users', (req, res) => {
    logger.info(`request users`)

    userService.getAll(function (result) {
        if (result.status == 200) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(result.payload.usersList);
        } else {
            res.status(result.status).end(result.message);
        }
    })
})*/

router.get('/user/create/', (req, res) => {
    logger.info("request get new user")

    userService.createUser(function (result) {
        if (result.status == 201) {
            res.setHeader('Content-Type', 'application/json');
            res.status(201).send(result.payload.user);
        } else {
            res.status(result.status).end(result.message);
        }
    })
})

export default router