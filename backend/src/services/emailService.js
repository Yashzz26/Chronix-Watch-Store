const nodemailer = require('nodemailer');

const {
  SMTP_HOST = 'smtp.gmail.com',
  SMTP_PORT = 587,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = 'Chronix <no-reply@chronix.com>',
} = process.env;

/**
 * Configure Nodemailer Transport
 * Falls back to a dummy sender if SMTP is not configured
 */
const createTransport = () => {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[Chronix Email] SMTP credentials missing. Emails will not be sent.');
    return {
      sendMail: async (opts) => {
        console.warn('[Chronix Email] DUMMY_SEND: to: %s subject: %s', opts.to, opts.subject);
        return { messageId: 'dummy_id' };
      }
    };
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const transporter = createTransport();

/**
 * Sends a welcome email or verification confirmation
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 */
async function sendEmailConfirmation({ to, name }) {
  if (!to) return;
  
  const mailOptions = {
    from: SMTP_FROM,
    to,
    subject: 'Welcome to Chronix - Phone Verification Confirmed',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="color: #bf9e53; font-size: 24px;">Greetings, ${name || 'Chronix User'}</h1>
        <p style="font-size: 16px; line-height: 1.5;">
          Your mobile number has been successfully verified! 
          You can now proceed with secure checkouts and manage your premium watch orders.
        </p>
        <p style="font-size: 14px; color: #666; margin-top: 32px;">
          Regards,<br>
          <strong>Team Chronix</strong>
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Chronix Email] Confirmation sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('[Chronix Email] FAILED to send email:', error.message);
    throw error;
  }
}

module.exports = {
  sendEmailConfirmation
};
