const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');

/**
 * GET /api/products
 * Public: Get all products (with optional category filter, keyword search, and pagination)
 * Query: ?category=Luxury&limit=12&keyword=dive
 *
 * 🔐 Fix #5: Search Optimization
 *   - Uses Firestore "keywords" array-contains for indexed search when available
 *   - Falls back to server-side filter on a CAPPED result set (never full collection scan)
 *   - Limits set size to prevent memory issues at scale
 */
router.get('/', async (req, res) => {
  try {
    const { category, limit = 12, keyword } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10) || 12, 60);

    // ── Build the base query ──────────────────────────────────────────────
    let productsQuery;

    if (keyword && keyword.trim()) {
      const normalizedKeyword = keyword.trim().toLowerCase();

      // Strategy 1: Use the "keywords" array field if products have it indexed
      // This is the Firestore-native approach: O(1) index lookup, no full scan.
      // Products should have a "keywords" field like: ["rolex", "submariner", "dive", "steel"]
      try {
        const indexedSnap = await db.collection('products')
          .where('keywords', 'array-contains', normalizedKeyword)
          .orderBy('createdAt', 'desc')
          .limit(parsedLimit)
          .get();

        // If we got results via the index, return them directly
        if (!indexedSnap.empty) {
          const products = indexedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return res.json({ products });
        }
      } catch (indexErr) {
        // Index may not exist yet — fall through to the filter approach
        if (indexErr.code !== 9 && !/index/i.test(indexErr.message || '')) {
          console.warn('[Products] keywords index query failed:', indexErr.message);
        }
      }

      // Strategy 2: Fallback — fetch a capped set and filter in memory
      // Cap at 100 docs max to avoid scanning the entire collection
      const SEARCH_CAP = 100;
      const capLimit = Math.max(parsedLimit, SEARCH_CAP);

      if (category && category !== 'all') {
        productsQuery = db.collection('products')
          .where('category', '==', category)
          .orderBy('createdAt', 'desc')
          .limit(capLimit);
      } else {
        productsQuery = db.collection('products')
          .orderBy('createdAt', 'desc')
          .limit(capLimit);
      }

      const snapshot = await productsQuery.get();
      const products = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((product) => {
          const searchable = [
            product.name,
            product.title,
            product.category,
            product.description
          ]
            .filter(Boolean)
            .map((field) => field.toString().toLowerCase());

          const tagMatch = Array.isArray(product.tags)
            ? product.tags.some((tag) => tag?.toString().toLowerCase().includes(normalizedKeyword))
            : false;

          const keywordMatch = Array.isArray(product.keywords)
            ? product.keywords.some((kw) => kw?.toString().toLowerCase().includes(normalizedKeyword))
            : false;

          return (
            searchable.some((field) => field.includes(normalizedKeyword)) ||
            tagMatch ||
            keywordMatch
          );
        })
        .slice(0, parsedLimit);

      return res.json({ products });
    }

    // ── No keyword: standard category / all query ─────────────────────────
    if (category && category !== 'all') {
      productsQuery = db.collection('products')
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .limit(parsedLimit);
    } else {
      productsQuery = db.collection('products')
        .orderBy('createdAt', 'desc')
        .limit(parsedLimit);
    }

    const snapshot = await productsQuery.get();
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
 *
 * 🔐 Fix #7: Protected by verifyToken + verifyAdmin ✅
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

    // Auto-generate search keywords from product name, category, and tags
    const keywords = generateKeywords(name, category, tags);

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
      keywords,
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
 *
 * 🔐 Fix #7: Protected by verifyToken + verifyAdmin ✅
 */
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    // Convert numeric fields
    if (updates.price) updates.price = Number(updates.price);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.dealPrice) updates.dealPrice = Number(updates.dealPrice);

    // Regenerate keywords if name, category, or tags changed
    if (updates.name || updates.category || updates.tags) {
      const productDoc = await db.collection('products').doc(req.params.id).get();
      const existing = productDoc.exists ? productDoc.data() : {};
      updates.keywords = generateKeywords(
        updates.name || existing.name || '',
        updates.category || existing.category || '',
        updates.tags || existing.tags || []
      );
    }

    await db.collection('products').doc(req.params.id).update(updates);
    res.json({ success: true, message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * DELETE /api/products/:id
 * Admin: Delete product
 *
 * 🔐 Fix #7: Protected by verifyToken + verifyAdmin ✅
 */
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.collection('products').doc(req.params.id).delete();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ─── Helper: Generate lowercase keyword tokens for Firestore array-contains search ─
function generateKeywords(name = '', category = '', tags = []) {
  const tokens = new Set();

  // Tokenize name: "Rolex Submariner Date" → ["rolex", "submariner", "date"]
  String(name).toLowerCase().split(/\s+/).forEach(word => {
    const clean = word.replace(/[^a-z0-9]/g, '');
    if (clean.length >= 2) {
      // Generate all prefixes for each word (Edge n-grams)
      // "rolex" → ["ro", "rol", "role", "rolex"]
      for (let i = 2; i <= clean.length; i++) {
        tokens.add(clean.slice(0, i));
      }
    }
  });

  // Add category as a keyword + its prefixes
  const catClean = String(category).toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (catClean) {
    catClean.split(/\s+/).forEach(word => {
      for (let i = 2; i <= word.length; i++) {
        tokens.add(word.slice(0, i));
      }
    });
  }

  // Add tags + their prefixes
  if (Array.isArray(tags)) {
    tags.forEach(tag => {
      if (typeof tag === 'string') {
        const clean = tag.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        if (clean.length >= 2) {
          for (let i = 2; i <= clean.length; i++) {
            tokens.add(clean.slice(0, i));
          }
        }
      }
    });
  }

  return Array.from(tokens);
}

module.exports = router;
