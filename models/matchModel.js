const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    matchId: { type: String, required: true, unique: true },
    status: String,
    startTime: Date,
    venue: String,
    team1: {
        id: String,
        name: String,
    },
    team2: {
        id: String,
        name: String,
    },
    venue: String,
    type: String,
    fullData: Object
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
