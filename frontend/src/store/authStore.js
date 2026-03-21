import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const useAuthStore = create((set, get) => ({
  isLoggedIn: false,
  user: null,
  profile: {},
  loading: true,

  setLoading: (loading) => set({ loading }),

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'customer',
        createdAt: new Date().toISOString(),
        ...userData
      });

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
    const updated = { ...get().profile, ...data };
    set({ profile: updated });
    // In a real app, you'd also update Firestore here
    if (get().user) {
      setDoc(doc(db, 'users', get().user.uid), updated, { merge: true });
    }
  },
}));

// Initialize auth listener
export const initAuthListener = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        lastLogin: new Date().toISOString()
      }, { merge: true });
      
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      useAuthStore.setState({ 
        isLoggedIn: true, 
        user, 
        profile: profileDoc.exists() ? profileDoc.data() : {},
        loading: false 
      });
    } else {
      useAuthStore.setState({ isLoggedIn: false, user: null, profile: {}, loading: false });
    }
  }, (error) => {
    console.error('Auth state change error:', error);
    useAuthStore.setState({ loading: false });
  });
};

export default useAuthStore;
