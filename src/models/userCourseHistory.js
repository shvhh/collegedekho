const mongoose = require("mongoose");
const userCourseHistory = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",

    },
 
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",

    },
    


   
     

    },
    {
        timestamps: true,
    }

);

module.exports = mongoose.model("userCourseHistory", userCourseHistory);
