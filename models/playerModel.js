const mongoose = require("mongoose");

const playerStatsSchema = new mongoose.Schema({
    playerId: String,
    fullName: String,
    nationality: String,
    birthDate: Date,
    battingStyle: String,
    bowlingStyle: String,
    role: String,
    profile: Object,
    fullProfile: Object,
    updatedAt: { type: Date, default: Date.now }
});

function calculatePoints(playerStats) {
    let points = 0;

    points += playerStats.runs * 1;
    points += playerStats.wickets * 25;
    points += playerStats.catches * 8;
    points += playerStats.sixes * 2;
    points += playerStats.fours * 2
    if (playerStats.runs === 0) points -= 2;

    return points;
}


module.exports = mongoose.model("PlayerStats", playerStatsSchema);
