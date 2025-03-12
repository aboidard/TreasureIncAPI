import logger from '../config/logger'
import { produce } from '../config/redis'

const itemService = {
    addItem: async function (user, nb, privateKey, callback) {
        logger.info(`item | user ${user}, nb : ${nb}`)

        //check engine
        produce({ type: "generateItemsForUser", params: { user: user, privateKey: privateKey, nb: nb } }, callback)
    }
}


export default itemService
