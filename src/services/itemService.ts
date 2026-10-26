import logger from '../config/logger'
import { request } from '../config/redis'
import { EngineReply } from './engine'

// largest page the engine serves
const MAX_LIMIT = 100

const itemService = {
    /**
     * Items of the user: the private listing when a private key is given, the public one otherwise.
     * With a limit, one page (0-based `page`); without, every item, fetched page by page.
     */
    getItems: async function (user: string, privateKey: string | undefined,
                              page: number, limit: number): Promise<EngineReply> {
        const type = privateKey ? "getPrivateItems" : "getItems"
        const params = { user: user, private_key: privateKey }
        logger.info(`item | ${type} ${user}, page : ${page}, limit : ${limit}`)

        if (!isNaN(limit)) {
            return request(type, { ...params, page: (isNaN(page) ? 0 : page) + 1, limit: limit })
        }
        const items: any[] = []
        for (let p = 1; ; p++) {
            const reply = await request(type, { ...params, page: p, limit: MAX_LIMIT })
            if (reply.status !== 200) {
                return reply
            }
            items.push(...reply.payload.items)
            if (reply.payload.items.length === 0 || items.length >= reply.payload.total) {
                return { status: 200, message: "OK", payload: { items: items } }
            }
        }
    },
    addItems: async function (user: string, privateKey: string | undefined, nb): Promise<EngineReply> {
        logger.info(`item | generate for ${user}, nb : ${nb}`)
        return request("generateItemsForUser", { user: user, private_key: privateKey, nb: nb })
    },
    sellItems: async function (user: string, privateKey: string | undefined, items): Promise<EngineReply> {
        logger.info(`item | sell for ${user} : ${JSON.stringify(items)}`)
        return request("sellItems", { user: user, private_key: privateKey, items: items })
    }
}

export default itemService
