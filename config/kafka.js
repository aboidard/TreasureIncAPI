const { Kafka } = require("kafkajs")
const { generateRandomString } = require("../services/utils.js")
const logger = require('./logger')

const topic = "message-log"
const topicResponse = "message-log-res"

const clientIdApi = "treasure-inc-api"
const clientIdEngine = "treasure-inc-Engine"

const brokers = ["localhost:9093"]

const responses = Object.create(null);

const kafkaConsumer = new Kafka({ clientId: clientIdEngine, brokers })
const kafkaProducer = new Kafka({ clientId: clientIdApi, brokers })

const consumer = kafkaConsumer.consumer({ groupId: clientIdEngine })
const producer = kafkaProducer.producer({})

const consume = async () => {
    logger.info("Starting consumer")
    await consumer.connect()
    await consumer.subscribe({ topic: topicResponse })
    await consumer.run({
        eachMessage: ({ message }) => {
            try {
                const result = JSON.parse(message.value)
                const res = responses[result.replyId]
                res.status(200).send(result)
            } catch (err) {
                logger.error(`could not read message ${err}`)
            }
        },
    })

    logger.info("Consumer Started")
}

const produce = async (payload, res) => {
    await producer.connect()

    try {
        const replyId = generateRandomString(10)
        responses[replyId] = res;
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

module.exports = { produce, consume }