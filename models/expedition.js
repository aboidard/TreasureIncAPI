const pool = require('../config/db')

class Items {
    constructor() {
        this.cost = 0
    }

    get cost() {
        return this._cost
    }

    set cost(value) {
        this._cost = value
    }

    getItemsJson() {
        return JSON.stringify(this.cost)
    }



    static async create(publicKey, expedition, callback) {
        console.log(`post create expedition ${publicKey} : ${JSON.stringify(expedition)}`)

        const client = await pool.connect()

        try {
            await client.query('BEGIN')

            const queryMoney = `UPDATE users SET money = money - $1 WHERE public_key = $2`
            await client.query(queryMoney, [expedition.cost, publicKey])

            await client.query('COMMIT')
        } catch (e) {
            await client.query('ROLLBACK')
            console.log("ROLLBACK " + e)
            throw e
        } finally {
            client.release()
        }
        console.log(`post create expedition end ${publicKey}`)
        callback()
    }
}

module.exports = Items