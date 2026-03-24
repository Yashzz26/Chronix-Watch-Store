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

const useAuthStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      profile: {},
      loading: true,

      setLoading: (loading) => set({ loading }),

      async login(email, password) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
            createdAt: new Date().toISOString(),
            ...userData
          };

          await setDoc(doc(db, 'users', user.uid), profileData);
          set({ isLoggedIn: true, user, profile: profileData });
          return { success: true, user };
        } catch (error) {
          console.error('Signup error:', error.message);
          return { success: false, error: error.message };
        }
      },

      async logout() {
        try {
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
        const { photo, ...rest } = data; // strip photo from persisted store
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
        lastLogin: new Date().toISOString()
      }, { merge: true });
    } else {
      useAuthStore.setState({ isLoggedIn: false, user: null, profile: {}, loading: false });
    }
  }, (error) => {
    console.error('Auth state change error:', error);
    useAuthStore.setState({ loading: false });
  });
};

export default useAuthStore;
