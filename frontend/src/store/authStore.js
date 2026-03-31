import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

const createOrUpdateUser = async (user, provider, extra = {}) => {
  if (!user) return null;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const existing = snap.data() || {};

  const data = {
    uid: user.uid,
    name: user.displayName ?? existing.name ?? '',
    email: user.email ?? existing.email ?? '',
    phone: user.phoneNumber ?? existing.phone ?? '',
    photo: user.photoURL ?? existing.photo ?? '',
    loginProvider: provider || existing.loginProvider || 'password',
    isPhoneVerified: user.phoneNumber ? true : (extra.isPhoneVerified ?? existing.isPhoneVerified ?? false),
    lastLogin: serverTimestamp(),
    ...extra,
  };

  if (provider) {
    data.providers = arrayUnion(provider);
  }

  if (!snap.exists()) {
    data.createdAt = serverTimestamp();
    data.role = 'customer';
  }

  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  await setDoc(ref, data, { merge: true });
  const updatedSnap = await getDoc(ref);
  return updatedSnap.data();
};

const getReadableError = (code) => {
  switch (code) {
    case 'auth/user-not-found':
      return 'Account not found. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'Email is already registered.';
    case 'auth/account-exists-with-different-credential':
      return 'This email is linked to another provider. Sign in with that method to continue.';
    case 'auth/invalid-verification-code':
      return 'Invalid OTP. Please re-enter the code.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed before completing.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

const getInitialMethod = () => {
  if (typeof window === 'undefined') return 'email';
  return localStorage.getItem('chronix_last_auth') || 'email';
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      profile: {},
      loading: true,
      lastAuthMethod: getInitialMethod(),
      pendingCredential: null,
      pendingEmail: null,

      setLoading: (loading) => set({ loading }),

      setLastAuthMethod: (method) => {
        try {
          localStorage.setItem('chronix_last_auth', method);
        } catch (error) {
          console.warn('Could not persist auth method', error);
        }
        set({ lastAuthMethod: method });
      },

      async login(email, password) {
        if (get().loading) return;
        set({ loading: true });
        try {
          const credential = await signInWithEmailAndPassword(auth, email, password);

          if (get().pendingCredential && get().pendingEmail === email) {
            try {
              await linkWithCredential(credential.user, get().pendingCredential);
            } catch (linkError) {
              console.warn('Linking failed', linkError.code);
            } finally {
              set({ pendingCredential: null, pendingEmail: null });
            }
          }

          const profileData = await createOrUpdateUser(credential.user, 'password');
          get().setLastAuthMethod('email');
          set({ isLoggedIn: true, user: credential.user, profile: profileData, loading: false });
          return { success: true, user: credential.user, requiresOtp: !(profileData?.isPhoneVerified) };
        } catch (error) {
          console.error('Login error:', error.code);
          set({ loading: false });
          return { success: false, error: error.code, message: getReadableError(error.code) };
        }
      },

      async signup(email, password, userData = {}) {
        if (get().loading) return;
        set({ loading: true });
        try {
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          if (userData?.name) {
            try {
              await firebaseUpdateProfile(credential.user, { displayName: userData.name });
            } catch (err) {
              console.warn('Display name update failed', err);
            }
          }
          const profileData = await createOrUpdateUser(credential.user, 'password', {
            name: userData?.name ?? credential.user.displayName ?? '',
          });
          get().setLastAuthMethod('email');
          set({ isLoggedIn: true, user: credential.user, profile: profileData, loading: false });
          return { success: true, user: credential.user, requiresOtp: !(profileData?.isPhoneVerified) };
        } catch (error) {
          console.error('Signup error:', error.code);
          set({ loading: false });
          return { success: false, error: error.code, message: getReadableError(error.code) };
        }
      },

      async googleSignIn() {
        if (get().loading) return;
        set({ loading: true });
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          const result = await signInWithPopup(auth, provider);
          const profileData = await createOrUpdateUser(result.user, 'google.com');
          get().setLastAuthMethod('google.com');
          set({ isLoggedIn: true, user: result.user, profile: profileData, loading: false });
          return { success: true, user: result.user, requiresOtp: !(profileData?.isPhoneVerified) };
        } catch (error) {
          console.error('Google sign-in error', error.code);
          set({ loading: false });
          if (error.code === 'auth/account-exists-with-different-credential') {
            try {
              const credential = GoogleAuthProvider.credentialFromError(error);
              set({ pendingCredential: credential, pendingEmail: error.customData.email });
              const methods = await fetchSignInMethodsForEmail(auth, error.customData.email);
              return {
                success: false,
                error: error.code,
                methods,
                email: error.customData.email,
                message: getReadableError(error.code),
              };
            } catch (linkError) {
              return { success: false, error: linkError.code, message: 'Unable to complete link. Please try email login.' };
            }
          }
          return { success: false, error: error.code, message: getReadableError(error.code) };
        }
      },

      async facebookSignIn() {
        if (get().loading) return;
        set({ loading: true });
        try {
          const provider = new FacebookAuthProvider();
          provider.setCustomParameters({ display: 'popup' });
          const result = await signInWithPopup(auth, provider);
          const profileData = await createOrUpdateUser(result.user, 'facebook.com');
          get().setLastAuthMethod('facebook.com');
          set({ isLoggedIn: true, user: result.user, profile: profileData, loading: false });
          return { success: true, user: result.user, requiresOtp: !(profileData?.isPhoneVerified) };
        } catch (error) {
          console.error('Facebook sign-in error', error.code);
          set({ loading: false });
          if (error.code === 'auth/account-exists-with-different-credential') {
            return { success: false, error: error.code, message: getReadableError(error.code) };
          }
          return { success: false, error: error.code, message: getReadableError(error.code) };
        }
      },

      async linkCurrentAccount(credential) {
        if (get().loading) return;
        const currentUser = auth.currentUser;
        if (!currentUser) {
          return { success: false, error: 'No active session' };
        }
        set({ loading: true });
        try {
          const result = await linkWithCredential(currentUser, credential);
          const profileData = await createOrUpdateUser(result.user, credential.providerId);
          set({ user: result.user, profile: profileData, loading: false });
          return { success: true };
        } catch (error) {
          console.error('Linking error:', error.code);
          set({ loading: false });
          return { success: false, error: error.code, message: getReadableError(error.code) };
        }
      },

      async logout() {
        try {
          await signOut(auth);
        } catch (error) {
          console.error('Logout error:', error.message);
        } finally {
          set({ isLoggedIn: false, user: null, profile: {}, loading: false });
        }
      },

      async fetchProfile(uid) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', uid));
          if (profileDoc.exists()) {
            set({ profile: profileDoc.data() });
            return profileDoc.data();
          }
          return null;
        } catch (error) {
          console.error('Fetch profile error:', error.message);
          return null;
        }
      },

      updateProfile(data) {
        const { photo, role, createdAt, isPhoneVerified, ...rest } = data;
        const patched = { ...get().profile, ...rest };
        if (photo) {
          patched.photo = photo;
        }
        set({ profile: patched });

        if (get().user) {
          setDoc(doc(db, 'users', get().user.uid), patched, { merge: true });
        }
      },
    }),
    {
      name: 'chronix-auth',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        profile: state.profile,
        lastAuthMethod: state.lastAuthMethod,
      }),
    }
  )
);

export const initAuthListener = () => {
  useAuthStore.setState({ loading: true });
  const unsubscribe = onAuthStateChanged(
    auth,
    async (user) => {
      if (user) {
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        useAuthStore.setState({
          isLoggedIn: true,
          user,
          profile: profileDoc.exists() ? profileDoc.data() : {},
          loading: false,
        });
      } else {
        useAuthStore.setState({ isLoggedIn: false, user: null, profile: {}, loading: false });
      }
    },
    (error) => {
      console.error('Auth listener error:', error);
      useAuthStore.setState({ loading: false });
    }
  );
  return unsubscribe;
};

export default useAuthStore;
