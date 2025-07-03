const express = require('express');
const { isAuthenticated } = require('../middleware/auth.js'); const { cricketLiveScore, cricketUpcomingMatches } = require('../controller/liveScore.js');
const { createContest, getUserContests, getAllContests, getOneContests } = require('../controller/contestController.js');



const router = express.Router()


router.post("/create", isAuthenticated, createContest)
router.get("/contest", isAuthenticated, getUserContests)
router.get("/get-all", getAllContests)
router.get("/:id", getOneContests)

module.exports = router;
