import logger from '../config/logger'
import { request } from '../config/redis'
import { EngineReply } from './engine'

const userService = {
    login: async function (user: string, privateKey: string | undefined): Promise<EngineReply> {
        logger.info(`user | user ${user}`)
        return request("login", { user: user, private_key: privateKey })
    },
    createUser: async function (): Promise<EngineReply> {
        logger.info(`createUser`)
        return request("createUser")
    },
    startExpedition: async function (user: string, privateKey: string | undefined, cost): Promise<EngineReply> {
        logger.info(`user | expedition for ${user}, cost : ${cost}`)
        return request("startExpedition", { user: user, private_key: privateKey, cost: cost })
    }
}

export default userService
