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
  PhoneAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

const createOrUpdateUser = async (user, provider) => {
  const ref = doc(db, 'users', user.uid);
  const data = {
    uid: user.uid,
    name: user.displayName || user.name || '',
    email: user.email || '',
    phone: user.phoneNumber || '',
    photo: user.photoURL || '',
    providers: arrayUnion(provider),
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp() // Only set if it doesn't exist due to merge:true
  };
  
  // Clean empty fields
  Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
  
  await setDoc(ref, data, { merge: true });
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      profile: {},
      loading: true,
      lastAuthMethod: localStorage.getItem('chronix_last_auth') || 'email',

      setLoading: (loading) => set({ loading }),

      setLastAuthMethod: (method) => {
        localStorage.setItem('chronix_last_auth', method);
        set({ lastAuthMethod: method });
      },

      async login(email, password) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          await createOrUpdateUser(userCredential.user, 'password');
          get().setLastAuthMethod('email');
          set({ isLoggedIn: true, user: userCredential.user });
          return { success: true, user: userCredential.user };
        } catch (error) {
          console.error('Login error:', error.message);
          return { success: false, error: error.message };
        }
      },

      async signup(email, password, userData) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          const profileData = {
            uid: user.uid,
            email: user.email,
            role: 'customer',
            providers: ['password'],
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            ...userData
          };

          await setDoc(doc(db, 'users', user.uid), profileData);
          get().setLastAuthMethod('email');
          set({ isLoggedIn: true, user, profile: profileData });
          return { success: true, user };
        } catch (error) {
          console.error('Signup error:', error.message);
          return { success: false, error: error.message };
        }
      },

      async googleSignIn() {
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          
          // Optional: Account linking logic can be more complex if needed.
          // For now, we follow the "Single Profile" sync.
          await createOrUpdateUser(result.user, 'google.com');
          get().setLastAuthMethod('google.com');
          set({ isLoggedIn: true, user: result.user });
          return { success: true, user: result.user };
        } catch (error) {
          console.error('Google Auth Error:', error.message);
          return { success: false, error: error.message };
        }
      },

      async completePhoneLogin(user) {
        try {
          await createOrUpdateUser(user, 'phone');
          get().setLastAuthMethod('phone');
          set({ isLoggedIn: true, user });
          return { success: true, user };
        } catch (error) {
          console.error('Phone Auth Store Error:', error.message);
          return { success: false, error: error.message };
        }
      },

      // Advanced linking: Link the current user with a new credential
      async linkCurrentAccount(credential) {
        if (!auth.currentUser) return { success: false, error: 'No active session' };
        try {
          const result = await linkWithCredential(auth.currentUser, credential);
          await createOrUpdateUser(result.user, credential.providerId);
          set({ user: result.user });
          return { success: true };
        } catch (error) {
          console.error('Linking error:', error.message);
          return { success: false, error: error.message };
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
        const { photo, ...rest } = data;
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
