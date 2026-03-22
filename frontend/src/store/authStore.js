import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Simple token generator — for client-side session validation
const generateToken = () => {
  const arr = new Uint8Array(24);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      profile: {},
      loading: true,
      sessionToken: null,

      setLoading: (loading) => set({ loading }),

      async login(email, password) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const token = generateToken();
          sessionStorage.setItem('chronix-session', token);
          set({ isLoggedIn: true, sessionToken: token, user: userCredential.user });
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
          const token = generateToken();
          sessionStorage.setItem('chronix-session', token);
          
          const profileData = {
            uid: user.uid,
            email: user.email,
            role: 'customer',
            createdAt: new Date().toISOString(),
            ...userData
          };

          await setDoc(doc(db, 'users', user.uid), profileData);
          set({ isLoggedIn: true, sessionToken: token, user, profile: profileData });
          return { success: true, user };
        } catch (error) {
          console.error('Signup error:', error.message);
          return { success: false, error: error.message };
        }
      },

      async logout() {
        try {
          await signOut(auth);
          sessionStorage.removeItem('chronix-session');
          set({ isLoggedIn: false, sessionToken: null, user: null, profile: {} });
        } catch (error) {
          console.error('Logout error:', error.message);
        }
      },

      validateSession() {
        const storedToken = get().sessionToken;
        const sessionToken = sessionStorage.getItem('chronix-session');
        if (!storedToken || !sessionToken || storedToken !== sessionToken) {
          set({ isLoggedIn: false, sessionToken: null, user: null });
          sessionStorage.removeItem('chronix-session');
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
        const { photo, ...rest } = data; // strip photo from persisted store
        const updated = { ...get().profile, ...rest };
        set({ profile: updated });

        if (photo) {
          try {
            sessionStorage.setItem('chronix-profile-photo', photo);
          } catch (e) {
            console.warn('Profile photo storage failed', e);
            // toast.error('Storage full or unavailable'); // Removed as 'toast' is not defined
          }
        }

        if (get().user) {
          setDoc(doc(db, 'users', get().user.uid), updated, { merge: true });
        }
        // NOTE: Photo stays in sessionStorage only (handled in Profile.jsx)
      },
    }),
    {
      name: 'chronix-auth',
      partialize: (s) => ({
        isLoggedIn: s.isLoggedIn,
        sessionToken: s.sessionToken,
        user: s.user,
        profile: s.profile,
      }),
    }
  )
);

// Initialize auth listener
export const initAuthListener = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Ensure session token exists on refresh
      let token = sessionStorage.getItem('chronix-session');
      if (!token) {
        token = generateToken();
        sessionStorage.setItem('chronix-session', token);
      }

      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      useAuthStore.setState({ 
        isLoggedIn: true, 
        user, 
        profile: profileDoc.exists() ? profileDoc.data() : {},
        sessionToken: token,
        loading: false 
      });

      // Update last login
      setDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date().toISOString()
      }, { merge: true });
    } else {
      useAuthStore.setState({ isLoggedIn: false, user: null, profile: {}, sessionToken: null, loading: false });
      sessionStorage.removeItem('chronix-session');
    }
  }, (error) => {
    console.error('Auth state change error:', error);
    useAuthStore.setState({ loading: false });
  });
};

export default useAuthStore;
