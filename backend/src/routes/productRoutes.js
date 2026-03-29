const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');

/**
 * GET /api/products
 * Public: Get all products (with optional category filter and pagination)
 * Query: ?category=Luxury&limit=12&lastDocId=xxx
 */
router.get('/', async (req, res) => {
  try {
    const { category, limit = 12 } = req.query;
    let query = db.collection('products').orderBy('createdAt', 'desc').limit(parseInt(limit));
    if (category && category !== 'all') {
      query = db.collection('products')
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit));
    }
    const snapshot = await query.get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

/**
 * GET /api/products/:id
 * Public: Get single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('products').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: { id: doc.id, ...doc.data() } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/**
 * POST /api/products
 * Admin: Create new product
 * Body: { name, price, category, description, imageGallery, stock, isOnDeal, dealPrice, dealEndsAt, tags }
 */
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { 
      name, price, category, description, imageGallery, stock, 
      isOnDeal, dealPrice, dealEndsAt, tags, variants, attributes 
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'name, price, and category are required' });
    }

    const productData = {
      name,
      price: Number(price),
      category,
      description: description || '',
      imageGallery: imageGallery || [],
      stock: Number(stock) || 0,
      isOnDeal: isOnDeal || false,
      dealPrice: dealPrice ? Number(dealPrice) : null,
      dealEndsAt: dealEndsAt || null,
      tags: tags || [],
      variants: variants || [],
      attributes: attributes || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('products').add(productData);
    res.status(201).json({ success: true, productId: docRef.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

/**
 * PUT /api/products/:id
 * Admin: Update product
 */
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    // Convert numeric fields
    if (updates.price) updates.price = Number(updates.price);
    if (updates.stock) updates.stock = Number(updates.stock);
    if (updates.dealPrice) updates.dealPrice = Number(updates.dealPrice);

    await db.collection('products').doc(req.params.id).update(updates);
    res.json({ success: true, message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * DELETE /api/products/:id
 * Admin: Delete product
 */
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.collection('products').doc(req.params.id).delete();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
