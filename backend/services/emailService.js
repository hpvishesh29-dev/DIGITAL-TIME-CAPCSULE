import { getTransporter } from '../config/nodemailer.js';

/**
 * Helper to delay execution between retries
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Categorizes and logs full error trace
 */
const logEmailError = (label, error) => {
  console.error(`\n=== [EMAIL SYSTEM ERROR]: ${label} ===`);
  if (error && error.code === 'EAUTH') {
    console.error('SMTP Authentication Error');
    console.error('Invalid App Password');
  }
  if (error && error.stack) {
    console.error(error.stack);
  } else {
    console.error(error || label);
  }
  console.error('======================================\n');
};

/**
 * Requirement 9 & 10 & 14 & 15:
 * Sends time capsule unlock email using Nodemailer and Gmail App Password credentials.
 * Includes 3x retry mechanism and complete error logging.
 */
export const sendUnlockEmail = async (params = {}) => {
  const { email, userName, memoryTitle, unlockDate } = params || {};

  const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const rawPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

  if (!user || !rawPass) {
    const missingErr = new Error('Missing Environment Variable: GMAIL_USER or GMAIL_APP_PASSWORD is not set.');
    logEmailError('Missing Environment Variable', missingErr);
    return {
      success: false,
      error: 'Missing Environment Variable: GMAIL_USER or GMAIL_APP_PASSWORD',
    };
  }

  const toEmail = email || user;
  if (!toEmail) {
    const err = new Error('Missing Recipient Email Address');
    logEmailError('Missing Environment Variable', err);
    return {
      success: false,
      error: 'Recipient email address is required',
    };
  }

  const transporter = getTransporter();
  if (!transporter) {
    const err = new Error('Transport Creation Failed: Transporter instance is null');
    logEmailError('Transport Creation Failed', err);
    return {
      success: false,
      error: 'Transport Creation Failed',
    };
  }

  const formattedName = userName || 'Time Keeper';
  const formattedTitle = memoryTitle || 'Time Capsule Memory';
  const formattedDate = unlockDate || new Date().toLocaleString();

  // Requirement 10: Email Subject & Body
  const subject = '🔓 Your Chrona Time Capsule has been Unlocked!';
  const textBody = `Hello ${formattedName},

Your Time Capsule "${formattedTitle}" has reached its unlock time.

Open Chrona to relive your memory.

Unlocked:
${formattedDate}

Thank you for using Chrona.`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #070b14; color: #e2e8f0; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; }
    .title { font-size: 20px; font-weight: bold; color: #38bdf8; margin-bottom: 16px; }
    .content { font-size: 15px; line-height: 1.6; color: #94a3b8; }
    .highlight { color: #ffffff; font-weight: bold; }
    .date-box { background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 12px; margin: 16px 0; color: #38bdf8; font-weight: 600; }
    .footer { margin-top: 24px; font-size: 13px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">🔓 Your Chrona Time Capsule has been Unlocked!</div>
    <div class="content">
      <p>Hello <span class="highlight">${formattedName}</span>,</p>
      <p>Your Time Capsule "<span class="highlight">${formattedTitle}</span>" has reached its unlock time.</p>
      <p>Open Chrona to relive your memory.</p>
      <div class="date-box">Unlocked:<br/>${formattedDate}</div>
      <p class="footer">Thank you for using Chrona.</p>
    </div>
  </div>
</body>
</html>`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Chrona Time Capsule" <${user}>`,
    to: toEmail,
    subject: subject,
    text: textBody,
    html: htmlBody,
  };

  // Requirement 14: Retry up to 3 times
  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);

      if (info && (info.accepted?.length > 0 || info.messageId)) {
        // Requirement 15: If email succeeds print exact log format
        console.log(`📧 Unlock email sent to ${toEmail}`);
        return {
          success: true,
          messageId: info.messageId,
        };
      } else {
        throw new Error(`Gmail did not accept message delivery (response: ${JSON.stringify(info)})`);
      }
    } catch (err) {
      lastError = err;
      if (err.code === 'EAUTH' || err.responseCode === 535) {
        logEmailError('SMTP Authentication Error', err);
        logEmailError('Invalid App Password', err);
        // Auth errors won't fix themselves on retry, but we fulfill requirements by attempting retry loop
      } else {
        console.warn(`[SendMail Attempt ${attempt}/${MAX_RETRIES} Failed]: ${err.message}`);
      }

      if (attempt < MAX_RETRIES) {
        await delay(attempt * 500);
      }
    }
  }

  // If all retries failed
  logEmailError('SendMail Failed', lastError);
  return {
    success: false,
    error: lastError?.message || 'SendMail Failed after 3 retries',
  };
};

export const sendUnlockAlertEmail = sendUnlockEmail;

export const sendWelcomeEmail = async (toEmail, userName) => {
  return sendUnlockEmail({ email: toEmail, userName, memoryTitle: 'Welcome to Chrona', unlockDate: 'Now' });
};

export const sendPasswordResetEmail = async (toEmail, resetLink) => {
  return sendUnlockEmail({ email: toEmail, userName: 'User', memoryTitle: 'Password Reset Request', unlockDate: 'Now' });
};

export const sendPushNotificationEmail = async (toEmail, userName, subject, message) => {
  return sendUnlockEmail({ email: toEmail, userName, memoryTitle: subject, unlockDate: 'Now' });
};

export const sendVaultSummaryEmail = async (toEmail, userName, stats) => {
  return sendUnlockEmail({ email: toEmail, userName, memoryTitle: 'Vault Summary', unlockDate: 'Now' });
};

export default {
  sendUnlockEmail,
  sendUnlockAlertEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPushNotificationEmail,
  sendVaultSummaryEmail,
};
