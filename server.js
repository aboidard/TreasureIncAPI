import dotenv from 'dotenv'

import express from 'express'
import cors from 'cors'
import logger from './config/logger'
import { consume } from './config/kafka'
import fs from 'fs'
import morgan from 'morgan'
import path from 'path'


import User from './models/user'
import Items from './models/items'
import Expedition from './models/Expedition'
import healthcheck from './services/healthcheck'

dotenv.config()
const app = express()

// Create a write stream (in append mode)
const __dirname = path.resolve();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs/access.log'), { flags: 'a' })

// Setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

const port = process.env.SERVER_PORT
const version = process.env.VERSION

logger.info("Starting server...")
logger.info(`running NODE_ENV :${process.env.NODE_ENV}`);

app.use(express.json())

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

app.get('/version', (req, res) => {
    logger.info("request version")
    res.status(200).send({ version: version })
})

app.get('/healthcheck', (_, res) => {
    healthcheck(version, function (status, message) {
        res.status(status).send(message)
    })
})

app.get('/login/:publicKey', (req, res) => {

    let private_key = req.get('X-PRIVATE-KEY')

    logger.info(`request login ${req.params.publicKey} ${private_key}`)


    User.get(req.params.publicKey, private_key, function (user) {
        if (user != undefined) {
            res.status(200).send(user.getUserJson())
        }
        res.status(404).end()
    })
})

app.get('/users', (req, res) => {

    //let private_key = req.get('X-PRIVATE-KEY')

    logger.info(`request users`)

    User.getAll(function (arrayUsers) {
        if (arrayUsers != undefined) {
            res.status(200).send(arrayUsers)
        }
        res.status(404).end()
    })
})

app.get('/user/:publicKey/items/', (req, res) => {
    logger.info("request get items")
    //let private_key = req.get('X-PRIVATE-KEY')

    Items.get(req.params.publicKey, req.query.page, req.query.limit, function (items) {
        if (items != undefined) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(items.getItemsJson())
        }
        res.status(204).end()
    })
})
app.get('/user/create/', (req, res) => {
    logger.info("request get new user")

    User.create(function (user) {
        if (user != undefined) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(user.getUserJson())
        }
        res.status(204).end()
    })
})

app.post('/user/:publicKey/items/', (req, res) => {
    logger.info("request post items")
    if (req.body === undefined || req.body.length === 0) {
        res.status(204).end()
    } else {
        logger.info(`req.body ${req.body}`)
        Items.post(req.params.publicKey, req.body, function (items) {
            if (items != undefined) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(items.getItemsJson())
                logger.info("request items")
            }
            res.status(404).end()
        })
    }
})

app.post('/user/:publicKey/sellitems/', (req, res) => {
    logger.info("request delete items")
    if (req.body === undefined || req.body.length === 0) {
        res.status(204).end()
    } else {
        logger.info(`req.body ${req.body}`)
        Items.delete(req.params.publicKey, req.body, function () {
            res.status(200).send()
            logger.info("request delete items")
        })
    }
})

app.post('/user/:publicKey/expedition/', (req, res) => {
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


// start the consumer, and log any errors
consume().catch((err) => {
    logger.error("error in consumer: ", err)
})

app.listen(port, () => {
    logger.info("Running on port " + port)
})