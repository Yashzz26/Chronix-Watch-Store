import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineShieldCheck, 
  HiOutlineTruck, 
  HiOutlineArrowPath,
  HiChevronDown,
  HiOutlineHeart,
  HiOutlineArrowUpRight
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
  const [openAccordion, setOpenAccordion] = useState('specs'); // specs, service, delivery

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

  const specs = [
    { label: 'Movement', value: 'Automatic Swiss Calibre' },
    { label: 'Case Diameter', value: '42mm' },
    { label: 'Glass', value: 'Sapphire Crystal' },
    { label: 'Water Depth', value: '100m (10 ATM)' },
    { label: 'Band', value: 'Oystersteel Link' },
    { label: 'Power Reserve', value: '72 Hours' }
  ];

  return (
    <div className="pdp-wrapper pb-5">
      <style>{`
        .pdp-wrapper { 
          background: var(--bg); 
          padding-top: 140px; 
          color: var(--t1);
          font-family: var(--font-body);
        }

        /* --- BREADCRUMB --- */
        .pdp-breadcrumb {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 60px;
          color: var(--t3);
        }
        .pdp-breadcrumb a { color: var(--t1); text-decoration: none; font-weight: 700; transition: var(--transition); }
        .pdp-breadcrumb a:hover { color: var(--gold); }

        /* --- GALLERY --- */
        .gallery-container { position: sticky; top: 140px; }
        .pdp-main-card {
           background: var(--s1);
           border: 1px solid var(--border);
           border-radius: 24px;
           padding: 60px;
           display: flex;
           align-items: center;
           justify-content: center;
           margin-bottom: 24px;
           box-shadow: 0 10px 40px rgba(0,0,0,0.02);
           overflow: hidden;
           position: relative;
        }
        .pdp-main-img {
           width: 100%;
           height: auto;
           max-height: 550px;
           object-fit: contain;
           transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pdp-main-card:hover .pdp-main-img { transform: scale(1.05); }

        .thumb-strip {
           display: flex;
           gap: 16px;
           justify-content: center;
           overflow-x: auto;
           padding-bottom: 10px;
        }
        .thumb-strip::-webkit-scrollbar { height: 2px; }
        
        .pdp-thumb {
           width: 100px;
           height: 100px;
           background: var(--s1);
           border: 1.5px solid var(--border);
           border-radius: 12px;
           padding: 12px;
           cursor: pointer;
           flex-shrink: 0;
           transition: var(--transition);
        }
        .pdp-thumb img { width: 100%; height: 100%; object-fit: contain; opacity: 0.5; transition: var(--transition); }
        .pdp-thumb.active { border-color: var(--gold); }
        .pdp-thumb.active img { opacity: 1; }
        .pdp-thumb:hover img { opacity: 1; }

        /* --- INFO PANEL --- */
        .info-panel { padding-left: 40px; }
        .pdp-label { 
          display: block; 
          font-size: 0.7rem; 
          font-weight: 800; 
          color: var(--gold); 
          letter-spacing: 0.3em; 
          text-transform: uppercase; 
          margin-bottom: 12px; 
        }
        .pdp-title { 
          font-family: var(--font-display); 
          font-size: clamp(2.5rem, 5vw, 4rem); 
          font-weight: 700; 
          line-height: 1.1;
          margin-bottom: 8px;
        }
        .pdp-edition { font-size: 0.85rem; color: var(--t3); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; margin-bottom: 40px; }

        .pdp-desc { font-size: 1.05rem; color: var(--t2); line-height: 1.8; margin-bottom: 40px; max-width: 500px; }

        .pdp-price { font-family: var(--font-body); font-weight: 700; font-size: 2.25rem; color: var(--t1); margin-bottom: 40px; }
        .pdp-price span { font-size: 1.1rem; color: var(--t3); text-decoration: line-through; margin-left: 15px; font-weight: 400; opacity: 0.6; }

        .pdp-cta-wrap { display: flex; gap: 16px; margin-bottom: 60px; }
        .btn-secure {
           flex-grow: 1;
           height: 64px;
           background: var(--t1);
           color: #fff;
           border: none;
           border-radius: 100px;
           font-weight: 800;
           letter-spacing: 0.15em;
           text-transform: uppercase;
           font-size: 0.85rem;
           transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-secure:hover { background: var(--gold); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(212,175,55,0.25); }

        .btn-wishlist {
           width: 64px;
           height: 64px;
           border: 1.5px solid var(--border);
           background: #fff;
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           color: var(--t2);
           transition: var(--transition);
        }
        .btn-wishlist:hover { border-color: var(--gold); color: var(--gold); }

        /* --- SPECS GRID --- */
        .specs-pdp-grid {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 16px;
           margin-bottom: 50px;
           padding: 32px;
           background: var(--bg-2);
           border-radius: 20px;
           border: 1px solid var(--border);
        }
        .spec-item { display: flex; flex-direction: column; gap: 4px; }
        .spec-lbl { font-size: 0.65rem; font-weight: 700; color: var(--t3); text-transform: uppercase; letter-spacing: 0.1em; }
        .spec-val { font-size: 0.9rem; font-weight: 700; color: var(--t1); }

        /* --- ACCORDIONS --- */
        .pdp-accordion { border-top: 1px solid var(--border); overflow: hidden; }
        .pdp-acc-trigger {
           display: flex;
           justify-content: space-between;
           align-items: center;
           padding: 24px 0;
           cursor: pointer;
           font-weight: 800;
           font-size: 0.75rem;
           text-transform: uppercase;
           letter-spacing: 0.15em;
           color: var(--t1);
        }
        .pdp-acc-trigger:hover { color: var(--gold); }

        /* --- TRUST BADGES --- */
        .pdp-trust-badges { display: flex; gap: 40px; margin-top: 60px; padding-top: 40px; border-top: 1px solid var(--border); }
        .pdp-trust { display: flex; align-items: center; gap: 12px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--t3); }
        .pdp-trust svg { color: var(--gold); font-size: 1.2rem; }

        @media (max-width: 991px) {
           .pdp-wrapper { padding-top: 100px; }
           .info-panel { padding-left: 0; margin-top: 60px; }
           .gallery-container { position: relative; top: 0; }
        }
      `}</style>

      <div className="container">
        <div className="pdp-breadcrumb">
          <Link to="/">Chronix</Link> <span className="mx-2 opacity-50">•</span>
          <Link to="/allcollection">{product.category}</Link> <span className="mx-2 opacity-50">•</span>
          <span className="text-t3">{product.name}</span>
        </div>

        <div className="row g-5">
           {/* Visual Column */}
           <div className="col-lg-7">
              <div className="gallery-container">
                 <div className="pdp-main-card">
                    <AnimatePresence mode="wait">
                       <motion.img 
                         key={activeImg}
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 1.05 }}
                         transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                         src={product.imageGallery[activeImg]} 
                         alt={product.name} 
                         className="pdp-main-img"
                       />
                    </AnimatePresence>
                 </div>

                 <div className="thumb-strip">
                    {product.imageGallery.map((img, i) => (
                      <div 
                        key={i} 
                        className={`pdp-thumb ${activeImg === i ? 'active' : ''}`}
                        onClick={() => setActiveImg(i)}
                      >
                         <img src={img} alt="" />
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Information Column */}
           <div className="col-lg-5">
              <div className="info-panel">
                 <span className="pdp-label">{product.category} Archive</span>
                 <h1 className="pdp-title">{product.name}</h1>
                 <p className="pdp-edition">Institutional Edition • 2024 Series</p>

                 <p className="pdp-desc">
                   A masterclass in technical synthesis. This timepiece features an institutional-grade steel chassis, sapphire architecture, and our signature calibered movement. Designed for the collector who demands absolute precision without visual volume.
                 </p>

                 <div className="pdp-price">
                    ₹{product.price.toLocaleString()}
                    {product.isOnDeal && <span>₹{(product.price + 7500).toLocaleString()}</span>}
                 </div>

                 <div className="pdp-cta-wrap">
                    <button className="btn-secure" onClick={handleAddToCart}>
                       Secure Acquisition
                    </button>
                    <button className="btn-wishlist">
                       <HiOutlineHeart size={24} />
                    </button>
                 </div>

                 <div className="specs-pdp-grid">
                    {specs.map((s, idx) => (
                      <div key={idx} className="spec-item">
                         <span className="spec-lbl">{s.label}</span>
                         <span className="spec-val">{s.value}</span>
                      </div>
                    ))}
                 </div>

                 <div className="pdp-accordions">
                    <div className="pdp-accordion">
                       <div className="pdp-acc-trigger" onClick={() => setOpenAccordion(openAccordion === 'service' ? '' : 'service')}>
                          Service Atelier & Warranty
                          <HiChevronDown style={{ transform: openAccordion === 'service' ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                       </div>
                       <AnimatePresence>
                          {openAccordion === 'service' && (
                            <motion.div 
                              initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                               <div className="pb-4 text-t3 small" style={{ lineHeight: 1.8 }}>
                                  Each acquisition is accompanied by a 24-month chronometric guarantee. Our Maharashtra atelier provides specialized recalibration and maintenance for all institutional-grade components. Access to prioritized service cycles is standard.
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>

                    <div className="pdp-accordion">
                       <div className="pdp-acc-trigger" onClick={() => setOpenAccordion(openAccordion === 'delivery' ? '' : 'delivery')}>
                          Delivery Protocol
                          <HiChevronDown style={{ transform: openAccordion === 'delivery' ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                       </div>
                       <AnimatePresence>
                          {openAccordion === 'delivery' && (
                            <motion.div 
                              initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                               <div className="pb-4 text-t3 small" style={{ lineHeight: 1.8 }}>
                                  Secure, white-glove logistics handled by our prioritized partners. Standard delivery window: 3-5 business days. All timepieces are dispatched in our modular, impact-resistant collector cases.
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>

                 <div className="pdp-trust-badges">
                    <div className="pdp-trust"><HiOutlineShieldCheck /> Authentic</div>
                    <div className="pdp-trust"><HiOutlineTruck /> Priority</div>
                    <div className="pdp-trust"><HiOutlineArrowPath /> 14-Day Return</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Cross-Sell Section */}
      <section className="container mt-5 pt-5">
         <div className="d-flex justify-content-between align-items-end mb-5 border-bottom border-border pb-4">
            <div>
               <span className="x-small fw-bold text-gold uppercase tracking-widest mb-2 d-block">Recommendations</span>
               <h2 className="font-display h1 m-0">Consolidate Your Collection</h2>
            </div>
            <Link to="/allcollection" className="btn-pill-soft d-flex align-items-center gap-2">
               Explore Archive <HiOutlineArrowUpRight />
            </Link>
         </div>

         <div className="row g-4">
            {products.slice(0, 4).map((p) => (
              <div key={p.id} className="col-6 col-md-3">
                 <Link to={`/product/${p.id}`} className="text-decoration-none group">
                    <div className="editorial-product-card p-4 transition-all">
                       <div className="mb-4 text-center">
                          <img 
                            src={p.imageGallery[0]} 
                            alt="" 
                            className="img-fluid" 
                            style={{ height: '180px', objectFit: 'contain' }} 
                          />
                       </div>
                       <span className="x-small fw-bold text-t3 uppercase tracking-wider mb-2 d-block opacity-50">{p.category}</span>
                       <h4 className="h6 fw-bold text-t1 mb-2 text-truncate">{p.name}</h4>
                       <p className="text-gold font-mono small m-0 fw-bold">₹{p.price.toLocaleString()}</p>
                    </div>
                 </Link>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
