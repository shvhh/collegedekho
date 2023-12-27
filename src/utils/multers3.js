
const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

var s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.AWS_BUCKET
  });
  
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        console.log(file);
        cb(null, { fieldName: file.originalname });
      },
      key: function (req, file, cb) {
        console.log(file);
        const uniqueName =
          Date.now() +
          '-' +
          Math.floor(Math.random() * 1000000000) +
          '-' +
          file.originalname.replace(/\s/g, '_');
        req.fileName = `https://${process.env.AWS_BUCKET}.s3.ap-south-1.amazonaws.com/${uniqueName}`;
        console.log(req.fileName);
        cb(null, uniqueName);
      }
    })
  });

  module.exports = upload;