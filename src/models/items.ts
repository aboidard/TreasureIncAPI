import pool from '../config/db';
import logger from '../config/logger';
import { computePageParams } from '../services/utils';

export default class Items {
    private _items: any;

    constructor(rows) {
        this.items = rows;
    }

    get items() {
        return this._items;
    }

    set items(value) {
        this._items = value;
    }

    getItemsJson() {
        return JSON.stringify(this.items)
    }

    static async get(publicKey: string, page: number = 0, limit: number, callback: any) {

        const [limitParam, offset] = computePageParams(page, limit);

        logger.info(`get items (${publicKey}) limit : ${limitParam} | offset : ${offset}`)
        const request = `SELECT items.* FROM items, users
                         WHERE items.user_id = users.id
                            AND users.public_key = $1
                            ORDER BY items.id
                            LIMIT $2 OFFSET $3`;

        const values = [publicKey, limitParam, offset]
        pool.query(request, values, (err, res) => {
            if (err) throw err;
            if (res.rows.length != 0) {
                callback(new Items(res.rows));
            }
            callback();
        });
    }

    static async delete(publicKey, items, callback) {
        logger.info(`post items ${publicKey} : ${JSON.stringify(items)}`)

        const client = await pool.connect()

        try {
            await client.query('BEGIN')

            logger.info(" récupération user ")
            const queryUser = `SELECT users.id FROM users WHERE public_key = $1`
            const res = await client.query(queryUser, [publicKey])
            const idUser = res.rows[0].id

            let priceTotal = 0
            for (let i in items) {
                let item = items[i]
                const requestText = `DELETE FROM items WHERE id = $1 AND user_id = $2 RETURNING price`
                const requestValue = [item.id, idUser]

                const resultSelling = await client.query(requestText, requestValue)

                priceTotal += resultSelling.rows[0].price
            }

            logger.info(" update priceTotal " + priceTotal)
            //update money
            const queryMoney = `UPDATE users SET money = money + $1 WHERE public_key = $2`
            await client.query(queryMoney, [priceTotal, publicKey])


            await client.query('COMMIT')
        } catch (e) {
            await client.query('ROLLBACK')
            logger.error("ROLLBACK " + e)
            throw e
        } finally {
            client.release()
        }
        logger.info(`delete items end ${publicKey}`)
        callback()
    }
}
