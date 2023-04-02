import { Kafka } from 'kafkajs'
import { generateRandomString } from '../services/utils'
import logger from './logger'

const topic = "message-log"
const topicResponse = "message-log-res"

const clientIdApi = "treasure-inc-api"
const clientIdEngine = "treasure-inc-Engine"

const brokers = process.env.BROKERS.split(',')

const callbacks = Object.create(null);

const kafkaConsumer = new Kafka({ clientId: clientIdEngine, brokers })
const kafkaProducer = new Kafka({ clientId: clientIdApi, brokers })

const consumer = kafkaConsumer.consumer({ groupId: clientIdEngine })
const producer = kafkaProducer.producer({})

export const consume = async () => {
    logger.info("Starting consumer")
    await consumer.connect()
    await consumer.subscribe({ topic: topicResponse })
    await consumer.run({
        eachMessage: ({ message }) => {
            try {
                const result = JSON.parse(message.value)
                const callback = callbacks[result.replyId]
                callback(result.payload)
            } catch (err) {
                logger.error(`could not read message ${err}`)
            }
        },
    })

    logger.info("Consumer Started")
}

export const produce = async (payload, callback) => {
    await producer.connect()

    try {
        const replyId = generateRandomString(10)
        callbacks[replyId] = callback;
        await producer.send({
            topic: topic,
            messages: [
                {
                    value: JSON.stringify({ replyId: replyId, payload: payload }),
                },
            ],
        })
        // if the message is written successfully, log it
        logger.info(`message sent ${replyId} | ${payload}`)
    } catch (err) {
        logger.error(`could not write message ${err}`)
    }
}
