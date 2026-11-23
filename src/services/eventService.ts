import logger from '../config/logger'
import { request } from '../config/redis'
import { EngineReply } from './engine'

const eventService = {
    getEvents: async function (user: string, privateKey: string | undefined): Promise<EngineReply> {
        logger.info(`event | list for ${user}`)
        return request("getEvents", { user: user, private_key: privateKey })
    },
    startEventExpedition: async function (user: string, privateKey: string | undefined, event: string, character): Promise<EngineReply> {
        logger.info(`event | expedition for ${user}, event : ${event}, character : ${character}`)
        return request("startEventExpedition", { user: user, private_key: privateKey, event: event, character: character })
    }
}

export default eventService
