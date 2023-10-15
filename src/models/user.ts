import pool from '../config/db'
import logger from '../config/logger'


export default class User {

    private _id: number;
    private _publicKey: string;
    private _privateKey: string;
    private _money: number;
    private _diamond: number;
    private _createdAt: Date;


    constructor(row: any) {
        this._id = row.id
        this._publicKey = row.public_key
        this._privateKey = row.private_key
        this._money = row.money
        this._diamond = row.diamond
        this._createdAt = row.createdAt
    }

    get publicKey() {
        return this._publicKey
    }
    get privateKey() {
        return this._privateKey
    }
    get createdAt() {
        return this._createdAt
    }
    get id() {
        return this._id
    }
    get money() {
        return this._money
    }
    get diamond() {
        return this._diamond
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
    set diamond(value) {
        this._diamond = value
    }
    set createdAt(value) {
        this._createdAt = value
    }


    getUserJson(): string {
        let user: any = {}
        user['publicKey'] = this.publicKey
        user['privateKey'] = this.privateKey
        user['createdAt'] = this.createdAt
        user['money'] = this.money
        user['diamond'] = this.diamond

        logger.info(JSON.stringify(user))
        return JSON.stringify(user)
    }

    static async get(publicKey: string, privateKey: string, callback: any) {
        const request = 'SELECT * FROM users WHERE public_key = $1 AND private_key = $2';
        const values = [publicKey, privateKey];
        pool.query(request, values, (err, res) => {
            if (err) throw err;
            if (res.rows.length != 0) {
                callback(new User(res.rows[0]));
            }
            callback();
        })
    }
}
