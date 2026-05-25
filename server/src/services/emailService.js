const nodemailer = require('nodemailer');

/**
 * Creates a transporter.
 * Uses configured SMTP (e.g. Gmail) when EMAIL_HOST is set in .env,
 * regardless of NODE_ENV. Falls back to Ethereal (fake SMTP) only
 * when no EMAIL_HOST is configured.
 */
const createTransporter = async () => {
  // Use real SMTP when configured (works in both dev and production)
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host:   process.env.EMAIL_HOST,
      port:   Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback: auto-generate an Ethereal test account (no real delivery)
  console.warn('⚠️  No EMAIL_HOST configured — using Ethereal (emails won\'t be delivered).');
  const testAccount = await nodemailer.createTestAccount();
  const transporter  = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return transporter;
};

/**
 * Send a password-reset email.
 * @param {{ to: string, name: string, resetUrl: string }} opts
 */
const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const transporter = await createTransporter();
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@jansamadhan.com';
  const from = `"JanSamadhan" <${fromEmail}>`;

  // Log which SMTP config is being used
  console.log(`📧 Email config → HOST: ${process.env.EMAIL_HOST || 'Ethereal'}, USER: ${process.env.EMAIL_USER || 'test'}, TO: ${to}`);

  // Verify the SMTP connection is working before sending
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully.');
  } catch (verifyErr) {
    console.error('❌ SMTP connection FAILED:', verifyErr.message);
    throw verifyErr;
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Reset your JanSamadhan password',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password</title>
</head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">JanSamadhan</h1>
            <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">Grievance Redressal Portal</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 24px;">
            <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px;font-weight:700;">Reset your password</h2>
            <p style="margin:0 0 8px;color:#475569;font-size:15px;line-height:1.6;">Hello <strong>${name}</strong>,</p>
            <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.6;">
              We received a request to reset your password. Click the button below to choose a new one.
              This link is valid for <strong>15 minutes</strong>.
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding-bottom:28px;">
                <a href="${resetUrl}"
                   style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                  Reset Password
                </a>
              </td></tr>
            </table>

            <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.6;">
              Or copy and paste this URL into your browser:
            </p>
            <p style="margin:0 0 28px;word-break:break-all;">
              <a href="${resetUrl}" style="color:#2563eb;font-size:13px;">${resetUrl}</a>
            </p>

            <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:14px 16px;margin-bottom:8px;">
              <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                ⚠️ If you didn't request a password reset, you can safely ignore this email. Your password won't change.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #f1f5f9;">
            <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
              © ${new Date().getFullYear()} JanSamadhan. All rights reserved.<br/>
              This is an automated message — please do not reply.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);

    // Print Ethereal preview URL if not using real SMTP
    if (!process.env.EMAIL_HOST) {
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        console.log(`\n📧 Password reset email preview: ${testUrl}\n`);
      }
    }

    return info;
  } catch (sendErr) {
    console.error('❌ Email sending FAILED:', sendErr.message);
    console.error('   Full error:', sendErr);
    throw sendErr;
  }
};

module.exports = { sendPasswordResetEmail };
