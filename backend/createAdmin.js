/**
 * createAdmin.js — Run once to create an admin user in Firebase
 * Usage: node createAdmin.js
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Load service account
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch {
  console.error('❌ serviceAccountKey.json not found in /backend');
  process.exit(1);
}

// Init Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const db   = admin.firestore();

const ADMIN_EMAIL    = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';
const ADMIN_NAME     = 'Chronix Admin';

async function createAdmin() {
  try {
    // 1) Create (or get existing) auth user
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email:         ADMIN_EMAIL,
        password:      ADMIN_PASSWORD,
        displayName:   ADMIN_NAME,
        emailVerified: true,
      });
      console.log('✅ Firebase Auth user created:', userRecord.uid);
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        // User already exists — fetch them
        userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
        console.log('ℹ️  User already exists in Auth, UID:', userRecord.uid);
      } else {
        throw err;
      }
    }

    // 2) Write admin profile to Firestore users/{uid}
    await db.collection('users').doc(userRecord.uid).set(
      {
        uid:   userRecord.uid,
        email: ADMIN_EMAIL,
        name:  ADMIN_NAME,
        role:  'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }   // don't overwrite existing fields
    );

    console.log('✅ Firestore users document set with role: admin');
    console.log('─────────────────────────────────────────');
    console.log('  Email    :', ADMIN_EMAIL);
    console.log('  Password :', ADMIN_PASSWORD);
    console.log('  UID      :', userRecord.uid);
    console.log('─────────────────────────────────────────');
    console.log('🎉 Done! You can now log into the admin panel.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
