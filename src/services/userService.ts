import logger from '../config/logger'
import { produce } from '../config/redis'

const userService = {
    login: async function (user, privateKey, callback) {
        logger.info(`user | user ${user}`)
        produce({ type: "login", params: { user: user, private_key: privateKey } }, callback)
    },
    createUser: async function (callback) {
        logger.info(`createUser`)
        produce({ type: "createUser" }, callback)
    },
    getAll: async function (callback) {
        logger.info(`getAll`)
        produce({ type: "getAllUsers" }, callback)
    }
}

export default userService
