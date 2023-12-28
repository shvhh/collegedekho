const mongoose = require("mongoose");
const State = new mongoose.Schema({

    name: {
        type: String,
    },
},
{
timestamps: true,
},
);
module.exports = mongoose.model("state", State);