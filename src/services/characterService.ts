import logger from '../config/logger'
import { request } from '../config/redis'
import { EngineReply } from './engine'

const characterService = {
    getCharacters: async function (user: string, privateKey: string | undefined): Promise<EngineReply> {
        logger.info(`character | list for ${user}`)
        return request("getCharacters", { user: user, private_key: privateKey })
    },
    equipItem: async function (user: string, privateKey: string | undefined, character: number, slot, itemId): Promise<EngineReply> {
        logger.info(`character | equip for ${user}, character : ${character}, slot : ${slot}, item : ${itemId}`)
        return request("equipItem", { user: user, private_key: privateKey, character: character, slot: slot, item: itemId })
    },
    unequipItem: async function (user: string, privateKey: string | undefined, character: number, slot): Promise<EngineReply> {
        logger.info(`character | unequip for ${user}, character : ${character}, slot : ${slot}`)
        return request("unequipItem", { user: user, private_key: privateKey, character: character, slot: slot })
    }
}

export default characterService
