const Contest = require("../models/contestModels.js")
const Wallet = require("../models/walletModel.js")
const catchAsyncError = require('../utils/catchAsyncError.js');
const { ErrorHandler } = require("../middleware/error.js");

exports.createContest = catchAsyncError(async (req, res, next) => {
    const { team1, team2, matchTitle, entryAmount } = req.body;
    const userId = req.user.userId;
    const userObjectId = req.user._id;
    // console.log(userId)
    // console.log(userObjectId)

    if (!team1 || !team2 || !entryAmount) {
        return next(ErrorHandler("Please select your team", 400))
    }

    const wallet = await Wallet.findOne({ user: userObjectId })
    if (!wallet || wallet.balance < entryAmount) {
        return next(ErrorHandler("Insufficient wallet balance", 400))
    }

    function generateMatchId(team1, team2, matchTime) {
        const safeTeam1 = team1.trim().toLowerCase().replace(/\s+/g, '');
        const safeTeam2 = team2.trim().toLowerCase().replace(/\s+/g, '');
        const randomNumber = Math.floor(100 + Math.random() * 9000);
        return `${safeTeam1}_vs_${safeTeam2}_${randomNumber}`;
    }
    const matchId = generateMatchId(team1, team2);


    wallet.balance -= entryAmount;
    wallet.transactions.push({
        type: "debit",
        amount: entryAmount,
        description: `Contest placed  for match ${matchId}`,
    })
    await wallet.save()


    const contest = await Contest.create({
        matchId,
        matchTitle,
        // teamName,
        entryAmount,
        user: userObjectId,
    })

    res.json({
        success: true,
        message: "Contest created successfully",
        contest
    })
})


exports.updatePlayerStatsFromLiveAPI = catchAsyncError(async (req, res, next) => {
    const response = await axios.get(`https://api.sportradar.com/cricket-t2/en/matches/sr:sport_event:39497515/lineups.json?api_key=${process.env.SPORT_RADAR_API}`);

    const liveStats = response.data.players;

    for (let player of liveStats) {
        const points = calculatePoints(player);
        await PlayerStats.findOneAndUpdate(
            { matchId: matchId, playerId: player.id },
            {
                playerName: player.name,
                team: player.team,
                runs: player.runs,
                wickets: player.wickets,
                catches: player.catches,
                fours: player.fours,
                sixes: player.sixes,
                points: points,
                playerId: player.id,
                matchId: matchId
            },
            { upsert: true, new: true }
        );
    }
})


exports.getAllContests = catchAsyncError(async (req, res, next) => {
    const contests = await Contest.find();
    res.json({ success: true, contests });
});

exports.getOneContests = catchAsyncError(async (req, res, next) => {
    const ID = req.params.id
    const contests = await Contest.findById(ID);
    res.json({ success: true, contests });
});

exports.getUserContests = catchAsyncError(async (req, res, next) => {
    const contests = await Contest.find({ user: req.user._id });
    res.json({ success: true, contests });
});

