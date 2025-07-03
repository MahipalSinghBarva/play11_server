const mongoose = require("mongoose");


const matchSummarySchema = new mongoose.Schema({
    matchId: String,
    data: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model("MatchSummary", matchSummarySchema);
