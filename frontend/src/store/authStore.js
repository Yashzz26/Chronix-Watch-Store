import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  linkWithCredential,
  EmailAuthProvider,
  PhoneAuthProvider,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

const createOrUpdateUser = async (user, provider) => {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const exists = snap.exists();

  // 🛡️ S1.2: Hardened createOrUpdateUser logic
  const data = {
    uid: user.uid,
    name: user.displayName || snap.data()?.name || '',
    email: user.email || snap.data()?.email || '',
    phone: user.phoneNumber || snap.data()?.phone || '',
    photo: user.photoURL || snap.data()?.photo || '',
    providers: arrayUnion(provider),
    lastLogin: serverTimestamp(),
  };

  // Only set createdAt once
  if (!exists) {
    data.createdAt = serverTimestamp();
    data.role = 'customer'; // Default role
  }
  
  // Clean empty fields
  Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
  
  // 🚫 Role is never updated from frontend simple syncs
  await setDoc(ref, data, { merge: true });
};

// 🔐 T1.3: User-friendly Error Mapping
const getReadableError = (code) => {
  switch (code) {
    case 'auth/user-not-found': return 'Profile not found. Please register.';
    case 'auth/wrong-password': return 'Incorrect credentials. Please try again.';
    case 'auth/email-already-in-use': return 'Email already registered. Try logging in.';
    case 'auth/account-exists-with-different-credential': return 'Account linked to another method. Use Google/Email to sign in.';
    case 'auth/invalid-verification-code': return 'Invalid OTP. Please check and retry.';
    case 'auth/too-many-requests': return 'Suspicious activity detected. Account temporarily locked.';
    default: return 'Authentication failed. Please contact support.';
  }
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      profile: {},
      loading: false,
      lastAuthMethod: localStorage.getItem('chronix_last_auth') || 'email',
      pendingCredential: null,
      pendingEmail: null,

      setLoading: (loading) => set({ loading }),

      setLastAuthMethod: (method) => {
        localStorage.setItem('chronix_last_auth', method);
        set({ lastAuthMethod: method });
      },

      async login(email, password) {
        if (get().loading) return;
        set({ loading: true });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          // 🛡️ T1.2: Automatic Linking Resolution
          if (get().pendingCredential && get().pendingEmail === email) {
            try {
              await linkWithCredential(userCredential.user, get().pendingCredential);
            } catch (linkError) {
              console.warn('Silent linking handoff failed:', linkError.code);
            } finally {
              set({ pendingCredential: null, pendingEmail: null });
            }
          }

          await createOrUpdateUser(userCredential.user, 'password');
          get().setLastAuthMethod('email');
          set({ isLoggedIn: true, user: userCredential.user, loading: false });
          return { success: true, user: userCredential.user };
        } catch (error) {
          set({ loading: false });
          console.error('Login error:', error.code);
          return { success: false, error: error.code, message: getReadableError(error.code) };
        }
      },

      async signup(email, password, userData) {
        if (get().loading) return;
        set({ loading: true });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // 🛡️ T1.2: Share same hardened sync logic
          await createOrUpdateUser(user, 'password');
          
          // Apply initial userData provided from form
          if (userData) {
            await setDoc(doc(db, 'users', user.uid), {
              ...userData,
              lastLogin: serverTimestamp()
            }, { merge: true });
          }

          get().setLastAuthMethod('email');
          set({ isLoggedIn: true, user, loading: false });
          return { success: true, user };
        } catch (error) {
          set({ loading: false });
          console.error('Signup error:', error.code);
          return { success: false, error: error.code, message: getReadableError(error.code) };
        }
      },

      async googleSignIn() {
        if (get().loading) return;
        set({ loading: true });
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          await createOrUpdateUser(result.user, 'google.com');
          get().setLastAuthMethod('google.com');
          set({ isLoggedIn: true, user: result.user, loading: false });
          return { success: true, user: result.user };
        } catch (error) {
          set({ loading: false });
          // 🛡️ T1.1: Automatic Linking Check
          if (error.code === "auth/account-exists-with-different-credential") {
            try {
              const credential = GoogleAuthProvider.credentialFromError(error);
              set({ pendingCredential: credential, pendingEmail: error.customData.email });
              const methods = await fetchSignInMethodsForEmail(auth, error.customData.email);
              return { 
                success: false, 
                error: error.code, 
                methods, 
                email: error.customData.email,
                message: getReadableError(error.code) 
              };
            } catch (e) {
              return { success: false, error: e.code, message: 'Network error or rate limit hit.' };
            }
          }
          return { success: false, error: error.code, message: getReadableError(error.code) };
        }
      },

      async completePhoneLogin(user) {
        if (get().loading) return;
        set({ loading: true });
        try {
          await createOrUpdateUser(user, 'phone');
          get().setLastAuthMethod('phone');
          set({ isLoggedIn: true, user, loading: false });
          return { success: true, user };
        } catch (error) {
          set({ loading: false });
          console.error('Phone Auth Store Error:', error.code);
          return { success: false, error: error.code };
        }
      },

      // Advanced linking: Link the current user with a new credential
      async linkCurrentAccount(credential) {
        if (get().loading) return;
        set({ loading: true });
        const currentUser = auth.currentUser;
        if (!currentUser) {
          set({ loading: false });
          return { success: false, error: 'No active session' };
        }
        try {
          const result = await linkWithCredential(currentUser, credential);
          await createOrUpdateUser(result.user, credential.providerId);
          set({ user: result.user, loading: false });
          return { success: true };
        } catch (error) {
          set({ loading: false });
          console.error('Linking error:', error.code);
          return { success: false, error: error.code };
        }
      },

      async logout() {
        try {
          // Cleanup recaptcha via window if necessary, but typically handled in component
          await signOut(auth);
          set({ isLoggedIn: false, user: null, profile: {} });
        } catch (error) {
          console.error('Logout error:', error.message);
        }
      },

      async fetchProfile(uid) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', uid));
          if (profileDoc.exists()) {
            set({ profile: profileDoc.data() });
          }
        } catch (error) {
          console.error('Fetch profile error:', error.message);
        }
      },

      updateProfile(data) {
        // 🔥 NEVER include role in profile updates from local state
        const { photo, role, createdAt, ...rest } = data;
        const updated = { ...get().profile, ...rest };
        set({ profile: updated });

        if (photo) {
          try {
            sessionStorage.setItem('chronix-profile-photo', photo);
          } catch (e) {
            console.warn('Profile photo storage failed', e);
          }
        }

        if (get().user) {
          setDoc(doc(db, 'users', get().user.uid), updated, { merge: true });
        }
      },
    }),
    {
      name: 'chronix-auth',
      partialize: (s) => ({
        isLoggedIn: s.isLoggedIn,
        user: s.user,
        profile: s.profile,
        lastAuthMethod: s.lastAuthMethod
      }),
    }
  )
);

// Initialize auth listener
export const initAuthListener = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      useAuthStore.setState({ 
        isLoggedIn: true, 
        user, 
        profile: profileDoc.exists() ? profileDoc.data() : {},
        loading: false 
      });

      // Update last login
      setDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp()
      }, { merge: true });
    } else {
      useAuthStore.setState({ isLoggedIn: false, user: null, profile: {}, loading: false });
    }
  }, (error) => {
    console.error('Auth state auth listener error:', error);
    useAuthStore.setState({ loading: false });
  });
};

export default useAuthStore;
