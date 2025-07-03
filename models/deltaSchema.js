const mongoose = require("mongoose");

const deltaSchema = new mongoose.Schema({
    matchId: String,
    data: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model("Delta", deltaSchema);
