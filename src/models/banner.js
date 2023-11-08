const mongoose = require('mongoose');

const Banner = new mongoose.Schema({

 pageName: {
    type: String,
 },
   url: {
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

module.exports = mongoose.model('Banner', Banner);

 
