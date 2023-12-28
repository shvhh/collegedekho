const mongoose = require("mongoose");   
const district = new mongoose.Schema({
    stateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "state",
    },
    name: {
        type: String,
    },
},
{
    timestamps: true,
},
);

module.exports = mongoose.model("district", district);