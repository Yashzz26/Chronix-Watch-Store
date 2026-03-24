const crypto = require('crypto');

// Simulated backend logic
function verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature, secret) {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === razorpaySignature;
}

// User's provided keys from screenshot
const secret = 'SVvfsEsfmt57IAdp0NzryGPh';
const razorpay_order_id = 'order_DUMMY_ID';
const razorpay_payment_id = 'pay_DUMMY_ID';

// Generate a valid signature for the test
const body = `${razorpay_order_id}|${razorpay_payment_id}`;
const razorpay_signature = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

console.log('Testing Razorpay Signature Verification:');
console.log('Order ID:', razorpay_order_id);
console.log('Payment ID:', razorpay_payment_id);
console.log('Generated Signature:', razorpay_signature);

const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, secret);

if (isValid) {
  console.log('✅ PASS: Signature verified correctly');
} else {
  console.log('❌ FAIL: Signature verification failed');
  process.exit(1);
}

// Test invalid signature
const isInvalidValid = verifySignature(razorpay_order_id, razorpay_payment_id, 'invalid_sig', secret);
if (!isInvalidValid) {
  console.log('✅ PASS: Invalid signature correctly rejected');
} else {
  console.log('❌ FAIL: Invalid signature was accepted');
  process.exit(1);
}
