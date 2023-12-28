const mongoose = require('mongoose');
const Wishlist = new mongoose.Schema({



userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
},

collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
},

  

  

},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Wishlist", Wishlist);
