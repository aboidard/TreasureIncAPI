const express = require('express')
const cors = require('cors')
const logger = require('./config/logger')
const pool = require('./config/db')
require('dotenv').config()

const app = express()

const port = process.env.SERVER_PORT
const version = process.env.VERSION

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

app.get('/healthcheck', (req, res) => {
    logger.info("healthcheck")
    let check = {
        version: version,
        status: ""
    }
    pool.connect()
        .then(() => {
            check.status = "OK"
            res?.status(200).send(check)
        })
        .catch(err => {
            check.status = "connection error " + err.message
            res?.status(500).send(check)
        })
})

app.get('/login/:publicKey', (req, res) => {

    let private_key = req.get('X-PRIVATE-KEY')

    logger.info(`request login ${req.params.publicKey} ${private_key}`)


    let User = require('./models/user')
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


    let User = require('./models/user')
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

    let Items = require('./models/items')
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

    let User = require('./models/user')
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
        let Items = require('./models/items')
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
        let Items = require('./models/items')
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
        let Expedition = require('./models/Expedition')
        logger.info(`req.body ${req.body}`)
        Expedition.create(req.params.publicKey, req.body, function () {
            res.status(200).send()
        })
    }
})


logger.info("Starting server...")
app.listen(port, () => {
    logger.info("Running on port " + port)
})
