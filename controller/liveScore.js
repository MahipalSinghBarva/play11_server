const axios = require("axios");
const Match = require("../models/matchModel");
const Player = require("../models/playerModel");
const Team = require("../models/teamSchema");
const Lineup = require("../models/lineupSchema");
const MatchSummary = require("../models/matchSummarySchema");
const Timeline = require("../models/timelineSchema");
const Delta = require("../models/deltaSchema");

const catchAsyncError = require("../utils/catchAsyncError");
const { ErrorHandler } = require("../middleware/error");
const dotenv = require("dotenv");
dotenv.config();

// Use this to show all matches for contest creation.
// exports.syncDailyScheduleFromAPI = catchAsyncError(async (req, res, next) => {
//     const today = new Date().toISOString().split("T")[0];

//     const response = await axios.get(
//         `https://api.sportradar.com/cricket-t2/en/schedules/${today}/schedule`,
//         {
//             params: {
//                 api_key: process.env.SPORT_RADAR_API
//             },
//             headers: {
//                 Accept: 'application/json'
//             }
//         }
//     );

//     const matches = response.data?.sport_events || [];

//     for (let match of matches) {
//         await Match.findOneAndUpdate(
//             { matchId: match.id },
//             {
//                 matchId: match.id,
//                 type: match.sport_event_context?.competition?.name || '',
//                 status: match.sport_event_status?.status || 'scheduled',
//                 startTime: match.sport_event?.start_time,
//                 venue: match.sport_event?.venue?.name || '',
//                 team1: {
//                     id: match.sport_event?.competitors?.[0]?.id,
//                     name: match.sport_event?.competitors?.[0]?.name
//                 },
//                 team2: {
//                     id: match.sport_event?.competitors?.[1]?.id,
//                     name: match.sport_event?.competitors?.[1]?.name
//                 },
//                 fullData: match
//             },
//             { upsert: true, new: true }
//         );
//     }

//     res.status(200).json({
//         success: true,
//         message: `${matches.length} matches synced.`,
//         count: matches.length
//     });
// });

// Use this to display daily live matches.


exports.syncTodayMatches = async (req, res) => {
    const today = new Date().toISOString().split("T")[0];
    try {
        const { data } = await axios.get(
            `https://api.sportradar.com/cricket-t2/en/schedules/${today}/schedule.json`,
            { params: { api_key: process.env.SPORT_RADAR_API } }
        );

        const matches = data.sport_events || [];
        for (const match of matches) {
            await Match.findOneAndUpdate(
                { matchId: match.id },
                {
                    matchId: match.id,
                    startTime: match.sport_event?.start_time,
                    competition: match.sport_event_context?.competition?.name,
                    team1: match.sport_event?.competitors?.[0],
                    team2: match.sport_event?.competitors?.[1],
                    venue: match.sport_event?.venue,
                    status: match.sport_event_status?.status,
                    fullData: match
                },
                { upsert: true }
            );
        }
        res.json({ success: true, count: matches.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Fetch and store match lineups
exports.syncMatchLineup = async (req, res) => {
    const { matchId } = req.params;
    try {
        const { data } = await axios.get(
            `https://api.sportradar.com/cricket-t2/en/matches/${matchId}/lineups.json`,
            { params: { api_key: process.env.SPORT_RADAR_API } }
        );
        // console.log(data)
        const lineupData = await Lineup.findOneAndUpdate(
            { matchId },
            {
                matchId,
                data: data.lineups || []
            },
            { upsert: true }
        );

        res.json({ success: true, message: "Lineup synced" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Fetch and store match summary
exports.syncMatchSummary = async (req, res) => {
    const { matchId } = req.params;
    try {
        const { data } = await axios.get(
            `https://api.sportradar.com/cricket-t2/en/matches/${matchId}/summary.json`,
            { params: { api_key: process.env.SPORT_RADAR_API } }
        );

        await MatchSummary.findOneAndUpdate(
            { matchId },
            {
                matchId,
                data: data || []
            },
            { upsert: true }
        );

        res.json({ success: true, message: "Summary synced" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Fetch and store timeline data
exports.syncMatchTimeline = async (req, res) => {
    const { matchId } = req.params;
    try {
        const { data } = await axios.get(
            `https://api.sportradar.com/cricket-t2/en/matches/${matchId}/timeline.json`,
            { params: { api_key: process.env.SPORT_RADAR_API } }
        );

        await Timeline.findOneAndUpdate(
            { matchId },
            { matchId, data: data },
            { upsert: true }
        );

        res.json({ success: true, message: "Timeline synced" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Fetch and store delta updates
exports.syncMatchDelta = async (req, res) => {
    const { matchId } = req.params;
    try {
        const { data } = await axios.get(
            `https://api.sportradar.com/cricket-t2/en/matches/${matchId}/timeline/delta.json`,
            { params: { api_key: process.env.SPORT_RADAR_API } }
        );

        await Delta.findOneAndUpdate(
            { matchId },
            { matchId, data: data },
            { upsert: true }
        );

        res.json({ success: true, message: "Delta synced" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Fetch and store player profile
exports.syncPlayerProfile = async (req, res) => {
    const { playerId } = req.params;
    try {
        const { data } = await axios.get(
            `https://api.sportradar.com/cricket-t2/en/players/${playerId}/profile.json`,
            { params: { api_key: process.env.SPORT_RADAR_API } }
        );

        await Player.findOneAndUpdate(
            { playerId },
            { playerId, fullProfile: data },
            { upsert: true }
        );

        res.json({ success: true, message: "Player profile synced" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Fetch and store team profile
exports.syncTeamProfile = async (req, res) => {
    const { teamId } = req.params;
    try {
        const { data } = await axios.get(
            `https://api.sportradar.com/cricket-t2/en/teams/${teamId}/profile.json`,
            { params: { api_key: process.env.SPORT_RADAR_API } }
        );

        await Team.findOneAndUpdate(
            { teamId },
            { teamId, fullProfile: data },
            { upsert: true }
        );

        res.json({ success: true, message: "Team profile synced", data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.getTodayMatch = catchAsyncError(async (req, res, next) => {
    const todayMatch = await Match.find();
    res.status(200).json({
        success: true,
        todayMatch
    })
})

exports.getMatchLineup = catchAsyncError(async (req, res, next) => {
    const matchLineup = await Lineup.find();
    res.status(200).json({
        success: true,
        matchLineup
    })
})

exports.getMatchSummary = catchAsyncError(async (req, res, next) => {
    const matchSummary = await MatchSummary.find();
    res.status(200).json({
        success: true,
        matchSummary
    })
})

exports.getMatchTimeLine = catchAsyncError(async (req, res, next) => {
    const matchTimeline = await Timeline.find();
    res.status(200).json({
        success: true,
        matchTimeline
    })
})

exports.getMatchDelta = catchAsyncError(async (req, res, next) => {
    const matchDelta = await Delta.find();
    res.status(200).json({
        success: true,
        matchDelta
    })
})

exports.getPlayerProfile = catchAsyncError(async (req, res, next) => {
    const playerProfile = await Player.find();
    res.status(200).json({
        success: true,
        playerProfile
    })
})

exports.getTeamProfile = catchAsyncError(async (req, res, next) => {
    const teamProfile = await Team.find();
    res.status(200).json({
        success: true,
        teamProfile
    })
})
