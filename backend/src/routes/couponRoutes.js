const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');

/**
 * GET /api/coupons
 * Public: Get all active coupons (for display on product page)
 */
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('coupons').get();
    const coupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

class CouponError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const resolveDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getUsageCounters = (coupon = {}) => {
  const limit =
    Number(coupon.maxRedemptions ??
      coupon.usageLimit ??
      coupon.maxUses ??
      coupon.limit ??
      0) || null;
  const used = Number(coupon.redemptionCount ??
    coupon.timesUsed ??
    coupon.usageCount ??
    0);
  return { limit, used };
};

/**
 * POST /api/coupons/apply
 * Public: Validate a coupon and return adjusted totals
 */
router.post('/apply', async (req, res) => {
  try {
    const { couponCode, cartTotal } = req.body || {};
    if (!couponCode || cartTotal === undefined) {
      return res.status(400).json({ error: 'couponCode and cartTotal are required' });
    }

    const normalizedCode = couponCode.trim().toUpperCase();
    const numericCartTotal = Number(cartTotal);

    if (!normalizedCode) {
      return res.status(400).json({ error: 'Invalid coupon code' });
    }
    if (Number.isNaN(numericCartTotal) || numericCartTotal <= 0) {
      return res.status(400).json({ error: 'cartTotal must be a positive number' });
    }

    const couponSnap = await db
      .collection('coupons')
      .where('code', '==', normalizedCode)
      .limit(1)
      .get();

    if (couponSnap.empty) {
      return res.status(404).json({ error: 'Invalid code' });
    }

    const couponRef = couponSnap.docs[0].ref;

    const result = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(couponRef);
      if (!snapshot.exists) {
        throw new CouponError('Invalid code', 404);
      }

      const coupon = snapshot.data();

      if (!coupon.isActive) {
        throw new CouponError('Coupon inactive');
      }

      const expirySource =
        coupon.expiresAt ||
        coupon.expiryDate ||
        coupon.validTill ||
        coupon.validUntil;
      const expiryDate = resolveDate(expirySource);
      if (expiryDate && expiryDate.getTime() < Date.now()) {
        throw new CouponError('Coupon expired');
      }

      const minimumSpend = Number(coupon.minimumSpend || 0);
      if (numericCartTotal < minimumSpend) {
        throw new CouponError(`Minimum spend not met (₹${minimumSpend})`);
      }

      const discountValue = Number(
        coupon.discountValue ??
        coupon.discount ??
        coupon.value ??
        0
      );
      if (discountValue <= 0) {
        throw new CouponError('Coupon has no discount configured');
      }

      const discountTypeRaw = (coupon.discountType || coupon.type || 'percentage').toLowerCase();
      const discountType =
        discountTypeRaw === 'flat' ||
        discountTypeRaw === 'amount' ||
        discountTypeRaw === 'flat_rate'
          ? 'flat'
          : 'percentage';

      let discountAmount =
        discountType === 'flat'
          ? discountValue
          : (numericCartTotal * discountValue) / 100;

      discountAmount = Math.min(discountAmount, numericCartTotal);
      const finalPrice = Number((numericCartTotal - discountAmount).toFixed(2));

      const { limit, used } = getUsageCounters(coupon);
      if (limit !== null && used >= limit) {
        throw new CouponError('Coupon usage limit reached');
      }

      // 🔐 FIX: coupon usage is now incremented ONLY inside the order creation
      // transaction (orderRoutes.js), NOT here. This prevents "ghost" increments
      // when users apply coupons but never complete the purchase.

      return {
        success: true,
        message: 'Coupon applied',
        coupon: {
          code: coupon.code,
          discountType,
          discountValue,
          minimumSpend,
          expiresAt: expiryDate ? expiryDate.toISOString() : null,
          remainingUses: limit !== null ? Math.max(0, limit - (used + 1)) : null,
        },
        breakdown: {
          originalTotal: numericCartTotal,
          discountAmount,
          finalPrice,
        },
      };
    });

    return res.json(result);
  } catch (err) {
    if (err instanceof CouponError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('Coupon apply failed:', err);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

/**
 * POST /api/coupons
 * Admin: Create new coupon
 */
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { code, discount, description } = req.body;
    if (!code || !discount) return res.status(400).json({ error: 'Code and discount% are required' });

    const couponData = {
      code: code.toUpperCase(),
      discount: Number(discount),
      description: description || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('coupons').add(couponData);
    res.status(201).json({ success: true, id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

/**
 * DELETE /api/coupons/:id
 * Admin: Delete coupon
 */
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.collection('coupons').doc(req.params.id).delete();
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

module.exports = router;
