const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    PatientName: String,
    PatientId: String,
    DoctorName: String,
    DoctorId: String,
    AppointmentDateTime: Date
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

exports.Appointment = Appointment
