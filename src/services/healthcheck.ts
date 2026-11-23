import logger from '../config/logger'
import { request } from '../config/redis'
import { DEFAULT_SETTINGS, maintenanceInfo, readSettings, Settings } from './settings'

interface Check {
    name: string
    status: string
}

// the engine may be stopped during a maintenance: do not keep the client waiting for it
const ENGINE_TIMEOUT_MS = 2000

/** "OK" when the engine reports its database check as UP; otherwise that check's status, or "unknown". */
const dbStatus = (checks: Check[] | undefined): string => {
    const db = (checks ?? []).find((c) => /postgres|database/i.test(c.name))
    if (!db) return "unknown"
    return db.status === "UP" ? "OK" : db.status
}

/**
 * Version, engine status and database status (as seen by the engine: the API has no database access), the
 * maintenance ({status: "on"|"off", reason, start, end}: reason, start and end are given as soon as one is planned)
 * and the oldest version of the Unity client that may log in (minClientVersion, "0" for any).
 * Always answers 200, the statuses telling what is down.
 */
export const healthcheck = async (version: string): Promise<[number, object]> => {
    logger.info("healthcheck")
    const check: { version: string, dbStatus: string, engineStatus: any, maintenance: object, minClientVersion: string } = {
        version: version,
        dbStatus: "KO",
        engineStatus: "KO",
        maintenance: maintenanceInfo(DEFAULT_SETTINGS.maintenance),
        minClientVersion: DEFAULT_SETTINGS.minClientVersion
    }
    const [engine, settings] = await Promise.allSettled([request("healthcheck", {}, ENGINE_TIMEOUT_MS), readSettings(true)])
    if (engine.status === 'fulfilled') {
        check.engineStatus = engine.value
        check.dbStatus = dbStatus(engine.value.checks)
    } else {
        check.engineStatus = `KO: ${engine.reason?.message}`
        check.dbStatus = "unknown (engine unreachable)"
    }
    if (settings.status === 'fulfilled') {
        const s: Settings = settings.value
        check.maintenance = maintenanceInfo(s.maintenance)
        check.minClientVersion = s.minClientVersion
    } else {
        logger.error(`healthcheck: could not read the settings: ${settings.reason}`)
    }
    return [200, check]
}
