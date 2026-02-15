// emailTemplates.js

// ---------------------------
// Verification Email Template
// ---------------------------
const Verification_Email_Template = (code) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; color: #333; margin: 0; padding: 0; }
    .container {
      max-width: 600px; margin: 30px auto; padding: 30px; border-radius: 12px;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    h2 { text-align: center; font-size: 28px; font-weight: bold; background: linear-gradient(90deg, #ff7ce5, #7f5af0, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px; }
    .code { display: block; text-align: center; font-size: 32px; font-weight: bold; margin: 20px 0; padding: 15px; border-radius: 8px; background: rgba(255,255,255,0.2); letter-spacing: 4px; }
    .footer { text-align: center; font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Email Verification</h2>
    <p>Hello,</p>
    <p>Please use the following verification code to verify your email address:</p>
    <span class="code">${code}</span>
    <p class="footer">If you did not request this, please ignore this email.</p>
  </div>
</body>
</html>
`;

// ---------------------------
// Welcome Email Template
// ---------------------------
const Welcome_Email_Template = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome Email</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; color: #333; margin: 0; padding: 0; }
    .container {
      max-width: 600px; margin: 30px auto; padding: 30px; border-radius: 12px;
      background: linear-gradient(135deg, #06b6d4 0%, #4f46e5 100%); color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    h2 { text-align: center; font-size: 28px; font-weight: bold; background: linear-gradient(90deg, #ff7ce5, #7f5af0, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px; }
    p { font-size: 16px; margin: 10px 0; line-height: 1.5; }
    .footer { text-align: center; font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Welcome, ${name}!</h2>
    <p>Thank you for joining our platform. We’re excited to have you onboard!</p>
    <p>You can now explore all the features and start building amazing things.</p>
    <p class="footer">If you have any questions, feel free to reply to this email. We’re happy to help!</p>
  </div>
</body>
</html>
`;

// ---------------------------
// Contact Email Template
// ---------------------------
const Contact_Email_Template = ({ name, email, mobile, description }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Form Submission</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; color: #333; margin: 0; padding: 0; }
    .container {
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      border-radius: 12px; max-width: 600px; margin: 30px auto; padding: 30px; color: #fff;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    .header { text-align: center; margin-bottom: 25px; }
    .header h2 {
      font-size: 28px; font-weight: bold;
      background: linear-gradient(90deg, #ff7ce5, #7f5af0, #0ea5e9);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .info {
      background: rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px;
    }
    .info p { font-size: 16px; margin-bottom: 10px; }
    .info strong { color: #fef3c7; }
    .footer { text-align: center; font-size: 12px; color: rgba(255,255,255,0.8); }
    @media only screen and (max-width: 600px) { .container { padding: 20px; } .header h2 { font-size: 24px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h2>New Contact Form Submission</h2></div>
    <div class="info">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile Number:</strong> ${mobile}</p>
      <p><strong>Message:</strong> ${description}</p>
      <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <div class="footer">This email was generated automatically from your website contact form.</div>
  </div>
</body>
</html>
`;

module.exports = {
  Verification_Email_Template,
  Welcome_Email_Template,
  Contact_Email_Template,
};
