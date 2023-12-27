const HttpStatus = require('http-status-codes');

const ProductCodeService = require('../services/productCode.service');

const {excelBuffer2json} = require('../utils/excel.util');
const { array } = require('../utils/multer.util');

// for ejs//
 const bulkInsertCompany = async (req, res, next) => {
  try {

    const buffer = req.files[0].buffer;

    const companyData = excelBuffer2json(buffer);
// console.log(companyData);

// convert companyData field to code
// let newArray = [];
// companyData.forEach(element => {
//   newArray['code'] = element['Authentic code'] ;
//   console.log(newArray) 
// }
// );

if(companyData){
  let section = [];

  companyData.forEach(element => {
    section.push(element['sectionData'])
  }
  );
  // console.log("section",section);
}

console.log("aaaaa",companyData)



let newArray = companyData.map(({ 'name': name }) => ({ name }));

    const data = await ProductCodeService.bulkInsertCompany(newArray);
res.redirect("/admin/productCodeList")

  } catch (error) {
    next(error);
  }
 }


 const bulkInsert= async (req, res, next) => {
try {
  const buffer = req.files[0].buffer;

  const companyData = excelBuffer2json(buffer);

  const data = await ProductCodeService.bulkInsertCompany(companyData);

// res.send({ Message:"School Created Succesfully", data });
res.status(HttpStatus.CREATED).json({
  code: HttpStatus.CREATED,
  data: data,
  message: 'City created successfully'
});

} catch (error) {
  next(error);
}
}

module.exports = {
  bulkInsertCompany,bulkInsert 
}


