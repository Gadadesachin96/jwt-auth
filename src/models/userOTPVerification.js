const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();


const userOTPVerificationSchema = new Schema({
        userId:String,
        otp:Number,
        // createdAt:Date,
        // expiresAt:Date

});


const userOTPVerification =mongoose.model(
"userOTPVerification",
userOTPVerificationSchema
);
module.exports = userOTPVerification;