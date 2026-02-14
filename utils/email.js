const { transporter } = require("../config/sendMail");
const { Verification_Email_Template, Welcome_Email_Template, Contact_Email_Template } = require("../utils/emailTampalete");

exports.sendVerificationEmail = async (email, code) => {
  const htmlContent = Verification_Email_Template.replace("{verificationCode}", code);
  await transporter.sendMail({
    from: `"Bom~X" <${process.env.EMAIL_USER_NAME}>`,
    to: email,
    subject: "Verify your Email",
    html: htmlContent,
  });
};

exports.sendWelcomeEmail = async (email, name) => {
  const htmlContent = Welcome_Email_Template.replace("{name}", name);
  await transporter.sendMail({
    from: `"Bom~X" <${process.env.EMAIL_USER_NAME}>`,
    to: email,
    subject: "Welcome Email",
    html: htmlContent,
  });
};

exports.sendContactEmail = async ({ name, email, mobileNumber, description }) => {
  const htmlContent = Contact_Email_Template({ name, email, mobileNumber, description });
  await transporter.sendMail({
    from: `"Website Contact" <${process.env.EMAIL_USER_NAME}>`,
    to: "vikayadave8669@gmail.com", // your receiving email
    subject: "New Contact Form Submission",
    html: htmlContent,
  });
};
