const mongoose = require("mongoose")

const contestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userId: String,
    matchId: String,
    matchTitle: String,
    team1: String,
    team2: String,
    entryFee: Number,
    prizePool: Number,
    isWin: {
        type: Boolean,
        default: false
    },
    fantasyPoints: {
        type: Number,
        default: 0
    },
    selectedPlayers: [
        {
            playerId: String,
            name: String,
            team: String,
            role: String,
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});


module.exports = mongoose.model("Contest", contestSchema)