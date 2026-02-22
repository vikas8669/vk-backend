// emailTemplates.js

// ---------------------------
// Verification Email Template
// ---------------------------
const Verification_Email_Template = (code) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" 
          style="background:#ffffff;border-radius:10px;padding:40px;box-shadow:0 5px 20px rgba(0,0,0,0.05);">
          
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="margin:0;color:#111;font-size:24px;">
                Verify Your Email Address
              </h2>
            </td>
          </tr>

          <tr>
            <td style="color:#555;font-size:16px;line-height:1.6;text-align:center;">
              Please use the verification code below to complete your registration.
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:30px 0;">
              <div style="display:inline-block;
                          background:#4f46e5;
                          color:#ffffff;
                          font-size:28px;
                          font-weight:bold;
                          padding:14px 28px;
                          border-radius:8px;
                          letter-spacing:4px;">
                ${code}
              </div>
            </td>
          </tr>

          <tr>
            <td style="text-align:center;color:#888;font-size:14px;">
              This code will expire in 10 minutes.<br/>
              If you didn’t request this, please ignore this email.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;


// ---------------------------
// Welcome Email Template
// ---------------------------
const Welcome_Email_Template = (name) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:10px;padding:40px;box-shadow:0 5px 20px rgba(0,0,0,0.05);">
          
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="margin:0;color:#111;font-size:24px;">
                Welcome to Our Platform 🎉
              </h2>
            </td>
          </tr>

          <tr>
            <td style="color:#555;font-size:16px;line-height:1.6;">
              Hi <strong>${name}</strong>,
              <br/><br/>
              Thank you for joining us. Your account has been successfully created.
              You can now explore all features and start using the platform.
              <br/><br/>
              If you have any questions, feel free to contact our support team.
            </td>
          </tr>

          <tr>
            <td style="padding-top:30px;color:#888;font-size:14px;">
              Best regards,<br/>
              <strong>Your Company Team</strong>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;


// ---------------------------
// Contact Email Template
// ---------------------------
const Contact_Email_Template = ({ name, email, mobile, description }) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:10px;padding:40px;box-shadow:0 5px 20px rgba(0,0,0,0.05);">

          <tr>
            <td style="padding-bottom:20px;">
              <h2 style="margin:0;color:#111;font-size:22px;">
                New Contact Form Submission
              </h2>
            </td>
          </tr>

          <tr>
            <td style="color:#555;font-size:15px;line-height:1.8;">
              <strong>Name:</strong> ${name || "Not Provided"} <br/>
              <strong>Email:</strong> ${email || "Not Provided"} <br/>
              <strong>Mobile:</strong> ${mobile || "Not Provided"} <br/><br/>

              <strong>Message:</strong><br/>
              <div style="margin-top:10px;
                          background:#f9fafb;
                          padding:15px;
                          border-radius:6px;
                          border:1px solid #e5e7eb;">
                ${description || "No message provided"}
              </div>

              <br/>
              <strong>Submitted on:</strong> ${new Date().toLocaleString()}
            </td>
          </tr>

          <tr>
            <td style="padding-top:30px;color:#999;font-size:13px;text-align:center;">
              This email was automatically generated from your website contact form.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = {
  Verification_Email_Template,
  Welcome_Email_Template,
  Contact_Email_Template,
};