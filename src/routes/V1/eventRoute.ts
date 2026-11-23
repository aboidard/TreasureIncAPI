import { Router } from 'express';
import logger from '../../config/logger'
import { respond } from '../../services/engine'
import eventService from '../../services/eventService'

const router = Router();

// the events open now (expeditions limited in time or special, changed from Maestro):
// {events: [{code, name, description, image, level, floors, rewards: {gems, money, items}, maxPerDay, runsToday,
// remainingToday, end}]}; level is the difficulty, 1 (easy) to 3 (hard); remainingToday is null without a daily limit
router.get('/user/:publicKey/events/', (req, res) => {
    logger.info("request get events")
    respond(res, eventService.getEvents(req.params.publicKey, req.get('X-PRIVATE-KEY')))
})

// body {character}: sends the character to the event, for free; answers like POST /user/:publicKey/expedition/
// (plus floors). 404 when the event is not open, 409 when the character is already on an expedition, 429 when the
// player already went there as many times today as the event allows. The chest gives the rewards of the event
// (gems, money, items) when it is opened
router.post('/user/:publicKey/events/:event/expedition/', (req, res) => {
    logger.info("request event expedition")
    respond(res, eventService.startEventExpedition(req.params.publicKey, req.get('X-PRIVATE-KEY'),
        req.params.event, req.body?.character))
})

export default router
