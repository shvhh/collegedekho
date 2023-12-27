const course = require("../models/course");



module.exports = {
  async bulkInsertCompany(data) {
    



// console.log("data",data);

    const result = course.bulkWrite(data.map(doc => ({
      updateOne: {
          filter: {code: doc.name},
          update: doc,
          upsert: true,
  }
  })))

   
    console.log(result);
    return result;
  },
};
