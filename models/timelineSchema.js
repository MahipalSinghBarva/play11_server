const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema({
    matchId: String,
    data: { type: Array, default: [] }
})

module.exports = mongoose.model("Timeline", timelineSchema);
