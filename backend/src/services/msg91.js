const axios = require('axios');

const {
  MSG91_API_KEY,
  MSG91_SENDER_ID = 'CHRONX',
  MSG91_OTP_TEMPLATE_ID,
  MSG91_OTP_LENGTH = '6',
  MSG91_OTP_EXPIRY = '10',
  MSG91_EMAIL_TEMPLATE_ID,
  MSG91_EMAIL_FROM,
  MSG91_EMAIL_FROM_NAME = 'Chronix',
  MSG91_EMAIL_REPLY_TO,
  MSG91_EMAIL_SUBJECT = 'Phone verification confirmed',
} = process.env;

const MSG91_BASE_URL = process.env.MSG91_BASE_URL || 'https://api.msg91.com/api/v5';

const client = axios.create({
  baseURL: MSG91_BASE_URL,
  timeout: 10000,
  headers: {
    authkey: MSG91_API_KEY,
    'Content-Type': 'application/json',
  },
});

const ensureConfig = (fields = []) => {
  const missing = fields.filter((f) => !process.env[f]);
  if (missing.length) {
    throw new Error(`Missing MSG91 config: ${missing.join(', ')}`);
  }
};

const normalizePhone = (phone) => {
  if (!phone) return '';
  const trimmed = phone.toString().replace(/\s+/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  if (trimmed.length === 10) return `+91${trimmed}`;
  if (!trimmed.startsWith('+') && !trimmed.startsWith('0')) return `+${trimmed}`;
  return trimmed;
};

async function sendOtpSMS(phone) {
  ensureConfig(['MSG91_API_KEY', 'MSG91_OTP_TEMPLATE_ID']);
  const mobile = normalizePhone(phone);
  if (!mobile) {
    throw Object.assign(new Error('Phone number required'), { code: 'invalid_phone' });
  }
  await client.post('/otp', {
    template_id: MSG91_OTP_TEMPLATE_ID,
    mobile,
    sender_id: MSG91_SENDER_ID,
    otp_length: Number(MSG91_OTP_LENGTH),
    otp_expiry: Number(MSG91_OTP_EXPIRY),
  });
  return { mobile };
}

async function verifyOtpSMS(phone, otp) {
  ensureConfig(['MSG91_API_KEY', 'MSG91_OTP_TEMPLATE_ID']);
  const mobile = normalizePhone(phone);
  if (!mobile || !otp) {
    throw Object.assign(new Error('Phone and OTP required'), { code: 'invalid_payload' });
  }
  await client.post('/otp/verify', {
    template_id: MSG91_OTP_TEMPLATE_ID,
    mobile,
    otp: otp.toString(),
  });
  return { mobile };
}

async function sendEmailConfirmation({ to, name }) {
  if (!MSG91_EMAIL_TEMPLATE_ID || !MSG91_EMAIL_FROM || !MSG91_API_KEY) {
    return;
  }
  try {
    await client.post('/email/send', {
      recipients: [
        {
          to: [{ email: to, name: name || 'Chronix user' }],
        },
      ],
      from: {
        email: MSG91_EMAIL_FROM,
        name: MSG91_EMAIL_FROM_NAME,
      },
      reply_to: MSG91_EMAIL_REPLY_TO || MSG91_EMAIL_FROM,
      template_id: MSG91_EMAIL_TEMPLATE_ID,
      subject: MSG91_EMAIL_SUBJECT,
      variables: { name: name || 'Chronix user' },
    });
  } catch (err) {
    console.warn('MSG91 email send failed:', err.response?.data || err.message);
  }
}

module.exports = {
  sendOtpSMS,
  verifyOtpSMS,
  sendEmailConfirmation,
  normalizePhone,
};
