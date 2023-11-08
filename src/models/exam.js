const mongoose = require("mongoose");
const exam = new mongoose.Schema({  
    examCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "examCategory",
    },
    courseId:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course",
        },
        
    ],

    examCategoryName: {
        type: String,
    },
    

    level:{
        type: String,
    },

    mode:{
        type: String,
    },
    applicationDate:{
        from:{
            type:Date,
        },
        to:{
            type:Date,
        },
        },

    examDate:{
        from:{
            type:Date,
        },
        to:{
            type:Date,
        },
        },


        heading:{
            type:String,
      
           
        },

        description:{
            type:String,
          
        },

        section:[
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
        importantDates:[
            {
                heading:{
                    type:String,
                    default:"Important Dates",
                },
                description:{
                    type:String,
                    default:"Important Dates",
                },
            },
        ],

        applicationForm:[
            {
                heading:{
                    type:String,
                    default:"Application Form",
                },
                description:{
                    type:String,
                    default:"Application Form",
                },
            },
        ],
        eligibility:[
            {
                heading:{
                    type:String,
                    default:"Eligibility",
                },
                description:{
                    type:String,
                    default:"Eligibility",
                },
            },
        ],

        admitCard:[
            {
                heading:{
                    type:String,
                    default:"Admit Card",
                },
                description:{
                    type:String,
                    default:"Admit Card",
                },
            },
        ],

        syllabus:[
            {
                heading:{
                    type:String,
                    default:"Syllabus",
                },
                description:{
                    type:String,
                    default:"Syllabus",
                },
            },
        ],

        examPattern:[
            {
                heading:{
                    type:String,
                    default:"Exam Pattern",
                },
                description:{
                    type:String,
                    default:"Exam Pattern",
                },
            },
        ],

        counsellingProccess:[
            {
                heading:{
                    type:String,
                    default:"Counselling Proccess",
                },
                description:{
                    type:String,
                    default:"Counselling Proccess",
                },
            },
        ],

        howToPrepare:[
            {
                heading:{
                    type:String,
                    default:"How To Prepare",
                },
                description:{
                    type:String,
                    default:"How To Prepare",
                },
            },
        ],

        coachingInstitute:[
            {
                heading:{
                    type:String,
                    default:"Coaching Institute",
                },
                description:{
                    type:String,
                    default:"Coaching Institute",
                },
            },
        ],

        participateCollege:[
            {
                heading:{
                    type:String,
                    default:"Participate College",
                },
                description:{
                    type:String,
                },
            },
        ],

        faq:[
            {
                heading:{
                    type:String,
                    default:"FAQ",
                },
                description:{
                    type:String,
                        default:"FAQ",
                },
            },
        ],

        newsArticle:[
            {
                heading:{
                    type:String,
                    default:"News Article",
                },
                description:{
                    type:String,
                    default:"News Article",
                },
            },
        ],

        result:[    
            {
                heading:{
                    type:String,
                    default:"Result",   
                },
                description:{
                    type:String,
                    default:"Result",
                },
            },
        ],
        
        seatAllotment:[
            {
                heading:{
                    type:String,
                    default:"Seat Allotment",
                },
                description:{
                    type:String,
                    default:"Seat Allotment",
                },
            },
        ],
        cutOff:[
            {
                heading:{
                    type:String,
                    default:"Cut Off",
                },
                description:{
                    type:String,
                    default:"Cut Off",
                },
            },
        ],

        meritList:[
            {
                heading:{
                    type:String,
                    default:"Merit List",
                },
                description:{
                    type:String,
                    default:"Merit List",
                },
            },
        ],

        bestBook:[
            {
                heading:{
                    type:String,
                    default:"Best Book",
                },

                description:{
                    type:String,
                    default:"Best Book",
                },
            }
        ],

        collegePredictor:[
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
},
);

module.exports = mongoose.model("exam", exam);



