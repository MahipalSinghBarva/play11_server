const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    teamId: String,
    name: String,
    country: String,
    players: [],
    profile: Object,
    fullProfile: Object
});

module.exports = mongoose.model("Team", teamSchema);
