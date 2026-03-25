import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper to validate cart items on load (Section 1.6)
const isValidCartItem = (item) => {
  return (
    item &&
    (typeof item.id === 'number' || typeof item.id === 'string') &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.qty === 'number' &&
    item.qty > 0 &&
    item.qty <= 99 &&
    Array.isArray(item.imageGallery)
  );
};

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      reviews: JSON.parse(localStorage.getItem('chronix-reviews') || '[]'),

      appliedCoupon: null,

      // ── Cart ──────────────────────────────────
      addItem(product) {
        const existing = get().items.find(i => i.id === product.id);
        if (existing) {
          set({ items: get().items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) });
        } else {
          set({ items: [...get().items, { ...product, qty: 1 }] });
        }
      },
      removeItem(id) {
        set({ items: get().items.filter(i => i.id !== id) });
      },
      updateQty(id, qty) {
        if (qty <= 0) return get().removeItem(id);
        if (qty > 99) qty = 99; // Section 2.4 boundary
        set({ items: get().items.map(i => i.id === id ? { ...i, qty } : i) });
      },
      clearCart() {
        set({ items: [], appliedCoupon: null });
      },
      totalItems() {
        return get().items.reduce((s, i) => s + i.qty, 0);
      },
      totalPrice() {
        const subtotal = get().items.reduce((s, i) => s + (i.dealPrice || i.price) * i.qty, 0);
        if (get().appliedCoupon) {
            const discount = (subtotal * get().appliedCoupon.discount) / 100;
            return subtotal - discount;
        }
        return subtotal;
      },
      
      applyCoupon(coupon) {
        set({ appliedCoupon: coupon });
      },
      removeCoupon() {
        set({ appliedCoupon: null });
      },

      // ── Reviews (localStorage, matching original script.js) ──
      addReview(review) {
        const updated = [...get().reviews, review];
        set({ reviews: updated });
        localStorage.setItem('chronix-reviews', JSON.stringify(updated));
      },
      getProductReviews(productId) {
        return get().reviews.filter(r => r.productId === productId);
      },
    }),
    { 
      name: 'chronix-cart', 
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.items)) {
          // Filter out any invalid/corrupted items (Section 1.6)
          state.items = state.items.filter(isValidCartItem);
        }
      }
    }
  )
);

export default useCartStore;
