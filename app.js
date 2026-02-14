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

const { transporter } = require("../config/emailConfig")
const { Verification_Email_Template, Welcome_Email_Template } = require("../utils/emailTamplete")

exports.verificationEmail = async (email, verificationCode) => {

    try {

        const htmlContent = Verification_Email_Template.replace("{verificationCode}", verificationCode)

        const response = await transporter.sendMail({
            from: '"Bom~X" <vikayadave8669@gmail.com>',
            to: email,
            subject: "Verify your Email",
            text: "Verify your Email",
            html: htmlContent
        })
        console.log(response)
    } catch (error) {
        console.log("Email verification error : ", error)
    }
}




exports.senWelcomeEmail = async (name) => {
    try {

        const htmlContent = Welcome_Email_Template.replace("{name}", name)

        const response = await transporter.sendMail({
            from: '"Bom~X" <vikayadave8669@gmail.com>',

            // to: email, // list of receivers
            subject: "Welcome Email", // Subject line
            text: "Welcome Email", // plain text body
            html: htmlContent
        })
        console.log('Email send Successfully', response)
        // console.log("Email sent", response)

    } catch (error) {
        console.log('Email ', error)
    }
}

// emailTemplates.js

const Verification_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Segoe UI', Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08); }
    .header { background: linear-gradient(135deg, #4CAF50, #43a047); color: #ffffff; padding: 24px; text-align: center; font-size: 28px; font-weight: 600; }
    .content { padding: 30px; line-height: 1.7; }
    .content p { margin-bottom: 16px; font-size: 15px; }
    .verification-code { display: block; margin: 25px auto; padding: 15px; width: fit-content; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #2e7d32; background-color: #e8f5e9; border-radius: 6px; border: 1px dashed #66bb6a; }
    .note { font-size: 14px; color: #666; }
    .footer { background-color: #f1f3f5; padding: 18px; text-align: center; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Verify Your Email</div>
    <div class="content">
      <p>Hello,</p>
      <p>Thank you for registering with us. To complete your signup, please verify your email address using the code below:</p>
      <span class="verification-code">{verificationCode}</span>
      <p class="note">This code is valid for a limited time. If you did not create an account, you can safely ignore this email.</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Your Company. All rights reserved.</div>
  </div>
</body>
</html>
`;

const Welcome_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Segoe UI', Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08); }
    .header { background: linear-gradient(135deg, #007BFF, #0056b3); color: #ffffff; padding: 26px; text-align: center; font-size: 28px; font-weight: 600; }
    .content { padding: 30px; line-height: 1.7; }
    .content p { margin-bottom: 16px; font-size: 15px; }
    .welcome-name { font-size: 20px; font-weight: 600; margin-bottom: 10px; }
    .features { margin: 20px 0; padding-left: 18px; }
    .features li { margin-bottom: 10px; font-size: 14px; }
    .button { display: inline-block; margin: 25px 0; padding: 14px 32px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600; }
    .footer { background-color: #f1f3f5; padding: 18px; text-align: center; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Welcome Aboard 🎉</div>
    <div class="content">
      <p class="welcome-name">Hello {name},</p>
      <p>Welcome to our community! We’re excited to have you with us. Your account has been successfully verified, and you’re all set to explore.</p>
      <p>Here’s what you can do next:</p>
      <ul class="features">
        <li>Discover and personalize your dashboard</li>
        <li>Stay updated with our latest features</li>
        <li>Contact our support team anytime you need help</li>
      </ul>
      <a href="#" class="button">Get Started</a>
      <p>If you have any questions, feel free to reply to this email. We’re always happy to help.</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Your Company. All rights reserved.</div>
  </div>
</body>
</html>
`;

module.exports = {
    Verification_Email_Template,
    Welcome_Email_Template
};
