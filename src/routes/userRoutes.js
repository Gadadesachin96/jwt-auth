const express = require("express");
const { login, registration,changePassword,sendMail,userPasswordReset } = require("../controller/userController");
const userRouter = express.Router();
const  checkUserAuth = require('../middlewares/auth-middleware')

// route level Middleware (protect route)
userRouter.use('/changepassword', checkUserAuth);


// public routes
userRouter.post("/registration",registration)
userRouter.post("/login",login);
userRouter.post("/sendMail",sendMail);
userRouter.post("/userPasswordReset/:id/:token",userPasswordReset);

const userOTPVerification =require("../models/userOTPVerification");

// private routes   
userRouter.post("/changepassword",changePassword,checkUserAuth)


module.exports  = userRouter