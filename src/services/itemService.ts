import logger from '../config/logger'
import { produce } from '../config/kafka'

const itemService = {
    addItem: async function (user, nb, callback) {
        logger.info(`item | user ${user}, nb : ${nb}`)

        //check engine
        produce({ type: "generateItemsForUser", params: { user: user, nb: nb } }, callback)
    }
}


export default itemService
