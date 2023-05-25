require('dotenv').config();
const nodemailer = require('nodemailer') 


let transporter = nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
    port:process.env.EMAIL_PORT,
   secure:false ,// true for 465 , false for other ports
   service: "gmail" , 
   auth:{
user:process.env.EMAIL_USER, //GMAIL ID
pass:process.env.PASS_USER,  // GMAIL PASSWORD

   }

})

module.exports = transporter