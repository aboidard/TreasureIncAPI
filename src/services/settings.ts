import { NextFunction, Request, Response } from 'express'
import logger from '../config/logger'
import { getValue } from '../config/redis'

/**
 * The settings of the game (maintenance, oldest Unity client version), changed from Maestro and written by the
 * engine in this Redis key. They are read here straight from Redis, without the engine: during a maintenance the
 * engine may be stopped.
 */
export const SETTINGS_KEY = 'treasure_inc.settings'

// how long the settings read from Redis are reused by the guard of the game routes
const CACHE_MS = 2000

export interface MaintenanceSettings {
    enabled: boolean
    reason: string | null
    start: string | null
    end: string | null
}

export interface Settings {
    maintenance: MaintenanceSettings
    minClientVersion: string
}

export const DEFAULT_SETTINGS: Settings = {
    maintenance: { enabled: false, reason: null, start: null, end: null },
    minClientVersion: '0',
}

let cache: { at: number, settings: Settings } | null = null

const text = (v: any): string | null => (typeof v === 'string' && v !== '' ? v : null)

const parse = (json: string | null): Settings => {
    if (!json) return DEFAULT_SETTINGS
    const raw = JSON.parse(json)
    const m = raw?.maintenance ?? {}
    return {
        maintenance: { enabled: m.enabled === true, reason: text(m.reason), start: text(m.start), end: text(m.end) },
        minClientVersion: text(raw?.minClientVersion) ?? DEFAULT_SETTINGS.minClientVersion,
    }
}

/** The settings from Redis; reuses the last ones read within CACHE_MS unless `fresh`. Rejects when Redis fails. */
export const readSettings = async (fresh = false): Promise<Settings> => {
    const now = Date.now()
    if (!fresh && cache && now - cache.at < CACHE_MS) return cache.settings
    const settings = parse(await getValue(SETTINGS_KEY))
    cache = { at: now, settings }
    return settings
}

const time = (iso: string | null): number | null => {
    if (!iso) return null
    const t = Date.parse(iso)
    return Number.isNaN(t) ? null : t
}

/** Under way: switched on, its start (if any) reached and its end (if any) not reached yet. */
export const maintenanceActive = (m: MaintenanceSettings, now = Date.now()): boolean => {
    const start = time(m.start)
    const end = time(m.end)
    return m.enabled && (start === null || now >= start) && (end === null || now < end)
}

/** What the healthcheck and the refused requests tell about the maintenance: status "on" while it is under way. */
export const maintenanceInfo = (m: MaintenanceSettings, now = Date.now()) => ({
    status: maintenanceActive(m, now) ? 'on' : 'off',
    // a planned maintenance is told in advance
    reason: m.enabled ? m.reason : null,
    start: m.enabled ? m.start : null,
    end: m.enabled ? m.end : null,
})

/**
 * Answers 503 Service Unavailable for a maintenance: Retry-After (seconds until the planned end, when there is one)
 * and {error: "maintenance", message: reason, maintenance: {status, reason, start, end}}.
 */
export const sendMaintenance = (res: Response, m: MaintenanceSettings) => {
    const end = time(m.end)
    if (end !== null && end > Date.now()) {
        res.set('Retry-After', String(Math.max(1, Math.ceil((end - Date.now()) / 1000))))
    }
    res.status(503).json({ error: 'maintenance', message: m.reason ?? 'Maintenance', maintenance: maintenanceInfo(m) })
}

/**
 * Guard of the game routes (/V1): during a maintenance they are answered 503 and never reach the engine.
 * When Redis cannot be read the request goes on: the engine refuses it too during a maintenance.
 */
export const maintenanceGuard = (req: Request, res: Response, next: NextFunction) => {
    readSettings().then((settings) => {
        if (maintenanceActive(settings.maintenance)) {
            logger.info(`maintenance: refused ${req.method} ${req.path}`)
            sendMaintenance(res, settings.maintenance)
        } else {
            next()
        }
    }).catch((err) => {
        logger.error(`maintenance: could not read the settings: ${err}`)
        next()
    })
}
