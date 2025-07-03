const mongoose = require("mongoose");


const lineupSchema = new mongoose.Schema({
    matchId: String,
    data: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model("Lineup", lineupSchema);
