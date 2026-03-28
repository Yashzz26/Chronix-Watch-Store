import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiStar, 
  HiOutlineShieldCheck, 
  HiOutlineTruck, 
  HiOutlineArrowPath,
  HiOutlineCheckBadge,
  HiChevronDown,
  HiArrowRight,
  HiOutlineShoppingBag
} from 'react-icons/hi2';
import { getProductById, products } from '../data/products';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);
  const { addItem } = useCartStore();

  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('specs'); // specs, service

  useEffect(() => {
    if (!product) navigate('/404', { replace: true });
    window.scrollTo(0, 0);
  }, [product, navigate, id]);

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} added to archive`, {
      style: { background: '#fff', color: '#111', border: '1px solid var(--border)' }
    });
  };

  return (
    <div className="product-page">
      <style>{`
        .product-page { background: var(--bg); min-height: 100vh; padding-top: 120px; color: var(--t1); }
        
        .breadcrumb { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 40px; color: var(--t3); }
        .breadcrumb a { color: var(--t1); text-decoration: none; font-weight: 700; }

        .product-gallery { position: sticky; top: 120px; }
        .main-img-wrap { background: var(--bg-2); border-radius: 12px; padding: 60px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .main-img { max-height: 500px; width: 100%; object-fit: contain; }
        
        .thumb-list { display: flex; gap: 16px; justify-content: center; }
        .thumb-item { width: 80px; height: 80px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; padding: 10px; opacity: 0.5; transition: var(--transition); background: #fff; }
        .thumb-item.active { opacity: 1; border-color: var(--gold); }

        .product-info { padding-left: 40px; }
        .product-cat { color: var(--gold); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 12px; display: block; }
        .product-name { font-family: var(--font-display); font-size: clamp(2.5rem, 4vw, 3.5rem); font-weight: 700; margin-bottom: 20px; }
        .product-description { color: var(--t2); font-size: 1rem; line-height: 1.7; margin-bottom: 40px; }

        .product-price { font-size: 2.5rem; font-family: var(--font-body); font-weight: 700; margin-bottom: 40px; }
        .product-price span { font-size: 1rem; color: var(--t3); text-decoration: line-through; margin-left: 15px; font-weight: 400; }

        .buy-actions { display: flex; gap: 20px; margin-bottom: 60px; }
        
        .accordion-wrap { border-top: 1px solid var(--border); }
        .accordion-item { border-bottom: 1px solid var(--border); }
        .accordion-header { 
          padding: 24px 0; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          cursor: pointer; 
          font-weight: 700; 
          font-size: 0.85rem; 
          text-transform: uppercase; 
          letter-spacing: 0.1em;
        }

        .spec-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.03); font-size: 0.9rem; }
        .spec-label { color: var(--t3); }
        .spec-value { color: var(--t1); font-weight: 600; }

        .trust-pills { display: flex; gap: 30px; margin-top: 60px; }
        .trust-pill { display: flex; align-items: center; gap: 10px; font-size: 0.75rem; font-weight: 700; color: var(--t3); text-transform: uppercase; letter-spacing: 0.1em; }
        .trust-pill svg { color: var(--gold); font-size: 1.25rem; }

        @media (max-width: 991.98px) {
          .product-info { padding-left: 0; margin-top: 60px; }
        }
      `}</style>

      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Archive</Link> / <Link to="/allcollection">{product.category}</Link> / {product.name}
        </div>

        <div className="row">
          {/* Gallery Column */}
          <div className="col-12 col-lg-7">
            <div className="product-gallery">
              <div className="main-img-wrap">
                <motion.img 
                  key={activeImg}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={product.imageGallery[activeImg]} 
                  className="main-img"
                  alt={product.name}
                />
              </div>
              <div className="thumb-list">
                {product.imageGallery.map((img, i) => (
                  <div 
                    key={i} 
                    className={`thumb-item ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} className="w-100 h-100 object-fit-contain" alt="" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info Column */}
          <div className="col-12 col-lg-5">
            <div className="product-info">
              <span className="product-cat">{product.category}</span>
              <h1 className="product-name">{product.name}</h1>
              <p className="product-description">
                A masterpiece of horological engineering. This instrument combines absolute technical precision with a refined aesthetic that transcends seasonal trends. Engineered in limited batches for the discerning collector.
              </p>

              <div className="product-price">
                ₹{product.price.toLocaleString()}
                {product.isOnDeal && <span>₹{(product.price + 5000).toLocaleString()}</span>}
              </div>

              <div className="buy-actions">
                <button className="btn-gold flex-grow-1" onClick={handleAddToCart}>
                  Secure Acquisition
                </button>
                <button className="btn-outline-gold" style={{ width: '60px', padding: 0 }} onClick={handleAddToCart}>
                  <HiOutlineShoppingBag size={20} />
                </button>
              </div>

              <div className="accordion-wrap">
                <div className="accordion-item">
                  <div className="accordion-header" onClick={() => setActiveTab(activeTab === 'specs' ? '' : 'specs')}>
                    Technical Specifications
                    <HiChevronDown style={{ transform: activeTab === 'specs' ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                  </div>
                  <AnimatePresence>
                    {activeTab === 'specs' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4">
                          <div className="spec-row"><span className="spec-label">Internal Movement</span><span className="spec-value">Automatic Swiss Calibre</span></div>
                          <div className="spec-row"><span className="spec-label">Case Diameter</span><span className="spec-value">42mm</span></div>
                          <div className="spec-row"><span className="spec-label">Materials</span><span className="spec-value">Institutional Grade Steel</span></div>
                          <div className="spec-row"><span className="spec-label">Water Resistance</span><span className="spec-value">100 Meters / 10 ATM</span></div>
                          <div className="spec-row"><span className="spec-label">Glass Architecture</span><span className="spec-value">Sapphire Crystal</span></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="accordion-item">
                  <div className="accordion-header" onClick={() => setActiveTab(activeTab === 'service' ? '' : 'service')}>
                    Service Atelier
                    <HiChevronDown style={{ transform: activeTab === 'service' ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                  </div>
                  <AnimatePresence>
                    {activeTab === 'service' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 text-t3 small" style={{ lineHeight: 1.8 }}>
                          Every Chronix instrument includes a 24-month institutional warranty. Our service atelier in Pune, MH provides life-long maintenance, ensuring your asset retains its precision for generations. Complimentary white-glove shipping is included in this acquisition.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="trust-pills">
                <div className="trust-pill"><HiOutlineShieldCheck /> Authentic</div>
                <div className="trust-pill"><HiOutlineTruck /> Priority</div>
                <div className="trust-pill"><HiOutlineArrowPath /> 14-Day Returns</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Sell */}
      <section className="container py-5 mt-5">
        <div className="d-flex justify-content-between align-items-end mb-5">
           <h2 className="font-display h1 m-0">Consolidate Your Collection</h2>
           <Link to="/allcollection" className="text-gold text-decoration-none fw-bold small tracking-widest uppercase">
             Explore All <HiArrowRight />
           </Link>
        </div>
        <div className="row g-4">
          {products.slice(0, 4).map((p, i) => (
            <div key={p.id} className="col-6 col-md-3">
              <Link to={`/product/${p.id}`} className="text-decoration-none">
                <div className="chronix-card p-4 text-center">
                  <img src={p.imageGallery[0]} className="img-fluid mb-3" style={{ height: '140px', objectFit: 'contain' }} alt="" />
                  <h4 className="font-display h6 text-t1 text-truncate">{p.name}</h4>
                  <p className="text-gold font-mono small mb-0">₹{p.price.toLocaleString()}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
