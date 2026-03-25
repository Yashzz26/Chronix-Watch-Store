import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiArrowRight, 
  HiOutlineTicket, 
  HiOutlineClock, 
  HiOutlineShieldCheck, 
  HiOutlineTruck,
  HiOutlineShoppingCart
} from 'react-icons/hi';
import { products, getDealProduct, categories } from '../data/products';
import DealBanner from '../components/product/DealBanner';
import SkeletonCard from '../components/ui/SkeletonCard';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);

  // States
  const category = searchParams.get('cat') || 'All';
  const sort = searchParams.get('sort') || 'default';
  const [loading, setLoading] = useState(true);

  // Constants
  const dealProduct = getDealProduct();
  const heroProduct = products[2]; // G-Shock GA2100

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }

    // Sorting
    if (sort === 'price-low') {
      result.sort((a, b) => (a.dealPrice || a.price) - (b.dealPrice || b.price));
    } else if (sort === 'price-high') {
      result.sort((a, b) => (b.dealPrice || b.price) - (a.dealPrice || a.price));
    }

    return result;
  }, [category, sort]);

  // Loading effect on filter change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [category, sort]);

  const handleCategoryChange = (cat) => {
    setSearchParams({ cat, sort });
  };

  const handleSortChange = (newSort) => {
    setSearchParams({ cat: category, sort: newSort });
  };

  return (
    <div className="home-container">
      <style>{`
        .home-container {
          background: #080808;
          color: #F0EDE8;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }

        /* --- SECTION 1: HERO --- */
        .hero-section {
          min-height: 88vh;
          display: flex;
          align-items: center;
          position: relative;
          background: radial-gradient(ellipse 55% 70% at 68% 50%, rgba(212,175,55,0.07) 0%, transparent 65%);
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("https://grains.com/noise.png"); /* Placeholder for grain, using opacity instead */
          background-color: #ffffff;
          opacity: 0.025;
          pointer-events: none;
          z-index: 1;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 0.65rem;
          color: #D4AF37;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .hero-eyebrow-line {
          display: inline-block;
          width: 24px;
          height: 1px;
          background: #D4AF37;
        }

        .hero-headline {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: clamp(3.2rem, 7vw, 6.5rem);
          line-height: 1.02;
          color: #F0EDE8;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
        }

        .hero-headline em {
          font-style: italic;
          color: #D4AF37;
        }

        .hero-subheading {
          font-size: 1.1rem;
          color: #9A9690;
          max-width: 460px;
          line-height: 1.75;
          margin-bottom: 40px;
        }

        .btn-primary-gold {
          background: #D4AF37;
          color: #000;
          font-weight: 700;
          padding: 14px 32px;
          border-radius: 6px;
          font-size: 0.9rem;
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
        }

        .btn-primary-gold:hover {
          background: #F0D060;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(212,175,55,0.2);
          color: #000;
        }

        .btn-outline-gold {
          background: transparent;
          color: #D4AF37;
          border: 2px solid rgba(212,175,55,0.4);
          padding: 12px 28px;
          border-radius: 6px;
          font-size: 0.9rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
        }

        .btn-outline-gold:hover {
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.06);
          color: #D4AF37;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: #5A5652;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .hero-right {
          position: relative;
          display: none;
        }

        @media (min-width: 992px) {
          .hero-right {
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }

        .hero-blob {
          position: absolute;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          background: rgba(212,175,55,0.07);
          filter: blur(80px);
          z-index: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .hero-img {
          width: 100%;
          max-width: 360px;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.85));
        }

        .floating-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 2;
          background: #D4AF37;
          color: #000;
          border-radius: 50%;
          width: 72px;
          height: 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          box-shadow: 0 8px 24px rgba(212,175,55,0.35);
        }

        /* --- SECTION 2: DEAL BANNER --- */
        .deal-banner-wrapper {
          margin-bottom: 80px;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(212,175,55,0.12);
        }

        .shimmer-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
          opacity: 0.6;
          z-index: 10;
        }

        /* --- SECTION 3: COLLECTION HEADER --- */
        .collection-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 4vw, 3rem);
          font-weight: 400;
          color: #F0EDE8;
          margin-bottom: 4px;
        }

        .collection-count {
          font-size: 0.85rem;
          color: #5A5652;
        }

        .sort-select {
          background: #0f0f0f;
          border: 1px solid #1e1e1e;
          color: #9A9690;
          padding: 8px 36px 8px 14px;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235A5652'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }

        .pill-btn {
          padding: 8px 20px;
          border-radius: 999px;
          font-size: 0.8rem;
          cursor: pointer;
          border: 1px solid #1e1e1e;
          background: #0f0f0f;
          color: #9A9690;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .pill-btn:hover {
          border-color: #3a3a3a;
        }

        .pill-btn.active {
          background: #D4AF37;
          color: #000;
          font-weight: 700;
          border-color: transparent;
        }

        /* --- SECTION 4: PRODUCT GRID --- */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }

        /* --- PRODUCT CARD --- */
        .product-card {
          background: #0f0f0f;
          border: 1px solid #1e1e1e;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .product-card:hover {
          border-color: rgba(212, 175, 55, 0.3);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .pc-image-area {
          aspect-ratio: 1/1;
          background: #161616;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 24px;
          position: relative;
        }

        .pc-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.5s ease;
        }

        .product-card:hover .pc-img {
          transform: scale(1.06);
        }

        .deal-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #D4AF37;
          color: #000;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .pc-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pc-category {
          font-size: 0.6rem;
          color: #D4AF37;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .pc-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          color: #F0EDE8;
          line-height: 1.3;
        }

        .pc-price-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pc-price-current {
          font-family: 'DM Mono', monospace;
          color: #D4AF37;
          font-weight: 500;
          font-size: 1rem;
        }

        .pc-price-old {
          font-family: 'DM Mono', monospace;
          color: #5A5652;
          text-decoration: line-through;
          font-size: 0.85rem;
        }

        .pc-button-row {
          margin-top: auto;
          padding-top: 16px;
          display: flex;
          gap: 8px;
        }

        .pc-add-btn {
          flex-grow: 1;
          background: transparent;
          border: 1px solid #1e1e1e;
          border-radius: 6px;
          color: #9A9690;
          font-size: 0.8rem;
          padding: 10px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .pc-add-btn:hover {
          border-color: #D4AF37;
          color: #D4AF37;
          background: rgba(212, 175, 55, 0.04);
        }

        .pc-arrow-btn {
          width: 40px;
          height: 40px;
          border: 1px solid #1e1e1e;
          border-radius: 6px;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: #9A9690;
          text-decoration: none;
        }

        .pc-arrow-btn:hover {
          border-color: #D4AF37;
          color: #D4AF37;
        }

        .empty-state {
          text-align: center;
          padding-top: 80px;
        }

        .empty-state h3 {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: #F0EDE8;
          font-weight: 400;
        }

        .reset-btn {
          color: #D4AF37;
          background: none;
          border: none;
          font-size: 0.875rem;
          cursor: pointer;
          margin-top: 12px;
        }
      `}</style>

      {/* SECTION 1: HERO */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            {/* Left Column */}
            <div className="col-12 col-lg-7">
              <motion.div 
                className="hero-eyebrow"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="hero-eyebrow-line"></span>
                SINCE 2024 · PRECISION HOROLOGY
              </motion.div>

              <motion.h1 
                className="hero-headline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                Time is the only true <em>luxury.</em>
              </motion.h1>

              <motion.p 
                className="hero-subheading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                Curated timepieces for those who understand that precision is an art form.
              </motion.p>

              <motion.div 
                className="d-flex flex-wrap gap-3 mb-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to="/?cat=All" className="btn-primary-gold">
                  Explore Collection <HiArrowRight size={18} />
                </Link>
                {dealProduct && (
                  <Link to={`/product/${dealProduct.id}`} className="btn-outline-gold">
                    <HiOutlineTicket size={18} /> Deal of the Day
                  </Link>
                )}
              </motion.div>

              <motion.div 
                className="d-flex flex-wrap gap-4 mt-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="trust-badge">
                  <HiOutlineClock size={16} color="#D4AF37" /> 6 CURATED PIECES
                </div>
                <div className="trust-badge">
                  <HiOutlineShieldCheck size={16} color="#D4AF37" /> 2-YEAR WARRANTY
                </div>
                <div className="trust-badge">
                  <HiOutlineTruck size={16} color="#D4AF37" /> FREE SHIPPING
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="col-12 col-lg-5 hero-right">
              <div className="hero-blob"></div>
              {heroProduct && (
                <motion.div
                  className="position-relative"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <img src={heroProduct.imageGallery[0]} alt={heroProduct.name} className="hero-img" />
                  <div className="floating-badge">
                    <span style={{ fontSize: '0.6rem', marginBottom: '2px' }}>SAVE</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>93%</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container py-5">
        {/* SECTION 2: DEAL BANNER */}
        <div className="deal-banner-wrapper">
          <div className="shimmer-line"></div>
          <DealBanner product={dealProduct} />
        </div>

        {/* SECTION 3: COLLECTION HEADER + FILTERS */}
        <div className="row align-items-end justify-content-between mb-4 gy-4">
          <div className="col-12 col-md-auto">
            <h2 className="collection-title">The Collection</h2>
            <p className="collection-count">
              Showing <span style={{ color: '#F0EDE8' }}>{filteredProducts.length}</span> exceptional timepieces
            </p>
          </div>
          <div className="col-12 col-md-auto">
            <select 
              className="sort-select" 
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="default">Relevance</option>
              <option value="price-low">Price: Low–High</option>
              <option value="price-high">Price: High–Low</option>
            </select>
          </div>
        </div>

        <div className="d-flex gap-2 overflow-auto pb-4 mb-5 no-scrollbar">
          {['All', 'Analog', 'Smart Watch', 'Luxury'].map((cat) => (
            <button
              key={cat}
              className={`pill-btn ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SECTION 4: PRODUCT GRID */}
        <div className="product-grid">
          <AnimatePresence mode="wait">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} addItem={addItem} />
              ))
            ) : (
              <div className="grid-span-full">
                <motion.div 
                  className="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h3>No timepieces match your selection.</h3>
                  <button className="reset-btn" onClick={() => handleCategoryChange('All')}>Reset filters</button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Internal ProductCard Component
function ProductCard({ product, index, addItem }) {
  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart!`, {
      style: {
        background: '#0f0f0f',
        color: '#F0EDE8',
        border: '1px solid #1e1e1e',
        fontSize: '0.85rem'
      },
      iconTheme: {
        primary: '#D4AF37',
        secondary: '#000',
      },
    });
  };

  return (
    <motion.div 
      className="product-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className="pc-image-area">
        {product.isOnDeal && <div className="deal-badge">Deal</div>}
        <img src={product.imageGallery[0]} alt={product.name} className="pc-img" />
      </div>

      <div className="pc-info">
        <span className="pc-category">{product.category}</span>
        <h3 className="pc-name">{product.name}</h3>
        <div className="pc-price-row">
          <span className="pc-price-current">₹{(product.dealPrice || product.price).toLocaleString()}</span>
          {product.isOnDeal && (
            <span className="pc-price-old">₹{product.price.toLocaleString()}</span>
          )}
        </div>

        <div className="pc-button-row">
          <button className="pc-add-btn" onClick={handleAddToCart}>
            <HiOutlineShoppingCart size={15} /> Add
          </button>
          <Link to={`/product/${product.id}`} className="pc-arrow-btn">
            <HiArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
