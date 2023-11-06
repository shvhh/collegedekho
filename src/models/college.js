const mongoose = require("mongoose");
const College = new mongoose.Schema({ 
    
    name:{
        type:String,
 
    },

    slag:{
        type:String,
        unique:true,
    },

    stateId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"state",
    },

    districtId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"district",
    },

    

    address:{
        type:String,
    },

    courseId:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course",
        },
        
    ],

    studyMode:{
        type:String,
    },

    subCourseId:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subCourse",
        },
        
    ],


    examId:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "exam",
        },
        
    ],

    instituteType:{
        type:String,
    },

    hostel: [
        {
          type: String,
        },
      ],
  

    feesRange:{
        type:String,
    },
    facility: [
        {
          type: String,
        },
      ],
  

    image:{
        type:String,
    },

    icon:{
        type:String,
    },
    altForIcon:{
        type:String,
    },
    

    brochure:{
        type:String,
    },

    approvedField:{
        type:String,
    },


    courseCategoryId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseCategory",
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

    altForImage:{
        type:String,
    },
    overView:[
        {
            heading:{
                type:String,
                default:"College Predictor",
            },
            description:{
                type:String,
                default:"College Predictor",
            },
        },
    ],


    courses:[
        {
            heading:{
                type:String,
                default:"College Predictor",
            },
            description:{
                type:String,
                default:"College Predictor",
            },
        },
    ],

    admission:[
        {
            heading:{
                type:String,
                default:"College Predictor",
            },
            description:{
                type:String,
                default:"College Predictor",
            },
        },
    ],

    scholarShip:[
        {
            heading:{
                type:String,
                default:"College Predictor",
            },
            description:{
                type:String,
                default:"College Predictor",
            },
        },
    ],


    placement:[
        {
            heading:{
                type:String,
                default:"College Predictor",
            },
            description:{
                type:String,
                default:"College Predictor",
            },
        },
    ],


    campus:[
        {
            heading:{
                type:String,
                default:"College Predictor",
            },
            description:{
                type:String,
                default:"College Predictor",
            },
        },
    ],

    reviews:[
        {
            heading:{
                type:String,
                default:"College Predictor",
            },
            description:{
                type:String,
                default:"College Predictor",
            },
        },
    ],

    // gallery: [
    //     {
    //       type: String,
    //     },
    //   ],
    

      isPopular: {
      type:Boolean,
        default:false,
    
        },
    
        isTop:{
            type:Boolean,
            default:false,
         
        },
        
        brochureUrl:{
            type:String
        },

        ranking:{
            type:String,
        },
        cutOff:{
            type:String,
        },
        applicationDate:{
            from:{
                type:Date,
            },
            to:{
                type:Date,
            },
            },

            viewCount:{
                type:Number,
                default:0,
            },

            matchKeyword: [
                {
                  type: String,
                },
              ],
         
        


},


    

{
    timestamps: true,
}
);

module.exports = mongoose.model("college", College);
