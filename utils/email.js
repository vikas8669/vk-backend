// emailService.js
import 'dotenv/config';
import { Resend } from 'resend';
import {
  Verification_Email_Template,
  Welcome_Email_Template,
  Contact_Email_Template,
  Admin_Reply_Email_Template
} from '../utils/emailTampalete.js';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send verification email
 */
export const sendVerificationEmail = async (email, code) => {
  const htmlContent = Verification_Email_Template(code);
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: "Verify your Email",
    html: htmlContent,
  });
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = Welcome_Email_Template(name);
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: "Welcome Email",
    html: htmlContent,
  });
};

/**
 * Send contact form submission email (to admin)
 */
export const sendContactEmail = async ({ name, email, mobile, description }) => {
  const htmlContent = Contact_Email_Template({ name, email, mobile, description });
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: "vikasyadav326234@gmail.com", // admin email
    subject: "New Contact Form Submission",
    html: htmlContent,
  });
};

/**
 * Send admin reply email to user
 */
export const sendAdminReplyEmail = async ({ name, email, reply }) => {
  const htmlContent = Admin_Reply_Email_Template({ name, reply });
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: "Reply to your message",
    html: htmlContent,
  });
};