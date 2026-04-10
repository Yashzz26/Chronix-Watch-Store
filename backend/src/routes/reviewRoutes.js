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

/**
 * POST /api/reviews
 * Creates a new review for a product. Must be authenticated.
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, rating, comment, authorName } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Missing review details: productId, rating, or comment' });
    }

    const nowIso = new Date().toISOString();
    const reviewData = {
      productId,
      userId: req.user.uid,
      authorName: authorName || req.user.email.split('@')[0], // Fallback to email prefix
      rating: Number(rating),
      comment,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAtIso: nowIso,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAtIso: nowIso
    };

    const docRef = await db.collection('reviews').add(reviewData);
    res.status(201).json({ success: true, reviewId: docRef.id, review: { id: docRef.id, ...reviewData } });

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

    const nowIso = new Date().toISOString();
    await reviewRef.update({
      rating: Number(rating) || doc.data().rating,
      comment: comment || doc.data().comment,
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
