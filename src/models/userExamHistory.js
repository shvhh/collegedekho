const mongoose = require("mongoose");
const userExamHistory = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",

    },
 
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exam",

    },
    


   
     

    },
    {
        timestamps: true,
    }

);

module.exports = mongoose.model("userExamHistory", userExamHistory);
