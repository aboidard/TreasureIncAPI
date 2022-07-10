let pool = require('../config/db')
const logger = require('../config/logger')
let { generatePublicKey, generatePrivateKey } = require('../services/utils.js')


class User {
    constructor(row) {
        this.id = row.id
        this.publicKey = row.public_key
        this.privateKey = row.private_key
        this.money = row.money
        this.created = row.created
    }

    get publicKey() {
        return this._publicKey
    }
    get privateKey() {
        return this._privateKey
    }
    get created() {
        return this._created
    }
    get id() {
        return this._id
    }
    get money() {
        return this._money
    }

    set id(value) {
        this._id = value
    }
    set publicKey(value) {
        this._publicKey = value
    }
    set privateKey(value) {
        this._privateKey = value
    }
    set money(value) {
        this._money = value
    }
    set created(value) {
        this._created = value
    }


    getUserJson() {
        let user = {}
        user['publicKey'] = this.publicKey
        user['privateKey'] = this.privateKey
        user['created'] = this.created
        user['money'] = this.money

        logger.info(JSON.stringify(user))
        return JSON.stringify(user)
    }

    static async get(publicKey, privateKey, callback) {
        const request = 'SELECT * FROM users WHERE public_key = $1 AND private_key = $2'
        const values = [publicKey, privateKey]
        pool.query(request, values, (err, res) => {
            if (err) throw err
            if (res.rows.length != 0) {
                callback(new User(res.rows[0]))
            }
            callback()
        })
    }

    static async getAll(callback) {
        const request = 'SELECT * FROM users'
        const values = []
        let arrayResult = []
        pool.query(request, values, (err, res) => {
            if (err) throw err
            if (res.rows.length != 0) {
                arrayResult = []
                res.rows.forEach((e) => arrayResult.push(new User(e)))
                callback(arrayResult)
            }
            callback()
        })
    }

    static async create(callback) {
        const request = 'INSERT INTO users (public_key, private_key, money) values ($1, $2, $3) RETURNING public_key, private_key, money, created'
        const values = [generatePublicKey(11), generatePrivateKey(30), 100000]
        pool.query(request, values, (err, res) => {
            if (err) throw err
            if (res.rows.length != 0) {
                callback(new User(res.rows[0]))
            }
            callback()
        })
    }
}
module.exports = User