import logger from '../config/logger'
import pool from '../config/db'
import { produce } from '../config/kafka'

const healthcheck = async function (version, callback) {
    var timeout = 1000000
    logger.info("healthcheck")

    //result to send
    let check = {
        version: version,
        dbStatus: "",
        engineStatus: ""
    }

    const funcEngine = async function (args) { check.engineStatus = args.result.payload }

    let start = Date.now();
    let promiseEngine = new Promise(function waitForEngine(resolve, reject) {
        if (check.engineStatus !== "")
            resolve("ok");
        else if (timeout && (Date.now() - start) >= timeout)
            reject(new Error("timeout"));
        else {
            console.log("wait")
            setTimeout(waitForEngine.bind(this, resolve, reject), 30)
        }
    })

    let promiseDb = pool.connect()

    //check engine
    produce("healthcheck", funcEngine)

    //check DB
    promiseDb.then(() => {
        check.dbStatus = "OK"
    }).catch(err => {
        check.dbStatus = "connection error " + err.message
    })

    //waiting for Engine and DB
    Promise.all([promiseDb, promiseEngine]).then(() => {
        callback(200, check)
    })
}


export default healthcheck
