const allowedPaymentAliases = {
  cod: 'cod',
  'cash_on_delivery': 'cod',
  'cash on delivery': 'cod',
  cash: 'cod',
  cashondelivery: 'cod',
  online: 'online',
  prepaid: 'online',
  razorpay: 'online'
};

const sanitizeAddress = (address = {}) => {
  if (!address || typeof address !== 'object') return null;
  const trimmedEntries = Object.entries(address).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length) acc[key] = trimmed;
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});
  return Object.keys(trimmedEntries).length ? trimmedEntries : null;
};

module.exports = function validateOrderPayload(req, res, next) {
  try {
    const body = req.body || {};
    const errors = [];

    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      errors.push('At least one cart item is required.');
    }

    // totalAmount is now OPTIONAL — server recalculates from Firestore prices.
    // We still accept it for logging/mismatch detection purposes.
    const parsedTotal = Number(body.totalAmount ?? body.totalPrice ?? body.finalAmount);
    const totalAmount = Number.isFinite(parsedTotal) && parsedTotal > 0 ? parsedTotal : 0;

    const rawPaymentMethod = (body.paymentMethod || '').toString().trim().toLowerCase();
    const paymentMethod = allowedPaymentAliases[rawPaymentMethod] || null;
    if (!paymentMethod) {
      errors.push('Unsupported payment method.');
    }

    const unifiedAddress = sanitizeAddress(body.address) || sanitizeAddress(body.shippingAddress);
    if (!unifiedAddress) {
      errors.push('Shipping address required.');
    }

    const invalidItems = items
      .map((item, index) => ({
        index,
        productId: item?.productId || item?.id,
        qty: Number(item?.qty ?? item?.quantity ?? 0)
      }))
      .filter(item => !item.productId || item.qty <= 0);

    if (invalidItems.length) {
      errors.push('Every item must include productId/id and qty > 0.');
    }

    if (errors.length) {
      return res.status(400).json({ success: false, error: 'Invalid order payload', details: errors });
    }

    // Extract couponCode so the route handler can re-validate it server-side
    const couponCode = typeof body.couponCode === 'string' ? body.couponCode.trim() : null;

    req.orderPayload = {
      items,
      totalAmount,
      paymentMethod,
      shippingAddress: unifiedAddress,
      rawPaymentMethod,
      couponCode
    };

    return next();
  } catch (err) {
    console.error('Order payload validation error:', err);
    return res.status(500).json({ success: false, error: 'Failed to validate order payload' });
  }
};
