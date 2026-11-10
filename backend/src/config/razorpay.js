const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID?.trim();
const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

if (!keyId || !keySecret) {
  console.warn('Razorpay credentials are not configured.');
}

if (keyId && keySecret && keyId.startsWith('rzp_test_') === false && keyId.startsWith('rzp_live_') === false) {
  console.warn('Razorpay key ID has an unexpected format.');
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

module.exports = razorpay;
