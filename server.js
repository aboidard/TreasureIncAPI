const express = require('express')
const cors = require('cors');
require('dotenv').config()

const app = express()

const port = process.env.SERVER_PORT

console.log("running NODE_ENV : " + process.env.NODE_ENV)

app.use(express.json())

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

app.get('/version', (req, res) => {
    console.log("request version")
    res.status(200).send({ version: "0.0.1" })
})

app.get('/healthcheck', (req, res) => {
    console.log("healthcheck")
    res.status(200).send({ version: "0.0.1" })
})

app.get('/login/:publicKey', (req, res) => {

    let private_key = req.get('X-PRIVATE-KEY')

    console.log(`request login ${req.params.publicKey} ${private_key}`)


    let User = require('./models/user')
    User.get(req.params.publicKey, private_key, function (user) {
        if (user != undefined) {
            res.status(200).send(user.getUserJson())
        }
        res.status(404).end()
    })
})

app.get('/user/:publicKey/items/', (req, res) => {
    console.log("request get items")
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
    console.log("request get new user")

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
    console.log("request post items")
    if (req.body === undefined || req.body.length === 0) {
        res.status(204).end()
    } else {
        let Items = require('./models/items')
        Items.post(req.params.publicKey, req.body, function (items) {
            if (items != undefined) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(items.getItemsJson())
                console.log("request items")
            }
            res.status(404).end()
        })
    }
})

app.delete('/user/:publicKey/items/', (req, res) => {
    console.log("request delete items")
    if (req.body === undefined || req.body.length === 0) {
        res.status(204).end()
    } else {
        let Items = require('./models/items')
        Items.delete(req.params.publicKey, req.body, function (items) {
            if (items != undefined) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(items.getItemsJson())
                console.log("request items")
            }
            res.status(404).end()
        })
    }
})

console.log("Starting server...")
app.listen(port, () => {
    console.log("Running on port " + port)
})
