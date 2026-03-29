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

const generateDisplayId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, totalPrice, paymentMethod, shippingAddress, address } = req.body;
    const finalAddress = address || shippingAddress;

    if (!items || !totalPrice || !paymentMethod) {
      return res.status(400).json({ error: 'Missing order details' });
    }

    const suffix = generateDisplayId();
    const orderId = await db.runTransaction(async (transaction) => {
      const orderRef = db.collection('orders').doc();
      
      const orderData = {
        userId: req.user.uid,
        userEmail: req.user.email,
        items: (items || []).map(i => ({
          productId: String(i.productId || i.id || ''),
          name: String(i.name || 'Unknown Item'),
          image: String(i.image || ''),
          selectedVariant: i.selectedVariant || i.variants || null,
          priceAtPurchase: Number(i.priceAtPurchase || i.price || 0),
          qty: Number(i.qty || 1),
          sku: String(i.sku || `CHX-${String(i.productId || i.id || '').slice(0, 6)}`),
          variantLabel: String(i.variantLabel || 'Standard Model')
        })),
        totalPrice: Number(totalPrice || 0),
        paymentMethod: String(paymentMethod || 'cod'),
        shippingAddress: finalAddress || {},
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderDisplayId: `ORD-${suffix}`,
        invoiceId: `INV-${suffix}`,
      };

      // 1. Process Stock for every item
      for (const item of (items || [])) {
        const pId = item.productId || item.id;
        if (!pId) continue; // Skip if no ID

        const productRef = db.collection('products').doc(String(pId));
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists) {
          throw new Error(`Product ${pId} not found in repository.`);
        }

        const productData = productDoc.data();
        let updatedVariants = productData.variants || [];
        let stockAvailable = 0;

        // 🛡️ T8.1: Strict Stock Validation
        const vKey = item.selectedVariant || item.variants;
        if (vKey && vKey.sku) {
          const variant = updatedVariants.find(v => v.sku === vKey.sku);
          if (!variant) {
            // Fallback to base stock if variant doesn't strictly exist via sku match
            stockAvailable = Number(productData.stock) || 0;
            if (stockAvailable < item.qty) {
              throw new Error(`Insufficient inventory for base model: ${item.name}. Requested: ${item.qty}, Available: ${stockAvailable}`);
            }
          } else {
            stockAvailable = Number(variant.stock) || 0;
            if (stockAvailable < item.qty) {
              throw new Error(`Insufficient inventory: ${item.name} (${vKey.sku}). Requested: ${item.qty}, Available: ${stockAvailable}`);
            }

            // Update the specific variant
            updatedVariants = updatedVariants.map(v => 
              v.sku === vKey.sku 
                ? { ...v, stock: v.stock - item.qty } 
                : v
            );
          }
        } else {
          // Fallback to base stock if no variants
          stockAvailable = Number(productData.stock) || 0;
          if (stockAvailable < item.qty) {
            throw new Error(`Insufficient inventory for base model: ${item.name}. Requested: ${item.qty}, Available: ${stockAvailable}`);
          }
        }

        const newTotalStock = Math.max(0, (Number(productData.stock) || 0) - item.qty);

        transaction.update(productRef, { 
          stock: newTotalStock,
          variants: updatedVariants,
          updatedAt: new Date().toISOString()
        });
      }

      // 2. Handle Razorpay details if present
      if (paymentMethod === 'online' && req.body.razorpayDetails) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.razorpayDetails;
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(body)
          .digest('hex');

        if (expectedSignature === razorpay_signature) {
          orderData.status = 'paid';
          orderData.razorpayDetails = {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id
          };
        } else {
          throw new Error('Payment verification failed');
        }
      }

      transaction.set(orderRef, orderData);
      return orderRef.id;
    });

    res.status(201).json({ success: true, orderId, orderDisplayId: `ORD-${suffix}` });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ 
      error: 'Failed to create order', 
      details: err.message,
      name: err.name,
      trace: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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
      receipt: `rcpt_${Date.now().toString(36)}`,
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
