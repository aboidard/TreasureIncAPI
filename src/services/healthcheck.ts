import logger from '../config/logger'
import pool from '../config/db'
import { produce } from '../config/redis'

interface IHealthcheck {
    (version: string, callback: any): Promise<any>;
}

export const healthcheck: IHealthcheck = async (version, callback) => {
    var timeout = 5000
    logger.info("healthcheck")
    console.log("--------------> healthcheck")

    //result to send
    let check = {
        version: version,
        dbStatus: "KO",
        engineStatus: "KO"
    }

    const funcEngine = async function (payload) {
        check.engineStatus = payload
    }

    let start = Date.now();
    let promiseEngine = new Promise(function waitForEngine(this: unknown, resolve, reject) {
        if (check.engineStatus !== "KO") {
            console.log("engine OK")
            resolve("ok");
        }
        else if (timeout && (Date.now() - start) >= timeout) {
            console.log("timeout")
            reject("timeout")
        }
        else {
            console.log("wait engine")
            setTimeout(waitForEngine.bind(this, resolve, reject), 30)
        }
    })

    let promiseDb = pool.connect()

    //check engine
    produce({ type: "healthcheck", params: {} }, funcEngine)

    //check DB
    promiseDb.then((value) => {
        check.dbStatus = "OK"
        value.release()
    }).catch(err => {
        check.dbStatus = "connection error " + err.message
    })

    //waiting for Engine and DB
    Promise.allSettled([promiseDb, promiseEngine]).then(() => {
        callback(200, check)
    }).catch((value) => {
        value.forEach((value) => console.log(value.status))
        check.engineStatus = value
        callback(500, check)
    }).finally(() => console.log("<-------------- end healthcheck"))
}
