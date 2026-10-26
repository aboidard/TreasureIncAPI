import logger from '../config/logger'
import { request } from '../config/redis'

interface Check {
    name: string
    status: string
}

/** "OK" when the engine reports its database check as UP; otherwise that check's status, or "unknown". */
const dbStatus = (checks: Check[] | undefined): string => {
    const db = (checks ?? []).find((c) => /postgres|database/i.test(c.name))
    if (!db) return "unknown"
    return db.status === "UP" ? "OK" : db.status
}

/**
 * Version, engine status and database status (as seen by the engine: the API has no database access).
 * Always answers 200, the statuses telling what is down.
 */
export const healthcheck = async (version: string): Promise<[number, object]> => {
    logger.info("healthcheck")
    const check: { version: string, dbStatus: string, engineStatus: any } = {
        version: version,
        dbStatus: "KO",
        engineStatus: "KO"
    }
    try {
        const reply = await request("healthcheck")
        check.engineStatus = reply
        check.dbStatus = dbStatus(reply.checks)
    } catch (err: any) {
        check.engineStatus = `KO: ${err.message}`
        check.dbStatus = "unknown (engine unreachable)"
    }
    return [200, check]
}
