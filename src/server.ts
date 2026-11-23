import * as dotenv from 'dotenv';
import express from 'express';

import checks from './routes/checks';
import logger from './config/logger';
import { consume } from './config/redis';
import userRoute from './routes/V1/userRoute';
import itemRoute from './routes/V1/itemRoute';
import expeditionRoute from './routes/V1/expeditionRoute';
import characterRoute from './routes/V1/characterRoute';
import questRoute from './routes/V1/questRoute';
import giftRoute from './routes/V1/giftRoute';
import eventRoute from './routes/V1/eventRoute';
import { maintenanceGuard } from './services/settings';

const cors = require('cors');

// loading conf
dotenv.config({ quiet: true });

const port = process.env.SERVER_PORT

logger.info("Starting server...");
logger.info(`running NODE_ENV :${process.env.NODE_ENV}`);

//express app
const app = express();

// Setup the loggers
//const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
//app.use(morgan('combined', { stream: accessLogStream }));

//express setup
app.use(express.json());
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// routes setup
app.use('/', checks);
// the game routes: refused during a maintenance, without reaching the engine
app.use('/V1/', maintenanceGuard);
app.use('/V1/', userRoute);
app.use('/V1/', itemRoute);
app.use('/V1/', expeditionRoute);
app.use('/V1/', characterRoute);
app.use('/V1/', questRoute);
app.use('/V1/', giftRoute);
app.use('/V1/', eventRoute);

// start the consumer, and log any errors
consume().catch((err) => {
    logger.error("error in consumer: ", err);
});

// start server
app.listen(port, () => {
    logger.info("Running on port " + port);
});