const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { db, admin } = require('../config/firebase');
const { sendEmailConfirmation } = require('../services/emailService');
const { normalizePhone } = require('../utils/phone');

const serverTimestamp = () =>
  admin.firestore ? admin.firestore.FieldValue.serverTimestamp() : new Date();

const wait = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const fetchUserRecord = async (uid, attempts = 3) => {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await admin.auth().getUser(uid);
    } catch (error) {
      lastError = error;
      await wait(200 * (i + 1));
    }
  }
  throw lastError;
};

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
    const payloadPhone = normalizePhone(phone);
    const userRef = db.collection('users').doc(req.user.uid);
    const userRecord = await fetchUserRecord(req.user.uid, 4);

    if (!userRecord?.phoneNumber) {
      return res.status(409).json({ error: 'Firebase Auth has not stored a verified phone number yet. Retry in a moment.' });
    }

    const verifiedPhone = normalizePhone(userRecord.phoneNumber);
    if (verifiedPhone !== payloadPhone) {
      console.warn(`[Auth] Sync mismatch: Auth=${verifiedPhone} Payload=${payloadPhone}`);
    }

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
    profile.isPhoneVerified = true;
    profile.phone = verifiedPhone;

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
 * DEV ONLY: Allows bypassing phone verification for local testing.
 * 🔐 Completely disabled in production.
 */
if (
  (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') &&
  process.env.ENABLE_OTP_BYPASS === 'true'
) {
  router.post('/otp/bypass', verifyToken, async (req, res) => {
    try {
      await db.collection('users').doc(req.user.uid).set(
        {
          isPhoneVerified: true,
          phoneBypassedAt: serverTimestamp(),
        },
        { merge: true }
      );
      res.json({ success: true, message: 'OTP verification bypassed (dev only)' });
    } catch (error) {
      console.error('Bypass failed:', error.message);
      res.status(500).json({ error: 'Bypass failed' });
    }
  });
} else {
  // Block the route entirely in production
  router.post('/otp/bypass', (_req, res) => {
    res.status(403).json({ error: 'OTP bypass is disabled in production.' });
  });
}

module.exports = router;
