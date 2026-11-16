import { Router } from 'express';
import logger from '../../config/logger'
import { respond } from '../../services/engine'
import questService from '../../services/questService'

const router = Router();

// the daily and weekly quests of the user, drawn by the engine:
// {claimable, daily: {period, resetIn, quests: [{id, metric, goal, progress, completed, claimed,
// reward: {money, items}}]}, weekly: {...}}; claimable is how many rewards wait, resetIn is in seconds
router.get('/user/:publicKey/quests/', (req, res) => {
    logger.info("request get quests")
    respond(res, questService.getQuests(req.params.publicKey, req.get('X-PRIVATE-KEY')))
})

// takes the reward of a completed quest, answers {quest, money, reward: {money, items: [item]}, quests} where money
// is the new balance and quests the same as above; 404 when the quest is not one of the user's quests (any more),
// 409 when it is not completed or already claimed
router.post('/user/:publicKey/quests/:quest/claim/', (req, res) => {
    logger.info("request claim quest")
    respond(res, questService.claimQuest(req.params.publicKey, req.get('X-PRIVATE-KEY'), req.params.quest))
})

export default router
