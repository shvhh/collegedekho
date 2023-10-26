const mongoose = require("mongoose");
const subCourse = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",

    },
    courseName:{
        type: String,
    },
    
subCourseName: {
        type: String,
    },
    image: {
        type: String,
    },
    imageAlt: {
        type: String,
    },

    slag:{
        type: String,
        unique: true,   
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

module.exports = mongoose.model("subCourse", subCourse);
