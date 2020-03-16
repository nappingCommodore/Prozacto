const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 200,
        unique: true
    },
    files: [{
        name: String,
        file: Object
    }]
});

const Files = mongoose.model('Files', FileSchema);

exports.Files = Files;
