const express = require("express");

const routes = express.Router();
const Exam = require("../models/exam");
const ExamCategory = require("../models/examCategory");
const College = require("../models/college");
const course = require("../models/course");
const courseCategory = require("../models/courseCategory");
const State = require("../models/state");
const mongoose = require("mongoose");
const district = require("../models/district");
const Slider = require("../models/slider");
const college = require("../models/college");
const state = require("../models/state");
const moment = require("moment");


routes.get("/", async (req, res) => {
  try {
    const slider = await Slider.find();

    //  find the isTop couurseCategory AND FIND ITS college/

    const topCourseCategory = await courseCategory.aggregate([
      {
        $match: {
          isTop: true,
        },
      },

      // find  the college  by courseCategoryId/ and state name belong to wg\hich state/

      {
        $lookup: {
          from: "colleges",
          let: { courseCategoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$courseCategoryId", "$$courseCategoryId"],
                },
              },
            },
            {
              $lookup: {
                from: "states",
                localField: "stateId",
                foreignField: "_id",
                as: "stateDetail",
              },
            },
          ],
          as: "collegeDetail",
        },
      },
    ]);

    const state =await State.find().limit(9).lean();
    const courseCategoryData = await courseCategory.find().lean();

    const id = courseCategoryData[0]?._id;
    const courseCategoryId = new mongoose.Types.ObjectId(id);

 const collegeData = await courseCategory.aggregate([
      {
        $match: {
          _id: courseCategoryId ,
        },
      },

      // find  the college  by courseCategoryId/ and state name belong to wg\hich state/

      {
        $lookup: {
          from: "colleges",
          let: { courseCategoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$courseCategoryId", "$$courseCategoryId"],
                },
              },
            },
            {
              $lookup: {
                from: "states",
                localField: "stateId",
                foreignField: "_id",
                as: "stateDetail",
              },
            },
          ],
          as: "collegeDetail",
        },
      },
    ]);

console.log(collegeData)

    res.view("pages/index", { slider, topCourseCategory,state,courseCategoryData,collegeData });

  } catch (error) {
    console.log(error);
    console.log("error");
  }
});

// exam-detail page/
routes.get("/exam-detail/:slag/:section", async (req, res) => {
  const examSection = req.params.section;
  const examDetail = await Exam.findOne({ slag: req.params.slag });
  const sectionData = examDetail[examSection];
  res.view("pages/exam", {
    examDetail,
    examSection,
    sectionData,
  });
});

routes.get("/blog", async (req, res) => {
  res.render("pages/blog");
});

routes.get("/blog-details", async (req, res) => {
  res.render("pages/blog-details");
});

routes.get("/college-details", async (req, res) => {
  res.render("pages/college-details");
});

// get college by course id/
routes.get("/collegeGetByCourseId/:slag", async (req, res) => {
  try {
    const slag = req.params.slag;
    const courseData = await course.findOne({ slag: slag });
    const data = await College.find({ courseId: courseData._id }).lean();
    const courseCategoryId = courseData.courseCategoryId;
    const courseCategoryDetail = await courseCategory.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(courseCategoryId),
        },
      },

      // find the course by courseCategoryId/

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

      {
        $lookup: {
          from: "states",
          localField: "collegeDetail.stateId",
          foreignField: "_id",
          as: "stateDetail",
        },
      },

      {
        $lookup: {
          from: "districts",
          localField: "collegeDetail.districtId",
          foreignField: "_id",
          as: "districtDetail",
        },
      },

      {
        $lookup: {
          from: "exams",
          localField: "collegeDetail.examId",
          foreignField: "_id",
          as: "examDetail",
        },
      },

      {
        $lookup: {
          from: "subcourses",
          localField: "collegeDetail.subCourseId",
          foreignField: "_id",
          as: "subCoursesDetail",
        },
      },
    ]);
    const facility = [
      "A/C",
      "ATM",
      "AV Lab",
      "Acadamic Zone",
      "CSC",
      "Canteen",
      "Computer Lab",
      "Conference Room",
      "Counselling",
      "Cultural Role",
      "Fest",
      "Ground",
      "Guest House",
      "Gym",
      "Hospital",
      "Interntional Center",
      "Math Lab",
      "Mess",
      "Music",
      "Planning lab",
      "Shopping",
      "Sports",
      ,
      "Wifi",
      "Workshop",
    ];
    console.log(facility);
    res.view("pages/colleges", { data, courseCategoryDetail, facility });
  } catch (error) {
    console.log(error);
    console.log("error");
  }
});

// get college by state id/

routes.get("/getCollegeByState/:stateName/:category", async (req, res) => {
  try {
    const stateName = req.params.stateName;

    const category = req.params.category;

    const state = await State.findOne({ name: stateName }).lean();
    const categoryData = await courseCategory
      .findOne({ slag: category })
      .lean();

    const courseCategoryId = categoryData._id;

    // find the  data with state id/ and courseCategoryId

    const data = await College.aggregate([
      {
        $match: {
          stateId: state._id,
          courseCategoryId: categoryData._id,
        },
      },
    ]);

    const courseCategoryDetail = await courseCategory.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(courseCategoryId),
        },
      },

      // find the course by courseCategoryId/

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

      {
        $lookup: {
          from: "states",
          localField: "collegeDetail.stateId",
          foreignField: "_id",
          as: "stateDetail",
        },
      },

      {
        $lookup: {
          from: "districts",
          localField: "collegeDetail.districtId",
          foreignField: "_id",
          as: "districtDetail",
        },
      },

      {
        $lookup: {
          from: "exams",
          localField: "collegeDetail.examId",
          foreignField: "_id",
          as: "examDetail",
        },
      },

      {
        $lookup: {
          from: "subcourses",
          localField: "collegeDetail.subCourseId",
          foreignField: "_id",
          as: "subCoursesDetail",
        },
      },
    ]);
    const facility = [
      "A/C",
      "ATM",
      "AV Lab",
      "Acadamic Zone",
      "CSC",
      "Canteen",
      "Computer Lab",
      "Conference Room",
      "Counselling",
      "Cultural Role",
      "Fest",
      "Ground",
      "Guest House",
      "Gym",
      "Hospital",
      "Interntional Center",
      "Math Lab",
      "Mess",
      "Music",
      "Planning lab",
      "Shopping",
      "Sports",
      ,
      "Wifi",
      "Workshop",
    ];

    res.view("pages/colleges", { data, courseCategoryDetail, facility });
  } catch (error) {
    console.log(error);
    console.log("error");
  }
});

// get college by slag/

routes.get("/collegeDetail/:slag/:section", async (req, res) => {
  try {
    const collegeSection = req.params.section;

    const data = await College.findOne({ slag: req.params.slag }).lean();
    const topCollege = await College.find({ isTop: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    const sectionData = data[collegeSection];

    res.view("pages/college-detail", {
      data,
      sectionData,
      collegeSection,
      topCollege,
    });
  } catch (error) {
    console.log(error);
    console.log("error");
  }
});

// get college by courseId  and find the state and district and exam and subcourse

routes.get("/collegesGetBytheFilters", async (req, res) => {
  try {
    const id = (req.query.courseId = req.query.courseId.split(","));
    console.log("id", id);

    const category = req.query.category;

    // const data1 = await College.find({courseId:{$in:id}}).lean();
    for (let i = 0; i < id.length; i++) {
      id[i] = new mongoose.Types.ObjectId(id[i]);
    }
    // console.log("iddata",id);

    const data = await courseCategory.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(category),
        },
      },

      {
        $lookup: {
          from: "colleges",
          let: { courseId: "$_id" },
          pipeline: [
            {
              $match: {
                courseId: { $in: id },
              },
            },
          ],
          as: "collegeDetail",
        },
      },

      // Exam state and district and subcourse and exam/

      {
        $lookup: {
          from: "states",
          localField: "collegeDetail.stateId",
          foreignField: "_id",
          as: "stateDetail",
        },
      },

      {
        $lookup: {
          from: "districts",
          localField: "collegeDetail.districtId",
          foreignField: "_id",
          as: "districtDetail",
        },
      },

      {
        $lookup: {
          from: "exams",
          localField: "collegeDetail.examId",
          foreignField: "_id",
          as: "examDetail",
        },
      },

      {
        $lookup: {
          from: "subcourses",
          localField: "collegeDetail.subCourseId",
          foreignField: "_id",
          as: "subCoursesDetail",
        },
      },
    ]);

    console.log("data11", data);
    console.log("data22", data.length);
    res.send(data);
  } catch (error) {
    console.log(error);
    console.log("error");
  }
});

// get college by multiple filter like stateId and districtId and courseId and examId and subCourseId

routes.get("/getcollegeByMultipleFilter", async (req, res) => {
  try {
    const key = req.query.field;
    // const id = req.query.filterBy;

    const id = (req.query.filterBy = req.query.filterBy.split(","));

    // const data1 = await College.find({courseId:{$in:id}}).lean();
    for (let i = 0; i < id.length; i++) {
      id[i] = new mongoose.Types.ObjectId(id[i]);
    }

    const data = await College.aggregate([
      {
        $match: {
          [key]: { $in: id },
        },
      },
    ]);

    res.send(data);
  } catch (error) {
    console.log(error);
    console.log("error");
  }
});

// get college by static data/

routes.get("/getCollegeByStatic", async (req, res) => {
  try {
    const key = req.query.field;
    const category = req.query.category;

    const id = (req.query.filterBy = req.query.filterBy.split(","));

    console.log(
      JSON.stringify([
        {
          $match: {
            courseCategoryId: new mongoose.Types.ObjectId(category),
          },
        },
        {
          $match: {
            [key]: id,
          },
        },
      ])
    );

    const data = await College.aggregate([
      {
        $match: {
          courseCategoryId: new mongoose.Types.ObjectId(category),
        },
      },
      {
        $match: {
          [key]: { $in: id },
        },
      },
    ]);

    res.send(data);
  } catch (error) {
    console.log(error);
    console.log("error");
  }
});

// find the colleges with alphabets/

routes.get("/collegeShorting", async (req, res) => {
  try {
    const shortBy = req.query.short;

    const category = req.query.category;

    // sort college with aplhabet/

    const data = await College.aggregate([
      {
        $sort: {
          name: 1,
        },
      },
    ]);

    res.send(data);
  } catch (error) {
    console.log(error);
    console.log("error");
  }
});

routes.get("/courseDetail/:slag/:section", async (req, res) => {
  try {
    const courseSection = req.params.section;

    const data = await course.findOne({ slag: req.params.slag }).lean();
    const topCourse = await course
      .find({ isTop: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
    console.log(topCourse.length);

    topCourse.forEach((course) => {
      course.from = course.fees.from;
      course.to = course.fees.to;

      course.fees = course.fees.from + " - " + course.fees.to;
    });

    console.log(topCourse);

    const sectionData = data[req.params.section];

    res.view("pages/course-detail", {
      data,
      sectionData,
      courseSection,
      topCourse,
    });
  } catch (error) {
    console.log(error);
    console.log("error");
  }
});



routes.get("/getCollegeByStateId",async(req,res)=>{
  try{
    const stateId = req.query.stateId;
    console.log(stateId);
    const data = await College.find({stateId:stateId}).limit(6).lean();


// convert data.appicationDate from to in dd/mm/yyyy format/

data.forEach((data) => {

    // data.from = moment(data?.applicationDate?.from).format("DD/MM/YYYY");
    // data.to = moment(data?.applicationDate?.to).format("DD/MM/YYYY");
    // data.applicationDate = data.from + " - " + data.to;
    // year is not repeated and month is not in number format/

    data.from = moment(data?.applicationDate?.from).format("DD MMM");
    data.to = moment(data?.applicationDate?.to).format("DD MMM-YYYY");
    data.applicationDate = data.from + " - " + data.to;

    // convert the date in dd/mm/yyyy format/


 
}
);







    console.log(data);


    console.log(data.length)
    res.send(data);
  }
  catch(error){
    console.log(error);
    console.log("error");
  }
}
)



routes.get("/getCollegeByCourseId",async(req,res)=>{
  try{
    const courseId = req.query.courseCategoryId;
   const id = new mongoose.Types.ObjectId(courseId);

    const collegeData = await courseCategory.aggregate([
      {
        $match: {
          _id: id ,
        },
      },

      // find  the college  by courseCategoryId/ and state name belong to wg\hich state/

      {
        $lookup: {
          from: "colleges",
          let: { courseCategoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$courseCategoryId", "$$courseCategoryId"],
                },
              },
            },
            {
              $lookup: {
                from: "states",
                localField: "stateId",
                foreignField: "_id",
                as: "stateDetail",
              },
            },
          ],
          as: "collegeDetail",
        },
      },

  
    ]);

    console.log(collegeData);
    console.log(collegeData.length)
    res.send(collegeData);
  }
  catch(error){
    console.log(error);
    console.log("error");
  }
}
);








module.exports = routes;
