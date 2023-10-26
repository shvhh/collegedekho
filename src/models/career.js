const mongoose = require("mongoose");
const career = new mongoose.Schema({

    heading:{
        type:String,
    },

    careerCategoryId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "careerCategory",
    },
    

    
    about:[
        {
            heading:{
                type:String,
                default:Date.now(),
            
                
            },
            description:{
                type:String,
               
            
                
            },
        },
    ],

    eligibility:[
        {
            heading:{
                type:String,
                default:Date.now(),
            
                
            },
            description:{
                type:String,
               
            
                
            },
        },
    ],

    jobRole:[
        {
            heading:{
                type:String,
                default:Date.now(),
            
                
            },
            description:{
                type:String,
               
            
                
            },
        },
    ],

    salary:[
        {
            heading:{
                type:String,
                default:Date.now(),
            
                
            },
            description:{
                type:String,
               
            
                
            },
        },
    ],

    preBooks:[
        {
            heading:{
                type:String,
                default:Date.now(),
            
                
            },
            description:{
                type:String,
               
            
                
            },
        },
    ],
    pros:[
        {
            heading:{
                type:String,
                default:Date.now(),
            
                
            },
            description:{
                type:String,
               
            
                
            },
        },
    ],

    cons:[

        {
            heading:{
                type:String,
                default:Date.now(),
            
                
            },
            description:{
                type:String,
               
            
                
            },
        },

    ],

    slag:{
        type:String,
        unique:true,
    },

    metaKeyword:{
        type:String,
      },
      metaDescription:{
        type:String,
      },
    
      metaTitle:{
        type:String,
      },
      canonical:{
        type:String,
      },


}
,
{
    timestamps: true,
}

);

module.exports = mongoose.model("career", career);