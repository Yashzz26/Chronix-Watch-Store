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

    const parsedTotal = Number(body.totalAmount ?? body.totalPrice);
    const totalAmount = Number.isFinite(parsedTotal) ? parsedTotal : 0;
    if (totalAmount <= 0) {
      errors.push('totalAmount must be a positive number.');
    }

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

    req.orderPayload = {
      items,
      totalAmount,
      paymentMethod,
      shippingAddress: unifiedAddress,
      rawPaymentMethod
    };

    return next();
  } catch (err) {
    console.error('Order payload validation error:', err);
    return res.status(500).json({ success: false, error: 'Failed to validate order payload' });
  }
};
