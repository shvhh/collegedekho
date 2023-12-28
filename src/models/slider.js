const mongoose = require('mongoose');
const slider = new mongoose.Schema({


    image: {
        type: String,
    },
    alt: {
        type: String,
    },


},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("slider", slider);
