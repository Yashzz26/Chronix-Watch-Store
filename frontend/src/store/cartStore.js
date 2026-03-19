import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      reviews: JSON.parse(localStorage.getItem('chronix-reviews') || '[]'),

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
        set({ items: get().items.map(i => i.id === id ? { ...i, qty } : i) });
      },
      clearCart() {
        set({ items: [] });
      },
      totalItems() {
        return get().items.reduce((s, i) => s + i.qty, 0);
      },
      totalPrice() {
        return get().items.reduce((s, i) => s + (i.dealPrice || i.price) * i.qty, 0);
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
    { name: 'chronix-cart', partialize: (s) => ({ items: s.items }) }
  )
);

export default useCartStore;
