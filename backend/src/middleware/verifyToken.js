const { authAdmin, db } = require('../config/firebase');

/**
 * Verifies Firebase ID token from Authorization: Bearer <token> header.
 * Attaches decoded user as req.user
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = await authAdmin.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Must be used AFTER verifyToken.
 * Checks Firestore users collection for role === "admin"
 */
const verifyAdmin = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'User not found' });
    }
    if (userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify admin role' });
  }
};

module.exports = { verifyToken, verifyAdmin };
