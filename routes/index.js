var express = require('express');
var router = express.Router();
var multer = require('multer');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost/nodejsauth';
var path = require('path');
const auth = require('../middleware/auth');
const { User, validate } = require('../models/user.model');
const { Appointment } = require('../models/appointment.model');
const { Files } = require('../models/file.model');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, `../uploads`))
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

var multerUpload = multer({storage: storage}).any('file_data');

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

router.post('/upload', auth, async function(req, res, next) {
  const user = await User.findById(req.user._id).select("-password");
  if(user.role === 'PATIENT') {
    multerUpload(req, res, async (err) => {
      if(err) {
        res.status(500).json({'Error': 'Some error occured while file upload.'});
      } else {
        res.json({'message': 'File uploaded successfully'});
      }
    });

    req.files.map(async (file) => {
      console.log(file);
      let files = await Files.findOne({userid: req.user._id});
      if(files) {
        files.files.push({name: file.fieldname, file: file});
        await files.save();
      } else {
        files = new Files({
          userid: req.user._id,
          files: [{
            name: file.fieldname, file: file
          }]
        });
        await files.save();
      }
    });
  } else {
    res.status(401).json({'Error': 'You are not authorised to perform this action.'});
  }
});

router.delete('/deleteUpload', auth, async function(req, res, next) {
  const user = await User.findById(req.user._id).select("-password");

});

router.get('/viewUpload', auth, async function(req, res, next) {
  const user = await User.findById(req.user._id).select("-password");
  if(user.role === 'DOCTOR' || user.role === 'PATIENT') {
    const files = await Files.findOne({userid: req.query.id});
    res.send(files);
  } else {
    res.status(401).send({'Error': 'You dont have access to view this resource.'})
  }
});

router.post('/setAppointment', auth, async function(req, res, next) {
  const user = await User.findById(req.user._id).select("-password");
  console.log(user);
  if(user.role === 'ASSISTANT') {
    let appointment = await Appointment.findOne({DoctorId: req.body.DoctorId, AppointmentDateTime: req.body.AppointmentDateTime});
    if(appointment) {
      return res.status(400).status("Slot is not empty");
    } else {
      appointment = new Appointment({
        PatientName: req.body.PatientName,
        PatientId: req.body.PatientId,
        DoctorName: req.body.DoctorName,
        DoctorId: req.body.DoctorId,
        AppointmentDateTime: req.body.AppointmentDateTime
      });
      await appointment.save();

      res.send({
        _id: appointment._id,
        PatientName: req.body.PatientName,
        PatientId: req.body.PatientId,
        DoctorName: req.body.DoctorName,
        DoctorId: req.body.DoctorId,
        AppointmentDateTime: req.body.AppointmentDateTime
      });
    }
  } else {
    res.status(401).send({"Error": "You don't have access to create appointments."})
  }
});

router.get('/getAppointmentByDoctor', auth, async function(req, res, next) {
  const user = await (await User.findById(req.user._id)).isSelected("-password");
  if(user.role === 'DOCTOR' || user.role === 'ASSISTANT') {
    let appointment = await Appointment.findOne({DoctorId: req.body.DoctorId, AppointmentDateTime: req.body.AppointmentDateTime});
    if(appointment) {
      res.send({
        _id: appointment._id,
        PatientName: req.body.PatientName,
        PatientId: req.body.PatientId,
        DoctorName: req.body.DoctorName,
        DoctorId: req.body.DoctorId,
        AppointmentDateTime: req.body.AppointmentDateTime
      });
    } else {
      res.send("This slot is free.");
    }
  } else {
    res.status(401).send({"Error": "You dont have access for this resource."});
  }
});

router.get('/getAppointmentByPatient', auth, async function(req, res, next) {
  const user = await (await User.findById(req.user._id)).isSelected("-password");
  if(user.role === 'DOCTOR' || user.role === 'ASSISTANT') {
    let appointment = await Appointment.findOne({PatientId: req.body.PatientId});
    if(appointment) {
      res.send({
        _id: appointment._id,
        PatientName: req.body.PatientName,
        PatientId: req.body.PatientId,
        DoctorName: req.body.DoctorName,
        DoctorId: req.body.DoctorId,
        AppointmentDateTime: req.body.AppointmentDateTime
      });
    } else {
      res.send("No appointment found.");
    }
  } else {
    res.status(401).send({"Error": "You dont have access for this resource."});
  }
});


module.exports = router;
