document.addEventListener("DOMContentLoaded", () => {
  // --- DATABASE ---
  const allProducts = [
    {
      id: 1,
      name: "Galaxy Watch 6",
      price: 21999.0,
      category: "Smart Watch",
      description:
        "A stylish and powerful smartwatch with advanced health tracking, a larger screen, and improved performance.",
      imageGallery: [
        "https://m.media-amazon.com/images/I/61fDRIfPQEL.jpg",
        "https://m.media-amazon.com/images/I/61fDRIfPQEL.jpg",
        "https://m.media-amazon.com/images/I/61fDRIfPQEL.jpg",
        "https://m.media-amazon.com/images/I/61fDRIfPQEL.jpg",
      ],
    },
    {
      id: 2,
      name: "Seiko 5 Sports",
      price: 25500.0,
      category: "Analog",
      description:
        "A reliable and iconic automatic watch, perfect for everyday wear and adventure. Features a durable stainless steel case.",
      imageGallery: [
        "https://m.media-amazon.com/images/I/71L5l2A4DPL._AC_UY1000_.jpg",
        "https://www.seikowatches.com/in-en/-/media/Images/Global/Seiko/Home/Seiko-5-Sports/lineup/SKX-Sports-Style/img_SRPD55K1/SRPD55K1_bac.png",
        "https://5.imimg.com/data5/ANDROID/Default/2021/4/SF/QB/FP/36395995/product-jpeg-500x500.jpg",
        "https://i.ebayimg.com/images/g/g~QAAOSw-4xka-n1/s-l1200.webp",
      ],
    },
    {
      id: 3,
      name: "G-Shock GA2100",
      price: 8995.0,
      dealPrice: 7500.0,
      onDeal: true,
      category: "Analog",
      description:
        "Legendary toughness in a slim, modern octagonal case. Water-resistant up to 200 meters.",
      imageGallery: [
        "https://m.media-amazon.com/images/I/61-pC3-A8BL._AC_UY1000_.jpg",
        "https://www.casio.com/content/dam/casio/product-info/wat/g-shock/ga-2100/ga-2100-1a1/assets/GA-2100-1A1_l-02.png.transform/main-l/image.png",
        "https://www.casio.com/content/dam/casio/product-info/wat/g-shock/ga-2100/ga-2100-1a1/assets/GA-2100-1A1_l-03.png.transform/main-l/image.png",
        "https://media.gq.com/photos/5d5452a20423910008544e31/master/w_1600%2Cc_limit/casio-g-shock-watch.jpg",
      ],
    },
    {
      id: 4,
      name: "Tudor Black Bay",
      price: 350000.0,
      category: "Luxury",
      description:
        "A vintage-inspired diver watch with modern craftsmanship and a timeless design. Certified chronometer.",
      imageGallery: [
        "https://content.thewosgroup.com/productimage/17771235/17771235_1.jpg",
        "https://www.tudorwatch.com/-/media/watch-assets/family/black-bay/black-bay-41-mm-steel/m79230n-0005/slides/m79230n-0005-02-watch-case.jpg",
        "https://www.tudorwatch.com/-/media/watch-assets/family/black-bay/black-bay-41-mm-steel/m79230n-0005/slides/m79230n-0005-04-watch-bracelet.jpg",
        "https://images.ethoswatches.com/img/t/tudor-black-bay-m79230n-0005-41-mm-17771235_5.jpg",
      ],
    },
    {
      id: 5,
      name: "Apple Watch Ultra",
      price: 89900.0,
      category: "Smart Watch",
      description:
        "The most rugged and capable Apple Watch ever. Designed for exploration, adventure, and endurance.",
      imageGallery: [
        "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQF03_VW_34FR+watch-49-titanium-ultra_VW_34FR_WF_CO+watch-face-49-alpine-ultra_VW_34FR_WF_CO_GEO_IN?wid=752&hei=720&bgc=fafafa&trim=1&.v=1683226926343",
        "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQF03_VW_34FR+watch-49-titanium-ultra_VW_34FR_WF_CO?wid=752&hei=720&bgc=fafafa&trim=1&.v=1683226926343",
        "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iup-hero-marketing-202209?wid=986&hei=636&fmt=png-alpha&.v=1680126780029",
        "https://m.media-amazon.com/images/I/812cA4I2I3L.jpg",
      ],
    },
    {
      id: 6,
      name: "Rolex Submariner",
      price: 12500.0,
      category: "Luxury",
      description:
        "The archetype of the diver's watch, a true icon. Unwavering reliability and timeless design.",
      imageGallery: [
        "https://content.rolex.com/v7/dam/new-watches/2023/m126610lv-0002/m126610lv-0002_portrait.jpg?sc_lang=en_in&imwidth=1280",
        "https://content.rolex.com/v7/dam/new-watches/2023/m126610lv-0002/m126610lv-0002_showcase.jpg?sc_lang=en_in&imwidth=1280",
        "https://content.rolex.com/v7/dam/new-watches/2023/m126610lv-0002/m126610lv-0002_0006.jpg?sc_lang=en_in&imwidth=1280",
        "https://content.rolex.com/v7/dam/new-watches/2023/m126610lv-0002/m126610lv-0002_0003.jpg?sc_lang=en_in&imwidth=1280",
      ],
    },
  ];

  // --- STATE MANAGEMENT ---
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  let cart = JSON.parse(localStorage.getItem("chronixCart")) || [];
  let userProfile =
    JSON.parse(localStorage.getItem("chronixUserProfile")) || {};
  let allReviews = JSON.parse(localStorage.getItem("chronixReviews")) || [];

  // --- GENERAL HELPER FUNCTIONS ---
  const saveCart = () =>
    localStorage.setItem("chronixCart", JSON.stringify(cart));
  const saveProfile = () =>
    localStorage.setItem("chronixUserProfile", JSON.stringify(userProfile));
  const saveReviews = () =>
    localStorage.setItem("chronixReviews", JSON.stringify(allReviews));

  const checkAuth = () => {
    if (!sessionStorage.getItem("loggedIn") && currentPath !== "login.html") {
      window.location.href = "login.html";
    }
  };

  const updateCartCount = () => {
    const cartCountElement = document.getElementById("cart-item-count");
    if (cartCountElement) {
      cartCountElement.textContent = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
    }
  };

  const showToast = (message, type = "default") => {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.prepend(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => toast.remove());
    }, 3000);
  };

  const updateUserGreeting = () => {
    const container = document.getElementById("user-greeting-container");
    if (!container) return;
    if (userProfile.name) {
      container.innerHTML = `<a href="profile.html" class="user-greeting-link"><img src="${
        userProfile.photo || "https://via.placeholder.com/150"
      }" alt="Profile" class="profile-pic-small"><span>Hello, ${
        userProfile.name.split(" ")[0]
      }</span></a>`;
    } else {
      container.innerHTML = `<a href="profile.html">Hello, Guest</a>`;
    }
  };

  // --- INITIALIZATION ---
  checkAuth();
  updateCartCount();
  updateUserGreeting();
  const mainContent = document.getElementById("main-content");
  if (mainContent) mainContent.classList.add("fade-in");

  // --- GLOBAL COMPONENTS LOGIC (Navbar, Search, Logout) ---
  const searchBar = document.getElementById("search-bar");
  if (searchBar) {
    const searchResultsContainer = document.getElementById("search-results");
    searchBar.addEventListener("input", () => {
      const searchTerm = searchBar.value.toLowerCase();
      searchResultsContainer.innerHTML = "";
      if (searchTerm.length > 1) {
        const results = allProducts.filter((p) =>
          p.name.toLowerCase().includes(searchTerm)
        );
        if (results.length > 0) {
          results.forEach((product) => {
            searchResultsContainer.innerHTML += `<a href="product.html?id=${
              product.id
            }" class="search-result-item"><img src="${
              product.imageGallery[0]
            }" alt="${product.name}"><div class="search-result-item-info"><h4>${
              product.name
            }</h4><p>₹${product.price.toFixed(2)}</p></div></a>`;
          });
          searchResultsContainer.style.display = "block";
        } else {
          searchResultsContainer.style.display = "none";
        }
      } else {
        searchResultsContainer.style.display = "none";
      }
    });
    document.addEventListener("click", (e) => {
      if (searchResultsContainer && !searchBar.contains(e.target))
        searchResultsContainer.style.display = "none";
    });
  }
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("loggedIn");
      window.location.href = "login.html";
    });
  }

  // --- PAGE-SPECIFIC LOGIC ---

  // 1. LOGIN PAGE
  if (currentPath === "login.html") {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        if (username === "admin" && password === "admin1234") {
          sessionStorage.setItem("loggedIn", "true");
          showToast("Login Successful!", "success");
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1500);
        } else {
          document.getElementById("login-error").textContent =
            "Invalid credentials.";
        }
      });
    }
  }

  // 2. INDEX PAGE (Homepage with Filters, Deal, and Ratings)
  if (currentPath === "index.html" || currentPath === "") {
    const productGrid = document.getElementById("product-grid");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const sortSelect = document.getElementById("sort-select");

    if (productGrid && filterBtns.length > 0 && sortSelect) {
      const displayProducts = (products) => {
        productGrid.innerHTML = "";
        products.forEach((p) => {
          const productReviews = allReviews.filter(
            (review) => review.productId === p.id
          );
          const avgRating =
            productReviews.length > 0
              ? productReviews.reduce((sum, review) => sum + review.rating, 0) /
                productReviews.length
              : 0;
          const totalReviews = productReviews.length;
          productGrid.innerHTML += `
                        <div class="product-card">
                            <img src="${p.imageGallery[0]}" alt="${p.name}">
                            <div class="product-card-content">
                                <h3>${p.name}</h3>
                                <div class="average-rating-display">
                                    <div class="stars-outer">
                                        <div class="stars-inner" style="width: ${
                                          (avgRating / 5) * 100
                                        }%"></div>
                                    </div>
                                    <span class="rating-text">(${totalReviews})</span>
                                </div>
                                <p class="price">₹${p.price.toFixed(2)}</p>
                                <div class="card-actions">
                                    <button class="add-to-cart-btn-grid" data-id="${
                                      p.id
                                    }">Add to Cart</button>
                                    <a href="product.html?id=${
                                      p.id
                                    }" class="view-details-btn">View Details</a>
                                </div>
                            </div>
                        </div>`;
        });
      };

      const applyFiltersAndSort = () => {
        const category =
          document.querySelector(".filter-btn.active").dataset.category;
        const sort = sortSelect.value;
        let products = [...allProducts];
        if (category !== "all")
          products = products.filter((p) => p.category === category);
        if (sort === "price-asc") products.sort((a, b) => a.price - b.price);
        else if (sort === "price-desc")
          products.sort((a, b) => b.price - a.price);
        displayProducts(products);
      };

      filterBtns.forEach((btn) =>
        btn.addEventListener("click", () => {
          filterBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          applyFiltersAndSort();
        })
      );
      sortSelect.addEventListener("change", applyFiltersAndSort);

      productGrid.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-to-cart-btn-grid")) {
          const productId = parseInt(e.target.dataset.id);
          const existingItem = cart.find((item) => item.id === productId);
          if (existingItem) {
            existingItem.quantity++;
          } else {
            cart.push({ id: productId, quantity: 1 });
          }
          saveCart();
          updateCartCount();
          showToast("Item added to cart!");
        }
      });

      applyFiltersAndSort();
    }

    const dealSection = document.getElementById("deal-of-the-day-section");
    if (dealSection) {
      let dealEndTime = new Date();
      dealEndTime.setHours(23, 59, 59, 999);
      const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = dealEndTime - now;
        if (distance < 0) {
          clearInterval(countdownInterval);
          dealSection.style.display = "none";
          return;
        }
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        if (document.getElementById("hours"))
          document.getElementById("hours").innerText = hours
            .toString()
            .padStart(2, "0");
        if (document.getElementById("minutes"))
          document.getElementById("minutes").innerText = minutes
            .toString()
            .padStart(2, "0");
        if (document.getElementById("seconds"))
          document.getElementById("seconds").innerText = seconds
            .toString()
            .padStart(2, "0");
      }, 1000);
    }
  }

  // 3. PRODUCT DETAIL PAGE
  if (currentPath === "product.html") {
    const params = new URLSearchParams(window.location.search),
      productId = parseInt(params.get("id")),
      product = allProducts.find((p) => p.id === productId),
      container = document.getElementById("product-detail-container");
    if (product && container) {
      const createImageGalleryHTML = (gallery) => {
        const mainImage = gallery[0];
        let thumbnailsHTML = "";
        gallery.forEach((imgSrc, index) => {
          thumbnailsHTML += `<img src="${imgSrc}" alt="Thumbnail ${
            index + 1
          }" class="thumbnail-img ${index === 0 ? "active" : ""}">`;
        });
        return `<div class="product-image-gallery"><div class="main-image-container"><img src="${mainImage}" alt="${product.name}" id="main-product-image"></div><div class="thumbnail-container">${thumbnailsHTML}</div></div>`;
      };

      const renderProductInfo = () => {
        const productReviews = allReviews.filter(
          (review) => review.productId === productId
        );
        const avgRating =
          productReviews.length > 0
            ? productReviews.reduce((sum, review) => sum + review.rating, 0) /
              productReviews.length
            : 0;
        const totalReviews = productReviews.length;
        container.innerHTML = `
                    ${createImageGalleryHTML(product.imageGallery)}
                    <div class="product-info">
                        <h1>${product.name}</h1>
                        <div class="average-rating-display">
                            <div class="stars-outer"><div class="stars-inner" style="width: ${
                              (avgRating / 5) * 100
                            }%"></div></div>
                            <span class="rating-text">${avgRating.toFixed(
                              1
                            )} out of 5 (${totalReviews} reviews)</span>
                        </div>
                        <p class="price">₹${(
                          product.dealPrice || product.price
                        ).toFixed(2)}</p>
                        <p>${product.description}</p>
                        <div class="product-actions">
                            <button class="add-to-cart-btn" data-id="${
                              product.id
                            }">Add to Cart</button>
                            <a href="checkout.html?buyNow=${
                              product.id
                            }" class="buy-now-btn">Buy Now</a>
                        </div>
                    </div>`;

        container
          .querySelector(".add-to-cart-btn")
          .addEventListener("click", (e) => {
            const id = parseInt(e.target.dataset.id),
              existingItem = cart.find((item) => item.id === id);
            if (existingItem) existingItem.quantity++;
            else cart.push({ id, quantity: 1 });
            saveCart();
            updateCartCount();
            showToast("Item added to cart!");
          });

        const mainProductImage = document.getElementById("main-product-image");
        const thumbnails = container.querySelectorAll(".thumbnail-img");
        thumbnails.forEach((thumb) => {
          thumb.addEventListener("click", () => {
            mainProductImage.src = thumb.src;
            thumbnails.forEach((t) => t.classList.remove("active"));
            thumb.classList.add("active");
          });
        });
      };

      const reviewsList = document.getElementById("reviews-list");
      const reviewForm = document.getElementById("review-form");
      if (reviewsList && reviewForm) {
        const starRatingInput = reviewForm.querySelector(".star-rating-input"),
          ratingValueInput = reviewForm.querySelector("#rating-value"),
          stars = starRatingInput.querySelectorAll("i");
        const renderReviews = () => {
          reviewsList.innerHTML = "";
          const currentProductReviews = allReviews.filter(
            (review) => review.productId === productId
          );
          if (currentProductReviews.length === 0) {
            reviewsList.innerHTML = "<p>No reviews yet. Be the first!</p>";
            return;
          }
          currentProductReviews.forEach((review) => {
            reviewsList.innerHTML += `<div class="review-card"><div class="review-card-header"><span class="reviewer-info">${
              review.name
            }</span><span class="review-stars">${"★".repeat(
              review.rating
            )}${"☆".repeat(
              5 - review.rating
            )}</span></div><p class="review-body">${review.text}</p></div>`;
          });
        };
        const updateStarDisplay = (rating) => {
          stars.forEach((star) => {
            star.classList.remove("fa-solid");
            star.classList.add("fa-regular");
            if (star.dataset.value <= rating) {
              star.classList.remove("fa-regular");
              star.classList.add("fa-solid");
            }
          });
        };
        starRatingInput.addEventListener("mouseover", (e) => {
          if (e.target.tagName === "I")
            updateStarDisplay(e.target.dataset.value);
        });
        starRatingInput.addEventListener("mouseout", () => {
          updateStarDisplay(ratingValueInput.value);
        });
        starRatingInput.addEventListener("click", (e) => {
          if (e.target.tagName === "I") {
            ratingValueInput.value = e.target.dataset.value;
            updateStarDisplay(ratingValueInput.value);
          }
        });
        reviewForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const newReview = {
            productId,
            name: document.getElementById("reviewer-name").value,
            rating: parseInt(ratingValueInput.value),
            text: document.getElementById("review-text").value,
          };
          if (newReview.rating === 0) {
            showToast("Please select a star rating.", "error");
            return;
          }
          allReviews.push(newReview);
          saveReviews();
          showToast("Thank you for your review!", "success");
          reviewForm.reset();
          ratingValueInput.value = 0;
          updateStarDisplay(0);
          renderProductInfo();
          renderReviews();
        });
        renderProductInfo();
        renderReviews();
      }
    } else if (container) {
      container.innerHTML = "<h2>Product not found</h2>";
    }
  }

  // 4. CART PAGE
  if (currentPath === "cart.html") {
    const cartItemsList = document.getElementById("cart-items-list"),
      cartSummary = document.getElementById("cart-summary"),
      emptyMsg = document.getElementById("empty-cart-message");
    if (cartItemsList) {
      const renderCart = () => {
        cartItemsList.innerHTML = "";
        if (cart.length === 0) {
          emptyMsg.classList.add("show");
          cartSummary.style.display = "none";
          if (document.querySelector(".cart-main h1"))
            document.querySelector(".cart-main h1").style.display = "none";
          return;
        }
        emptyMsg.classList.remove("show");
        cartSummary.style.display = "block";
        if (document.querySelector(".cart-main h1"))
          document.querySelector(".cart-main h1").style.display = "block";
        let subtotal = 0;
        cart.forEach((item) => {
          const p = allProducts.find((prod) => prod.id === item.id);
          subtotal += (p.dealPrice || p.price) * item.quantity;
          cartItemsList.innerHTML += `<div class="cart-item" data-id="${
            item.id
          }"><div class="cart-item-image"><img src="${
            p.imageGallery[0]
          }" alt="${p.name}"></div><div class="cart-item-details"><h3>${
            p.name
          }</h3><p class="price">₹${(p.dealPrice || p.price).toFixed(
            2
          )}</p><div class="quantity-controls"><button class="quantity-btn decrease-qty">-</button><span>${
            item.quantity
          }</span><button class="quantity-btn increase-qty">+</button></div></div><button class="remove-item-btn"><i class="fas fa-trash"></i></button></div>`;
        });
        cartSummary.innerHTML = `<h2>Order Summary</h2><div class="summary-line"><span>Subtotal</span><span>₹${subtotal.toFixed(
          2
        )}</span></div><div class="summary-line total"><span>Total</span><span>₹${subtotal.toFixed(
          2
        )}</span></div><a href="checkout.html" class="btn checkout-btn">Proceed to Checkout</a>`;
      };
      cartItemsList.addEventListener("click", (e) => {
        const target = e.target.closest("button");
        if (!target) return;
        const id = parseInt(e.target.closest(".cart-item").dataset.id),
          item = cart.find((i) => i.id === id);
        if (target.classList.contains("increase-qty")) item.quantity++;
        else if (target.classList.contains("decrease-qty") && item.quantity > 1)
          item.quantity--;
        else if (target.classList.contains("remove-item-btn"))
          cart = cart.filter((i) => i.id !== id);
        saveCart();
        updateCartCount();
        renderCart();
      });
      renderCart();
    }
  }

  // 5. CHECKOUT PAGE
  // 5. CHECKOUT PAGE
  if (currentPath === "checkout.html") {
    const checkoutForm = document.getElementById("checkout-form");
    const upiOverlay = document.getElementById("upi-payment-overlay");
    const confirmOrderBtn = document.getElementById("confirm-order-btn");
    const params = new URLSearchParams(window.location.search);
    const buyNowProductId = parseInt(params.get("buyNow"));
    let cartTotal = 0;

    // ✅ Calculate total for Buy Now or Cart items
    if (buyNowProductId) {
      const product = allProducts.find((p) => p.id === buyNowProductId);
      if (product) cartTotal = product.dealPrice || product.price;
    } else {
      cartTotal = cart.reduce((sum, item) => {
        const product = allProducts.find((p) => p.id === item.id);
        return sum + (product.dealPrice || product.price) * item.quantity;
      }, 0);
    }

    if (checkoutForm && upiOverlay && confirmOrderBtn) {
      // ✅ QR Code Generator
      const generateQRCode = (amount) => {
        const qrContainer = document.getElementById("qrcode-container");
        const amountDisplay = document.getElementById("qr-amount-display");
        qrContainer.innerHTML = "";

        // 🔑 Your BHIM UPI ID
        const yourUpiId = "yashbhadane483-1@okicici";

        const upiLink = `upi://pay?pa=${yourUpiId}&pn=Chronix&am=${amount.toFixed(
          2
        )}&cu=INR`;

        new QRCode(qrContainer, { text: upiLink, width: 180, height: 180 });

        if (amountDisplay) amountDisplay.innerText = `₹${amount.toFixed(2)}`;
      };

      // ✅ Place Order Function
      const placeOrder = () => {
        if (upiOverlay.classList.contains("show")) {
          upiOverlay.classList.remove("show");
        }
        showToast("Order Placed Successfully!", "success");
        setTimeout(() => {
          if (!buyNowProductId) {
            cart = [];
            saveCart();
          }
          updateCartCount();
          window.location.href = "confirmation.html";
        }, 2000);
      };

      // ✅ Checkout Form Submission
      checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (cartTotal === 0) {
          showToast("Your cart is empty!", "error");
          return;
        }

        const selectedPayment = document.querySelector(
          'input[name="payment"]:checked'
        ).value;

        if (selectedPayment === "online") {
          generateQRCode(cartTotal);
          upiOverlay.classList.add("show");
        } else {
          placeOrder();
        }
      });

      // ✅ Confirm Button Click
      confirmOrderBtn.addEventListener("click", placeOrder);
    }
  }

  // 6. PROFILE PAGE
  if (currentPath === "profile.html") {
    const form = document.getElementById("profile-form"),
      nameInput = document.getElementById("full-name"),
      emailInput = document.getElementById("email-id"),
      addressInput = document.getElementById("address"),
      photoInput = document.getElementById("profile-photo-input"),
      photoPreview = document.getElementById("profile-photo-preview");
    if (form) {
      nameInput.value = userProfile.name || "";
      emailInput.value = userProfile.email || "";
      addressInput.value = userProfile.address || "";
      if (userProfile.photo) photoPreview.src = userProfile.photo;
      photoInput.addEventListener("change", () => {
        const file = photoInput.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            photoPreview.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        userProfile.name = nameInput.value;
        userProfile.email = emailInput.value;
        userProfile.address = addressInput.value;
        userProfile.photo = photoPreview.src;
        saveProfile();
        showToast("Profile updated successfully!", "success");
        updateUserGreeting();
      });
    }
  }
});
