import logger from '../config/logger'
import { request } from '../config/redis'
import { EngineReply } from './engine'

const giftService = {
    getGifts: async function (user: string, privateKey: string | undefined): Promise<EngineReply> {
        logger.info(`gift | list for ${user}`)
        return request("getGifts", { user: user, private_key: privateKey })
    },
    claimGift: async function (user: string, privateKey: string | undefined, gift: number): Promise<EngineReply> {
        logger.info(`gift | claim for ${user}, gift : ${gift}`)
        return request("claimGift", { user: user, private_key: privateKey, gift: gift })
    }
}

export default giftService
