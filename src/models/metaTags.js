const mongoose = require("mongoose");
const MetaTag = new mongoose.Schema(
    {

pageName: {
    type: String,
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
          }
      
       


    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("MetaTag", MetaTag);