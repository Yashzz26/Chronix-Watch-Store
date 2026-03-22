const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const { db } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');

/**
 * POST /api/orders
 * Customer: Create a new order (COD or Online)
 * Body: { items, totalPrice, paymentMethod, shippingAddress }
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, totalPrice, paymentMethod, shippingAddress } = req.body;

    if (!items || !totalPrice || !paymentMethod) {
      return res.status(400).json({ error: 'Missing order details' });
    }

    const orderData = {
      userId: req.user.uid,
      userEmail: req.user.email,
      items,
      totalPrice,
      paymentMethod,
      shippingAddress: shippingAddress || {},
      status: paymentMethod === 'cod' ? 'pending' : 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('orders').add(orderData);
    res.status(201).json({ success: true, orderId: docRef.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

/**
 * POST /api/orders/create-razorpay-order
 * Creates a Razorpay order. Called from frontend checkout.
 * Body: { amount: number (in INR, NOT paise) }
 * Returns: { razorpayOrderId, amount, currency }
 */
router.post('/create-razorpay-order', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert INR to paise
      currency: 'INR',
      receipt: `receipt_${req.user.uid}_${Date.now()}`,
      notes: {
        userId: req.user.uid,
        email: req.user.email,
      },
    });

    res.json({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({ error: 'Failed to create payment order', details: err.message });
  }
});

/**
 * POST /api/orders/verify-payment
 * Verifies Razorpay payment signature after frontend payment success.
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * Returns: { success: boolean, message: string }
 */
router.post('/verify-payment', verifyToken, (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Missing payment details' });
  }

  try {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpaySignature) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Payment signature mismatch — possible fraud' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Signature verification error' });
  }
});

/**
 * GET /api/orders/admin/all
 * Admin: Get all orders from Firestore, sorted by date desc
 * Query params: ?status=paid&limit=20&page=1
 */
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;

    let query = db.collection('orders').orderBy('createdAt', 'desc').limit(parseInt(limit));
    if (status && status !== 'all') {
      query = db.collection('orders').where('status', '==', status).orderBy('createdAt', 'desc').limit(parseInt(limit));
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ orders, total: orders.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

/**
 * PATCH /api/orders/admin/:orderId/status
 * Admin: Update order status
 * Body: { status: 'paid' | 'shipped' | 'delivered' | 'cancelled' }
 */
router.patch('/admin/:orderId/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    await db.collection('orders').doc(orderId).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

/**
 * GET /api/orders/my
 * Customer: Get current user's orders
 */
router.get('/my', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('orders')
      .where('userId', '==', req.user.uid)
      .get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ orders });
  } catch (err) {
    console.error('Fetch my orders error:', err);
    res.status(500).json({ error: 'Failed to fetch your orders', details: err.message });
  }
});

module.exports = router;
