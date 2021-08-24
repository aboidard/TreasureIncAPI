const pool = require('../config/db')
const computePageParams = require('../services/utils');

class Items {
    constructor(rows) {
        this.items = rows
    }

    get items() {
        return this._items
    }

    set items(value) {
        this._items = value
    }

    getItemsJson() {
        return JSON.stringify(this.items)
    }

    static async get(publicKey, page = 0, limit, callback) {

        const [limitParam, offset] = computePageParams(page, limit)

        console.log(`get items (${publicKey}) limit : ${limitParam} | offset : ${offset}`)
        const request = `SELECT items.* FROM items, users
                         WHERE items.user_id = users.id
                            AND users.public_key = $1
                            ORDER BY items.id
                            LIMIT $2 OFFSET $3`

        const values = [publicKey, limitParam, offset]
        pool.query(request, values, (err, res) => {
            if (err) throw err
            if (res.rows.length != 0) {
                callback(new Items(res.rows))
            }
            callback()
        })
    }

    static async post(publicKey, items, callback) {
        console.log(`post items ${publicKey} : ${JSON.stringify(items)}`)

        const client = await pool.connect()

        try {
            await client.query('BEGIN')

            const queryUser = `SELECT users.id FROM users WHERE public_key = $1`
            const res = await client.query(queryUser, [publicKey])
            const idUser = res.rows[0].id

            for (let i in items) {
                let item = items[i]
                const requestText = `INSERT INTO items (name, description, price, rarity, graphics, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
                const requestValue = [item.name, item.description, item.price, item.rarity, item.graphics, idUser]

                const resInsert = await client.query(requestText, requestValue)

                const id = resInsert.rows[0].id
                item.id = id
            }
            await client.query('COMMIT')
        } catch (e) {
            await client.query('ROLLBACK')
            console.log("ROLLBACK " + e)
            throw e
        } finally {
            client.release()
        }
        console.log(`post items end ${publicKey} : ${JSON.stringify(items)}`)
        callback(new Items(items))
    }
}

module.exports = Items