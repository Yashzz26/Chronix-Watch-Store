import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineShieldCheck, 
  HiOutlineTruck, 
  HiOutlineArrowPath,
  HiChevronDown,
  HiOutlineHeart,
  HiOutlineShoppingCart,
  HiOutlineArrowUpRight,
  HiStar
} from 'react-icons/hi2';
import { HiHeart } from 'react-icons/hi2';
import { doc, getDoc, collection, query, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import useCartStore from '../store/cartStore';
import useWishlistStore from '../store/wishlistStore';
import useReviewStore from '../store/reviewStore';
import { auth } from '../lib/firebase';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setProduct(data);

          // Fetch Related Products (same category)
          const q = query(
            collection(db, 'products'), 
            where('category', '==', data.category),
            limit(5)
          );
          const relatedSnap = await getDocs(q);
          setRelatedProducts(
            relatedSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(p => p.id !== id)
              .slice(0, 4)
          );
        } else {
          navigate('/404', { replace: true });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load instrument details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const [activeImg, setActiveImg] = useState(0);
  const [openAccordion, setOpenAccordion] = useState('description');
  const [showSticky, setShowSticky] = useState(false);
  const reviewsRef = useRef(null);

  const { reviews, loading: reviewsLoading, fetchReviews, postReview, editReview, deleteReview } = useReviewStore();
  const [hasPurchased, setHasPurchased] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    if (product) {
      window.scrollTo(0, 0);
      fetchReviews(product.id);
    }
  }, [product, fetchReviews]);

  useEffect(() => {
    const checkPurchase = async () => {
      if (!auth.currentUser) return;
      try {
        const token = await auth.currentUser.getIdToken();
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${backendUrl}/api/orders/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.orders) {
          const purchased = data.orders.some(order => 
             order.items.some(item => item.id === product.id)
          );
          setHasPurchased(purchased);
        }
      } catch (e) {
        console.error("Purchase verification failed", e);
      }
    };
    checkPurchase();
  }, [product, auth.currentUser]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    try {
      if (editingReviewId) {
        await editReview(editingReviewId, reviewRating, reviewText);
        toast.success("Review updated");
        setEditingReviewId(null);
      } else {
        await postReview({ productId: product.id, rating: reviewRating, comment: reviewText });
        toast.success("Review published");
      }
      setReviewText('');
      setReviewRating(5);
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 800);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div className="p-10 text-center text-t3 opacity-50">Retrieving Instrument Specifications...</div>;
  if (!product) return null;

  const handleAddToCart = (e) => {
    if(e) e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to archive`, {
      style: { background: '#111', color: '#fff', border: '1px solid var(--gold)' }
    });
  };

  const handleWishlist = (e, prod) => {
    if(e) e.preventDefault();
    const targetProduct = prod || product;
    const added = toggleWishlist(targetProduct);
    if (added) toast.success('Added to curation', { icon: '🤍' });
    else toast.success('Removed from curation');
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
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
          padding-top: 40px; 
          color: var(--t1);
          font-family: var(--font-body);
          overflow-x: hidden;
        }

        /* --- BREADCRUMB --- */
        .pdp-breadcrumb {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 40px;
          color: var(--t3);
        }
        .pdp-breadcrumb a { color: var(--t1); text-decoration: none; font-weight: 700; transition: var(--transition); }
        .pdp-breadcrumb a:hover { color: var(--gold); }

        /* --- GALLERY --- */
        .gallery-container { position: sticky; top: 120px; }
        .pdp-main-card {
           background: var(--s1);
           border: 1px solid var(--border);
           border-radius: 20px;
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
        .pdp-main-card:hover .pdp-main-img { transform: scale(1.08); }

        .thumb-strip {
           display: flex;
           gap: 16px;
           justify-content: center;
           overflow-x: auto;
           padding-bottom: 10px;
        }
        .thumb-strip::-webkit-scrollbar { height: 2px; }
        
        .pdp-thumb {
           width: 80px;
           height: 80px;
           background: var(--s1);
           border: 1.5px solid var(--border);
           border-radius: 12px;
           padding: 10px;
           cursor: pointer;
           flex-shrink: 0;
           transition: var(--transition);
        }
        .pdp-thumb img { width: 100%; height: 100%; object-fit: contain; opacity: 0.4; transition: var(--transition); }
        .pdp-thumb.active { border-color: var(--gold); box-shadow: 0 4px 15px rgba(212,175,55,0.1); }
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
          font-size: clamp(2.5rem, 4vw, 3.5rem); 
          font-weight: 700; 
          line-height: 1.1;
          margin-bottom: 16px;
        }
        
        .pdp-social-proof { display: flex; align-items: center; gap: 8px; margin-bottom: 30px; cursor: pointer; transition: opacity 0.3s; }
        .pdp-social-proof:hover { opacity: 0.7; }
        .pdp-stars { color: var(--gold); display: flex; gap: 2px; }
        .pdp-reviews-text { font-size: 0.85rem; color: var(--t2); font-weight: 600; text-decoration: underline; text-decoration-color: var(--border); text-underline-offset: 4px; }

        .pdp-price-wrap { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
        .pdp-price { font-family: var(--font-body); font-weight: 700; font-size: 2.5rem; color: var(--t1); margin: 0; }
        .pdp-price span { font-size: 1.1rem; color: var(--t3); text-decoration: line-through; margin-left: 15px; font-weight: 400; opacity: 0.6; }

        .urgency-badge { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 700; color: #b45309; background: #fef3c7; padding: 6px 14px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em; }
        .pulse-dot { width: 8px; height: 8px; background: #ea580c; border-radius: 50%; box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.7); animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(234, 88, 12, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0); }
        }

        .pdp-highlights { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 40px; }
        .highlight-chip { background: var(--bg-2); border: 1px solid var(--border); padding: 8px 16px; border-radius: 100px; font-size: 0.7rem; font-weight: 700; color: var(--t2); text-transform: uppercase; letter-spacing: 0.05em; }

        .pdp-cta-wrap { display: flex; gap: 16px; margin-bottom: 24px; }
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
           background: var(--bg-1);
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           color: var(--t2);
           transition: var(--transition);
        }
        .btn-wishlist:hover { border-color: var(--gold); color: var(--gold); background: #fff; }

        .trust-bar { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: var(--bg-2); border-radius: 16px; border: 1px solid var(--border); margin-bottom: 50px; }
        .trust-item { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; font-weight: 700; color: var(--t2); text-transform: uppercase; letter-spacing: 0.05em; }
        .trust-item svg { color: var(--gold); font-size: 1.1rem; }

        /* --- ACCORDIONS --- */
        .pdp-accordions { border-top: 1px solid var(--border); }
        .pdp-accordion { border-bottom: 1px solid var(--border); overflow: hidden; }
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
           transition: color 0.3s;
        }
        .pdp-acc-trigger:hover { color: var(--gold); }
        .pdp-acc-content { padding-bottom: 24px; color: var(--t2); font-size: 0.95rem; line-height: 1.8; }

        .specs-grid-internal { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: var(--bg-2); padding: 24px; border-radius: 12px; }
        .spec-item { display: flex; flex-direction: column; gap: 4px; }
        .spec-lbl { font-size: 0.65rem; font-weight: 700; color: var(--t3); text-transform: uppercase; letter-spacing: 0.1em; }
        .spec-val { font-size: 0.85rem; font-weight: 700; color: var(--t1); }

        /* --- EDITORIAL BLOCK --- */
        .editorial-block { margin-top: 80px; padding: 80px; background: var(--t1); color: #fff; border-radius: 24px; text-align: center; }
        .editorial-block h2 { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; margin-bottom: 24px; }
        .editorial-block p { color: rgba(255,255,255,0.7); max-width: 600px; margin: 0 auto; font-size: 1.1rem; line-height: 1.8; }

        /* --- RELATED PRODUCTS ENHANCED --- */
        .related-card { position: relative; background: #fff; border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: all 0.3s ease; }
        .related-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.06); border-color: var(--gold); }
        .related-img-wrap { background: var(--bg-2); padding: 40px; text-align: center; position: relative; }
        .related-img-wrap img { height: 160px; object-fit: contain; transition: transform 0.5s ease; }
        .related-card:hover .related-img-wrap img { transform: scale(1.1); }
        .related-actions { position: absolute; bottom: 20px; left: 0; right: 0; display: flex; justify-content: center; gap: 10px; opacity: 0; transform: translateY(10px); transition: all 0.3s ease; }
        .related-card:hover .related-actions { opacity: 1; transform: translateY(0); }
        
        .action-btn-mini { width: 44px; height: 44px; border-radius: 50%; background: #fff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--t1); transition: all 0.2s; cursor: pointer; }
        .action-btn-mini:hover { background: var(--gold); color: #fff; border-color: var(--gold); }

        /* --- REVIEWS SECTION --- */
        .reviews-section { margin-top: 100px; padding-top: 80px; border-top: 1px solid var(--border); }
        .review-card { background: #fff; border: 1px solid var(--border); padding: 32px; border-radius: 16px; height: 100%; transition: box-shadow 0.3s; }
        .review-card:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.03); }

        /* --- STICKY BUY BAR --- */
        .sticky-buy-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-top: 1px solid var(--border); padding: 16px 0; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 1000; box-shadow: 0 -10px 40px rgba(0,0,0,0.05); }
        .sticky-buy-bar.visible { transform: translateY(0); }

        @media (max-width: 991px) {
           .pdp-wrapper { padding-top: 100px; }
           .info-panel { padding-left: 0; margin-top: 60px; }
           .gallery-container { position: relative; top: 0; }
           .editorial-block { padding: 40px 20px; }
           .trust-bar { flex-direction: column; gap: 16px; align-items: flex-start; }
           .sticky-buy-bar .product-info { display: none; }
        }
      `}</style>

      {/* STICKY BUY BAR */}
      <div className={`sticky-buy-bar ${showSticky ? 'visible' : ''}`}>
         <div className="container">
            <div className="d-flex justify-content-between align-items-center">
               <div className="d-flex align-items-center gap-4 product-info">
                  <img src={product.imageGallery[0]} alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                  <div>
                     <h4 className="h6 fw-bold m-0">{product.name}</h4>
                     <span className="text-gold font-mono small fw-bold">₹{product.price.toLocaleString()}</span>
                  </div>
               </div>
               <div className="d-flex gap-3 w-100 w-md-auto justify-content-end">
                  <button className="btn-secure" style={{ height: '48px', padding: '0 32px' }} onClick={handleAddToCart}>Secure Acquisition</button>
               </div>
            </div>
         </div>
      </div>

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
                 
                 {/* SOCIAL PROOF */}
                 <div className="pdp-social-proof" onClick={scrollToReviews}>
                    <div className="pdp-stars">
                      <HiStar /><HiStar /><HiStar /><HiStar /><HiStar />
                    </div>
                    <span className="pdp-reviews-text">4.9 (128 Reviews)</span>
                 </div>

                 <div className="pdp-price-wrap">
                    <div className="pdp-price">
                       ₹{product.price.toLocaleString()}
                       {product.isOnDeal && <span>₹{(product.price + 7500).toLocaleString()}</span>}
                    </div>
                    <div className="urgency-badge">
                       <div className="pulse-dot"></div>
                       Only 3 left in stock
                    </div>
                 </div>

                 {/* HIGHLIGHTS STRIP */}
                 <div className="pdp-highlights">
                    <div className="highlight-chip">Swiss Automatic</div>
                    <div className="highlight-chip">Sapphire Crystal</div>
                    <div className="highlight-chip">10ATM Water Res.</div>
                    <div className="highlight-chip">72H Reserve</div>
                 </div>

                 <div className="pdp-cta-wrap">
                    <button className="btn-secure" onClick={handleAddToCart}>
                       Secure Acquisition
                    </button>
                    <button 
                      className="btn-wishlist" 
                      onClick={(e) => handleWishlist(e, product)}
                    >
                       {isInWishlist(product.id) ? (
                         <HiHeart size={24} className="text-gold" />
                       ) : (
                         <HiOutlineHeart size={24} />
                       )}
                    </button>
                 </div>

                 {/* TRUST BAR (CONVERSION TRIGGER) */}
                 <div className="trust-bar">
                    <div className="trust-item"><HiOutlineTruck /> Free Global Shipping</div>
                    <div className="trust-item"><HiOutlineArrowPath /> 14-Day Returns</div>
                    <div className="trust-item"><HiOutlineShieldCheck /> 100% Authentic</div>
                 </div>

                 {/* EXPANDABLE SECTIONS */}
                 <div className="pdp-accordions">
                    {/* Description */}
                    <div className="pdp-accordion">
                       <div className="pdp-acc-trigger" onClick={() => setOpenAccordion(openAccordion === 'description' ? '' : 'description')}>
                          The Story
                          <HiChevronDown style={{ transform: openAccordion === 'description' ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                       </div>
                       <AnimatePresence>
                          {openAccordion === 'description' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                               <div className="pdp-acc-content">
                                  A masterclass in technical synthesis. This timepiece features an institutional-grade steel chassis, sapphire architecture, and our signature calibered movement. Designed for the collector who demands absolute precision without visual volume.
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>

                    {/* Specifications */}
                    <div className="pdp-accordion">
                       <div className="pdp-acc-trigger" onClick={() => setOpenAccordion(openAccordion === 'specs' ? '' : 'specs')}>
                          Technical Specifications
                          <HiChevronDown style={{ transform: openAccordion === 'specs' ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                       </div>
                       <AnimatePresence>
                          {openAccordion === 'specs' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                               <div className="pdp-acc-content">
                                  <div className="specs-grid-internal">
                                     {specs.map((s, idx) => (
                                       <div key={idx} className="spec-item">
                                          <span className="spec-lbl">{s.label}</span>
                                          <span className="spec-val">{s.value}</span>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>

                    {/* Service & Warranty */}
                    <div className="pdp-accordion">
                       <div className="pdp-acc-trigger" onClick={() => setOpenAccordion(openAccordion === 'service' ? '' : 'service')}>
                          Service Atelier & Warranty
                          <HiChevronDown style={{ transform: openAccordion === 'service' ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                       </div>
                       <AnimatePresence>
                          {openAccordion === 'service' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                               <div className="pdp-acc-content">
                                  Each acquisition is accompanied by a 24-month chronometric guarantee. Our Maharashtra atelier provides specialized recalibration and maintenance for all institutional-grade components. Access to prioritized service cycles is standard.
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>

                    {/* Shipping */}
                    <div className="pdp-accordion border-0">
                       <div className="pdp-acc-trigger" onClick={() => setOpenAccordion(openAccordion === 'delivery' ? '' : 'delivery')}>
                          Delivery Protocol
                          <HiChevronDown style={{ transform: openAccordion === 'delivery' ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                       </div>
                       <AnimatePresence>
                          {openAccordion === 'delivery' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                               <div className="pdp-acc-content">
                                  Secure, white-glove logistics handled by our prioritized partners. Standard delivery window: 3-5 business days. All timepieces are dispatched in our modular, impact-resistant collector cases.
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      </div>

      {/* EDITORIAL BANNER ("Why This Watch") */}
      <section className="container">
         <div className="editorial-block">
            <h2>Crafted for precision and timeless elegance.</h2>
            <p>
               Owning a {product.name} is not merely about tracking time, it's about holding a piece of mechanical artistry. Engineered with obsession, worn with authority.
            </p>
         </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="container reviews-section" ref={reviewsRef}>
         <div className="text-center mb-5 pb-4">
            <span className="section-label">COMMUNITY VERIFIED</span>
            <h2 className="font-display h1 m-0">Customer Experiences</h2>
         </div>

         {hasPurchased && (
           <div className="mb-5 p-4 bg-bg-2 border border-border rounded-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h4 className="h6 fw-bold mb-3">{editingReviewId ? 'Edit Your Review' : 'Share Your Experience'}</h4>
              <form onSubmit={handleSubmitReview}>
                 <div className="d-flex gap-2 mb-3">
                    {[1,2,3,4,5].map(star => (
                      <HiStar key={star} size={24} className={star <= reviewRating ? "text-gold" : "text-t3 opacity-25"} style={{ cursor: 'pointer' }} onClick={() => setReviewRating(star)} />
                    ))}
                 </div>
                 <textarea 
                   className="form-control mb-3" 
                   rows="3" 
                   placeholder="How does this timepiece perform?"
                   value={reviewText}
                   onChange={e => setReviewText(e.target.value)}
                   style={{ background: '#fff', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', padding: '12px', width: '100%', borderRadius: '8px' }}
                 ></textarea>
                 <div className="d-flex gap-2">
                    <button type="submit" className="btn-gold px-4 py-2" style={{ fontSize: '0.8rem', border: 'none', borderRadius: '4px' }} disabled={reviewsLoading}>
                       {reviewsLoading ? 'Publishing...' : (editingReviewId ? 'Update Review' : 'Publish Review')}
                    </button>
                    {editingReviewId && (
                      <button type="button" className="btn px-3 py-2 text-danger small bg-transparent border-0" onClick={() => { setEditingReviewId(null); setReviewText(''); setReviewRating(5); }}>Cancel</button>
                    )}
                 </div>
              </form>
           </div>
         )}

         {reviewsLoading && reviews.length === 0 ? (
            <div className="text-center py-5 text-t3 small">Loading community reviews...</div>
         ) : reviews.length === 0 ? (
            <div className="text-center py-5 border border-dashed border-border rounded-4 bg-bg-2">
               <p className="text-t3 uppercase tracking-widest small m-0">No experiences shared yet.</p>
            </div>
         ) : (
            <div className="row g-4">
               {reviews.map(r => (
                 <div className="col-12 col-md-4" key={r.id}>
                    <div className="review-card d-flex flex-column h-100">
                       <div className="d-flex justify-content-between mb-3">
                          <div className="pdp-stars">
                            {[1,2,3,4,5].map(star => <HiStar key={star} className={star <= r.rating ? '' : 'text-t3 opacity-25'} />)}
                          </div>
                          {auth.currentUser?.uid === r.userId && (
                            <div className="d-flex gap-2 x-small fw-bold">
                               <button className="btn p-0 text-t3" onClick={() => { setEditingReviewId(r.id); setReviewText(r.comment); setReviewRating(r.rating); }}>Edit</button>
                               <button className="btn p-0 text-danger opacity-50" onClick={() => { if(window.confirm('Delete review?')) deleteReview(r.id); }}>Delete</button>
                            </div>
                          )}
                       </div>
                       <p className="small text-t2 line-height-lg mb-4 flex-grow-1">"{r.comment}"</p>
                       <div className="d-flex align-items-center gap-3 mt-auto">
                          <div className="avatar-wrap bg-bg-2 rounded-circle" style={{ width: 40, height: 40 }}></div>
                          <div>
                             <span className="d-block small fw-bold">{r.authorName}</span>
                             <span className="x-small text-t3 opacity-75">Verified Buyer • {new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         )}
      </section>

      {/* CROSS-SELL SECTION (ENHANCED) */}
      <section className="container mt-5 pt-5">
         <div className="d-flex justify-content-between align-items-end mb-5 border-bottom border-border pb-4">
            <div>
               <span className="x-small fw-bold text-gold uppercase tracking-widest mb-2 d-block">Recommendations</span>
               <h2 className="font-display h1 m-0">Consolidate Your Collection</h2>
            </div>
            <Link to="/allcollection" className="btn-pill-soft d-flex align-items-center gap-2 text-decoration-none">
               Explore Archive <HiOutlineArrowUpRight />
            </Link>
         </div>

         <div className="row g-4">
            {relatedProducts.map((p) => (
              <div key={p.id} className="col-12 col-sm-6 col-lg-3">
                 <div className="related-card">
                    <Link to={`/product/${p.id}`} className="text-decoration-none position-relative d-block">
                       <div className="related-img-wrap">
                          <img src={p.imageGallery[0]} alt={p.name} className="img-fluid" />
                          <div className="related-actions" onClick={(e) => e.preventDefault()}>
                             <button className="action-btn-mini" onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(p); toast.success('Added to cart'); }}>
                                <HiOutlineShoppingCart size={18} />
                             </button>
                             <button className="action-btn-mini" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWishlist(null, p); }}>
                                {isInWishlist(p.id) ? <HiHeart size={18} className="text-gold" /> : <HiOutlineHeart size={18} />}
                             </button>
                          </div>
                       </div>
                       <div className="p-4 bg-white text-center border-top border-border">
                          <span className="x-small fw-bold text-t3 uppercase tracking-wider mb-2 d-block opacity-50">{p.category}</span>
                          <h4 className="h6 fw-bold text-t1 mb-2 text-truncate">{p.name}</h4>
                          <p className="text-gold font-mono small m-0 fw-bold">₹{p.price.toLocaleString()}</p>
                       </div>
                    </Link>
                 </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
