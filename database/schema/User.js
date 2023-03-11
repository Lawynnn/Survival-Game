const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
    },
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        required: true,
    },
    inventory: [],
    team: {
        type: String,
        default: "",
    },
})

module.exports.User = mongoose.model("users", schema);