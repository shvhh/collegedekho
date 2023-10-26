const mongoose = require('mongoose');
const faq = new mongoose.Schema({

courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "course",
},

courseName: {
    type: String,
},
    question: {
        type: String,
    
    },

    answer: {
        type: String,
    
    },

    status: {
        type: String,
        default: "active",
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

module.exports = mongoose.model("faq", faq);
