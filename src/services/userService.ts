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
    digCase: async function (user: string, privateKey: string | undefined, location, caseId, cost): Promise<EngineReply> {
        logger.info(`user | dig for ${user}, location : ${location}, case : ${caseId}, cost : ${cost}`)
        return request("digCase", { user: user, private_key: privateKey, location: location, case_id: caseId, cost: cost })
    },
    startExpedition: async function (user: string, privateKey: string | undefined, location, difficulty, caseId): Promise<EngineReply> {
        logger.info(`user | expedition for ${user}, location : ${location}, difficulty : ${difficulty}, case : ${caseId}`)
        return request("startExpedition", { user: user, private_key: privateKey, location: location, difficulty: difficulty, case_id: caseId })
    }
}

export default userService
