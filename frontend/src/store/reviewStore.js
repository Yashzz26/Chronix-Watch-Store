import { create } from 'zustand';
import { auth } from '../lib/firebase';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const useReviewStore = create((set, get) => ({
  reviews: [],
  loading: false,
  error: null,

  fetchReviews: async (productId) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${backendUrl}/api/reviews/${productId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch reviews');
      set({ reviews: data.reviews, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  postReview: async (reviewData) => {
    set({ loading: true, error: null });
    try {
      if (!auth.currentUser) throw new Error('You must be logged in to review');
      const token = await auth.currentUser.getIdToken();
      
      const res = await fetch(`${backendUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post review');

      // Update local state instantly mapping the new document payload
      set((state) => ({ reviews: [data.review, ...state.reviews], loading: false }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  editReview: async (reviewId, newRating, newComment) => {
    try {
      if (!auth.currentUser) throw new Error('Authentication required');
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`${backendUrl}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: newRating, comment: newComment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to edit review');

      // Optimistic upate
      set(state => ({
        reviews: state.reviews.map(r => r.id === reviewId ? { ...r, rating: Number(newRating), comment: newComment, updatedAt: new Date().toISOString() } : r)
      }));
      return true;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      if (!auth.currentUser) throw new Error('Authentication required');
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`${backendUrl}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete review');

      set(state => ({
        reviews: state.reviews.filter(r => r.id !== reviewId)
      }));
      return true;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  }
}));

export default useReviewStore;
