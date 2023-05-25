const userModel = require("../models/user.js")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const SECRET_KEY = "SECRET_KEY"
const nodemailer = require('nodemailer');
const userOTPVerification = require("../models/userOTPVerification.js");
require('dotenv').config();


// registration
const registration = async (req, resp) => {
  const { name, email, password, password_confirmation, tc } = req.body
  const user = await userModel.findOne({ email: email })
  if (user) {
    resp.send({ "status": "failed", "message": "Email already exists" })
  } else {
    if (name && email && password && password_confirmation && tc) {
      if (password === password_confirmation) {
        try {
          const salt = await bcrypt.genSalt(10)
          const hashPassword = await bcrypt.hash(password, salt)
          const doc = new userModel({
            name: name,
            email: email,
            password: hashPassword,
            tc: tc
          })
          await doc.save()
          //  resp.status(201).send({ "status": "success", "message": "registration done successfully" })
          const saved_user = await userModel.findOne({ email: email })
          // Generate JWT token
          const token = jwt.sign({ userID: saved_user._id },
            SECRET_KEY, { expiresIn: '1200s' })

          resp.status(201).send({ "status": "success", "message": "Registration Success", "token": token })
        } catch (error) {
          console.log(error)
          resp.send({ "status": "failed", "message": "Unable to Register" })
        }
      } else {
        resp.send({ "status": "failed", "message": "Password and Confirm Password doesn't match" })
      }
    } else {
      resp.send({ "status": "failed", "message": "All fields are required" })
    }
  }
}


// login
const login = async (req, resp) => {

  const { email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      return resp.status(404).json({ messege: "User not found" })
    }
    const matchpassword = await bcrypt.compare(password, existingUser.password);
    if (!matchpassword) {
      return resp.status(404).json({ messege: "invalid credentials" });
    }
    // JWT token
    const token = jwt.sign({ email: existingUser.email, id: existingUser.id }, SECRET_KEY);
    resp.status(200).json({ user: existingUser, token: token });

  } catch (error) {
    console.log(error);
    resp.status(500).json({ messege: "something wrong" });
  }


}


// changePassword
const changePassword = async (req, resp) => {
  const { password, password_confirmation } = req.body
  if (password && password_confirmation) {
    if (password != password_confirmation) {
      resp.send({ "status": "failed", "messege": "New password and confirm New password doesn't match" })
    } else {
      const salt = await bcrypt.genSalt(10)
      const newHashPassword = await bcrypt.hash(password, salt)
      resp.send({ "status": "success", "messege": "password changed successfully" })
    }

  } else {
    resp.send({ "status": "failed", "messege": "All fields are required" })
  }
}

// sendMail
const sendMail = async (req, resp) => {
  const { email } = req.body
  if (email) {
    const user = await userModel.findOne({ email: email });
    var otpcode = Math.floor((Math.random() * 10000) + 1000);
    
    const doc = new userOTPVerification({
      userId:user.id,
      otp:otpcode
      // createdAt:Date.()
      // expiresAt:Date.()+36000
    })
    await doc.save()

    if (user) {
      const secret = user._id + process.env.JWT_SECRET_KEY
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: '15m'
      })
      const link = `http://localhost:4000/users/userPasswordReset/${user._id}/${token}`
      // const link = (Math.random() + 1).toString(36).substring(7);

      // send email

      // let info = await transporter.sendMail({

      //   from: 'gadadesachin51@gmail.com',
      //   to: `${email}`,
      //   subject: " Password Reset Link",
      //   html: `<a href=${link}>Click Here</a> to Reset Your Password`
      // })
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'gadadesachin51@gmail.com',
          pass: 'iuuyqpjfyqfwwdvj'
        }

      })

      const mailOptions = {
        from: 'gadadesachin51@gmail.com',
        to: `${email}`,
        subject: 'forgot password',
        html: `<a href=${link}>Click Here</a> to Reset Your Password ,<br> your OTP is <b> ${otpcode}</b> `
      }
      transporter.sendMail(mailOptions, (err, result) => {
        if (err) {
          console.log(err)
          resp.json('oops err occurred')
        } else {
          resp.json('thanks for contacting us');
        }
      })
      resp.send({ "status": "success", "messege": "password reset Email sent , check your mail" })
    } else {
      resp.send({ "status": "failed", "messege": "email does not exist " })
    }
  } else {
    resp.send({ "status": "failed", "messege": "email field is reqd" })
  }
}

// userPasswordReset
const userPasswordReset = async (req, resp) => {
  const { otp,password, password_confirmation } = req.body
  const { id, token } = req.params
  const user = await userModel.findById(id)
  const user1 = await userOTPVerification.findOne({ otp });
  console.log(user1.otp)
  const new_secret = user._id + process.env.JWT_SECRET_KEY
  // resp.send(new_secret)
  try {
    // jwt.verify(token, new_secret)
    if(otp===user1.otp){
      resp.send({ "message": "OTP has been verified successfully" })
    }else
    {
      resp.send({ "message": "Something went wrong" })

    }
    
  } catch (error) {
    console.log(error)
    resp.send({ "status": "failed", "message": "Invalid Token" })
  }
}


//sendOTPverification
//   const sendOTPverification = async(req,resp)=>{
//     try{
// const otp = `${Math.floor(1000 + Math.random()* 9000)}`

// const mailOptions ={
//   from :'gadadesachin51@gmail.com',
//   to:`${email}`,
//   subject:'verify your mail',
//   html:`<p> Enter <b>${otp}<b> to Reset Your Password</p>   `
// }
// // hash otp
// const saltrounds =10
// const hashedOTP = await brcypt.hash(otp,saltrounds);
// const newOTPVerification =await new newOTPVerification({
//   userId:_id,
//   otp:hashedOTP,
//   createdAt:Date.now(),
//   expiresAt:Date.now()+3600000,
// });
// await newOTPVerification.save()
// await transporter.sendMail(mailOptions);
// resp.json({
//   status:"PENDING" ,
//   messege:"otp sent",
//   data:{
//     userId:_id,
//     email,

//   },

// })


// }catch(error) {
// resp.json({
//   status:'FAILED',
//   message:error.messege,
// })
//     }
//   }

// verify otp 
// router.post("/verifyOTP", async (req, resp) => {
//   try {
//     let { userID, otp } = req.body;
//     if (!userID || !otp) {
//       throw Error('empty otp details are not allowed')
//     } else {
//       const userOTPVerificationReccords = await userOTPVerification.find({
//         userId,
//       });
//       if (userOTPVerificationReccords.length <= 0) {
//         throw new Error(
//           " accounts records doesn't exist or has been verified already"
//         )
//       }
//     }
//   } catch (error) {

//   }

// });


module.exports = { registration, login, changePassword, sendMail, userPasswordReset };