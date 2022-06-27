const express = require('express')
const cors = require('cors');
const { createLogger, format, transports } = require('winston');
require('dotenv').config()

const app = express()

const port = process.env.SERVER_PORT

// logging
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        //format.json()
    ),
    defaultMeta: { service: 'api' },
    transports: [
        new transports.File({ filename: 'treasure-inc-error.log', level: 'error' }),
        new transports.File({ filename: 'treasure-inc.log' })
    ]
});

// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

logger.info(`running NODE_ENV :${process.env.NODE_ENV}`);
app.use(express.json())

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

app.get('/version', (req, res) => {
    logger.info("request version")
    res.status(200).send({ version: "0.0.3" })
})

app.get('/healthcheck', (req, res) => {
    logger.info("healthcheck")
    res.status(200).send({ version: "0.0.3" })
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
