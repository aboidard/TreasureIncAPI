const Redis = require('ioredis');
import { generateRandomString } from '../services/utils';
import logger from './logger';
import * as dotenv from 'dotenv';

// loading conf
dotenv.config();

const topic = "message-log"
const topicResponse = "message-log-res"

const callbacks = Object.create([]);
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
                callback({ status: "500", message: `could not read message : ${err}` })
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

export const produce = async (payload, callback) => {
    try {
        const replyId = generateRandomString(10)
        callbacks[replyId] = callback;
        await producer.publish(topic, JSON.stringify({ replyId: replyId, payload: payload }));
        // if the message is written successfully, log it
        logger.info(`message sent ${replyId} | ${payload}`)
    } catch (err) {
        logger.error(`could not write message ${err}`)
    }
}
