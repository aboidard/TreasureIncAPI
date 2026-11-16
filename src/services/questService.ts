import logger from '../config/logger'
import { request } from '../config/redis'
import { EngineReply } from './engine'

const questService = {
    getQuests: async function (user: string, privateKey: string | undefined): Promise<EngineReply> {
        logger.info(`quest | list for ${user}`)
        return request("getQuests", { user: user, private_key: privateKey })
    },
    claimQuest: async function (user: string, privateKey: string | undefined, quest: string): Promise<EngineReply> {
        logger.info(`quest | claim for ${user}, quest : ${quest}`)
        return request("claimQuest", { user: user, private_key: privateKey, quest: quest })
    }
}

export default questService
