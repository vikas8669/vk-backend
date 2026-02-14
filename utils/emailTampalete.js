const Verification_Email_Template = `...`; // existing
const Welcome_Email_Template = `...`; // existing

const Contact_Email_Template = ({ name, email, mobileNumber, description }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Form Submission</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f6f9fc; color: #333; padding: 20px; }
    .container { background-color: #fff; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    h2 { color: #007BFF; }
    p { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Mobile Number:</strong> ${mobileNumber}</p>
    <p><strong>Message:</strong> ${description}</p>
    <p>Submitted on: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
`;

module.exports = {
  Verification_Email_Template,
  Welcome_Email_Template,
  Contact_Email_Template,
};
