const mongoose = require("mongoose");

const Course = new mongoose.Schema({
    name: {
        type: String,
    },

    courseCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseCategory",
    },

    courseCategoryName: {
        type: String,
    },
 
   image: {
        type: String,
    },

    imageAlt: { 
        type: String,
    },

    

    averageDuration:{
        type: Number,
    },


    fees: {
    from:{
        type: String,
    },
    to:{
        type: String,
    },
},


 
 shortDescription: {
    type: String,
},


section: [
    {
    heading: {
        type: String,
      },
     description: {
        type: String,
      },
    },
  ],

  syllabus: [
    {
    heading: {
        type: String,
      },
     description: {
        type: String,
      },
    },
    ],


    salary: [
        {
        heading: {
            type: String,
          },
         description: {
            type: String,
          },
        },
        ],
      

    
    

    slag:{
        type: String,
        unique: true
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
      isTop:{
        type:Boolean,
        default:false,
      },

      mode:{
     type:String,
      },
      
      
      matchKeyword: [
        {
          type: String,
        },
      ],

      viewCount:{
        type:Number,
        default:0,
    },
      

     

      
  
},
{
    timestamps: true,
}
);


module.exports = mongoose.model("Course", Course);

