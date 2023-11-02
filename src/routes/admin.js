const express = require("express");

const AdminAuth = require("../middleware/admin.middleware");
const multer = require("multer");
const routes = express.Router();
const uploadS3 = require("../utils/multers3");

const moment = require("moment");

const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const courseCategory = require("../models/courseCategory");
const Course = require("../models/course");
const path = require("path");
const subCourse = require("../models/subCourse");
const ExamCategory = require("../models/examCategory");
const Exam = require("../models/exam");
const College = require("../models/college");
const course = require("../models/course");
const State = require("../models/state");
const District = require("../models/district");

const Faq = require("../models/faq");
const carrerCategory = require("../models/carrerCategory");
const Career = require("../models/career");
const Slider = require("../models/slider");
const slider = require("../models/slider");
const User = require("../models/user");
const SearchHistory = require("../models/searchHistory");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../publicadmin/images"));
  },
  filename: function (req, file, cb) {
    const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e8);
    cb(null, uniquesuffix + file.originalname);
  },
});
const upload = multer({ storage: storage });
var multiupload2 = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "multiImage", maxCount: 5 },
]);

var multiupload = upload.fields([{ name: "gallery", maxCount: 20 }]);

routes.get("/", AdminAuth(["admin"]), async (req, res) => {
  const college = await College.find().lean();
  const course = await Course.find().lean();
  const exam = await Exam.find().lean();
  const user = await User.find().lean();
  const career = await Career.find().lean();
  res.render("pages/dashboard", { college, course, exam, user, career });
});

routes.get("/login", async (req, res) => {
  res.render("pages/login", { message: "" });
});

routes.post("/adminLogin", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await Admin.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, userData.password);

    if (isMatch) {
      const userid = userData._id;
      const role = userData.role;
      const name = userData.name;

      let data = {};
      (data = {
        ...data,
        userid,

        role,
      }),
        (token = jwt.sign(
          data,
          "collegeInformation",

          { expiresIn: "999d" }
        ));
      res.cookie("tokens", token);
      res.cookie.token = token;

      res.redirect("/admin/");
    } else {
      res.render("pages/login", { message: "Password Incorrect" });
    }
  } catch (error) {
    console.log(error);
    res.render("pages/login", { message: "Invalid login details" });
  }
});

routes.get("/changePassword", AdminAuth(["admin"]), async (req, res) => {
  // const id = res.locals.user.userid;
  // const userDetail = await Admin.findById(id);

  res.render("pages/password-change", { message: "" });
});

routes.post("/updatePassword", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = res.locals.user.userid;
    const userDetail = await Admin.findById(id).lean();

    const password = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const data = await Admin.findById(id);

    const isMatch = await bcrypt.compare(password, data.password);
    const passwordCorrect = {
      password: await bcrypt.hash(newPassword, 10),
    };

    if (isMatch) {
      const passwordUpdate = await Admin.findByIdAndUpdate(id, passwordCorrect);
      res.redirect("/admin");
    } else {
      res.render("pages/password-change", {
        message: " Old Password is not match",
        userDetail,
      });
    }
  } catch (err) {
    console.log(err);
    res.render("pages/password-change", {
      message: "Password is not match",
      userDetail,
    });
  }
});

// category page get

routes.get("/courseCategory", AdminAuth(["admin"]), async (req, res) => {
  res.render("pages/courseCategory", {
    message: "",
  });
});

// category page post

routes.post("/categoryCreate", AdminAuth(["admin"]), async (req, res) => {
  try {
    req.body.category = req.body.category;

    const data = await courseCategory.find().lean();
    if (req.body.isTop == "on") {
      req.body.isTop = true;
      // do false all isfeatures in database//
      data.forEach(async (item) => {
        await courseCategory.findByIdAndUpdate(item._id, { isTop: false });
      });
    } else {
      req.body.isTop = false;
    }

    const courseCategoryCreate = await courseCategory.create(req.body);

    res.redirect("/admin/courseCategoryList");
  } catch (error) {
    console.log(error);
    res.render("pages/courseCategory", {
      message: "Please Select Another Slag",
    });
  }
});

// category list

routes.get("/courseCategoryList", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await courseCategory.find().sort({ createdAt: -1 }).lean();
    res.render("pages/courseCategorylist", {
      data,
    });
  } catch (error) {
    console.log(error);
  }
});

// category page get

routes.get("/categoryEdit/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;

    const data = await courseCategory.findById(id);
    res.render("pages/courseCategoryEdit", {
      data,
    });
  } catch (error) {
    console.log(error);
  }
});

// category page post

routes.post("/categoryUpdate/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await courseCategory.find().lean();

    if (req.body.isTop == "on") {
      req.body.isTop = true;

      data.forEach(async (item) => {
        await courseCategory.findByIdAndUpdate(item._id, { isTop: false });
      });
    } else {
      req.body.isTop = false;
    }

    const id = req.params.id;
    const category = req.body.category;
    const categoryData = await courseCategory.findByIdAndUpdate(id, {
      category: category,
      isTop: req.body.isTop,
    });
    res.redirect("/admin/courseCategoryList");
  } catch (error) {
    console.log(error);
  }
});

// course category disabled/enable

routes.get(
  "/courseCategoryDisabled/:id",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;

      const categoryData = await courseCategory.findById(id);

      if (categoryData.isDisabled == true) {
        const categoryData = await courseCategory.findByIdAndUpdate(id, {
          isDisabled: false,
        });
      } else {
        const categoryData = await courseCategory.findByIdAndUpdate(id, {
          isDisabled: true,
        });
      }
      res.redirect("/admin/courseCategoryList");
    } catch (error) {
      console.log(error);
    }
  }
);

// courseCreate render//

routes.get("/course", AdminAuth(["admin"]), async (req, res) => {
  try {
    const category = await courseCategory.find({ isDisabled: false }).lean();

    res.render("pages/courseCreate", {
      category,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// courseCreate post//

routes.post(
  "/courseCreate",
  AdminAuth(["admin"]),
  multiupload,
  async (req, res) => {
    try {
      const fees = req.body.fees.split(" - ");
      req.body.fees = {
        from: fees[0],
        to: fees[1],
      };
      if (req.body.isTop == "on") {
        req.body.isTop = true;
      } else {
        req.body.isTop = false;
      }
      if (req.body.courseCategoryId) {
        req.body.courseCategoryId = req.body.courseCategoryId;
        const category = await courseCategory.findById(
          req.body.courseCategoryId
        );
        req.body.courseCategoryName = category.category;
      }

      const data = await Course.create(req.body);

      res.redirect("/admin/courseList");
    } catch (error) {
      console.log(error);
      const category = await courseCategory.find().lean();
      res.render("pages/courseCreate", {
        category,
        message: "Please Select Another Slag",
      });
    }
  }
);

// courseList get/

routes.get("/courseList", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await Course.find().sort({ createdAt: -1 }).lean();

    data?.forEach((element) => {
      element.fees = element?.fees?.from + " - " + element?.fees?.to;
    });

    data?.forEach(async (element) => {
      const category = await courseCategory.findById(element.courseCategoryId);
      element.courseCategoryName = category.category;
    });

    res.render("pages/courselist", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// course Edit//

routes.get("/courseEdit/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;

    const data = await Course.findById(id);

    const category = await courseCategory.find({ isDisabled: false }).lean();

    const fees = data?.fees.from + " - " + data?.fees.to;

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

    res.render("pages/courseEdit", {
      data,
      fees,
      category,
      mode,
    });
  } catch (error) {
    console.log(error);
  }
});

// course update//

routes.post(
  "/courseUpdate/:id",
  AdminAuth(["admin"]),
  multiupload,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      const id = req.params.id;
      if (req.body.isTop == "on") {
        req.body.isTop = true;
      } else {
        req.body.isTop = false;
      }

      if (req.body.fees) {
        const fees = req.body.fees.split(" - ");
        req.body.fees = {
          from: fees[0],
          to: fees[1],
        };
      }
      if (!req.body.image) {
        req.body.image = course.image;
      }

      if (!req.body.courseCategoryId) {
        req.body.courseCategoryId = course.courseCategoryId;
      }

      if (req.body.courseCategoryId) {
        req.body.courseCategoryId = req.body.courseCategoryId;
        const category = await courseCategory.findById(
          req.body.courseCategoryId
        );
        req.body.courseCategoryName = category.category;
      }

      const data = await Course.findByIdAndUpdate(id, req.body);
      res.redirect("/admin/courseList");
    } catch (error) {
      console.log(error);
    }
  }
);

routes.get("/courseSection/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Course.findById(id);
    res.render("pages/courseSectionEdit", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

routes.get(
  "/editCourseSectionForUpdate/:id/:section",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const section = req.params.section;
      const data = await Course.findById(id);
      // find that array by section name

      const sectionData = data[section];

      res.render("pages/courseSectionUpdate", {
        data,
        section,
        sectionData,
        section,
        message: "",
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// update the course  array by  field name//

routes.post(
  "/courseSectionUpdateByName/:id/:section",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const section = req.params.section;

      const data = await Course.findById(id);
      // update the field by section name

      const update = await Course.findByIdAndUpdate(id, {
        [section]: req.body[section],
      });

      res.redirect("/admin/courseSection/" + id);
    } catch (error) {
      console.log(error);
    }
  }
);

// delete the course section and syllabus and sallary byits id//

routes.get(
  "/courseSubpartsDelete/:id/:subPartdId",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const subParts = await Course.findById(req.params.id);
      const section = subParts.section;
      const syllabus = subParts.syllabus;
      const sallary = subParts.sallary;
      const id = req.params.id;
      const subPartdId = req.params.subPartdId;
      if (section) {
        const sectionData = await Course.findByIdAndUpdate(id, {
          $pull: { section: { _id: subPartdId } },
        });
      }
      if (syllabus) {
        const syllabusData = await Course.findByIdAndUpdate(id, {
          $pull: { syllabus: { _id: subPartdId } },
        });
      }
      if (sallary) {
        const sallaryData = await Course.findByIdAndUpdate(id, {
          $pull: { sallary: { _id: subPartdId } },
        });
      }
      res.redirect("/admin/courseSection/" + id);
    } catch (error) {}
  }
);

// delete the course by its id//

routes.get("/courseDelete/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Course.findByIdAndDelete(id);
    res.redirect("/admin/courseList");
  } catch (error) {
    console.log(error);
  }
});

// sub course page render/

routes.get("/subCourse", AdminAuth(["admin"]), async (req, res) => {
  try {
    const course = await Course.find().lean();

    res.render("pages/subCourseCreate", {
      course,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// sub course page post/
routes.post(
  "/subCourseCreate",
  AdminAuth(["admin"]),
  multiupload,
  async (req, res) => {
    try {
      req.body.courseId = req.body.courseId;
      const course = await Course.findById(req.body.courseId);
      req.body.courseName = course.name;

      const data = await subCourse.create(req.body);

      res.redirect("/admin/subCourseList");
    } catch (error) {
      console.log(error);

      const course = await Course.find().lean();
      res.render("pages/subCourse", {
        course,
        message: "Please Select Another Slag",
      });
    }
  }
);

// sub course list get/

routes.get("/subCourseList", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await subCourse.find().sort({ createdAt: -1 }).lean();

    res.render("pages/subCourselist", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// sub course Edit//
routes.get("/subCourseEdit/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await subCourse.findById(id);
    const course = await Course.find().lean();
    res.render("pages/subCourseEdit", {
      data,
      course,
    });
  } catch (error) {
    console.log(error);
  }
});

// sub course update//

routes.post(
  "/subCourseUpdate/:id",
  AdminAuth(["admin"]),
  multiupload,
  async (req, res) => {
    try {
      const id = req.params.id;

      const course = await subCourse.findById(id);
      if (!req.body.image) {
        req.body.image = course.image;
      }
      if (!req.body.courseId) {
        req.body.courseId = course.courseId;
      }
      if (!req.body.courseName) {
        req.body.courseName = course.courseName;
      }
      if (req.body.courseId) {
        const course = await Course.findById(req.body.courseId);
        req.body.courseName = course.name;
      }

      const data = await subCourse.findByIdAndUpdate(id, req.body);
      res.redirect("/admin/subCourseList");
    } catch (error) {
      console.log(error);
    }
  }
);

// delete subcourse by id

routes.get("/subCourseDelete/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await subCourse.findByIdAndDelete(id);
    res.redirect("/admin/subCourseList");
  } catch (error) {
    console.log(error);
  }
});

// sub course delete//

routes.get("/subCourseDelete/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await subCourse.findByIdAndDelete(id);
    res.redirect("/admin/subCourseList");
  } catch (error) {
    console.log(error);
  }
});

// exam category page render/

routes.get("/examCategory", AdminAuth(["admin"]), async (req, res) => {
  try {
    res.render("pages/examCategory", {
      message: "",
    });
  } catch (error) {}
});

// exam category page post/
routes.post("/examCategoryCreate", AdminAuth(["admin"]), async (req, res) => {
  try {
    req.body.category = req.body.category;
    const data = await ExamCategory.create(req.body);

    res.redirect("/admin/examCategoryList");
  } catch (error) {
    console.log(error);
    res.render("pages/examCategory", {
      message: "Please Select Another Slag",
    });
  }
});

// exam category list get/

routes.get("/examCategoryList", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await ExamCategory.find().sort({ createdAt: -1 }).lean();
    res.render("pages/examCategorylist", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// exam category Edit//
routes.get("/examCategoryEdit/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await ExamCategory.findById(id);
    res.render("pages/examCategoryEdit", {
      data,
    });
  } catch (error) {
    console.log(error);
  }
});

// exam category update//

routes.post(
  "/examCategoryUpdate/:id",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const data = await ExamCategory.findByIdAndUpdate(id, req.body);
      res.redirect("/admin/examCategoryList");
    } catch (error) {
      console.log(error);
    }
  }
);

routes.get(
  "/examCategoryDisabled/:id",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;

      const categoryData = await ExamCategory.findById(id);

      if (categoryData.isDisabled == true) {
        const categoryData = await ExamCategory.findByIdAndUpdate(id, {
          isDisabled: false,
        });
      } else {
        const categoryData = await ExamCategory.findByIdAndUpdate(id, {
          isDisabled: true,
        });
      }
      res.redirect("/admin/examCategoryList");
    } catch (error) {
      console.log(error);
    }
  }
);

// logout

routes.get("/logout", (req, res) => {
  res.clearCookie("tokens");
  res.redirect("/admin/login");
});

routes.get("/exam", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await ExamCategory.find({ isDisabled: false })
      .sort({ createdAt: -1 })
      .lean();
    const course = await Course.find().lean();

    res.render("pages/examCreate", {
      data,
      course,
      message: "",
    });
  } catch (error) {}
});

routes.post("/examCreate", AdminAuth(["admin"]), async (req, res) => {
  try {
    const applicationDate = req.body.applicationDate.split(" - ");
    req.body.applicationDate = {
      from: applicationDate[0],
      to: applicationDate[1],
    };

    const examDate = req.body.examDate.split(" - ");
    req.body.examDate = {
      from: examDate[0],
      to: examDate[1],
    };

    if (req.body.examCategoryId) {
      req.body.examCategoryId = req.body.examCategoryId;
      const examCategory = await ExamCategory.findById(req.body.examCategoryId);
      req.body.examCategoryName = examCategory?.examCategory;
    }

    const data = await Exam.create(req.body);

    res.redirect("/admin/examList");
  } catch (error) {
    const data = await ExamCategory.find().sort({ createdAt: -1 }).lean();
    const course = await Course.find().lean();
    console.log(error);
    res.render("pages/examCreate", {
      message: "Please Select Another Slag",
      data,
      course,
    });
  }
});

// exam list get/

routes.get("/examList", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await Exam.find().sort({ createdAt: -1 }).lean();
    res.render("pages/examlist", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// exam Edit//

routes.get("/examEdit/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const examDetail = await Exam.findById(id);
    const data = await ExamCategory.find({ isDisabled: false })
      .sort({ createdAt: -1 })
      .lean();
    const course = await Course.find().lean();

    // applicant date
    examDetail.from = moment(examDetail.applicationDate.from).format(
      "MM/DD/YYYY"
    );
    examDetail.to = moment(examDetail.applicationDate.to).format("MM/DD/YYYY");

    examDetail.date = examDetail.from + " - " + examDetail.to;

    // examdate//

    data.from = moment(examDetail?.examDate?.from).format("MM/DD/YYYY");
    data.to = moment(examDetail?.examDate?.to).format("MM/DD/YYYY");

    examDetail.exam = data.from + " - " + data.to;

    const model = ["Online", "Offline", "Both Online & Offline", "None"];
    const level = ["U.G", "P.G", "Ph.D", "Diploma", "Certificate"];

    const courseData = examDetail.courseId;
    const courseId = await Course.find({ _id: courseData }).lean();

    res.render("pages/examEdit", {
      data,
      examDetail,
      course,
      model,
      level,
      courseId,
    });
  } catch (error) {
    console.log(error);
  }
});

// exam update//

routes.post("/examUpdate/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Exam.findById(id);

    if (!req.body.examCategoryId) {
      req.body.examCategoryId = data?.examCategoryId;
      req.body.examCategoryName = data?.examCategoryName;
    }

    if (req.body.examCategoryId) {
      req.body.examCategoryId = req.body.examCategoryId;
      const examCategory = await ExamCategory.findById(req.body.examCategoryId);
      req.body.examCategoryName = examCategory?.examCategory;
    }
    if (!req.body.courseId) {
      req.body.courseId = data.courseId;
    }

    if (req.body.applicationDate) {
      const applicationDate = req.body.applicationDate.split(" - ");
      req.body.applicationDate = {
        from: applicationDate[0],
        to: applicationDate[1],
      };
    }

    if (req.body.examDate) {
      const examDate = req.body.examDate.split(" - ");
      req.body.examDate = {
        from: examDate[0],
        to: examDate[1],
      };
    }

    const examUpdate = await Exam.findByIdAndUpdate(id, req.body);
    res.redirect("/admin/examList");
  } catch (error) {
    console.log(error);
  }
});

// exam delete//

routes.get("/examDelete/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Exam.findByIdAndDelete(id);
    res.redirect("/admin/examList");
  } catch (error) {
    console.log(error);
  }
});

routes.get("/examSection/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Exam.findById(id);

    // put all section in array

    // const section =   [data.section,data.importantDates,data.applicationForm,data.eligibility,data.admitCard,data.syllabus,data.examPattern,data.counsellingProccess,data.howToPrepare,data.coachingInstitute,data.participateCollege,data.faq,data.newsArticle,data.result,data.seatAllotment,data.cutOff,data.meritList,data.bestBook,data.collegePredictor]

    res.render("pages/examSectionEdit", {
      data,

      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// find the exam other section by id//

routes.get(
  "/editSectionForUpdate/:id/:section",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const section = req.params.section;
      const data = await Exam.findById(id);
      // find that array by section name

      const sectionData = data[section];

      res.render("pages/examSectionUpdate", {
        data,
        section,
        sectionData,
        section,
        message: "",
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// update the exam  array by  field name//

routes.post(
  "/examSectionUpdatedByName/:id/:section",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;

      const update = await Exam.findByIdAndUpdate(id, req.body);

      res.redirect("/admin/examSection/" + id);
    } catch (error) {
      console.log(error);
    }
  }
);

// exam section delete//by id

// delete the exam section by id

routes.get(
  "/examSubpartsDelete/:id/:section/:sectionId",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const section = req.params.section;
      const sectionId = req.params.sectionId;
      const data = await Exam.findById(id);
      const sectionData = data[section];

      const sectionDelete = await Exam.findByIdAndUpdate(id, {
        $pull: { [section]: { _id: sectionId } },
      });
      res.redirect("/admin/examSection/" + id);
    } catch (error) {
      console.log(error);
    }
  }
);

// college create

routes.get("/college", AdminAuth(["admin"]), async (req, res) => {
  const course = await Course.find().sort({ createdAt: -1 }).lean();
  const data = await subCourse.find().sort({ createdAt: -1 }).lean();
  const exam = await Exam.find().sort({ createdAt: -1 }).lean();
  const state = await State.find().sort({ createdAt: -1 }).lean();
  const courseCategoryDetail = await courseCategory
    .find()
    .sort({ createdAt: -1 })
    .lean();
  try {
    res.render("pages/collegeCreate", {
      message: "",
      course,
      data,
      exam,
      state,
      courseCategoryDetail,
    });
  } catch (error) {
    console.log(error);
  }
});

// get course by courseCategory id

routes.get(
  "/getCourseByCourseCategoryId",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.query.courseCategoryId;

      const course = await Course.find({ courseCategoryId: id }).lean();

      res.send(course);
    } catch (error) {}
  }
);

// create college/

routes.post(
  "/collegeCreate",
  AdminAuth(["admin"]),
  multiupload2,
  async (req, res) => {
    try {
      const applicationDate = req.body.applicationDate.split(" - ");
      req.body.applicationDate = {
        from: applicationDate[0],
        to: applicationDate[1],
      };

      const data = await College.create(req.body);
      res.redirect("/admin/collegeList");
    } catch (error) {
      console.log(error);
      const course = await Course.find().sort({ createdAt: -1 }).lean();
      const data = await subCourse.find().sort({ createdAt: -1 }).lean();
      const exam = await Exam.find().sort({ createdAt: -1 }).lean();
      const state = await State.find().sort({ createdAt: -1 }).lean();
      const courseCategoryDetail = await courseCategory
        .find()
        .sort({ createdAt: -1 })
        .lean();

      res.render("pages/collegeCreate", {
        message: "Please Select Another Slag",
        course,
        data,
        exam,
        state,
        courseCategoryDetail,
      });
    }
  }
);

routes.get("/collegeList", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await College.find().sort({ createdAt: -1 }).lean();
    res.render("pages/collegelist", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// get the subCourseId by usinng multi courseId/

routes.get("/getSubCourseId", AdminAuth(["admin"]), async (req, res) => {
  try {
    const courseId = req.query.courseId;

    const id = courseId.split(",");

    const subCourseId = await subCourse.find({ courseId: id }).lean();

    res.send(subCourseId);
  } catch (error) {
    console.log(error);
  }
});

// get district by state id

routes.get("/getDistrictByStateId", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.query.stateId;

    const district = await District.find({ stateId: id }).lean();

    res.send(district);
  } catch (error) {}
});

routes.get("/collegeDelete/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await College.findByIdAndDelete(id);
    res.redirect("/admin/collegeList");
  } catch (error) {
    console.log(error);
  }
});

routes.get("/collegeEdit/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;

    const collegeData = await College.findById(id).lean();
    const courseCategoryDetail = await courseCategory
      .find()
      .sort({ createdAt: -1 })
      .lean();

    // collegeDate convert to mmddyyy

    collegeData.from = moment(collegeData?.applicationDate?.from).format(
      "MM/DD/YYYY"
    );
    collegeData.to = moment(collegeData?.applicationDate?.to).format(
      "MM/DD/YYYY"
    );

    collegeData.date = collegeData.from + " - " + collegeData.to;

    const course = await Course.find().lean();
    const data = await subCourse.find().lean();
    const exams = await Exam.find().lean();
    const state = await State.find().lean();
    const courses = collegeData.courseId;
    const subCourseData = collegeData.subCourseId;
    const examData = collegeData.examId;
    const hostelData = collegeData.hostel;
    const facilityData = collegeData.facility;

    const courseData = await Course.find({ _id: courses }).lean();

    const subCourseDetail = await subCourse.find({ _id: subCourseData }).lean();

    const examDetail = await Exam.find({ _id: examData }).lean();

    const instituteType = ["Private", "Government", "Semi Government"];

    const feesRange = [
      "Less Than 1 Lakh",
      "1 To 2 Lakh",
      "2 To 3 Lakh",
      "3 To 4 Lakh",
      "4 To 5 Lakh",
      "Greater Than 5 Lakh",
    ];

    const studyMode = ["Distance", "Part Time", "Regular"];

    const hostel = ["Boys", "Girls"];

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

    const district = await District.findById(collegeData.districtId).lean();

    res.render("pages/collegeEdit", {
      collegeData,
      district,
      subCourseDetail,
      data,
      course,
      instituteType,
      exams,
      examDetail,
      state,
      message: "",
      courseData,
      course,
      feesRange,
      studyMode,
      hostel,
      hostelData,
      facility,
      facilityData,
      courseCategoryDetail,
    });
  } catch (error) {
    console.log(error);
  }
});

// update college/

routes.post(
  "/collegeUpdate/:id",
  AdminAuth(["admin"]),
  multiupload2,
  async (req, res) => {
    try {
      if (req.body.isPopular == "on") {
        req.body.isPopular = true;
      } else {
        req.body.isPopular = false;
      }

      if (req.body.isTop == "on") {
        req.body.isTop = true;
      } else {
        req.body.isTop = false;
      }

      const id = req.params.id;
      const college = await College.findById(id);

      if (!req.body.courseId) {
        req.body.courseId = college.courseId;
      }
      if (!req.body.subCourseId) {
        req.body.subCourseId = college.subCourseId;
      }
      if (!req.body.examId) {
        req.body.examId = college.examId;
      }
      if (!req.body.stateId) {
        req.body.stateId = college.stateId;
      }
      if (!req.body.districtId) {
        req.body.districtId = college.districtId;
      }
      if (!req.body.instituteType) {
        req.body.instituteType = college.instituteType;
      }
      if (!req.body.image) {
        req.body.image = college.image;
      }

      if (!req.body.studyMode) {
        req.body.studyMode = college.studyMode;
      }

      if (!req.body.collegeType) {
        req.body.collegeType = college.collegeType;
      }

      if (!req.body.icon) {
        req.body.icon = college.icon;
      }
      if (!req.body.brochureUrl) {
        req.body.brochureUrl = college.brochureUrl;
      }

      if (req.body.applicationDate) {
        const applicationDate = req.body.applicationDate.split(" - ");
        req.body.applicationDate = {
          from: applicationDate[0],
          to: applicationDate[1],
        };
      }

      const data = await College.findByIdAndUpdate(id, req.body);

      res.redirect("/admin/collegeList");
    } catch (error) {
      console.log(error);
    }
  }
);

routes.get("/collegeSection/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;

    const data = await College.findById(id);
    res.render("pages/collegeSectionEdit", {
      data,
      message: "",
    });
  } catch (error) {}
});

// find the college other section by id//

routes.get(
  "/editCollegeSectionForUpdate/:id/:section",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const section = req.params.section;
      const data = await College.findById(id);
      // find that array by section name

      const sectionData = data[section];

      res.render("pages/collegeSectionUpdate", {
        data,
        section,
        sectionData,
        section,
        message: "",
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// college section delete by id

routes.get(
  "/collegeSubpartsDelete/:id/:section/:sectionId",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const section = req.params.section;
      const sectionId = req.params.sectionId;
      const data = await College.findById(id);
      const sectionData = data[section];

      const sectionDelete = await College.findByIdAndUpdate(id, {
        $pull: { [section]: { _id: sectionId } },
      });
      res.redirect("/admin/collegeSection/" + id);
    } catch (error) {
      console.log(error);
    }
  }
);

// faq list

routes.get("/faqList", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await Faq.find().sort({ createdAt: -1 }).lean();
    res.render("pages/faqlist", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// faq create

routes.get("/faq", AdminAuth(["admin"]), async (req, res) => {
  try {
    const course = await Course.find().sort({ createdAt: -1 }).lean();
    res.render("pages/faqCreate", {
      message: "",
      course,
    });
  } catch (error) {
    console.log(error);
  }
});

// faq create post

routes.post("/faqCreate", AdminAuth(["admin"]), async (req, res) => {
  try {
    const courseId = req.body.courseId;

    const courseData = await Course.findById(courseId);

    req.body.courseName = courseData.name;

    const data = await Faq.create(req.body);
    res.redirect("/admin/faqList");
  } catch (error) {
    console.log(error);

    const course = await Course.find().sort({ createdAt: -1 }).lean();
    res.render("pages/faqCreate", {
      message: "Please Select Another Slag",
      course,
    });
  }
});

// faq edit

routes.get("/faqEdit/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Faq.findById(id);

    const course = await Course.find().sort({ createdAt: -1 }).lean();
    res.render("pages/faqEdit", {
      data,
      course,
    });
  } catch (error) {
    console.log(error);
  }
});

// faq update

routes.post("/faqUpdate/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await Faq.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/admin/faqList");
  } catch (error) {
    console.log(error);
  }
});

// faq delete

routes.get("/faqDelete/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Faq.findByIdAndDelete(id);
    res.redirect("/admin/faqList");
  } catch (error) {
    console.log(error);
  }
});

// carrercategory page render/

routes.get("/careerCategory", AdminAuth(["admin"]), async (req, res) => {
  try {
    res.render("pages/careerCategoryCreate", {
      message: "",
    });
  } catch (error) {}
});

// career category page post/
routes.post(
  "/careerCategoryCreate",
  AdminAuth(["admin"]),
  multiupload2,
  async (req, res) => {
    try {
      req.body.category = req.body.category;
      const data = await carrerCategory.create(req.body);

      res.redirect("/admin/careerCategoryList");
    } catch (error) {
      console.log(error);
      res.render("pages/careerCategory", {
        message: "Please Select Another Slag",
      });
    }
  }
);

// career category list get/

routes.get("/careerCategoryList", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await carrerCategory.find().sort({ createdAt: -1 }).lean();
    res.render("pages/careerCategorylist", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// career category Edit//
routes.get(
  "/careerCategoryEdit/:id",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const data = await carrerCategory.findById(id);
      res.render("pages/careerCategoryEdit", {
        data,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// career category update//

routes.post(
  "/careerCategoryUpdate/:id",
  AdminAuth(["admin"]),
  multiupload2,
  async (req, res) => {
    try {
      const id = req.params.id;
      const data = await carrerCategory.findByIdAndUpdate(id, req.body);
      res.redirect("/admin/careerCategoryList");
    } catch (error) {
      console.log(error);
    }
  }
);

routes.get(
  "/careerCategoryDisabled/:id",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;

      const categoryData = await carrerCategory.findById(id);

      if (categoryData.isDisabled == true) {
        const categoryData = await carrerCategory.findByIdAndUpdate(id, {
          isDisabled: false,
        });
      } else {
        const categoryData = await carrerCategory.findByIdAndUpdate(id, {
          isDisabled: true,
        });
      }
      res.redirect("/admin/careerCategoryList");
    } catch (error) {
      console.log(error);
    }
  }
);

routes.get("/career", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await carrerCategory
      .find({ isDisabled: false })
      .sort({ createdAt: -1 })
      .lean();
    res.render("pages/careerCreate", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

routes.post("/careerCreate", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await Career.create(req.body);
    res.redirect("/admin/careerList");
  } catch (error) {
    console.log(error);
  }
});

routes.get("/careerList", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await Career.find().sort({ createdAt: -1 }).lean();
    res.render("pages/careerlist", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

routes.get("/careerEdit/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Career.findById(id);
    const careerCategory = await carrerCategory
      .find({ isDisabled: false })
      .sort({ createdAt: -1 })
      .lean();

    res.render("pages/careerEdit", {
      data,
      careerCategory,
    });
  } catch (error) {
    console.log(error);
  }
});

routes.post(
  "/careerUpdate/:id",
  AdminAuth(["admin"]),
  multiupload2,
  async (req, res) => {
    try {
      const data = await Career.findByIdAndUpdate(req.params.id, req.body);
      res.redirect("/admin/careerList");
    } catch (error) {
      console.log(error);
    }
  }
);

routes.get("/careerDelete/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Career.findByIdAndDelete(id);
    res.redirect("/admin/careerList");
  } catch (error) {
    console.log(error);
  }
});

routes.get("/careerSection/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Career.findById(id);

    // put all section in careerSection

    // const section =   [data.section,data.importantDates,data.applicationForm,data.eligibility,data.admitCard,data.syllabus,data.examPattern,data.counsellingProccess,data.howToPrepare,data.coachingInstitute,data.participateCollege,data.faq,data.newsArticle,data.result,data.seatAllotment,data.cutOff,data.meritList,data.bestBook,data.collegePredictor]

    res.render("pages/careerSectionEdit", {
      data,

      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

routes.get(
  "/editCareerSectionForUpdate/:id/:section",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const gallery = "gallery";
      const id = req.params.id;
      const section = req.params.section;
      const data = await Career.findById(id);
      // find that array by section name

      const sectionData = data[section];

      res.render("pages/careerSectionUpdate", {
        data,
        section,
        sectionData,
        section,
        gallery,
        message: "",
      });
    } catch (error) {
      console.log(error);
    }
  }
);

routes.get(
  "/carrerSubpartsDelete/:id/:section/:sectionId",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const section = req.params.section;
      const sectionId = req.params.sectionId;
      const data = await College.findById(id);
      const sectionData = data[section];

      const sectionDelete = await College.findByIdAndUpdate(id, {
        $pull: { [section]: { _id: sectionId } },
      });
      res.redirect("/admin/collegeSection/" + id);
    } catch (error) {
      console.log(error);
    }
  }
);

// career section update by id/

routes.post(
  "/careerSectionUpdateByName/:id/:section",
  AdminAuth(["admin"]),
  multiupload2,
  async (req, res) => {
    try {
      const id = req.params.id;

      const update = await Career.findByIdAndUpdate(id, req.body);

      res.redirect("/admin/careerSection/" + id);
    } catch (error) {
      console.log(error);
    }
  }
);

// college section update by id

routes.post(
  "/collageSectionUpdateByName/:id/:section",
  AdminAuth(["admin"]),
  multiupload,
  async (req, res) => {
    try {
      const id = req.params.id;

      if (req.body.gallery) {
        const multiImages = req.body.gallery.filter(
          (gallery) => gallery !== ""
        );
        req.body.gallery = multiImages;
      }

      const update = await College.findByIdAndUpdate(id, req.body);

      res.redirect("/admin/collegeSection/" + id);
    } catch (error) {
      console.log(error);
    }
  }
);

// sliderlist page render//

routes.get("/sliderList", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await Slider.find().sort({ createdAt: -1 }).lean();
    res.render("pages/sliderlist", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// slider page render//

routes.get("/slider", AdminAuth(["admin"]), async (req, res) => {
  try {
    res.render("pages/sliderCreate", {
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// slider create post//

routes.post(
  "/sliderCreate",
  AdminAuth(["admin"]),
  multiupload2,
  async (req, res) => {
    try {
      const data = await Slider.create(req.body);
      res.redirect("/admin/sliderList");
    } catch (error) {
      console.log(error);
    }
  }
);

// slider edit//

routes.get("/sliderEdit/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Slider.findById(id);
    res.render("pages/sliderEdit", {
      data,
    });
  } catch (error) {
    console.log(error);
  }
});

// slider update/

routes.post(
  "/sliderUpdate/:id",
  AdminAuth(["admin"]),
  multiupload2,
  async (req, res) => {
    try {
      const slider = await Slider.findById(req.params.id);

      if (!req.body.image) {
        req.body.image = slider.image;
      }
      if (!req.body.alt) {
        req.body.alt = slider.alt;
      }

      const id = req.params.id;
      const data = await Slider.findByIdAndUpdate(id, req.body);
      res.redirect("/admin/sliderList");
    } catch (error) {
      console.log(error);
    }
  }
);

// user list

routes.get("/userList", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await User.find().sort({ createdAt: -1 }).lean();
    // convert data.dob to mm/dd/yyyy

    data.forEach((item) => {
      item.dob = moment(item.dob).format("MM/DD/YYYY");
    });

    res.render("pages/userlist", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// sliderDelete/

routes.get("/sliderDelete/:id", AdminAuth(["admin"]), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Slider.findByIdAndDelete(id);
    res.redirect("/admin/sliderList");
  } catch (error) {
    console.log(error);
  }
});

// image aws work/
routes.post("/file", uploadS3.single("file"), async (req, res) => {
  try {
    res.send(req.file.location);
  } catch (error) {
    console.log(error);
  }
});

routes.get("/userSearchlist", AdminAuth(["admin"]), async (req, res) => {
  try {
    const data = await User.find().sort({ createdAt: -1 }).lean();
    // convert data.dob to mm/dd/yyyy

    data.forEach((item) => {
      item.dob = moment(item.dob).format("MM/DD/YYYY");
    });

    res.render("pages/userSearchlist", {
      data,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
});

// get search history  by userId///

routes.get(
  "/getSearchHistoryByUserId/:id",
  AdminAuth(["admin"]),
  async (req, res) => {
    try {
      const userId = req.params.id;

      const userDetail = await User.findById(userId);
      const userName = userDetail?.name;
      const data = await SearchHistory.find({ userId: userId }).lean();

      data.forEach((item) => {
        item.createdAt = moment(item.createdAt).format("DD/MM/YYYY");
      });

      res.render("pages/userWiseSearchHistory", {
        data,
        userName,
        message: "",
      });
    } catch (error) {}
  }
);

module.exports = routes;

// Financial.create({
//   links:"rgghrt"
// })

// Counter.create({
//    totalVisitor:"0",
//    happyCustomer:"0",
//    liveProject:"0",
//    totalProject:"0",
// })
