const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { db, admin } = require('../config/firebase');
const { sendOtpSMS, verifyOtpSMS, sendEmailConfirmation, normalizePhone } = require('../services/msg91');

const serverTimestamp = () =>
  admin.firestore ? admin.firestore.FieldValue.serverTimestamp() : new Date();

/**
 * POST /api/auth/otp/send
 * Body: { phone: "+91XXXXXXXXXX" }
 * Requires Firebase ID token. Sends OTP via MSG91.
 */
router.post('/otp/send', verifyToken, async (req, res) => {
  const { phone } = req.body || {};
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  try {
    const mobile = normalizePhone(phone);
    await sendOtpSMS(mobile);
    await db.collection('users').doc(req.user.uid).set(
      {
        phone: mobile,
        isPhoneVerified: false,
        lastOtpRequestedAt: serverTimestamp(),
      },
      { merge: true }
    );
    res.json({ success: true, phone: mobile });
  } catch (error) {
    console.error('MSG91 OTP send failed:', error.response?.data || error.message);
    res.status(400).json({
      error: error.response?.data?.message || error.message || 'OTP send failed',
      code: error.response?.data?.type || error.code || 'otp_send_failed',
    });
  }
});

/**
 * POST /api/auth/otp/verify
 * Body: { phone: "+91XXXXXXXXXX", otp: "123456" }
 * On success, marks Firestore user as phone verified and sends confirmation email.
 */
router.post('/otp/verify', verifyToken, async (req, res) => {
  const { phone, otp } = req.body || {};
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  try {
    const mobile = normalizePhone(phone);
    await verifyOtpSMS(mobile, otp);
    await db.collection('users').doc(req.user.uid).set(
      {
        phone: mobile,
        isPhoneVerified: true,
        phoneVerifiedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const profileSnap = await db.collection('users').doc(req.user.uid).get();
    const profile = profileSnap.data() || {};

    if (profile?.email) {
      sendEmailConfirmation({ to: profile.email, name: profile.name }).catch((err) =>
        console.warn('MSG91 confirmation email failed:', err.message)
      );
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error('MSG91 OTP verify failed:', error.response?.data || error.message);
    res.status(400).json({
      error: error.response?.data?.message || error.message || 'OTP verification failed',
      code: error.response?.data?.type || error.code || 'otp_verify_failed',
    });
  }
});

module.exports = router;
