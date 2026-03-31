import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Allow developers to bypass phone verification locally when the Firebase
// project isn't yet on the Blaze plan. Opt-in with VITE_FIREBASE_DISABLE_PHONE_VERIFICATION=true.
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_FIREBASE_DISABLE_PHONE_VERIFICATION === 'true' &&
  auth.settings
) {
  auth.settings.appVerificationDisabledForTesting = true;
  console.warn('[Chronix] Phone verification disabled for local testing.');
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
