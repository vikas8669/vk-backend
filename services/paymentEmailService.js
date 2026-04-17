const { transporter } = require("../config/sendMail")

const sendPaymentSuccessEmail = async ({
    to,
    userName,
    projectTitle,
    downloadUrl,
    invoiceUrl
}) => {
    if (!to) return

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#f7f7f7;padding:24px;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
          <h2 style="margin:0 0 16px;color:#111827;">Payment Successful</h2>
          <p style="color:#374151;line-height:1.6;">
            Hi ${userName || "there"}, your payment for <strong>${projectTitle}</strong> was successful.
          </p>
          <p style="color:#374151;line-height:1.6;">
            Your secure download link is valid for 24 hours and can be used only once.
          </p>
          <p style="margin:24px 0;">
            <a href="${downloadUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;">Download Product</a>
          </p>
          <p style="color:#374151;line-height:1.6;">
            Invoice: <a href="${invoiceUrl}">${invoiceUrl}</a>
          </p>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;">
            If you did not make this purchase, please contact support immediately.
          </p>
        </div>
      </div>
    `

    await transporter.sendMail({
        from: `"Bom~X" <${process.env.EMAIL_USER_NAME}>`,
        to,
        subject: "Payment Successful - Your Download Link",
        html
    })
}

module.exports = {
    sendPaymentSuccessEmail
}


