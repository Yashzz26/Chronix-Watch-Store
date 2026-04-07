const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const { db } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');
const validateOrderPayload = require('../middleware/validateOrderPayload');

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

class OrderError extends Error {
  constructor(message, statusCode = 400, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

const normalizeSku = (sku = '') => sku ? sku.toString().trim().toLowerCase() : '';

const EXCLUDED_VARIANT_KEYS = new Set([
  'sku',
  'stock',
  'price',
  'mrp',
  'cost',
  'id',
  '_id',
  'image',
  'images',
  'qty',
  'quantity'
]);

const buildComparableAttributes = (variant = {}) => {
  const normalized = {};
  const pushAttributes = (source = {}) => {
    if (!source || typeof source !== 'object') return;
    Object.entries(source).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length) normalized[key.toLowerCase()] = trimmed.toLowerCase();
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        normalized[key.toLowerCase()] = String(value).toLowerCase();
      }
    });
  };

  pushAttributes(variant.attributes);
  pushAttributes(variant.options);

  Object.entries(variant || {}).forEach(([key, value]) => {
    if (EXCLUDED_VARIANT_KEYS.has(key)) return;
    if (value === undefined || value === null) return;
    if (typeof value === 'object') return;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length) normalized[key.toLowerCase()] = trimmed.toLowerCase();
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      normalized[key.toLowerCase()] = String(value).toLowerCase();
    }
  });

  return normalized;
};

const resolveVariantMatch = (variants = [], requestedVariant = {}, fallbackSku) => {
  const variantList = Array.isArray(variants) ? variants : [];
  if (!variantList.length) {
    return null;
  }

  const requestedSku = normalizeSku((requestedVariant && requestedVariant.sku) || fallbackSku);
  if (requestedSku) {
    const variantIndex = variantList.findIndex(v => normalizeSku(v.sku) === requestedSku);
    if (variantIndex !== -1) {
      return { variant: variantList[variantIndex], index: variantIndex };
    }
  }

  if (requestedVariant) {
    const requestedAttrs = buildComparableAttributes(requestedVariant);
    if (Object.keys(requestedAttrs).length) {
      const variantIndex = variantList.findIndex(variant => {
        const variantAttrs = buildComparableAttributes(variant);
        const keys = Object.keys(requestedAttrs);
        return keys.length && keys.every(key => variantAttrs[key] === requestedAttrs[key]);
      });

      if (variantIndex !== -1) {
        return { variant: variantList[variantIndex], index: variantIndex };
      }
    }
  }

  return null;
};

const mapOrderItems = (items = []) => items.map((rawItem, index) => {
  const productId = String(rawItem.productId || rawItem.id || '').trim();
  const selectedVariant = rawItem.selectedVariant || rawItem.variants || null;
  const fallbackSku = selectedVariant && selectedVariant.sku ? selectedVariant.sku : null;
  const priceRaw = Number(rawItem.priceAtPurchase ?? rawItem.price ?? 0);
  const qtyRaw = Number(rawItem.qty ?? rawItem.quantity ?? 1);
  const priceAtPurchase = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : 0;
  const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;

  const resolvedSku = rawItem.sku || fallbackSku || `CHX-${productId.slice(0, 6)}`;

  return {
    productId,
    name: String(rawItem.name || `Item ${index + 1}`),
    image: String(rawItem.image || ''),
    selectedVariant,
    priceAtPurchase,
    qty,
    sku: String(resolvedSku),
    variantLabel: String(rawItem.variantLabel || rawItem.variant || 'Standard Model')
  };
});

const logOrderEvent = (message, meta = {}) => {
  console.info(`[Order] ${message}`, meta);
};

const verifyRazorpaySignature = (details = {}) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = details;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new OrderError('Incomplete Razorpay payment details.', 400);
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return {
    valid: expectedSignature === razorpay_signature,
    details: {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    }
  };
};

router.post('/', verifyToken, validateOrderPayload, async (req, res) => {
  const { items, totalAmount, paymentMethod, shippingAddress } = req.orderPayload;
  const isCod = paymentMethod === 'cod';
  const suffix = generateDisplayId();
  const orderDisplayId = `ORD-${suffix}`;
  const invoiceId = `INV-${suffix}`;

  logOrderEvent('Incoming order request', {
    userId: req.user.uid,
    itemCount: items.length,
    totalAmount,
    paymentMethod,
    addressKeys: Object.keys(shippingAddress || {})
  });

  try {
    const { orderId } = await db.runTransaction(async (transaction) => {
      const orderRef = db.collection('orders').doc();
      const normalizedItems = mapOrderItems(items);
      const productCache = new Map();

      const ensureProductContext = async (productId) => {
        if (!productId) {
          throw new OrderError('Product identifier missing for one of the items.', 400);
        }

        if (!productCache.has(productId)) {
          const productRef = db.collection('products').doc(String(productId));
          const productDoc = await transaction.get(productRef);

          if (!productDoc.exists) {
            throw new OrderError(`Product ${productId} not found.`, 404);
          }

          productCache.set(productId, {
            ref: productRef,
            data: {
              ...productDoc.data(),
              variants: Array.isArray(productDoc.data().variants)
                ? productDoc.data().variants.map(v => ({ ...v }))
                : []
            }
          });
        }

        return productCache.get(productId);
      };

      for (const item of normalizedItems) {
        const ctx = await ensureProductContext(item.productId);
        const productData = ctx.data;
        const variants = Array.isArray(productData.variants) ? productData.variants : [];
        const variantMatch = resolveVariantMatch(variants, item.selectedVariant, item.sku);

        logOrderEvent('Stock validation', {
          productId: item.productId,
          requestedSku: item.sku,
          matchedSku: variantMatch && variantMatch.variant ? variantMatch.variant.sku : null,
          qty: item.qty
        });

        if (item.selectedVariant && !variantMatch && variants.length) {
          throw new OrderError(`Selected variant not found for ${item.name}.`, 404);
        }

        if (variantMatch) {
          const available = Number(variantMatch.variant.stock || 0);
          if (available < item.qty) {
            throw new OrderError(`Insufficient stock for ${item.name}.`, 409, {
              requested: item.qty,
              available
            });
          }

          variants[variantMatch.index] = {
            ...variantMatch.variant,
            stock: available - item.qty
          };

          logOrderEvent('Variant stock updated', {
            productId: item.productId,
            sku: variantMatch.variant.sku,
            remainingStock: variants[variantMatch.index].stock
          });
        } else {
          const available = Number(productData.stock || 0);
          if (available < item.qty) {
            throw new OrderError(`Insufficient stock for ${item.name}.`, 409, {
              requested: item.qty,
              available
            });
          }
        }

        const currentTotalStock = Number(productData.stock || 0);
        productData.stock = currentTotalStock - item.qty >= 0 ? currentTotalStock - item.qty : 0;
      }

      const nowIso = new Date().toISOString();
      const orderData = {
        userId: req.user.uid,
        userEmail: req.user.email,
        items: normalizedItems,
        totalPrice: totalAmount,
        totalAmount,
        paymentMethod,
        shippingAddress,
        address: shippingAddress,
        status: isCod ? 'pending' : 'pending_payment',
        createdAt: nowIso,
        updatedAt: nowIso,
        orderDisplayId,
        invoiceId
      };

      if (!isCod && req.body.razorpayDetails) {
        const verification = verifyRazorpaySignature(req.body.razorpayDetails);
        if (!verification.valid) {
          throw new OrderError('Payment verification failed.', 400);
        }
        orderData.status = 'paid';
        orderData.razorpayDetails = verification.details;
      }

      productCache.forEach((ctx) => {
        transaction.update(ctx.ref, {
          stock: Math.max(0, Number(ctx.data.stock || 0)),
          variants: ctx.data.variants || [],
          updatedAt: nowIso
        });
      });

      transaction.set(orderRef, orderData);
      return { orderId: orderRef.id };
    });

    return res.status(201).json({
      success: true,
      orderId,
      orderDisplayId,
      message: 'Order placed successfully'
    });
  } catch (err) {
    const statusCode = err instanceof OrderError ? err.statusCode : 500;
    logOrderEvent('Order creation error', {
      userId: req.user.uid,
      statusCode,
      message: err.message
    });
    const errorResponse = {
      success: false,
      error: err.message
    };
    if (err.details) {
      errorResponse.details = err.details;
    }
    return res.status(statusCode).json(errorResponse);
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
      res.status(400).json({ success: false, message: 'Payment signature mismatch - possible fraud' });
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
