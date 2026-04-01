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

/**
 * MSG91 v5 API requires the mobile number WITHOUT a leading '+'
 */
const stripPlus = (phone) => (phone || '').toString().replace(/^\+/, '');

/**
 * Generate a cryptographically secure 6-digit OTP
 */
const generateNumericOtp = () => {
  const crypto = require('crypto');
  return crypto.randomInt(100000, 999999).toString();
};

async function sendOtpSMS(phone) {
  ensureConfig(['MSG91_API_KEY', 'MSG91_OTP_TEMPLATE_ID']);
  const mobile = normalizePhone(phone);
  const mobileForMsg91 = stripPlus(mobile);

  if (!mobileForMsg91) {
    throw Object.assign(new Error('Phone number required'), { code: 'invalid_phone' });
  }

  console.log(`[MSG91] Sending OTP via Query Params to ${mobileForMsg91}`);

  try {
    // Using Query Params (some MSG91 accounts only work this way)
    const response = await client.get('/otp', {
      params: {
        template_id: MSG91_OTP_TEMPLATE_ID,
        mobile: mobileForMsg91,
        authkey: MSG91_API_KEY,
        sender: MSG91_SENDER_ID,
        otp_length: MSG91_OTP_LENGTH,
        otp_expiry: MSG91_OTP_EXPIRY,
      }
    });

    console.log('[MSG91] Response:', JSON.stringify(response.data, null, 2));

    if (response.data?.type === 'error') {
      throw Object.assign(new Error(response.data.message || 'MSG91 provider error'), {
        response: { data: response.data },
      });
    }

    return { mobile, providerResponse: response.data };
  } catch (error) {
    const errorData = error.response?.data || {};
    console.error('[MSG91] Send failed:', JSON.stringify(errorData, null, 2));
    throw error;
  }
}

async function verifyOtpSMS(phone, otp) {
  ensureConfig(['MSG91_API_KEY', 'MSG91_OTP_TEMPLATE_ID']);
  const mobile = normalizePhone(phone);
  const mobileForMsg91 = stripPlus(mobile);

  if (!mobileForMsg91 || !otp) {
    throw Object.assign(new Error('Phone and OTP required'), { code: 'invalid_payload' });
  }

  console.log(`[MSG91] Verifying OTP for ${mobile}`);

  try {
    const response = await client.get('/otp/verify', {
      params: {
        authkey: MSG91_API_KEY,
        mobile: mobileForMsg91,
        otp: otp.toString(),
      }
    });
    return { mobile, providerResponse: response.data };
  } catch (error) {
    const errorData = error.response?.data || {};
    console.error('[MSG91] Verification failed:', JSON.stringify(errorData, null, 2));
    throw error;
  }
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
