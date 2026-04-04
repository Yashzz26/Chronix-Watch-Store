const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { db, admin } = require('../config/firebase');
const { sendEmailConfirmation } = require('../services/emailService');
const { normalizePhone } = require('../utils/phone');

const serverTimestamp = () =>
  admin.firestore ? admin.firestore.FieldValue.serverTimestamp() : new Date();

/**
 * POST /api/auth/phone/mark-verified
 * Body: { phone: "+91XXXXXXXXXX" }
 * Used after successful Client-side Firebase Phone Auth to sync profile.
 */
router.post('/phone/mark-verified', verifyToken, async (req, res) => {
  const { phone } = req.body || {};
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const mobile = normalizePhone(phone);
    const userRef = db.collection('users').doc(req.user.uid);
    
    // Extract the verified phone number from the Firebase Auth token
    const userRecord = await admin.auth().getUser(req.user.uid);
    
    // Security check: Match payload with token claim
    if (userRecord.phoneNumber !== mobile) {
      console.warn(`[Auth] Sync mismatch: Token phone ${userRecord.phoneNumber} vs Payload ${mobile}`);
      if (!userRecord.phoneNumber) {
        return res.status(400).json({ error: 'Phone number not verified in Firebase' });
      }
    }

    const verifiedPhone = userRecord.phoneNumber || mobile;

    await userRef.set(
      {
        phone: verifiedPhone,
        isPhoneVerified: true,
        phoneVerifiedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const profileSnap = await userRef.get();
    const profile = profileSnap.data() || {};

    if (profile?.email) {
      sendEmailConfirmation({ to: profile.email, name: profile.name }).catch((err) =>
        console.warn('[Email] Welcome email failed:', err.message)
      );
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error('[Auth] Phone sync failed:', error.message);
    res.status(500).json({ error: 'Sync failed' });
  }
});

/**
 * POST /api/auth/otp/bypass
 * TEMPORARY: Allows bypassing phone verification for testing.
 */
router.post('/otp/bypass', verifyToken, async (req, res) => {
  try {
    await db.collection('users').doc(req.user.uid).set(
      {
        isPhoneVerified: true,
        phoneBypassedAt: serverTimestamp(),
      },
      { merge: true }
    );
    res.json({ success: true, message: 'OTP verification bypassed' });
  } catch (error) {
    console.error('Bypass failed:', error.message);
    res.status(500).json({ error: 'Bypass failed' });
  }
});

module.exports = router;


