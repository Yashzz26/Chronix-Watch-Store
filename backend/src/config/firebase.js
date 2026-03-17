const admin = require('firebase-admin');

// Load service account from file in dev, from env var in production
let serviceAccount;
if (process.env.NODE_ENV === 'production' && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  // In production (Render), store the JSON as base64 env variable
  const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(decoded);
} else {
  try {
    serviceAccount = require('../../serviceAccountKey.json');
  } catch (err) {
    console.warn('⚠️  serviceAccountKey.json not found or invalid. Firebase Admin SDK will not be initialized correctly.');
    serviceAccount = {}; // Placeholder to avoid crash during initializeApp if possible, though cert() will still fail
  }
}

if (!admin.apps.length && serviceAccount && serviceAccount.project_id && serviceAccount.project_id !== 'YOUR_PROJECT_ID') {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', err.message);
  }
} else {
  console.warn('⚠️  Firebase Admin SDK not initialized: Missing or invalid serviceAccountKey.json');
}

const db = admin.apps.length ? admin.firestore() : {
  collection: () => ({
    doc: () => ({ get: () => Promise.resolve({ exists: false }), update: () => Promise.resolve(), delete: () => Promise.resolve() }),
    where: () => ({ orderBy: () => ({ limit: () => ({ get: () => Promise.resolve({ docs: [] }) }), get: () => Promise.resolve({ docs: [] }) }), get: () => Promise.resolve({ docs: [] }) }),
    orderBy: () => ({ limit: () => ({ get: () => Promise.resolve({ docs: [] }) }), get: () => Promise.resolve({ docs: [] }) }),
    add: () => Promise.resolve({ id: 'dummy' }),
    get: () => Promise.resolve({ docs: [], size: 0 }),
  })
};

const authAdmin = admin.apps.length ? admin.auth() : {
  verifyIdToken: () => Promise.reject(new Error('Firebase Auth not initialized')),
};

module.exports = { admin, db, authAdmin };
