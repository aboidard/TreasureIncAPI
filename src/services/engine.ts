import { Response } from 'express'
import logger from '../config/logger'
import { EngineTimeoutError } from '../config/redis'

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
        } else {
            res.status(status).end(r.message ?? r.error ?? 'Engine error')
        }
    }).catch((err) => {
        logger.error(`engine request failed: ${err}`)
        res.status(err instanceof EngineTimeoutError ? 504 : 500).end(err.message)
    })
