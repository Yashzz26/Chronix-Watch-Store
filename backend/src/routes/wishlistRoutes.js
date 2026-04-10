const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken } = require('../middleware/verifyToken');

/**
 * GET /api/wishlist
 * Authenticated: Get current user's wishlist with full product data
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const wishlistSnap = await db
      .collection('users')
      .doc(req.user.uid)
      .collection('wishlist')
      .orderBy('addedAt', 'desc')
      .limit(100)
      .get();

    if (wishlistSnap.empty) {
      return res.json({ items: [] });
    }

    // Fetch full product data for each wishlist item
    const items = [];
    for (const wishDoc of wishlistSnap.docs) {
      const { productId, addedAt } = wishDoc.data();
      try {
        const productDoc = await db.collection('products').doc(productId).get();
        if (productDoc.exists) {
          items.push({
            id: productDoc.id,
            ...productDoc.data(),
            wishlistAddedAt: addedAt,
          });
        }
        // If product was deleted, silently skip it
      } catch (err) {
        console.warn(`[Wishlist] Could not fetch product ${productId}:`, err.message);
      }
    }

    res.json({ items });
  } catch (err) {
    console.error('Fetch wishlist error:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist', details: err.message });
  }
});

/**
 * POST /api/wishlist/add
 * Authenticated: Add a product to the user's wishlist
 * Body: { productId }
 */
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    // Verify product exists
    const productDoc = await db.collection('products').doc(String(productId)).get();
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Use productId as the document ID to prevent duplicates naturally
    const wishlistRef = db
      .collection('users')
      .doc(req.user.uid)
      .collection('wishlist')
      .doc(String(productId));

    await wishlistRef.set({
      productId: String(productId),
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ success: true, message: 'Added to wishlist' });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    res.status(500).json({ error: 'Failed to add to wishlist', details: err.message });
  }
});

/**
 * DELETE /api/wishlist/remove/:productId
 * Authenticated: Remove a product from the user's wishlist
 */
router.delete('/remove/:productId', verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const wishlistRef = db
      .collection('users')
      .doc(req.user.uid)
      .collection('wishlist')
      .doc(String(productId));

    await wishlistRef.delete();

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    res.status(500).json({ error: 'Failed to remove from wishlist', details: err.message });
  }
});

module.exports = router;
