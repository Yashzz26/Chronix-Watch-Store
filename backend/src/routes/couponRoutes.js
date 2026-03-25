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
