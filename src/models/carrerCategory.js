const mongoose = require("mongoose");
const carrerCategory = new mongoose.Schema({
    name: {
        type: String,
    },
    isDisabled: {
        type: Boolean,
        default: false,
    },
    slag:{
        type: String,
        unique: true
    },
image:{
    type:String,
},

altForImage:{
    type:String,
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
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("carrerCategory", carrerCategory);    