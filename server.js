import fs from 'fs'
import path from 'path'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import express from 'express'

import checks from './routes/checks'
import logger from './config/logger'
import { consume } from './config/kafka'
import userRoute from './routes/V1/userRoute'
import itemRoute from './routes/V1/itemRoute'
import expeditionRoute from './routes/V1/expeditionRoute'

// loading conf
dotenv.config()

const port = process.env.SERVER_PORT

logger.info("Starting server...")
logger.info(`running NODE_ENV :${process.env.NODE_ENV}`);

//express app
const app = express()

// Setup the loggers
const __dirname = path.resolve();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs/access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))

//express setup
app.use(express.json())
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// routes setup
app.use('/', checks);
app.use('/V1/', userRoute);
app.use('/V1/', itemRoute);
app.use('/V1/', expeditionRoute);

// start the consumer, and log any errors
consume().catch((err) => {
    logger.error("error in consumer: ", err)
})

// start server
app.listen(port, () => {
    logger.info("Running on port " + port)
})