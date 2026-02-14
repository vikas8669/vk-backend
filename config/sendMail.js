const nodemailer = require("nodemailer")
require("dotenv").config()

exports.transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER_NAME,
    pass: process.env.EMIAL_PASS_KEY,
  },
});