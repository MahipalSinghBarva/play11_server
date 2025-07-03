const express = require('express');
const { isAuthenticated } = require('../middleware/auth.js');
const { syncMatchesFromAPI, syncTodayMatches, syncMatchLineup, syncMatchSummary, syncMatchTimeline, syncMatchDelta, syncPlayerProfile, syncTeamProfile, getTodayMatch, getMatchLineup, getMatchSummary, getMatchTimeLine, getMatchDelta, getPlayerProfile, getTeamProfile } = require('../controller/liveScore.js');




const router = express.Router()


// router.get("/matches/save", syncMatchesFromAPI);
router.get("/matches/today", syncTodayMatches);
router.get("/matches/:matchId/lineup", syncMatchLineup);
router.get("/matches/:matchId/summary", syncMatchSummary);
router.get("/matches/:matchId/timeline", syncMatchTimeline);
router.get("/matches/:matchId/delta", syncMatchDelta);

// Player and team profiles
router.get("/players/:playerId", syncPlayerProfile);
router.get("/teams/:teamId", syncTeamProfile);


router.get("/today/match", getTodayMatch);
router.get("/match/lineup", getMatchLineup);
router.get("/match/summary", getMatchSummary);
router.get("/match/timeline", getMatchTimeLine);
router.get("/match/delta", getMatchDelta);
router.get("/player-profile", getPlayerProfile);
router.get("/team-profile", getTeamProfile);


module.exports = router;
