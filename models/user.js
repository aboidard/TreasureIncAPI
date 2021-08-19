let pool = require('../config/db')

class User {
    constructor(row) {
        this.id = row.id
        this.publicKey = row.public_key
        this.privateKey = row.private_key
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

    set id(value) {
        this._id = value
    }
    set publicKey(value) {
        this._publicKey = value
    }
    set privateKey(value) {
        this._privateKey = value
    }
    set created(value) {
        this._created = value
    }

    getUserJson() {
        let user = {}
        user['publicKey'] = this.publicKey
        user['created'] = this.created

        console.log(JSON.stringify(user))
        return JSON.stringify(user)
    }

    // static async create (message, callback){
    //     const request = 'INSERT INTO messages(content, created) VALUES($1, $2) RETURNING *'
    //     const values = [message, new Date()]
    //     // callback
    //     connection.query(request, values, (err, res) => {
    //       if (err) throw err
    //       callback(res)
    //     })
    // }

    static async get(publicKey, callback) {
        const request = 'SELECT * FROM users WHERE public_key = $1'
        const values = [publicKey]
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