# E-Commerce-Web-Store-Watches-


Welcome to Chronix, a beautifully designed, front-end e-commerce experience for a modern watch store. This project was built from the ground up using only **HTML, CSS, and Vanilla JavaScript**, demonstrating core web development principles without reliance on frameworks or backend services. All data, including the shopping cart and user preferences, is managed client-side using `localStorage`.

**Live Demo:** `[Link to your deployed website here]`

---

## ✨ Features

Chronix is packed with features that create a complete and modern shopping experience:

-   **Browse & Discover:**
    -   🖼️ **Dynamic Product Rendering:** Products are loaded dynamically from a JavaScript object, simulating an API.
    -   💀 **Skeleton Loading Screens:** Professional loading states that improve perceived performance.
    -   🔍 **Category Filtering:** View products by specific categories.

-   **Shopping & Interaction:**
    -   🛒 **Shopping Cart:** Fully functional cart with quantity control, item removal, and subtotal calculation, all persisted in `localStorage`.
    -   ❤️ **Wishlist:** Save favorite items for later, also saved to `localStorage`.
    -   🔔 **Toast Notifications:** Real-time, non-intrusive feedback for actions like "Add to Cart".

-   **Product Details:**
    -   🔄 **Image Carousel:** View multiple images of a product in an interactive gallery.
    -   ⭐ **Customer Reviews:** Users can submit reviews and ratings, which are saved and displayed for each product.

-   **User Experience & UI:**
    -   📱 **Fully Responsive Design:** A seamless experience on desktops, tablets, and mobile devices.
    -   🌙 **Dark/Light Mode:** A theme toggle that saves the user's preference for future visits.
    -   ⏳ **Deal Timers & Coupons:** UI for promotional events (logic handled by JS).
    -   ✅ **Complete Checkout Simulation:** A multi-step form process leading to an order confirmation page.

---

## 🛠️ Technologies Used

This project is built exclusively with front-end technologies:

-   **HTML5:** For the core structure and content.
-   **CSS3:** For all styling, including Flexbox, CSS Grid, custom properties (variables) for theming, and animations.
-   **Vanilla JavaScript (ES6+):** For all dynamic functionality, DOM manipulation, and state management.
-   **Font Awesome:** For clean and scalable icons.

---

## 📂 File Structure

The project is organized into a clear and logical file structure:
├── index.html          # Homepage
├── categories.html     # Category & Product Listing Page
├── product.html        # Single Product Detail Page (Template)
├── cart.html           # Shopping Cart Page
├── checkout.html       # Checkout Form Page
├── order.html          # Order Confirmation Page
├── style.css           # All CSS styles
├── script.js           # All JavaScript logic
└── /images/            # Product images and assets..