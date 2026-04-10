const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken } = require('../middleware/verifyToken');

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
    if (err.code === 9 || /index|composite/i.test(err.message || '')) {
      const urlMatch = err.message?.match(/https:\/\/[^\s)]+/i);
      return res.status(500).json({
        error: 'Missing Firestore index for productId+createdAt. Please deploy firestore.indexes.json or follow the Firebase console link.',
        consoleLink: urlMatch ? urlMatch[0] : null,
      });
    }
    console.error('Fetch reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
});

// ─── Helper: check if user has a delivered order containing this product ──────
const hasVerifiedPurchase = async (userId, productId) => {
  // Query orders where this user has a delivered order
  const ordersSnap = await db.collection('orders')
    .where('userId', '==', userId)
    .where('status', '==', 'delivered')
    .get();

  if (ordersSnap.empty) return false;

  // Check if any delivered order contains the target product
  return ordersSnap.docs.some(doc => {
    const orderData = doc.data();
    const items = Array.isArray(orderData.items) ? orderData.items : [];
    return items.some(item =>
      String(item.productId || item.id || '') === String(productId)
    );
  });
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

    // ── Fix #1: Verified Purchase Check ─────────────────────────────────
    const hasPurchased = await hasVerifiedPurchase(req.user.uid, productId);
    if (!hasPurchased) {
      return res.status(403).json({
        error: 'Only verified buyers can review this product. Your order must be delivered first.'
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

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized: Can only delete your own reviews' });
    }

    await reviewRef.delete();
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Failed to delete review', details: err.message });
  }
});

module.exports = router;
