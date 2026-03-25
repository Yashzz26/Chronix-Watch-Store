import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowRight, HiOutlineShoppingCart, HiAdjustments, HiX } from 'react-icons/hi';
import { products, categories } from '../data/products';
import SkeletonCard from '../components/ui/SkeletonCard';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Products({ filterCategory }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);

  // States
  const urlCategory = searchParams.get('cat') || 'All';
  const activeCategory = filterCategory || urlCategory;
  const sort = searchParams.get('sort') || 'default';
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Sorting
    if (sort === 'price-low') {
      result.sort((a, b) => (a.dealPrice || a.price) - (b.dealPrice || b.price));
    } else if (sort === 'price-high') {
      result.sort((a, b) => (b.dealPrice || b.price) - (a.dealPrice || a.price));
    }

    return result;
  }, [activeCategory, sort]);

  // Loading effect
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [activeCategory, sort]);

  const handleCategoryChange = (cat) => {
    setSearchParams({ cat, sort });
    if (!filterCategory) {
      // If we are on /allcollection, we update the URL
    }
  };

  const handleSortChange = (newSort) => {
    setSearchParams({ cat: urlCategory, sort: newSort });
  };

  return (
    <div className="collection-page pt-5 mt-4">
      <style>{`
        .collection-page { min-height: 100vh; }
        .page-header { margin-bottom: 60px; }
        .page-title { 
          font-family: 'Cormorant Garamond', serif; 
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 400;
          color: #F0EDE8;
          margin-bottom: 12px;
        }
        .breadcrumb {
          font-size: 0.75rem;
          color: #5A5652;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 24px;
        }
        .breadcrumb a { color: #D4AF37; text-decoration: none; }
        
        .filter-sidebar {
          position: sticky;
          top: 100px;
        }
        .filter-group { margin-bottom: 32px; }
        .filter-label {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #D4AF37;
          margin-bottom: 20px;
          display: block;
        }
        .cat-list { list-style: none; padding: 0; }
        .cat-item {
          padding: 8px 0;
          color: #9A9690;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cat-item:hover { color: #F0EDE8; transform: translateX(4px); }
        .cat-item.active { color: #D4AF37; font-weight: 600; }
        .cat-count { font-family: 'DM Mono', monospace; font-size: 0.7rem; opacity: 0.5; }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 32px;
        }

        @media (max-width: 991.98px) {
          .filter-sidebar { display: none; }
        }
      `}</style>

      <div className="container">
        <div className="page-header text-center text-lg-start">
          <div className="breadcrumb">
            <Link to="/">Home</Link> / {filterCategory ? filterCategory : 'Collection'}
          </div>
          <h1 className="page-title">
            {filterCategory ? filterCategory : (urlCategory === 'All' ? 'Complete Collection' : urlCategory)}
          </h1>
          <p className="text-t2 max-w-600">
            Discover our curated selection of 120+ exceptional timepieces, from heritage mechanicals to modern icons.
          </p>
        </div>

        <div className="row g-5">
          {/* Sidebar */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="filter-sidebar">
              <div className="filter-group">
                <span className="filter-label">Categories</span>
                <ul className="cat-list">
                  {categories.map((cat) => (
                    <li 
                      key={cat} 
                      className={`cat-item ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(cat)}
                    >
                      {cat}
                      <span className="cat-count">
                        {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="filter-group">
                <span className="filter-label">Sort Order</span>
                <select 
                  className="form-select bg-s2 border-border text-t2 shadow-none" 
                  style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="default">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="col-lg-9">
            {/* Mobile Filter Trigger */}
            <div className="d-lg-none mb-4 d-flex justify-content-between align-items-center">
               <span className="text-t3 small uppercase tracking-wider">{filteredProducts.length} Items</span>
               <button 
                className="btn btn-outline-gold d-flex align-items-center gap-2 py-2"
                onClick={() => setShowFilters(true)}
               >
                 <HiAdjustments /> Filters
               </button>
            </div>

            <div className="product-grid">
              <AnimatePresence mode="wait">
                {loading ? (
                  Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((p, idx) => (
                    <ProductCard key={p.id} product={p} index={idx} addItem={addItem} />
                  ))
                ) : (
                  <div className="col-12 py-5 text-center">
                    <h3 className="font-display italic text-t2">No timepieces found in this archive.</h3>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed-inset glass z-100 p-4 d-flex flex-column"
            style={{ position: 'fixed', inset: 0, zIndex: 1000 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-5">
              <span className="font-display h3 text-white mb-0">Refine Search</span>
              <button className="btn text-white p-0" onClick={() => setShowFilters(false)}><HiX size={28} /></button>
            </div>
            
            <div className="flex-grow-1 overflow-auto">
               <span className="filter-label">Categories</span>
                <ul className="cat-list mb-5">
                  {categories.map((cat) => (
                    <li 
                      key={cat} 
                      className={`cat-item h3 font-display ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => { handleCategoryChange(cat); setShowFilters(false); }}
                    >
                      {cat}
                    </li>
                  ))}
                </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusing ProductCard UI
function ProductCard({ product, index, addItem }) {
  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div 
      className="chronix-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
    >
      <Link to={`/product/${product.id}`} className="text-decoration-none h-100 d-flex flex-column">
        <div className="product-img-wrap p-4 bg-s2 d-flex align-items-center justify-content-center" style={{ aspectRatio: '1/1' }}>
          <img src={product.imageGallery[0]} alt={product.name} className="img-fluid object-fit-contain" style={{ maxHeight: '200px' }} />
        </div>
        <div className="p-4 d-flex flex-column flex-grow-1">
          <span className="section-label mb-2">{product.category}</span>
          <h3 className="h5 text-white mb-3 font-display">{product.name}</h3>
          <div className="mt-auto d-flex justify-content-between align-items-center">
            <span className="font-mono text-gold">₹{(product.dealPrice || product.price).toLocaleString()}</span>
            <button 
              onClick={handleAddToCart}
              className="btn bg-white bg-opacity-5 text-white border-0 p-2 rounded-circle hover-gold transition-all"
            >
              <HiOutlineShoppingCart size={20} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
