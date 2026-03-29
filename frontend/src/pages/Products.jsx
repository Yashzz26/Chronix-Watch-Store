import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiAdjustments, HiX } from 'react-icons/hi';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { categoryNames, categories } from '../data/products';
import SkeletonCard from '../components/ui/SkeletonCard';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Products({ filterCategory }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);

  // Database Products State
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync with Firestore
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDbProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error('Inventory Sync Failed');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter and Sort Logic
  const urlCategory = searchParams.get('cat') || 'All';
  const activeCategory = filterCategory || urlCategory;
  const sort = searchParams.get('sort') || 'default';
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredProducts = useMemo(() => {
    let result = [...dbProducts];
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }
    if (sort === 'price-low') {
      result.sort((a, b) => (a.dealPrice || a.price) - (b.dealPrice || b.price));
    } else if (sort === 'price-high') {
      result.sort((a, b) => (b.dealPrice || b.price) - (a.dealPrice || a.price));
    }
    return result;
  }, [dbProducts, activeCategory, sort]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, sort]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [activeCategory, sort, currentPage]);

  const handleCategoryChange = (cat) => {
    setSearchParams({ cat, sort });
  };

  const handleSortChange = (newSort) => {
    setSearchParams({ cat: urlCategory, sort: newSort });
  };

  return (
    <div className="collection-page pb-5">
      <style>{`
        .collection-page { background: var(--bg); min-height: 100vh; font-family: var(--font-body); }
        
        .collection-hero { padding: 120px 0 60px; border-bottom: 1px solid var(--border); margin-bottom: 60px; }
        .collection-title { font-family: var(--font-display); font-size: 3.5rem; font-weight: 700; color: var(--t1); }
        
        .sidebar { position: sticky; top: 120px; }
        .sidebar-title { 
          font-size: 0.75rem; 
          font-weight: 700; 
          letter-spacing: 0.15em; 
          text-transform: uppercase; 
          color: var(--t1); 
          margin-bottom: 30px; 
          display: block; 
          border-bottom: 1px solid var(--border);
          padding-bottom: 15px;
        }

        .filter-list { list-style: none; padding: 0; margin-bottom: 50px; }
        .filter-item {
          font-size: 0.9rem;
          color: var(--t2);
          padding: 12px 0;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .filter-item:hover { color: var(--gold); padding-left: 5px; }
        .filter-item.active { color: var(--gold); font-weight: 700; }
        .filter-count { font-size: 0.7rem; opacity: 0.5; color: var(--t1); }

        .sort-select {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border);
          background: var(--bg-2);
          font-size: 0.85rem;
          color: var(--t1);
          border-radius: 4px;
        }

        .pagination { display: flex; gap: 12px; justify-content: center; margin-top: 80px; }
        .page-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          background: #fff;
          font-size: 0.85rem;
          color: var(--t1);
          cursor: pointer;
          transition: var(--transition);
        }
        .page-btn.active { background: var(--t1); color: #fff; border-color: var(--t1); }
        .page-btn:hover:not(.active) { border-color: var(--gold); color: var(--gold); }

        @media (max-width: 991.98px) {
          .sidebar { display: none; }
        }
      `}</style>

      <div className="collection-hero">
        <div className="container">
          <span className="section-label">Institutional Archive</span>
          <h1 className="collection-title">
            {activeCategory === 'All' ? 'Technical Inventory' : activeCategory}
          </h1>
          <p className="text-t2 max-w-600 m-0">Discover our curated selection of horological instruments, engineered for precision and aesthetic restraint.</p>
        </div>
      </div>

      <div className="container">
        <div className="row g-5">
          {/* Sidebar */}
          <div className="col-lg-3">
            <aside className="sidebar">
              <span className="sidebar-title">Categories</span>
              <ul className="filter-list">
                {categories.map((cat) => (
                  <li 
                    key={cat} 
                    className={`filter-item ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                    <span className="filter-count">
                      ({cat === 'All' ? dbProducts.length : dbProducts.filter(p => p.category === cat).length})
                    </span>
                  </li>
                ))}
              </ul>

              <span className="sidebar-title">Sort By</span>
              <select 
                className="sort-select shadow-none"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="default">Newest Additions</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </aside>
          </div>

          {/* Grid */}
          <div className="col-lg-9">
            {/* Mobile Actions */}
            <div className="d-lg-none d-flex justify-content-between align-items-center mb-4">
              <span className="small uppercase fw-bold tracking-wider">{filteredProducts.length} Items</span>
              <button 
                className="btn btn-outline-gold d-flex align-items-center gap-2"
                onClick={() => setShowFilters(true)}
              >
                <HiAdjustments /> Filter
              </button>
            </div>

            <div className="row g-4">
              <AnimatePresence mode="wait">
                {loading ? (
                  Array(6).fill(0).map((_, i) => <div className="col-md-6 col-xl-4" key={i}><SkeletonCard /></div>)
                ) : currentProducts.length > 0 ? (
                  currentProducts.map((p, idx) => (
                    <div className="col-md-6 col-xl-4" key={p.id}>
                      <ProductCardElite product={p} index={idx} addItem={addItem} />
                    </div>
                  ))
                ) : (
                  <div className="col-12 py-5 text-center">
                    <h3 className="font-display italic text-t3">No instruments recorded in this sector.</h3>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed-inset"
            style={{ position: 'fixed', inset: 0, zIndex: 1100, background: '#fff', padding: '40px' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-5">
              <h2 className="font-display">Refine Search</h2>
              <button className="btn p-0" onClick={() => setShowFilters(false)}><HiX size={28} /></button>
            </div>
            <span className="sidebar-title">Categories</span>
            <ul className="filter-list">
              {categories.map((cat) => (
                <li 
                  key={cat} 
                  className={`filter-item h4 font-display ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => { handleCategoryChange(cat); setShowFilters(false); }}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductCardElite({ product, index, addItem }) {
    const handleAddToCart = (e) => {
      e.preventDefault();
      const defaultVariant = product.variants?.[0] || null;
      addItem({
        ...product,
        variants: defaultVariant ? {
          size: defaultVariant.dialSize,
          color: defaultVariant.colorName,
          strap: defaultVariant.strap,
          sku: defaultVariant.sku
        } : null
      });
      toast.success(`${product.name} Archived`, {
        style: { background: '#fff', color: '#111', border: '1px solid var(--border)' }
      });
    };
  
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: (index % 3) * 0.1 }}
        className="chronix-card p-0"
      >
        <Link to={`/product/${product.id}`} className="text-decoration-none">
          <div className="product-img-wrap p-5" style={{ background: 'var(--bg-2)' }}>
            <img src={product.imageGallery[0]} alt={product.name} className="img-fluid" />
          </div>
          <div className="p-4 text-center">
             <span className="section-label" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>{product.category}</span>
             <h3 className="font-display h4 text-t1 mb-2">{product.name}</h3>
             <div className="text-gold font-mono fw-bold mb-3">₹{product.price.toLocaleString()}</div>
             <button 
               className="btn-gold w-100" 
               style={{ fontSize: '0.7rem', padding: '10px' }}
               onClick={handleAddToCart}
             >
               Secure Delivery
             </button>
          </div>
        </Link>
      </motion.div>
    );
  }
