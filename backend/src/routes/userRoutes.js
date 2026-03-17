const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');

/**
 * GET /api/users/admin/all
 * Admin: Get all customers (role === 'customer')
 */
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .where('role', '==', 'customer')
      .orderBy('createdAt', 'desc')
      .get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

/**
 * GET /api/users/admin/stats
 * Admin: Dashboard stats — total orders, revenue, customers, products
 */
router.get('/admin/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [ordersSnap, usersSnap, productsSnap] = await Promise.all([
      db.collection('orders').get(),
      db.collection('users').where('role', '==', 'customer').get(),
      db.collection('products').get(),
    ]);

    const orders = ordersSnap.docs.map(d => d.data());
    const paidOrders = orders.filter(o => o.status !== 'pending' && o.status !== 'cancelled');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({
      totalOrders: orders.length,
      totalRevenue,
      totalCustomers: usersSnap.size,
      totalProducts: productsSnap.size,
      recentOrders: orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
  }
});

module.exports = router;
