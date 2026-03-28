const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/verifyToken');

/**
 * GET /api/reviews/:productId
 * Fetch all reviews for a specific product
 */
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const snapshot = await db.collection('reviews')
      .where('productId', '==', productId)
      .orderBy('createdAt', 'desc')
      .get();
      
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ reviews });
  } catch (err) {
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

    const reviewData = {
      productId,
      userId: req.user.uid,
      authorName: authorName || req.user.email.split('@')[0], // Fallback to email prefix
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

    await reviewRef.update({
      rating: Number(rating) || doc.data().rating,
      comment: comment || doc.data().comment,
      updatedAt: new Date().toISOString()
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
