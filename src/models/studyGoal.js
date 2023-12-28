const mongoose = require("mongoose");
const studyGoal = new mongoose.Schema({
    heading: {
        type: String,
    },
  

    title:{
        type:String,
    },
    subParts:[
        {
           subTitle :{
                type:String,
         
            },
           
        },
    ],


    
      
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("studyGoal", studyGoal);    