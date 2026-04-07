const nodemailer = require('nodemailer');

const DEFAULT_MAX_ATTEMPTS = Math.max(1, parseInt(process.env.EMAIL_MAX_ATTEMPTS, 10) || 3);
const DEFAULT_BACKOFF_MS = Math.max(100, parseInt(process.env.EMAIL_RETRY_BASE_DELAY, 10) || 500);
const ENV_FROM = process.env.EMAIL_FROM || process.env.SMTP_FROM || '';
const DEFAULT_FROM = ENV_FROM || 'Chronix <no-reply@chronix.com>';
const DEFAULT_APP_URL = process.env.FRONTEND_URL || process.env.APP_URL || 'https://chronix.app';

const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 587;
const smtpSecure = typeof process.env.SMTP_SECURE === 'string'
  ? ['true', '1', 'yes'].includes(process.env.SMTP_SECURE.toLowerCase())
  : smtpPort === 465;

const requiredEnv = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: smtpPort,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: ENV_FROM,
};

const missingEnv = Object.entries(requiredEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const smtpConfigured = missingEnv.length === 0;

const buildTransporter = () => {
  if (!smtpConfigured) {
    console.warn('[EmailService] SMTP disabled. Missing vars: %s', missingEnv.join(', '));
    return {
      async sendMail(options) {
        console.warn('[EmailService] Fallback mode - email NOT sent. to=%s subject=%s', maskEmail(options.to), options.subject);
        return { messageId: 'fallback', skipped: true };
      }
    };
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 5),
    maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 100),
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'false' ? false : true,
    },
  });

  transport.verify()
    .then(() => console.info('[EmailService] SMTP transporter verified (%s:%s).', process.env.SMTP_HOST, smtpPort))
    .catch((err) => console.error('[EmailService] SMTP verification failed:', err.message));

  return transport;
};

const transporter = buildTransporter();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function maskEmail(email = '') {
  if (!email || typeof email !== 'string') return '';
  const [local, domain] = email.split('@');
  if (!domain) {
    return `${email.slice(0, 2)}***`;
  }
  const prefix = local.slice(0, Math.min(2, local.length)) || '*';
  return `${prefix}***@${domain}`;
}

function buildEmailShell({ title, bodyHtml, ctaUrl, ctaLabel = 'Explore Cronix' }) {
  const buttonHtml = ctaUrl
    ? `<p style="text-align:center;margin:32px 0"><a href="${ctaUrl}" style="background:#111;color:#fff;padding:12px 28px;text-decoration:none;border-radius:4px;display:inline-block">${ctaLabel}</a></p>`
    : '';

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f7f7f7;padding:24px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 8px 20px rgba(0,0,0,0.05);">
        <h1 style="color:#111;font-size:24px;margin-bottom:16px;">${title}</h1>
        ${bodyHtml}
        ${buttonHtml}
        <p style="font-size:13px;color:#6b6b6b;margin-top:32px;">Need help? Contact <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@chronix.com'}">support@chronix.com</a>.</p>
      </div>
      <p style="text-align:center;font-size:12px;color:#999;margin-top:16px;">&copy; ${new Date().getFullYear()} Chronix. All rights reserved.</p>
    </div>
  `;
}

async function dispatchWithRetry(mailOptions, maxAttempts = DEFAULT_MAX_ATTEMPTS) {
  if (!smtpConfigured) {
    console.warn('[EmailService] Email skipped (service disabled). to=%s subject=%s', maskEmail(mailOptions.to), mailOptions.subject);
    return { success: false, skipped: true, reason: 'SMTP_NOT_CONFIGURED' };
  }

  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      console.info('[EmailService] Sending email attempt %s to %s', attempt, maskEmail(mailOptions.to));
      const info = await transporter.sendMail(mailOptions);
      console.info('[EmailService] Email delivered: %s', info.messageId);
      return { success: true, messageId: info.messageId, info, attempt };
    } catch (error) {
      lastError = error;
      console.error('[EmailService] Attempt %s failed for %s: %s', attempt, maskEmail(mailOptions.to), error.message);
      if (attempt >= maxAttempts) {
        return { success: false, error: error.message, attempt, details: error };
      }
      const delay = DEFAULT_BACKOFF_MS * Math.pow(2, attempt - 1);
      await wait(delay);
    }
  }

  return { success: false, error: lastError ? lastError.message : 'Unknown error', attempt: maxAttempts };
}

async function sendEmail({ to, subject, html, text, replyTo, headers }, options = {}) {
  if (!to) throw new Error('Recipient email address (to) is required.');
  if (!subject) throw new Error('Email subject is required.');
  if (!html && !text) throw new Error('Email content is required. Provide html or text.');

  const mailOptions = {
    from: DEFAULT_FROM,
    to,
    subject,
    html,
    text,
    replyTo: replyTo || process.env.EMAIL_REPLY_TO || DEFAULT_FROM,
    headers,
  };

  const maxAttempts = Math.max(1, options.maxAttempts || DEFAULT_MAX_ATTEMPTS);
  return dispatchWithRetry(mailOptions, maxAttempts);
}

function buildWelcomeTemplate(name = 'Chronix Explorer', ctaUrl = DEFAULT_APP_URL) {
  const bodyHtml = `
    <p style="font-size:16px;color:#333;">Hi ${name || 'there'},</p>
    <p style="font-size:16px;color:#333;">Welcome to Chronix! Your phone has been verified and your account is ready.</p>
    <ul style="font-size:15px;color:#333;line-height:1.6;">
      <li>Track premium watch drops in real time</li>
      <li>Access exclusive COD-friendly checkouts</li>
      <li>Manage warranties and support from a single dashboard</li>
    </ul>
    <p style="font-size:15px;color:#333;">Tap below to explore your dashboard.</p>
  `;
  return buildEmailShell({ title: 'Welcome aboard', bodyHtml, ctaUrl, ctaLabel: 'Open Dashboard' });
}

function buildOtpTemplate(name = 'Chronix Explorer', otp, expiresInMinutes = process.env.MSG91_OTP_EXPIRY || 10) {
  const bodyHtml = `
    <p style="font-size:16px;color:#333;">Hi ${name || 'there'},</p>
    <p style="font-size:16px;color:#333;">Use the one-time passcode below to continue:</p>
    <div style="font-size:32px;font-weight:bold;letter-spacing:6px;text-align:center;margin:24px 0;color:#111;">${otp}</div>
    <p style="font-size:14px;color:#555;">This code expires in ${expiresInMinutes} minutes.</p>
  `;
  return buildEmailShell({ title: 'Your Chronix verification code', bodyHtml, ctaUrl: null });
}

async function sendWelcomeEmail({ to, name, ctaUrl } = {}) {
  if (!to) throw new Error('Recipient email address is required for welcome email.');
  const html = buildWelcomeTemplate(name, ctaUrl);
  const text = `Hi ${name || 'there'}, your Chronix account is ready. Visit ${DEFAULT_APP_URL} to explore.`;
  return sendEmail({ to, subject: 'Welcome to Chronix', html, text });
}

async function sendOTPEmail({ to, name, otp, expiresInMinutes } = {}) {
  if (!to) throw new Error('Recipient email address is required for OTP email.');
  if (!otp) throw new Error('OTP value is required.');
  const html = buildOtpTemplate(name, otp, expiresInMinutes);
  const text = `Your Chronix verification code is ${otp}. It expires in ${expiresInMinutes || process.env.MSG91_OTP_EXPIRY || 10} minutes.`;
  return sendEmail({ to, subject: 'Your Chronix verification code', html, text });
}

async function sendEmailConfirmation(args) {
  return sendWelcomeEmail(args);
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOTPEmail,
  sendEmailConfirmation,
  isEmailServiceEnabled: smtpConfigured,
};
