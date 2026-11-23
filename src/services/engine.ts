import { Response } from 'express'
import logger from '../config/logger'
import { EngineTimeoutError } from '../config/redis'
import { sendMaintenance } from './settings'

/** Reply body of an engine request: {status, message, payload}, or {error} when the engine failed. */
export interface EngineReply {
    status?: number
    message?: string
    payload?: any
    error?: string
}

/**
 * Sends the engine reply as the HTTP response: on a 2xx, `pick(payload)` as JSON with `okStatus`
 * (the engine status by default); otherwise the engine status and message.
 * An engine timeout answers 504, any other failure 500.
 */
export const respond = (res: Response, reply: Promise<EngineReply>,
                        pick: (payload: any) => any = (payload) => payload, okStatus?: number) =>
    reply.then((r) => {
        const status = r.status ?? 500
        if (status >= 200 && status < 300) {
            res.status(okStatus ?? status).json(pick(r.payload))
        } else if (status === 503 && r.payload?.maintenance) {
            // the engine knew of the maintenance before the guard of the routes did
            const m = r.payload.maintenance
            sendMaintenance(res, { enabled: true, reason: r.message ?? m.reason ?? null, start: m.start ?? null, end: m.end ?? null })
        } else {
            res.status(status).end(r.message ?? r.error ?? 'Engine error')
        }
    }).catch((err) => {
        logger.error(`engine request failed: ${err}`)
        res.status(err instanceof EngineTimeoutError ? 504 : 500).end(err.message)
    })
