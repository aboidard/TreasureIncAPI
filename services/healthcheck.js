import logger from '../config/logger'
import pool from '../config/db'
import { produce } from '../config/kafka'

const healthcheck = async function (version, callback) {
    var timeout = 1000
    logger.info("healthcheck")
    console.log("--------------> healthcheck")

    //result to send
    let check = {
        version: version,
        dbStatus: "KO",
        engineStatus: "KO"
    }

    const funcEngine = async function (args) { check.engineStatus = args.result.payload }

    let start = Date.now();
    let promiseEngine = new Promise(function waitForEngine(resolve, reject) {
        if (check.engineStatus !== "KO") {
            console.log("OK")
            resolve("ok");
        }
        else if (timeout && (Date.now() - start) >= timeout) {
            console.log("timeout")
            reject("timeout")
        }
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
    Promise.race([promiseDb, promiseEngine]).then(() => {
        callback(200, check)
    }).catch(() => {
        callback(500, check)
    }).finally(() => console.log("<-------------- end healthcheck"))
}


export default healthcheck
