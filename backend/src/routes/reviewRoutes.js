const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken } = require('../middleware/verifyToken');

// ─── Helper: recalculate product rating aggregates from all reviews ───────────
const recalculateProductRating = async (productId) => {
  try {
    const snapshot = await db.collection('reviews')
      .where('productId', '==', productId)
      .get();

    const reviewCount = snapshot.size;
    let totalRatingSum = 0;

    snapshot.docs.forEach(doc => {
      totalRatingSum += Number(doc.data().rating || 0);
    });

    const avgRating = reviewCount > 0
      ? Number((totalRatingSum / reviewCount).toFixed(1))
      : 0;

    await db.collection('products').doc(productId).update({
      avgRating,
      reviewCount,
      totalRatingSum,
      ratingUpdatedAt: new Date().toISOString()
    });

    console.info(`[Review] Rating updated for product=${productId}: avg=${avgRating} count=${reviewCount}`);
    return { avgRating, reviewCount };
  } catch (err) {
    console.error(`[Review] Failed to update product rating for ${productId}:`, err.message);
  }
};

const formatTimestamp = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') return value;
  if (value.seconds) {
    return new Date(value.seconds * 1000).toISOString();
  }
  return null;
};

/**
 * GET /api/reviews/:productId
 * Fetch all reviews for a specific product
 */
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);

    const snapshot = await db.collection('reviews')
      .where('productId', '==', productId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const reviews = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: formatTimestamp(data.createdAt) || data.createdAtIso || null,
        updatedAt: formatTimestamp(data.updatedAt) || data.updatedAtIso || null,
      };
    });
    res.json({ reviews });
  } catch (err) {
    console.error(`[Review] Fetch reviews error for productId=${req.params.productId}:`, err);

    if (err.code === 9 || /index|composite/i.test(err.message || '')) {
      return res.status(500).json({
        message: "Failed to fetch reviews",
        reason: "MISSING_INDEX",
        hint: "This query requires a composite index (productId + createdAt).",
        link: err.message?.match(/https:\/\/[^\s)]+/i)?.[0] || null
      });
    }

    res.status(500).json({ 
      message: "Internal server error while fetching reviews",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ─── Helper: check if user has a delivered order containing this product ──────
const hasVerifiedPurchase = async (userId, productId) => {
  // Query orders where this user has an order
  const ordersSnap = await db.collection('orders')
    .where('userId', '==', userId)
    .get();

  if (ordersSnap.empty) return { allowed: false, reason: "NO_ORDER_FOUND" };

  const deliveredOrders = ordersSnap.docs.filter(doc => doc.data().status === 'delivered');
  if (deliveredOrders.length === 0) return { allowed: false, reason: "ORDER_NOT_DELIVERED" };

  // Check if any delivered order contains the target product
  const found = deliveredOrders.some(doc => {
    const orderData = doc.data();
    const items = Array.isArray(orderData.items) ? orderData.items : [];
    return items.some(item =>
      String(item.productId || item.id || '') === String(productId)
    );
  });

  return found 
    ? { allowed: true } 
    : { allowed: false, reason: "PRODUCT_NOT_IN_ORDER" };
};

// ─── Helper: fetch the user's display name from Firestore (never trust client) ─
const resolveAuthorName = async (userId, fallbackEmail) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const data = userDoc.data();
      return data.name || data.displayName || fallbackEmail.split('@')[0];
    }
  } catch (err) {
    console.warn('[Review] Could not fetch user profile for author name:', err.message);
  }
  return fallbackEmail ? fallbackEmail.split('@')[0] : 'Anonymous';
};

/**
 * POST /api/reviews
 * Creates a new review for a product. Must be authenticated.
 *
 * 🔐 Security:
 *   1. Verified purchase — user must have a delivered order with the product
 *   2. Duplicate prevention — one review per user per product
 *   3. Author name — fetched from Firestore, NOT from request body
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // ── Basic validation ────────────────────────────────────────────────
    if (!productId || rating === undefined || !comment) {
      return res.status(400).json({ error: 'Missing review details: productId, rating, or comment' });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const trimmedComment = String(comment).trim();
    if (!trimmedComment || trimmedComment.length < 3) {
      return res.status(400).json({ error: 'Review comment must be at least 3 characters' });
    }
    if (trimmedComment.length > 2000) {
      return res.status(400).json({ error: 'Review comment must be under 2000 characters' });
    }

    // ── Fix #1: Verified Purchase Check (with Dev Bypass) ───────────────
    let verification = { allowed: false, reason: "NOT_CHECKED" };
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Review] ⚠️ DEV BYPASS active for userId=${req.user.uid}`);
      verification = { allowed: true };
    } else {
      verification = await hasVerifiedPurchase(req.user.uid, productId);
    }

    if (!verification.allowed) {
      return res.status(403).json({
        message: 'Review blocked: Verified purchase required',
        reason: verification.reason,
        hint: verification.reason === 'ORDER_NOT_DELIVERED' 
          ? 'Reviews are only allowed after your order has been delivered.' 
          : 'You must purchase this individual item to leave a review.'
      });
    }

    // ── Fix #2: Duplicate Review Prevention ──────────────────────────────
    const existingReview = await db.collection('reviews')
      .where('userId', '==', req.user.uid)
      .where('productId', '==', productId)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      return res.status(400).json({
        error: 'You have already reviewed this product. You can edit your existing review instead.'
      });
    }

    // ── Fix #3: Author Name from Firestore (not request body) ───────────
    const authorName = await resolveAuthorName(req.user.uid, req.user.email);

    const nowIso = new Date().toISOString();
    const reviewData = {
      productId,
      userId: req.user.uid,
      authorName, // Server-controlled, never from client
      rating: numericRating,
      comment: trimmedComment,
      verified: true, // Verified purchase badge
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAtIso: nowIso,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAtIso: nowIso
    };

    const docRef = await db.collection('reviews').add(reviewData);

    // Update product rating aggregates
    recalculateProductRating(productId).catch(() => {});

    console.info(`[Review] New verified review by userId=${req.user.uid} for product=${productId} rating=${numericRating}`);

    res.status(201).json({
      success: true,
      reviewId: docRef.id,
      review: {
        id: docRef.id,
        ...reviewData,
        createdAt: nowIso,
        updatedAt: nowIso,
      }
    });

  } catch (err) {
    console.error('Post review error:', err);
    res.status(500).json({ error: 'Failed to post review', details: err.message });
  }
});

/**
 * PUT /api/reviews/:reviewId
 * Edits an existing review. Must be the author.
 */
router.put('/:reviewId', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const reviewRef = db.collection('reviews').doc(reviewId);
    const doc = await reviewRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized: Can only edit your own reviews' });
    }

    // Validate rating if provided
    const newRating = rating !== undefined ? Number(rating) : doc.data().rating;
    if (!Number.isFinite(newRating) || newRating < 1 || newRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const newComment = comment ? String(comment).trim() : doc.data().comment;

    const nowIso = new Date().toISOString();
    await reviewRef.update({
      rating: newRating,
      comment: newComment,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAtIso: nowIso
    });

    // Recalculate product rating after edit
    const reviewData = doc.data();
    recalculateProductRating(reviewData.productId).catch(() => {});

    res.json({ success: true, message: 'Review updated successfully' });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ error: 'Failed to update review', details: err.message });
  }
});

/**
 * DELETE /api/reviews/:reviewId
 * Deletes an existing review. Must be the author.
 */
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const reviewRef = db.collection('reviews').doc(reviewId);
    const doc = await reviewRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (doc.data().userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Can only delete your own reviews unless you are an administrator' });
    }

    const reviewData = doc.data();
    await reviewRef.delete();

    // Recalculate product rating after delete
    recalculateProductRating(reviewData.productId).catch(() => {});

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Failed to delete review', details: err.message });
  }
});

module.exports = router;
