const mongoose = require("mongoose");
const userCollegeHistory = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",

    },
 
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "college",

    },
    


   
     

    },
    {
        timestamps: true,
    }

);

module.exports = mongoose.model("userCollegeHistory", userCollegeHistory);
