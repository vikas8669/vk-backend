// emailService.js
import 'dotenv/config';
import { transporter } from '../config/sendMail.js';
import {
  Verification_Email_Template,
  Welcome_Email_Template,
  Contact_Email_Template,
  Admin_Reply_Email_Template
} from '../utils/emailTampalete.js';

/**
 * Send verification email
 */
export const sendVerificationEmail = async (email, code) => {
  const htmlContent = Verification_Email_Template(code);
  transporter.sendMail({
    from: `"Bom~X" <${process.env.EMAIL_USER_NAME}>`,
    to: email,
    subject: "Verify your Email",
    html: htmlContent,
  }).catch(err => console.error("Verification email error:", err));
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = Welcome_Email_Template(name);
  transporter.sendMail({
    from: `"Bom~X" <${process.env.EMAIL_USER_NAME}>`,
    to: email,
    subject: "Welcome Email",
    html: htmlContent,
  }).catch(err => console.error("Welcome email error:", err));
};

/**
 * Send contact form submission email (to admin)
 */
export const sendContactEmail = async ({ name, email, mobile, description }) => {
  const htmlContent = Contact_Email_Template({ name, email, mobile, description });
  transporter.sendMail({
    from: `"Website Contact" <${process.env.EMAIL_USER_NAME}>`,
    to: "vikasyadav326234@gmail.com", // admin email
    subject: "New Contact Form Submission",
    html: htmlContent,
  }).catch(err => console.error("Contact email error:", err));
};

/**
 * Send admin reply email to user
 */
export const sendAdminReplyEmail = async ({ name, email, reply }) => {
  const htmlContent = Admin_Reply_Email_Template({ name, reply });
  transporter.sendMail({
    from: `"Support Team" <${process.env.EMAIL_USER_NAME}>`,
    to: email,
    subject: "Reply to your message",
    html: htmlContent,
  }).catch(err => console.error("Admin reply email error:", err));
};