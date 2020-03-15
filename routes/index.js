var express = require('express');
var router = express.Router();
var multer = require('multer');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost/nodejsauth';
var path = require('path');
const auth = require("../middleware/auth");
const { User, validate } = require("../models/user.model");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
var multerUpload = multer({storage: storage});

// var insertDocuments = function(db, filePath, callback) {
//   var collection = db.collection('User');
//   collection.insertOne({'docPath' : filePath }, (err, result) => {
//       assert.equal(err, null);
//       callback(result);
//   });
// }

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html', { title: 'Express' });
});

router.post('/upload', auth, multerUpload.any(), async function(req, res, next) {
  const user = await User.findById(req.user._id).select("-password");
  if(user.role === 'PATIENT') {
    res.json({'message': 'File uploaded successfully'});
  } else {
    res.status(400).json({'Error': 'You are not authorised to perform this action.'});
  }
  
});

router.delete('/deleteUpload', function(req, res, next) {

});

router.get('/viewUpload', function(req, res, next) {

});

module.exports = router;
