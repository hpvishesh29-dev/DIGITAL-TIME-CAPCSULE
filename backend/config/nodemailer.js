import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// 5. Verify dotenv is loaded before creating transporter
dotenv.config();

let transporterInstance = null;

/**
 * 6. Create transporter exactly once (Singleton Pattern)
 * 4. Read credentials ONLY from process.env
 */
export const getTransporter = () => {
  if (transporterInstance) {
    return transporterInstance;
  }

  dotenv.config();

  const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const rawPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : '';

  if (!user || !pass) {
    const missingErr = new Error(
      `Missing Environment Variable: GMAIL_USER or GMAIL_APP_PASSWORD is not defined in process.env.`
    );
    console.error('Missing Environment Variable');
    console.error(missingErr.stack);
    return null;
  }

  try {
    transporterInstance = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    return transporterInstance;
  } catch (error) {
    console.error('Transport Creation Failed');
    console.error(error.stack || error);
    return null;
  }
};

/**
 * 7. Call transporter.verify() during server startup and print:
 *    ✓ Gmail SMTP Connected
 *    or the actual SMTP error.
 */
export const verifyTransporter = async () => {
  dotenv.config();
  const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const rawPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

  if (!user || !rawPass) {
    const missingErr = new Error(
      `Missing Environment Variable: GMAIL_USER or GMAIL_APP_PASSWORD is not set in process.env`
    );
    console.error('Missing Environment Variable');
    console.error(missingErr.stack);
    return false;
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.error('Transport Creation Failed');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✓ Gmail SMTP Connected');
    return true;
  } catch (error) {
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.error('SMTP Authentication Error');
      console.error('Invalid App Password');
    } else {
      console.error('Transport Creation Failed');
    }
    console.error(error.stack || error);
    return false;
  }
};

export default getTransporter;
