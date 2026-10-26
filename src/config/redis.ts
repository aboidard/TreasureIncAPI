const Redis = require('ioredis');
import { generateRandomString } from '../services/utils';
import logger from './logger';
import * as dotenv from 'dotenv';

// loading conf
dotenv.config();

const topic = "message-log"
const topicResponse = "message-log-res"

// pending requests, by replyId; an entry is removed on reply or timeout
const callbacks: Record<string, (payload: any) => void> = {};
const redisConf = {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
};
const consumer = new Redis(redisConf);
const producer = new Redis(redisConf);

const subscribe = function (topicResponse){
    console.log("Subscribing to channel :", topicResponse);
    consumer.subscribe(topicResponse, (err, count) => {
        if (err) {
            console.error("Failed to subscribe: %s", err.message);
        } else {
            console.log(
                `Subscribed successfully! This client is currently subscribed to ${count} channels.`
            );
        }
    });
}

export const consume = async () => {
    consumer.on('message', async (channel, message) => {
        try {
            logger.info(`message recieved ${message}`)
            const result = JSON.parse(message)
            const callback = callbacks[result.replyId]
            try {
                if (!callback) {
                    logger.error(`consume : no callback for message ${result.replyId}`)
                    return
                }
                callback(result.payload)
            } catch (err) {
                logger.error(`consume : could not read message ${err}`)
                callback({ status: 500, message: `could not read message : ${err}` })
            }
        } catch (err) {
            console.error(`could not read message ${err}`)
        }
    });

    consumer.on("error", function (err) {
        console.log("Error " + err);
    });

    consumer.on("end", function () {
        console.log("Redis connection ended");
    });

    consumer.on("connect", function () {
        console.log("Redis connected");
        subscribe(topicResponse);
    });

    consumer.on("reconnecting", function () {
        console.log("Redis reconnecting");
    });
}

export class EngineTimeoutError extends Error {
    constructor(type: string, timeoutMs: number) {
        super(`engine did not answer "${type}" within ${timeoutMs} ms`);
    }
}

/**
 * Sends a request to the engine and resolves with its reply payload ({status, message, payload}, or {error}).
 * Rejects with EngineTimeoutError when the engine does not answer in time.
 */
export const request = (type: string, params: object = {}, timeoutMs = 5000): Promise<any> =>
    new Promise((resolve, reject) => {
        const replyId = generateRandomString(10)
        const done = () => {
            clearTimeout(timer)
            delete callbacks[replyId]
        }
        const timer = setTimeout(() => {
            done()
            logger.error(`no reply for ${replyId} | ${type}`)
            reject(new EngineTimeoutError(type, timeoutMs))
        }, timeoutMs)
        callbacks[replyId] = (payload) => {
            done()
            resolve(payload)
        }
        producer.publish(topic, JSON.stringify({ replyId: replyId, payload: { type: type, params: params } }))
            .then(() => logger.info(`message sent ${replyId} | ${type}`))
            .catch((err) => {
                done()
                logger.error(`could not write message ${err}`)
                reject(err)
            })
    })
