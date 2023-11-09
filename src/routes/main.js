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
const studyGoal = require("../models/studyGoal");
const wishlist = require("../models/wishlist");
const userCollegeHistory = require("../models/userCollegeHistory");
const userExamHistory = require("../models/userExamHistory");
const userCourseHistory = require("../models/userCourseHistory");
const SiteMap = require("../models/sitemap");

routes.get("/", async (req, res) => {
  try {
    const slider = await Slider.find();
    const studyGoalData = await studyGoal.find().lean();

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
      studyGoalData,
    });
  } catch (error) {
    console.log(error);
  }
});

// exam-detail page/
routes.get("/exam-detail/:slag/:section", async (req, res) => {
  const examSection = req.params.section;
  const token = req.cookies.userToken;
  const examDetail = await Exam.findOne({ slag: req.params.slag });

  const increase = examDetail?.viewCount + 1;
  const viewCount = await Exam.findOneAndUpdate(
    { slag: req.params.slag },
    { viewCount: increase }
  );

  const sectionData = examDetail[examSection];

  if (token) {
    const user = jwt.verify(token, "collegeDekhoSecretKet");
    const userId = user.userid;

    const examHistory = {
      userId: userId,
      examId: examDetail._id,
    };

    // create examHistory using upsert

    const examHistoryData = await userExamHistory.findOneAndUpdate(
      {
        userId: userId,
        examId: examDetail._id,
      },
      examHistory,
      { upsert: true }
    );
  }

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
            courseCategoryId: new mongoose.Types.ObjectId(courseCategoryId),
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
      const data = await College.find({
        courseCategoryId: courseCategoryId,
      }).lean();

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
    const token = req.cookies.userToken;

    const data = await College.findOne({ slag: req.params.slag }).lean();
    const increase = data.viewCount + 1;
    const viewCount = await College.findOneAndUpdate(
      { slag: req.params.slag },
      { viewCount: increase }
    );

    const topCollege = await College.find({ isTop: true })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    const sectionData = data[collegeSection];

    if (token) {
      const user = jwt.verify(token, "collegeDekhoSecretKet");
      const userId = user.userid;

      const collegeHistory = {
        userId: userId,
        collegeId: data._id,
      };

      // create collegeHistory using upsert

      const collegeHistoryData = await userCollegeHistory.findOneAndUpdate(
        { userId: userId, collegeId: data._id },
        collegeHistory,
        { upsert: true }
      );
    }

    res.view("pages/college-detail", {
      data,
      sectionData,
      collegeSection,
      topCollege,
    });
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
                  as: "isWishlisted",
                },
              },
              {
                $addFields: {
                  isWishlisted: {
                    $cond: {
                      if: { $gt: [{ $size: "$isWishlisted" }, 0] },
                      then: true,
                      else: false,
                    },
                  },
                },
              },
            ],
            as: "collegeDetail",
          },
        },

        // {$unwind: "$collegeDetail"},
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
      ]);

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
    const token = req.cookies.userToken;

    const id = (req.query.filterBy = req.query.filterBy.split(","));

    // const data1 = await College.find({courseId:{$in:id}}).lean();
    for (let i = 0; i < id.length; i++) {
      id[i] = new mongoose.Types.ObjectId(id[i]);
    }

    if (token) {
      const user = jwt.verify(token, "collegeDekhoSecretKet");
      const userId = user.userid;
      const users = new mongoose.Types.ObjectId(userId);

      const data = await College.aggregate([
        {
          $match: {
            [key]: { $in: id },
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
      ]);

      res.send(data);
    } else {
      const data = await College.aggregate([
        {
          $match: {
            [key]: { $in: id },
          },
        },
      ]);

      res.send(data);
    }
  } catch (error) {
    console.log(error);
  }
});

// get college by static data/

routes.get("/getCollegeByStatic", async (req, res) => {
  try {
    const key = req.query.field;
    const category = req.query.category;
    const token = req.cookies.userToken;

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

    if (token) {
      const user = jwt.verify(token, "collegeDekhoSecretKet");
      const userId = user.userid;
      const users = new mongoose.Types.ObjectId(userId);

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
      ]);

      res.send(data);
    } else {
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
    }
  } catch (error) {
    console.log(error);
  }
});

// find the colleges with alphabets/

routes.get("/collegeShorting", async (req, res) => {
  try {
    const shortBy = req.query.short;

    const token = req.cookies.userToken;

    const category = req.query.category;

    if (shortBy == "A to Z") {
      var short = 1;
    }
    if (shortBy == "Z to A") {
      var short = -1;
    }

    if (!token && shortBy == "Popularity") {
      const data = await College.aggregate([
        {
          $sort: {
            viewCount: -1,
          },
        },
      ]);

      res.send(data);
    }

    if (token && shortBy == "Popularity") {
      const user = jwt.verify(token, "collegeDekhoSecretKet");
      const userId = user.userid;
      console.log(userId);
      const users = new mongoose.Types.ObjectId(userId);

      const data = await College.aggregate([
        {
          $sort: {
            viewCount: -1,
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
      ]);

      res.send(data);
    }

    if (token && short) {
      const user = jwt.verify(token, "collegeDekhoSecretKet");
      const userId = user.userid;
      console.log(userId);
      const users = new mongoose.Types.ObjectId(userId);

      const data = await College.aggregate([
        {
          $sort: {
            name: short,
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
      ]);

      res.send(data);
    }
    if (!token && short) {
      const data = await College.aggregate([
        {
          $sort: {
            name: short,
          },
        },
      ]);

      res.send(data);
    }
  } catch (error) {
    console.log(error);
  }
});

routes.get("/courseDetail/:slag/:section", async (req, res) => {
  try {
    const courseSection = req.params.section;
    const token = req.cookies.userToken;

    const data = await course.findOne({ slag: req.params.slag }).lean();

    const increase = data?.viewCount + 1;
    console.log(increase);
    const viewCount = await course.findOneAndUpdate(
      { slag: req.params.slag },
      { viewCount: increase }
    );

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

    if (token) {
      const user = jwt.verify(token, "collegeDekhoSecretKet");
      const userId = user.userid;

      const courseHistory = {
        userId: userId,
        courseId: data._id,
      };

      // create courseHistory using upsert

      const courseHistoryData = await userCourseHistory.findOneAndUpdate(
        { userId: userId, courseId: data._id },
        courseHistory,
        { upsert: true }
      );
    }

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

    const id = (req.query.courseId = req.query.courseId.split(","));

    // const data1 = await College.find({courseId:{$in:id}}).lean();
    for (let i = 0; i < id.length; i++) {
      id[i] = new mongoose.Types.ObjectId(id[i]);
    }

    const examData = await Exam.aggregate([
      {
        $match: {
          courseId: { $in: id },
        },
      },
    ]);

    examData.forEach((examData) => {
      examData.from = moment(examData?.applicationDate?.from).format("DD MMM");
      examData.to = moment(examData?.applicationDate?.to).format("DD MMM-YYYY");
      examData.applicationDate = examData.from + " - " + examData.to;

      examData.from = moment(examData?.examDate?.from).format("DD MMM");
      examData.to = moment(examData?.examDate?.to).format("DD MMM-YYYY");
      examData.examDate = examData.from + " - " + examData.to;

      // convert the date in dd/mm/yyyy format/
    });
    const token = req.cookies.userToken;

    // pass token into examData//

    // examData.forEach((examData) => {
    //   examData.token = token;
    // }
    // )

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
    const shortBy = req.query.short;

    if (shortBy == "A to Z") {
      var short = 1;
    }
    if (shortBy == "Z to A") {
      var short = -1;
    }

    if (shortBy == "Popularity") {
      const data = await Exam.aggregate([
        {
          $sort: {
            viewCount: -1,
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
    }

    if (short) {
      const data = await Exam.aggregate([
        {
          $sort: {
            heading: short,
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
    }
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
    if (search) {
      const collegeData = await College.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { matchKeyword: { $regex: search, $options: "i" } },
        ],
      }).lean();

      const courseData = await course
        .find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { matchKeyword: { $regex: search, $options: "i" } },
          ],
        })
        .lean();

      const examData = await Exam.find({
        $or: [
          { heading: { $regex: search, $options: "i" } },
          { matchKeyword: { $regex: search, $options: "i" } },
        ],
      }).lean();

      if (collegeData.length > 0) {
        let examData = [];
        let courseData = [];

        res.view("pages/search", { collegeData, search, examData, courseData });
      }

      if (collegeData.length == 0 || courseData.length < 0) {
        let collegeData = [];
        let examData = [];

        courseData.forEach((courseData) => {
          courseData.from = courseData.fees.from;
          courseData.to = courseData.fees.to;

          courseData.fees = courseData.fees.from + " - " + courseData.fees.to;

          // convert averageDuration in year and month format/ if less than 12 month then show in month format/and if greater than 12 month then show in year and month format if month is 0 then show only year/

          if (courseData.averageDuration < 12) {
            courseData.averageDuration = courseData.averageDuration + " Months";
          } else if (courseData.averageDuration > 12) {
            const year = Math.floor(courseData.averageDuration / 12);
            const month = courseData.averageDuration % 12;
            if (month == 0) {
              courseData.averageDuration = year + " Year";
            } else {
              courseData.averageDuration = year + " Year " + month + " Months";
            }
          }
        });

        res.view("pages/search", { examData, search, collegeData, courseData });
      }

      if (!collegeData || !courseData || !examData) {
        const collegeData = [];
        const examData = [];
        const courseData = [];

        res.view("pages/search", { collegeData, search, examData, courseData });
      }
    }
    if (!search) {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});

routes.get("/searchByExam", async (req, res) => {
  try {
    const search = req.query.search;

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

routes.get("/getWishlistByUserId", userAuth(["user"]), async (req, res) => {
  try {
    const userId = res.locals.user.userid;

    // find wishlist college by userId/ and college detail

    const data = await Wishlist.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "colleges",
          localField: "collegeId",
          foreignField: "_id",
          as: "collegeDetail",
        },
      },
    ]);

    res.view("pages/wishlist", { data });
  } catch (error) {
    console.log(error);
  }
});

// delete wishlist by id

routes.get("/deleteWishlistById/:id", userAuth(["user"]), async (req, res) => {
  try {
    const id = req.params.id;
    const userId = res.locals.user.userid;

    const deleteWishlist = await Wishlist.findByIdAndDelete({ _id: id });

    const data = await Wishlist.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "colleges",
          localField: "collegeId",
          foreignField: "_id",
          as: "collegeDetail",
        },
      },
    ]);

    res.send(data);
  } catch (error) {
    console.log(error);
  }
});

// my profile get

routes.get("/myProfile", userAuth(["user"]), async (req, res) => {
  try {
    const userId = res.locals.user.userid;

    const data = await User.findById({ _id: userId }).lean();
    const gender = ["Male", "Female", "Other"];

    // convert the date in dd/mm/yyyy format/

    data.from = moment(data?.dob).format("MM/DD/YYYY");
    data.dob = data.from;

    res.view("pages/my-profile", { data, gender });
  } catch (error) {
    console.log(error);
  }
});

// user your profile update

routes.post("/userProfileUpdated", userAuth(["user"]), async (req, res) => {
  try {
    const userId = res.locals.user.userid;

    if (req.body.dob) {
      const dob = req.body.dob;
      const date = dob.split("/")[0];
      const month = dob.split("/")[1];
      const year = dob.split("/")[2];

      const date1 = new Date(year, month - 1, date);

      req.body.dob = date1;
    }

    const updateProfile = await User.findByIdAndUpdate(
      { _id: userId },
      req.body
    );

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

routes.get("/getUserRecentData", userAuth(["user"]), async (req, res) => {
  try {
    const userId = res.locals.user.userid;

    const data = await userCollegeHistory.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "colleges",
          localField: "collegeId",
          foreignField: "_id",
          as: "collegeDetail",
        },
      },
    ]);

    res.view("pages/recent-view", { data });
  } catch (error) {
    console.log(error);
  }
});

routes.get("/getUserData", userAuth(["user"]), async (req, res) => {
  try {
    const userId = res.locals.user.userid;
    const key = req.query.type;

    if (key == "college") {
      const collegeData = await userCollegeHistory.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },

        {
          $lookup: {
            from: "colleges",
            localField: "collegeId",
            foreignField: "_id",
            as: "collegeDetail",
          },
        },
      ]);

      res.send({ collegeDetail: collegeData });
    }
    if (key == "course") {
      const courseData = await userCourseHistory.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },

        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "courseDetail",
          },
        },
      ]);

      courseData.forEach((courseData) => {
        courseData.from = courseData?.courseDetail[0]?.fees?.from;
        courseData.to = courseData?.courseDetail[0]?.fees?.to;

        courseData.courseDetail[0].fees =
          courseData.from + " - " + courseData.to;

        if (courseData?.courseDetail[0]?.averageDuration < 12) {
          courseData.courseDetail[0].averageDuration =
            courseData?.courseDetail[0]?.averageDuration + " Months";
        } else if (courseData?.courseDetail[0]?.averageDuration > 12) {
          const year = Math.floor(
            courseData?.courseDetail[0]?.averageDuration / 12
          );
          const month = courseData?.courseDetail[0]?.averageDuration % 12;
          if (month == 0) {
            courseData.courseDetail[0].averageDuration = year + " Year";
          } else {
            courseData.courseDetail[0].averageDuration =
              year + " Year " + month + " Months";
          }
        }
      });

      res.send({ courseDetail: courseData });
    }
    if (key == "exam") {
      const examData = await userExamHistory.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
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
      ]);

      //  examDetail mai appicationDateand examDate convert karna hai/

      // examData mai examDetail mai sa applicationDate and examDate  convert karna hai/

      examData.forEach((examData) => {
        examData.from = moment(
          examData?.examDetail[0]?.applicationDate?.from
        ).format("DD MMM");
        examData.to = moment(
          examData?.examDetail[0]?.applicationDate?.to
        ).format("DD MMM-YYYY");
        examData.examDetail[0].applicationDate =
          examData.from + " - " + examData.to;

        examData.from = moment(examData?.examDetail[0]?.examDate?.from).format(
          "DD MMM"
        );
        examData.to = moment(examData?.examDetail[0]?.examDate?.to).format(
          "DD MMM-YYYY"
        );
        examData.examDetail[0].examDate = examData.from + " - " + examData.to;

        // convert the date in dd/mm/yyyy format/
      });

      res.send({ examDetail: examData });
    }
  } catch (error) {
    console.log(error);
  }
});

routes.get("/getBySearch", async (req, res) => {
  const search = req.query.search;
  const type = req.query.typeFor;

  if (type == "college") {
    const data = await College.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { matchKeyword: { $regex: search, $options: "i" } },
      ],
    }).lean();

    res.send({ college: data });
  }

  if (type == "course") {
    const data = await course
      .find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { matchKeyword: { $regex: search, $options: "i" } },
        ],
      })
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

    res.send({ course: data });
  }

  if (type == "exam") {
    const data = await Exam.find({
      $or: [
        { heading: { $regex: search, $options: "i" } },
        { matchKeyword: { $regex: search, $options: "i" } },
      ],
    }).lean();

    data.forEach((data) => {
      data.from = moment(data?.applicationDate?.from).format("DD MMM");
      data.to = moment(data?.applicationDate?.to).format("DD MMM-YYYY");
      data.applicationDate = data.from + " - " + data.to;

      data.from = moment(data?.examDate?.from).format("DD MMM");
      data.to = moment(data?.examDate?.to).format("DD MMM-YYYY");
      data.examDate = data.from + " - " + data.to;
    });

    res.send({ exam: data });
  }
});

// password change/

routes.post("/userPasswordChangeHere", userAuth(["user"]), async (req, res) => {
  try {
    const userId = res.locals.user.userid;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const userDetail = await User.findById({ _id: userId });

    const isMatch = await bcrypt.compare(oldPassword, userDetail.password);

    if (isMatch) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(newPassword, salt);

      const updatePassword = await User.findByIdAndUpdate(
        { _id: userId },
        { password: hashPassword }
      );

      res.redirect("/");
    } else {
      res.view("pages/userPasswordChange", {
        message: "Old Password is not match",
      });
    }
  } catch (error) {
    console.log(error);
    res.view("pages/userPasswordChange", {
      message: "Something went wrong",
    });
  }
});

// password page render

routes.get("/passwordChange", userAuth(["user"]), async (req, res) => {
  try {
    res.view("pages/userPasswordChange", {
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// xml siteMap/

routes.get("/sitemap.xml", async (req, res) => {
  const sitemap = await SiteMap.find().lean();

  let siteMapResponse = `<?xml version="1.0" encoding="UTF-8"?><urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  sitemap.forEach((item) => {
    siteMapResponse += `
  <url>
  <loc>${item.url}</loc>
  <lastmod>${moment(new Date(item.lastmod)).format(
    "YYYY-MM-DDTHH:mm:ss+00:00"
  )}</lastmod>
  <priority>${item.priority}</priority>
</url>
  `;
  });

  siteMapResponse += `</urlset>`;

  res.end(siteMapResponse);
});

// get course by shoting

// exam with shorting/

routes.get("/getCourseByShorting", async (req, res) => {
  try {
    const shortBy = req.query.short;

    if (shortBy == "A to Z") {
      var short = 1;
    }
    if (shortBy == "Z to A") {
      var short = -1;
    }

    if (shortBy == "Popularity") {
      const data = await course.aggregate([
        {
          $sort: {
            viewCount: -1,
          },
        },
      ]);

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

    if (short) {
      const data = await course.aggregate([
        {
          $sort: {
            name: short,
          },
        },
      ]);

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

module.exports = routes;
