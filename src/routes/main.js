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
const User = require("../models/user");
const moment = require("moment");
const { HttpRequest } = require("aws-sdk");
const Career = require("../models/career");
const userAuth = require("../middleware/auth.middleware");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SearchHistory = require("../models/searchHistory");
const Wishlist = require("../models/wishlist");
const wishlist = require("../models/wishlist");

routes.get("/", async (req, res) => {
  try {
    const slider = await Slider.find();

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

    const state = await State.find().lean();
    const courseCategoryData = await courseCategory.find().lean();

    const id = courseCategoryData[0]?._id;
    const courseCategoryId = new mongoose.Types.ObjectId(id);
    const topCollege = await College.find({ isTop: true }).limit(2).lean();

    topCollege.forEach((topCollege) => {
      topCollege.from = moment(topCollege?.applicationDate?.from).format(
        "DD MMM"
      );
      topCollege.to = moment(topCollege?.applicationDate?.to).format(
        "DD MMM-YYYY"
      );
      topCollege.applicationDate = topCollege.from + " - " + topCollege.to;

      // convert the date in dd/mm/yyyy format/
    });

    const collegeData = await courseCategory.aggregate([
      {
        $match: {
          _id: courseCategoryId,
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

    res.view("pages/index", {
      slider,
      topCourseCategory,
      state,
      courseCategoryData,
      collegeData,
      topCollege,
    });
  } catch (error) {
    console.log(error);
  }
});

// exam-detail page/
routes.get("/exam-detail/:slag/:section", async (req, res) => {
  const examSection = req.params.section;
  const examDetail = await Exam.findOne({ slag: req.params.slag });
  const sectionData = examDetail[examSection];
  res.view("pages/exam-detail", {
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
    const token = req.cookies.userToken;

    const courseData = await course.findOne({ slag: slag });
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
    // const data = await College.find({ courseId: courseData._id }).lean();
    if (token) {
      const user = jwt.verify(token, "collegeDekhoSecretKet");
      const userId = user.userid;
      const users = new mongoose.Types.ObjectId(userId);

      const query = [
        {
          $match: {
            courseId: new mongoose.Types.ObjectId(courseData._id),
          },
        },

        {
          $lookup: {
            from: "wishlists",
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$collegeId", "$$id"] },
                      { $eq: ["$userId", users] },
                    ],
                  },
                },
              },
            ],
            as: "wishlist",
          },
        },
        {
          $addFields: {
            isWishlisted: {
              $cond: {
                if: { $gt: [{ $size: "$wishlist" }, 0] },
                then: true,
                else: false,
              },
            },
          },
        },
      ];
      const data = await college.aggregate(query);

      res.view("pages/colleges", { data, courseCategoryDetail, facility });
    } else {
      // const courseData = await course.findOne({ slag: slag });
      const data = await College.find({ courseId: courseData._id }).lean();

      res.view("pages/colleges", { data, courseCategoryDetail, facility });
    }
  } catch (error) {
    console.log(error);
  }
});

// get college by state id/

routes.get("/getCollegeByState/:stateName/:category", async (req, res) => {
  try {
    const stateName = req.params.stateName;

    const category = req.params.category;
    const token = req.cookies.userToken;

    const state = await State.findOne({ name: stateName }).lean();
    const categoryData = await courseCategory
      .findOne({ slag: category })
      .lean();

    const courseCategoryId = categoryData._id;

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

    if (token) {
      const user = jwt.verify(token, "collegeDekhoSecretKet");
      const userId = user.userid;
      const users = new mongoose.Types.ObjectId(userId);

      const query = [
        {
          $match: {
            stateId: new mongoose.Types.ObjectId(state._id),
          },
        },
        {
          $match: {
            courseCategoryId: new mongoose.Types.ObjectId(categoryData._id),
          },
        },

        {
          $lookup: {
            from: "wishlists",
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$collegeId", "$$id"] },
                      { $eq: ["$userId", users] },
                    ],
                  },
                },
              },
            ],
            as: "wishlist",
          },
        },
        {
          $addFields: {
            isWishlisted: {
              $cond: {
                if: { $gt: [{ $size: "$wishlist" }, 0] },
                then: true,
                else: false,
              },
            },
          },
        },
      ];
      const data = await college.aggregate(query);

      res.view("pages/colleges", { data, courseCategoryDetail, facility });
    } else {
      const data = await College.aggregate([
        {
          $match: {
            stateId: state._id,
            courseCategoryId: categoryData._id,
          },
        },
      ]);

      res.view("pages/colleges", { data, courseCategoryDetail, facility });
    }
  } catch (error) {
    console.log(error);
  }
});

// get college by slag/

routes.get("/collegeDetail/:slag/:section", async (req, res) => {
  try {
    const collegeSection = req.params.section;

    if (collegeSection == "gallery") {
      const data = await College.findOne({ slag: req.params.slag }).lean();
      const topCollege = await College.find({ isTop: true })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

      const sectionData = data[collegeSection];

      res.view("pages/gallery", {
        data,
        sectionData,
        collegeSection,
        topCollege,
      });
    } else {
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
    }
  } catch (error) {
    console.log(error);
  }
});

// get college by courseId  and find the state and district and exam and subcourse

routes.get("/collegesGetBytheFilters", async (req, res) => {
  try {
    const id = (req.query.courseId = req.query.courseId.split(","));

    const category = req.query.category;
    const token = req.cookies.userToken;

    // const data1 = await College.find({courseId:{$in:id}}).lean();
    for (let i = 0; i < id.length; i++) {
      id[i] = new mongoose.Types.ObjectId(id[i]);
    }

    if (token) {
      const user = jwt.verify(token, "collegeDekhoSecretKet");
      const userId = user.userid;

      const users = new mongoose.Types.ObjectId(userId);
      console.log(users);

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

      console.log(data);

      res.send(data);
    } else {
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

        {
          $lookup: {
            from: "states",
            localField: "stateId",
            foreignField: "_id",
            as: "stateDetail",
          },
        },

        {
          $lookup: {
            from: "districts",
            localField: "districtId",
            foreignField: "_id",
            as: "districtDetail",
          },
        },

        {
          $lookup: {
            from: "exams",
            localField: "examId",
            foreignField: "_id",
            as: "examDetail",
          },
        },

        {
          $lookup: {
            from: "subcourses",
            localField: "subCourseId",
            foreignField: "_id",
            as: "subCoursesDetail",
          },
        },
      ]);
      console.log(data.length);
      res.send(data);
    }
  } catch (error) {
    console.log(error);
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
  }
});

// get college by static data/

routes.get("/getCollegeByStatic", async (req, res) => {
  try {
    const key = req.query.field;
    const category = req.query.category;

    const id = (req.query.filterBy = req.query.filterBy.split(","));

    // console.log(
    //   JSON.stringify([
    //     {
    //       $match: {
    //         courseCategoryId: new mongoose.Types.ObjectId(category),
    //       },
    //     },
    //     {
    //       $match: {
    //         [key]: id,
    //       },
    //     },
    //   ])
    // );

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

    topCourse.forEach((course) => {
      course.from = course.fees.from;
      course.to = course.fees.to;

      course.fees = course.fees.from + " - " + course.fees.to;
    });

    const sectionData = data[req.params.section];

    res.view("pages/course-detail", {
      data,
      sectionData,
      courseSection,
      topCourse,
    });
  } catch (error) {
    console.log(error);
  }
});

routes.get("/getCollegeByStateId", async (req, res) => {
  try {
    const stateId = req.query.stateId;

    const data = await College.find({ stateId: stateId }).limit(9).lean();

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
    });

    res.send(data);
  } catch (error) {
    console.log(error);
  }
});

routes.get("/getCollegeByCourseId", async (req, res) => {
  try {
    const courseId = req.query.courseCategoryId;
    const id = new mongoose.Types.ObjectId(courseId);

    const collegeData = await courseCategory.aggregate([
      {
        $match: {
          _id: id,
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

    res.send(collegeData);
  } catch (error) {
    console.log(error);
  }
});

// register user

routes.post("/register", async (req, res) => {
  try {
    const match = await User.find({ phone: req.body.phone });

    if (match.length == 1) {
      res.send({ message1: "Phone Already Exist" });
    } else {
      const photo = await User.create(req.body);
      res.send({ data: "success" });
    }
  } catch (err) {
    res.send({ message2: "Email Already Exist" });
  }
});

routes.get("/exam/:slag", async (req, res) => {
  const slag = req.params.slag;
  const examCategoryBySlag = await ExamCategory.findOne({ slag: slag }).lean();
  const id = examCategoryBySlag?._id;
  const examCategoryId = new mongoose.Types.ObjectId(id);

  const examCategory = await ExamCategory.find({ isDisabled: false }).lean();
  const getExam = await Exam.find({ examCategoryId: examCategoryId }).lean();

  getExam.forEach((getExam) => {
    getExam.from = moment(getExam?.applicationDate?.from).format("DD MMM");
    getExam.to = moment(getExam?.applicationDate?.to).format("DD MMM-YYYY");
    getExam.applicationDate = getExam.from + " - " + getExam.to;

    getExam.from = moment(getExam?.examDate?.from).format("DD MMM");
    getExam.to = moment(getExam?.examDate?.to).format("DD MMM-YYYY");
    getExam.examDate = getExam.from + " - " + getExam.to;

    // convert the date in dd/mm/yyyy format/
  });

  const examData = await ExamCategory.aggregate([
    {
      $match: {
        _id: examCategoryId,
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

    {
      $lookup: {
        from: "courses",
        localField: "examDetail.courseId",
        foreignField: "_id",
        as: "courseDetail",
      },
    },
  ]);

  res.view("pages/exam", {
    examCategory,
    examData,
    getExam,
    examCategoryBySlag,
  });
});

routes.get("/getExamById", async (req, res) => {
  try {
    const courseId = req.query.courseId;

    const id = new mongoose.Types.ObjectId(courseId);
    const examData = await Exam.find({ courseId: id }).lean();

    examData.forEach((examData) => {
      examData.from = moment(examData?.applicationDate?.from).format("DD MMM");
      examData.to = moment(examData?.applicationDate?.to).format("DD MMM-YYYY");
      examData.applicationDate = examData.from + " - " + examData.to;

      examData.from = moment(examData?.examDate?.from).format("DD MMM");
      examData.to = moment(examData?.examDate?.to).format("DD MMM-YYYY");
      examData.examDate = examData.from + " - " + examData.to;

      // convert the date in dd/mm/yyyy format/
    });

    res.send(examData);
  } catch (error) {
    console.log(error);
  }
});

routes.get("/getExamByFilter", async (req, res) => {
  try {
    const id = req.query.examId;
    const key = req.query.key;
    const short = req.query.short;

    const dataShort = (req.query.short = req.query.short.split(","));

    const data = await Exam.aggregate([
      {
        $match: {
          examCategoryId: new mongoose.Types.ObjectId(id),
        },
      },

      {
        $match: {
          [key]: { $in: dataShort },
        },
      },
    ]);

    data.forEach((data) => {
      data.from = moment(data?.applicationDate?.from).format("DD MMM");
      data.to = moment(data?.applicationDate?.to).format("DD MMM-YYYY");
      data.applicationDate = data.from + " - " + data.to;

      data.from = moment(data?.examDate?.from).format("DD MMM");
      data.to = moment(data?.examDate?.to).format("DD MMM-YYYY");
      data.examDate = data.from + " - " + data.to;

      // convert the date in dd/mm/yyyy format/
    });

    res.send(data);
  } catch (error) {
    console.log(error);
  }
});

// exam with shorting/

routes.get("/examShorting", async (req, res) => {
  try {
    // sort college with aplhabet/

    const data = await Exam.aggregate([
      {
        $sort: {
          heading: 1,
        },
      },
    ]);

    data.forEach((data) => {
      data.from = moment(data?.applicationDate?.from).format("DD MMM");
      data.to = moment(data?.applicationDate?.to).format("DD MMM-YYYY");
      data.applicationDate = data.from + " - " + data.to;

      data.from = moment(data?.examDate?.from).format("DD MMM");
      data.to = moment(data?.examDate?.to).format("DD MMM-YYYY");
      data.examDate = data.from + " - " + data.to;

      // convert the date in dd/mm/yyyy format/
    });

    res.send(data);
  } catch (error) {
    console.log(error);
  }
});

// get all course

routes.get("/getAllCourse", async (req, res) => {
  try {
    const data = await course.find().lean();

    data.forEach((data) => {
      data.from = data.fees.from;
      data.to = data.fees.to;

      data.fees = data.fees.from + " - " + data.fees.to;

      // convert averageDuration in year and month format/ if less than 12 month then show in month format/and if greater than 12 month then show in year and month format if month is 0 then show only year/

      if (data.averageDuration < 12) {
        data.averageDuration = data.averageDuration + " Months";
      } else if (data.averageDuration > 12) {
        const year = Math.floor(data.averageDuration / 12);
        const month = data.averageDuration % 12;
        if (month == 0) {
          data.averageDuration = year + " Year";
        } else {
          data.averageDuration = year + " Year " + month + " Months";
        }
      }
    });

    const mode = [
      "None",
      "Regular/Distance/Part-time",
      "Part-time",
      "Regular/Part-time/Distance",
      "Regular/Distance",
      "Regular",
      "Full time",
      "Distance",
    ];

    const duration = [
      "1 Year",
      "2 Year",
      "3 Year",
      "4 Year",
      "5 Year",
      "6 + Year",
    ];

    res.view("pages/courses", { data, mode, duration });
  } catch (error) {
    console.log(error);
  }
});

// get courseBy duration//

routes.get("/getCourseByDuration", async (req, res) => {
  try {
    const duration1 = req.query.duration;

    // remove year from duration/
    const duration = duration1.replace("Year", "");

    // if duration is 0 year then show less then 12 month averageDuration and if duration is 1 year then show greater than 12 month averageDuration/

    if (duration == 0) {
      const data = await course.find({ averageDuration: { $lt: 12 } }).lean();
      data.forEach((data) => {
        data.from = data.fees.from;
        data.to = data.fees.to;

        data.fees = data.fees.from + " - " + data.fees.to;
      });

      if (data.averageDuration < 12) {
        data.averageDuration = data.averageDuration + " Months";
      } else if (data.averageDuration > 12) {
        const year = Math.floor(data.averageDuration / 12);
        const month = data.averageDuration % 12;
        if (month == 0) {
          data.averageDuration = year + " Year";
        } else {
          data.averageDuration = year + " Year " + month + " Months";
        }
      }

      res.send(data);
    } else if (duration == 1) {
      // find course with averageDuration between leas than 12 and grater thaan 24

      const data = await course
        .find({ averageDuration: { $gt: 12, $lt: 24 } })
        .lean();

      data.forEach((data) => {
        data.from = data.fees.from;
        data.to = data.fees.to;

        data.fees = data.fees.from + " - " + data.fees.to;

        // convert averageDuration in year and month format/ if less than 12 month then show in month format/and if greater than 12 month then show in year and month format if month is 0 then show only year/

        if (data.averageDuration < 12) {
          data.averageDuration = data.averageDuration + " Months";
        } else if (data.averageDuration > 12) {
          const year = Math.floor(data.averageDuration / 12);
          const month = data.averageDuration % 12;
          if (month == 0) {
            data.averageDuration = year + " Year";
          } else {
            data.averageDuration = year + " Year " + month + " Months";
          }
        }
      });

      res.send(data);
    } else if (duration == 2) {
      const data = await course
        .find({ averageDuration: { $gt: 24, $lt: 36 } })
        .lean();
      data.forEach((data) => {
        data.from = data.fees.from;
        data.to = data.fees.to;

        data.fees = data.fees.from + " - " + data.fees.to;

        // convert averageDuration in year and month format/ if less than 12 month then show in month format/and if greater than 12 month then show in year and month format if month is 0 then show only year/

        if (data.averageDuration < 12) {
          data.averageDuration = data.averageDuration + " Months";
        } else if (data.averageDuration > 12) {
          const year = Math.floor(data.averageDuration / 12);
          const month = data.averageDuration % 12;
          if (month == 0) {
            data.averageDuration = year + " Year";
          } else {
            data.averageDuration = year + " Year " + month + " Months";
          }
        }
      });

      res.send(data);
    } else if (duration == 3) {
      const data = await course
        .find({ averageDuration: { $gt: 36, $lt: 48 } })
        .lean();
      data.forEach((data) => {
        data.from = data.fees.from;
        data.to = data.fees.to;

        data.fees = data.fees.from + " - " + data.fees.to;

        // convert averageDuration in year and month format/ if less than 12 month then show in month format/and if greater than 12 month then show in year and month format if month is 0 then show only year/

        if (data.averageDuration < 12) {
          data.averageDuration = data.averageDuration + " Months";
        } else if (data.averageDuration > 12) {
          const year = Math.floor(data.averageDuration / 12);
          const month = data.averageDuration % 12;
          if (month == 0) {
            data.averageDuration = year + " Year";
          } else {
            data.averageDuration = year + " Year " + month + " Months";
          }
        }
      });

      res.send(data);
    } else if (duration == 4) {
      const data = await course
        .find({ averageDuration: { $gt: 48, $lt: 60 } })
        .lean();
      data.forEach((data) => {
        data.from = data.fees.from;
        data.to = data.fees.to;

        data.fees = data.fees.from + " - " + data.fees.to;

        // convert averageDuration in year and month format/ if less than 12 month then show in month format/and if greater than 12 month then show in year and month format if month is 0 then show only year/

        if (data.averageDuration < 12) {
          data.averageDuration = data.averageDuration + " Months";
        } else if (data.averageDuration > 12) {
          const year = Math.floor(data.averageDuration / 12);
          const month = data.averageDuration % 12;
          if (month == 0) {
            data.averageDuration = year + " Year";
          } else {
            data.averageDuration = year + " Year " + month + " Months";
          }
        }
      });
      res.send(data);
    } else if (duration == 5) {
      const data = await course
        .find({ averageDuration: { $gt: 60, $lt: 72 } })
        .lean();
      data.forEach((data) => {
        data.from = data.fees.from;
        data.to = data.fees.to;

        data.fees = data.fees.from + " - " + data.fees.to;

        // convert averageDuration in year and month format/ if less than 12 month then show in month format/and if greater than 12 month then show in year and month format if month is 0 then show only year/

        if (data.averageDuration < 12) {
          data.averageDuration = data.averageDuration + " Months";
        } else if (data.averageDuration > 12) {
          const year = Math.floor(data.averageDuration / 12);
          const month = data.averageDuration % 12;
          if (month == 0) {
            data.averageDuration = year + " Year";
          } else {
            data.averageDuration = year + " Year " + month + " Months";
          }
        }
      });
      res.send(data);
    } else if (duration == 6) {
      const data = await course
        .find({ averageDuration: { $gt: 72, $lt: 84 } })
        .lean();
      data.forEach((data) => {
        data.from = data.fees.from;
        data.to = data.fees.to;

        data.fees = data.fees.from + " - " + data.fees.to;

        // convert averageDuration in year and month format/ if less than 12 month then show in month format/and if greater than 12 month then show in year and month format if month is 0 then show only year/

        if (data.averageDuration < 12) {
          data.averageDuration = data.averageDuration + " Months";
        } else if (data.averageDuration > 12) {
          const year = Math.floor(data.averageDuration / 12);
          const month = data.averageDuration % 12;
          if (month == 0) {
            data.averageDuration = year + " Year";
          } else {
            data.averageDuration = year + " Year " + month + " Months";
          }
        }
      });
      res.send(data);
    }
  } catch (error) {
    console.log(error);
  }
});

// get course by mode

routes.get("/getCourseByMode", async (req, res) => {
  try {
    const mode = req.query.mode;

    const data = await course.find({ mode: mode }).lean();

    data.forEach((data) => {
      data.from = data.fees.from;
      data.to = data.fees.to;

      data.fees = data.fees.from + " - " + data.fees.to;

      // convert averageDuration in year and month format/ if less than 12 month then show in month format/and if greater than 12 month then show in year and month format if month is 0 then show only year/

      if (data.averageDuration < 12) {
        data.averageDuration = data.averageDuration + " Months";
      } else if (data.averageDuration > 12) {
        const year = Math.floor(data.averageDuration / 12);
        const month = data.averageDuration % 12;
        if (month == 0) {
          data.averageDuration = year + " Year";
        } else {
          data.averageDuration = year + " Year " + month + " Months";
        }
      }
    });

    res.send(data);
  } catch (error) {
    console.log(error);
  }
});

// user register/

routes.post("/userRegister", async (req, res) => {
  try {
    const dob = req.body.dob;
    const date = dob.split("/")[0];
    const month = dob.split("/")[1];
    const year = dob.split("/")[2];

    const date1 = new Date(year, month - 1, date);

    req.body.dob = date1;

    const match = await User.find({ phone: req.body.phone });

    if (match.length == 1) {
      res.send("Phone Already Exist");
    } else {
      const photo = await User.create(req.body);
      res.send("User Register Successfully");
    }
  } catch (err) {
    res.send("Email Already Exist");
  }
});

// check email unique or not/

routes.get("/checkUserEmailExitOrNot", async (req, res) => {
  try {
    const email = req.query.email;

    if (email) {
      const emailData = await User.find({ email: email }).lean();

      if (emailData.length == 1) {
        res.send("Email Already Exist");
      } else {
        res.send("Email Not Exist");
      }
    }
  } catch (error) {
    console.log(error);
  }
});

// check phone unique or not/
routes.get("/checkUserPhoneExitOrNot", async (req, res) => {
  try {
    const phone = req.query.phone;

    const data = await User.find({ phone: phone }).lean();

    if (data.length == 1) {
      res.send("Phone Already Exist");
    } else {
      res.send("Phone Not Exist");
    }
  } catch (error) {
    console.log(error);
  }
});

routes.get("/carrerDetail/:slag", async (req, res) => {
  try {
    const data = await Career.findOne({ slag: req.params.slag }).lean();

    res.view("pages/career-detail", { data });
  } catch (error) {
    console.log(error);
  }
});

// login user

routes.post("/userLogin", async (req, res) => {
  const phone = req.body.phone;
  const password = req.body.password;

  try {
    const userDetail = await User.findOne({ phone: phone });

    if (!userDetail) {
      res.send("Invalid login details");
    } else if (userDetail) {
      const isMatch = await bcrypt.compare(password, userDetail.password);

      if (isMatch) {
        const userid = userDetail._id;
        const role = userDetail.role;

        let data = {};
        (data = {
          ...data,
          userid,
          role,
        }),
          (token = jwt.sign(
            data,
            "collegeDekhoSecretKet",

            { expiresIn: "999d" }
          ));
        res.cookie("userToken", token);
        res.cookie.token = token;

        res.send("success");
      } else {
        res.send("Password is not match");
      }
    }
  } catch (err) {
    console.log(err);

    res.send("Invalid login details");
  }
});

// logout user

routes.get("/logout", async (req, res) => {
  try {
    res.clearCookie("userToken");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

routes.get("/search", async (req, res) => {
  try {
    const search = req.query.search;

    // if user login save the search result in database
    const token = req.cookies.userToken;
    if (token) {
      const token = req.cookies.userToken;
      const decoded = jwt.verify(token, "collegeDekhoSecretKet");
      const userId = decoded.userid;

      const user = {
        userId: userId,
        searchText: search,
      };

      const userSearch = await SearchHistory.create(user);
    }

    const data = await College.findOne({
      name: { $regex: search, $options: "i" },
    }).lean();
    const data1 = await course
      .findOne({ name: { $regex: search, $options: "i" } })
      .lean();
    const data2 = await Exam.findOne({
      heading: { $regex: search, $options: "i" },
    }).lean();

    if (data) {
      const collegeSection = "overView";
      const sectionData = data[collegeSection];
      const topCollege = await College.find({ isTop: true })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

      res.view("pages/college-detail", {
        data,
        sectionData,
        collegeSection,
        topCollege,
      });
    }

    if (data1) {
      // data1 convert to data

      let data = data1;
      const topCourse = await course
        .find({ isTop: true })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

      topCourse.forEach((course) => {
        course.from = course.fees.from;
        course.to = course.fees.to;

        course.fees = course.fees.from + " - " + course.fees.to;
      });
      const courseSection = "section";

      const sectionData = data[req.params.section];

      res.view("pages/course-detail", {
        data,
        sectionData,
        courseSection,
        topCourse,
      });
    }

    if (data2) {
      let examDetail = data2;
      const examSection = "section";

      const sectionData = examDetail[examSection];
      res.view("pages/exam-detail", {
        examDetail,
        examSection,
        sectionData,
      });
    }

    // if nothing will find redirect to index page//

    if (!data && !data1 && !data2) {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});

routes.get("/searchByExam", async (req, res) => {
  try {
    const search = req.query.search;
    const examDetail = await Exam.findOne({
      heading: { $regex: search, $options: "i" },
    }).lean();

    if (examDetail) {
      const examSection = "section";

      const sectionData = examDetail[examSection];
      res.view("pages/exam-detail", {
        examDetail,
        examSection,
        sectionData,
      });
    }

    if (!examDetail) {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});

// add college in  wishlist if already added in wishlist with userId then remove it from wishlist

routes.get("/addWishlist", userAuth(["user"]), async (req, res) => {
  try {
    const userId = res.locals.user.userid;
    const collegeId = req.query.collegeId;

    const match = await Wishlist.find({ userId: userId, collegeId: collegeId });

    if (match.length == 1) {
      const deleteWishlist = await Wishlist.deleteOne({
        userId: userId,
        collegeId: collegeId,
      });
      res.send({ message: "remove" });
    } else {
      const wishlist = await Wishlist.create({
        userId: userId,
        collegeId: collegeId,
      });
      res.send({ message: "add" });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = routes;
