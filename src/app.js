const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const bcrypt = require("bcrypt");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");

const Admin = require("./models/admin");
const District = require("./models/district");
const Exam = require("./models/exam");
const ExamCategory = require("./models/examCategory");
const College = require("./models/college");
const course = require("./models/course");
const courseCategory = require("./models/courseCategory");
const State = require("./models/state");
const Career = require("./models/career");

const jwt = require("jsonwebtoken");
const routes = require("./routes/main");
const adminroutes = require("./routes/admin");
// const cors = require("cors");
const bodyParser = require("body-parser");
const { get } = require("http");

// const { genericErrorHandler,appErrorHandler,notFound }= require ('./middleware/error.middleware')

// get navbar data//





function addUserToView(req, res, next) {
  


  res.view = async function (viewName, data) {
    const exam = await ExamCategory.aggregate([
    {
      $match: {
        isDisabled: false,
      },
    },
    {
      $lookup: {
        from: "exams",
        localField: "_id",
        foreignField: "examCategoryId",
        as: "examDetail",
      },
    },
  ]);

  const college = await courseCategory.aggregate([
    {
      $match: {
        isDisabled: false,
      },
    },

    //     // find the course by courseCategoryId/

    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "courseCategoryId",
        as: "courseDetail",
      },
    },

    {
      $lookup: {
        from: "colleges",
        localField: "_id",
        foreignField: "courseCategoryId",
        as: "collegeDetail",
      },
    },

    // find the state by state id in collegeDetail/

    {
      $lookup: {
        from: "states",
        localField: "collegeDetail.stateId",
        foreignField: "_id",
        as: "stateDetail",
      },
    },

    //     // if collegeDetail.isPopular is true then add in popularCollege array/

    {
      $addFields: {
        popularCollege: {
          $filter: {
            input: "$collegeDetail",
            as: "college",
            cond: {
              $eq: ["$$college.isPopular", true],
            },
          },
        },
      },
    },
    //     // if collegeDetail.isPopular is true then add in popularCollege array/

    {
      $addFields: {
        topCollege: {
          $filter: {
            input: "$collegeDetail",
            as: "college",
            cond: {
              $eq: ["$$college.isTop", true],
            },
          },
        },
      },
    },
  ]);


 
  const courses = await course.find().lean();
  const careerDetail = await Career.find().lean();

  const userToken = req.cookies.userToken;
 


    let viewData = {
      exam,
      college,
      courses,
      careerDetail,
      userToken
    }
    if(data){
      viewData = {...data,...viewData}
    }
    res.render(viewName,viewData);
  };

  next();
}

app.use(addUserToView);



// const { connected } = require("process");

// const admin = require("./models/admin");
// const router = express.Router();

// app.use(cors());
app.use("/public", express.static("publicadmin"));

app.set("view engine", "ejs");

app.use(cookieParser());

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use("/admin", adminroutes);

app.use("/", routes);

// app.use(appErrorHandler);
// app.use(genericErrorHandler);
// app.use(notFound);

// mongoose
//   .connect("mongodb://localhost:27017/college", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("connected to db");
//   })
//   .catch((err) => {
//     console.log(err);
//   });



mongoose.connect('mongodb+srv://admin:Webadmin1@cluster0.ul9cde6.mongodb.net/collegedekho').then(()=>{
  console.log("db connected")
}).
  catch(error => (error));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("port started at " + port);
});

// Admin.create({
//     name: "admin",
//     phone: 1234567890,
//     email: "admin@gmail.com",
//     password: "12345",

//     role: "admin",
//     isBlocked: false,
//     })

// Lead.create({
//     name: "karan",
//     moblie: 1234567890,
//     email: "karan@gmail.com",
//     productId: "64a7b8259cdfb4ca5909775b",
//     description: "hello",
//     status: "Pending",
//     })

// Contact.create({

//   address: "karan",
//     email: "admin@gamil.com",
//     phone: "1234567890",
//     })

// allt state in json/

// const state = [
//   "Andhra Pradesh",
//   "Arunachal Pradesh",
//   "Assam",
//   "Bihar",
//   "Chhattisgarh",
//   "Chandigarh (UT)",
//   "Dadra and Nagar Haveli (UT)",
//   "Daman and Diu (UT)",
//   "Delhi (NCT)",
//   "Goa",
//   "Gujarat",
//   "Haryana",
//   "Himachal Pradesh",
//   "Jammu and Kashmir",
//   "Jharkhand",
//   "Karnataka",
//   "Kerala",
//   "Lakshadweep (UT)",
//   "Madhya Pradesh",
//   "Maharashtra",
//   "Manipur",
//   "Meghalaya",
//   "Mizoram",
//   "Nagaland",
//   "Odisha",
//   "Puducherry (UT)",
//   "Punjab",
//   "Rajasthan",
//   "Sikkim",
//   "Tamil Nadu",
//   "Telangana",
//   "Tripura",
//   "Uttarakhand",
//   "Uttar Pradesh",
//   "West Bengal",
// ];

// const states = async (state) => {
//   const data = await State.findOne({ name: state }).lean();

//   if (!data) {
//     State.create({
//       name: state,
//     });
//   }
// };

// for (let i = 0; i < state.length; i++) {
//   states(state[i]);
// }

// // Andhra pradesh/
// const district = [
//   "Alipurduar",
//   "Bankura",
//   "Birbhum",
//   "Burdwan (Bardhaman)",
//   "Cooch Behar",
//   "Dakshin Dinajpur (South Dinajpur)",
//   "Darjeeling",
//   "Hooghly",
//   "Howrah",
//   "Jalpaiguri",
//   "Kalimpong",
//   "Kolkata",
//   "Malda",
//   "Murshidabad",
//   "Nadia",
//   "North 24 Parganas",
//   "Paschim Medinipur (West Medinipur)",
//   "Purba Medinipur (East Medinipur)",
//   "Purulia",
//   "South 24 Parganas",
//   "Uttar Dinajpur (North Dinajpur)",
// ];

// const id = "651e91e01c02fa3330071b5e";

// const districts = async (district) => {
//   const data = await District.findOne({ stateId: id, name: district }).lean();

//   if (!data) {
//     District.create({
//       stateId: id,
//       name: district,
//     });
//   }
// };
// for (let i = 0; i < district.length; i++) {
//   districts(district[i]);
// }

// Arunchal pradesh/

//   const data = await College.aggregate([
//     {
//       $match: {
// courseId:{$in:  id}      },
//     },

//     // find the state by state id in collegeDetail/ state in one array and district in one array

//     {
//       $lookup: {
//         from: "states",
//         localField: "stateId",
//         foreignField: "_id",
//         as: "stateDetail",
//       },
//     },
//     {$unwind:"$stateDetail"},

//     {
//       $lookup: {
//         from: "districts",
//         localField: "districtId",
//         foreignField: "_id",
//         as: "districtDetail",
//       },
//     },

//     {
//       $lookup: {
//         from: "exams",
//         localField: "examId",
//         foreignField: "_id",
//         as: "examDetail",
//       },
//     },

//     {
//       $lookup: {
//         from: "subcourses",
//         localField: "subCourseId",
//         foreignField: "_id",
//         as: "subCourseDetail",
//       },
//     },

//   ]);
