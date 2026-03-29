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
  HiStar,
  HiPlus,
  HiMinus
} from 'react-icons/hi2';
import { HiHeart } from 'react-icons/hi2';
import { doc, getDoc, collection, query, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import useCartStore from '../store/cartStore';
import useWishlistStore from '../store/wishlistStore';
import useReviewStore from '../store/reviewStore';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { reviews, loading: reviewsLoading, fetchReviews } = useReviewStore();

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStrap, setSelectedStrap] = useState('');
  const [showSticky, setShowSticky] = useState(false);
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setProduct(data);
          fetchReviews(data.id);

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
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // Set default variants when product is loaded
  useEffect(() => {
    if (product?.variants?.length > 0) {
      const v = product.variants[0];
      setSelectedSize(v.dialSize);
      setSelectedColor(v.colorName);
      setSelectedStrap(v.strap);
    } else if (product) {
      // Fallbacks for legacy products
      setSelectedSize('42mm');
      setSelectedColor('Steel');
      setSelectedStrap('Oystersteel');
    }
  }, [product]);

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 800);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div className="p-10 text-center text-t3 opacity-50 font-display h3">Refining Specifications...</div>;
  if (!product) return null;

  const activeVariant = product?.variants?.find(v => 
    v.dialSize === selectedSize && 
    v.colorName === selectedColor && 
    v.strap === selectedStrap
  ) || null;

  // S3.3: Reactive Selection Hardening
  const currentPrice = activeVariant?.price || product?.price || 0;
  const currentStock = activeVariant ? activeVariant.stock : (product?.variants?.length > 0 ? 0 : (product?.stock || 0));
  const isAvailable = currentStock > 0 && (product?.variants?.length > 0 ? !!activeVariant : true);

  const handleAddToCart = (e) => {
    if(e) e.preventDefault();
    addItem({ 
      ...product, 
      price: currentPrice, // Use variant price
      qty,
      variants: {
        size: selectedSize,
        color: selectedColor,
        strap: selectedStrap,
        sku: activeVariant?.sku || `LEGACY-${product.id}`
      }
    });
    toast.success(`${product.name} acquired`, {
      style: { background: '#111', color: '#fff', border: '1px solid var(--gold)' }
    });
  };

  const handleWishlist = (e) => {
    if(e) e.preventDefault();
    const added = toggleWishlist(product);
    if (added) toast.success('Added to archive', { icon: '🤍' });
    else toast.success('Removed from archive');
  };

  const sizes = Array.from(new Set(product?.variants?.map(v => v.dialSize) || ['38mm', '40mm', '42mm', '44mm']));
  const availableColors = product?.variants?.reduce((acc, v) => {
    if (!acc.some(c => c.name === v.colorName)) {
      acc.push({ name: v.colorName, color: v.colorHex || '#BFC1C2' });
    }
    return acc;
  }, []) || [
    { name: 'Steel', color: '#BFC1C2' },
    { name: 'Gold', color: '#D4AF37' },
    { name: 'Obsidian', color: '#1A1A1A' }
  ];
  const straps = Array.from(new Set(product?.variants?.map(v => v.strap) || ['Oystersteel', 'Titanium', 'Leather']));

  return (
    <div className="pdp-luxury-wrapper pb-5">
      <style>{`
        .pdp-luxury-wrapper { 
          background: var(--bg); 
          padding-top: 60px; 
          color: var(--t1);
        }
        .gallery-sticky { position: sticky; top: 120px; }
        .pdp-title { 
          font-family: var(--font-display); 
          font-size: clamp(2.5rem, 5vw, 4rem); 
          font-weight: 700; 
          line-height: 1.05;
          margin-bottom: 24px;
        }
        .pdp-price { font-size: 2.5rem; font-weight: 700; color: var(--t1); }
        .pdp-price span { font-size: 1.25rem; color: var(--t3); text-decoration: line-through; margin-left: 15px; font-weight: 400; }
        
        .sticky-acquisition-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          border-top: 1px solid var(--border);
          padding: 16px 0;
          z-index: 1000;
          transform: translateY(${showSticky ? '0' : '100%'});
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 -10px 40px rgba(0,0,0,0.05);
        }

        .image-zoom-container { cursor: crosshair; overflow: hidden; border-radius: 24px; }
        .image-zoom-container img { transition: transform 0.3s ease-out; transform-origin: center center; }
        .thumb-strip { display: flex; gap: 12px; margin-top: 24px; }
        .thumb-item { width: 80px; height: 80px; border-radius: 12px; border: 1.5px solid var(--border); padding: 8px; cursor: pointer; transition: var(--transition); }
        .thumb-item.active { border-color: var(--gold); background: #fff; box-shadow: var(--shadow-sm); }
        .thumb-item img { width: 100%; height: 100%; object-fit: contain; opacity: 0.6; }
        .thumb-item.active img { opacity: 1; }
      `}</style>

      {/* STICKY BUY BAR */}
      <div className="sticky-acquisition-bar">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-none d-md-flex align-items-center gap-4">
              <img src={product.imageGallery[0]} alt="" style={{ width: 50, height: 50, objectFit: 'contain' }} />
              <div>
                <h4 className="h6 fw-bold m-0">{product.name}</h4>
                <span className="text-gold fw-bold small">₹{product.price.toLocaleString()}</span>
              </div>
            </div>
            <div className="d-flex gap-3 w-100 w-md-auto justify-content-end">
               <button 
                 className={`btn-gold px-5 py-3 h-100 ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`} 
                 onClick={isAvailable ? handleAddToCart : null}
                 disabled={!isAvailable}
               >
                 {isAvailable ? 'Secure Acquisition' : 'Currently Unavailable'}
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* BREADCRUMB */}
        <div className="x-small tracking-widest text-uppercase fw-bold mb-5 opacity-50">
          <Link to="/">Chronix</Link> <span className="mx-2">/</span> 
          <Link to="/allcollection">{product.category}</Link> <span className="mx-2">/</span> 
          <span className="text-t1">{product.name}</span>
        </div>

        <div className="row g-5">
          {/* GALLERY COLUMN */}
          <div className="col-lg-7">
            <div className="gallery-sticky">
              <div className="pdp-gallery-card">
                 <AnimatePresence mode="wait">
                   <motion.img 
                      key={activeImg}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      src={product.imageGallery[activeImg]} 
                      className="img-fluid"
                      alt={product.name}
                   />
                 </AnimatePresence>
              </div>
              <div className="thumb-strip justify-content-center">
                {product.imageGallery.map((img, i) => (
                  <div 
                    key={i} 
                    className={`thumb-item ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt="" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* INFO COLUMN */}
          <div className="col-lg-5">
            <div className="info-stack">
              <span className="badge-limited">Limited Edition Archive</span>
              <h1 className="pdp-title">{product.name}</h1>
              
              {/* RATINGS */}
              <div className="d-flex align-items-center gap-3 mb-4 cursor-pointer">
                <div className="d-flex text-gold">
                   <HiStar /><HiStar /><HiStar /><HiStar /><HiStar />
                </div>
                <span className="small fw-bold text-t2">4.9</span>
                <span className="x-small text-t3 border-bottom border-border">128 Reviews</span>
              </div>

              {/* PRICE & STOCK */}
              <div className="d-flex align-items-end gap-4 mb-5">
                <div className="pdp-price">
                  ₹{currentPrice.toLocaleString()}
                  {product.isOnDeal && <span>₹{(currentPrice + 9500).toLocaleString()}</span>}
                </div>
                <div className={`badge-stock mb-2 ${currentStock < 5 ? 'bg-danger text-white' : ''}`}>
                   {currentStock > 0 && <div className="pulse-dot"></div>}
                   {currentStock > 0 ? `Only ${currentStock} Left In Stock` : (activeVariant ? 'Currently Out of Stock' : 'Selection Unavailable')}
                </div>
              </div>

              {/* FEATURE CHIPS */}
              <div className="d-flex flex-wrap gap-2 mb-5">
                <div className="feature-chip">Swiss Automatic</div>
                <div className="feature-chip">Sapphire Crystal</div>
                <div className="feature-chip">10ATM Water Resistance</div>
                <div className="feature-chip">72H Power Reserve</div>
              </div>

              <div className="border-top border-border pt-5 mb-5">
                {/* VARIANTS: SIZE */}
                <div className="mb-4">
                  <label className="section-label mb-3">Case Diameter</label>
                  <div className="d-flex gap-2">
                    {sizes.map(s => (
                      <button 
                        key={s} 
                        className={`variant-pill ${selectedSize === s ? 'active' : ''}`}
                        onClick={() => setSelectedSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* VARIANTS: COLOR */}
                <div className="mb-4">
                  <label className="section-label mb-3">Finish & Palette</label>
                  <div className="d-flex gap-3">
                    {availableColors.map(c => (
                      <div 
                        key={c.name} 
                        className={`color-swatch ${selectedColor === c.name ? 'active' : ''}`}
                        onClick={() => setSelectedColor(c.name)}
                        title={c.name}
                      >
                        <span style={{ backgroundColor: c.color }}></span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VARIANTS: MATERIAL */}
                <div className="mb-4">
                  <label className="section-label mb-3">Strap Architecture</label>
                  <div className="d-flex gap-2">
                    {straps.map(m => (
                      <button 
                        key={m} 
                        className={`variant-pill ${selectedStrap === m ? 'active' : ''}`}
                        onClick={() => setSelectedStrap(m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* QUANTITY & ACTIONS */}
              <div className="d-flex flex-column gap-4 mb-5 pb-4 border-bottom border-border">
                <div className="d-flex align-items-center justify-content-between">
                  <label className="section-label m-0">Consignment Quantity</label>
                  <div className="stepper-minimal">
                    <button className="stepper-btn" onClick={() => setQty(Math.max(1, qty - 1))}><HiMinus /></button>
                    <span className="stepper-val">{qty}</span>
                    <button className="stepper-btn" onClick={() => setQty(qty + 1)}><HiPlus /></button>
                  </div>
                </div>
                
                <div className="d-flex gap-3">
                  <button 
                    className={`btn-gold flex-grow-1 py-4 ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    onClick={isAvailable ? handleAddToCart : null}
                    disabled={!isAvailable}
                  >
                    {isAvailable ? 'Secure Acquisition' : 'Selection Unavailable'}
                  </button>
                  <button 
                    className={`btn-ghost p-0`} 
                    style={{ width: '68px', height: '68px', borderRadius: '50%' }}
                    onClick={handleWishlist}
                  >
                    {isInWishlist(product.id) ? <HiHeart size={24} className="text-gold" /> : <HiOutlineHeart size={24} />}
                  </button>
                </div>

                {/* TRUST SECTION */}
                <div className="d-flex justify-content-between pt-2">
                  <div className="trust-badge-horizontal"><HiOutlineTruck /> Free Global Shipping</div>
                  <div className="trust-badge-horizontal"><HiOutlineArrowPath /> 14-Day Returns</div>
                  <div className="trust-badge-horizontal"><HiOutlineShieldCheck /> 100% Authentic</div>
                </div>
              </div>

              {/* DESCRIPTION & SPECS */}
              <div className="pdp-description-story mb-5">
                <h3 className="section-label mb-3">The Narrative</h3>
                <p className={`text-t2 ${isStoryExpanded ? '' : 'text-truncate'}`} style={{ maxHeight: isStoryExpanded ? 'none' : '4.8em' }}>
                   A masterwork of industrial synthesis. This timepiece from our {product.category} collection represents the absolute apex of precision engineering and visual hierarchy. Designed for the collector who demands an institutional presence without visual noise.
                </p>
                <button 
                  className="btn p-0 text-gold x-small fw-bold tracking-widest uppercase mt-2 border-0 bg-transparent"
                  onClick={() => setIsStoryExpanded(!isStoryExpanded)}
                >
                  {isStoryExpanded ? 'Retract Story' : 'Engage Full Story'}
                </button>

                <div className="mt-5">
                  <h3 className="section-label mb-4">Institutional Specifications</h3>
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="spec-card p-3 bg-bg-2 rounded-3 border border-border">
                        <span className="x-small text-t3 uppercase d-block mb-1">Movement</span>
                        <span className="small fw-bold">{product.attributes?.movement || 'Calibre 3235'}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="spec-card p-3 bg-bg-2 rounded-3 border border-border">
                        <span className="x-small text-t3 uppercase d-block mb-1">Case Material</span>
                        <span className="small fw-bold">{product.attributes?.material || 'Oystersteel'}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="spec-card p-3 bg-bg-2 rounded-3 border border-border">
                        <span className="x-small text-t3 uppercase d-block mb-1">Water Resistance</span>
                        <span className="small fw-bold">{product.attributes?.waterResistance || '10ATM'}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="spec-card p-3 bg-bg-2 rounded-3 border border-border">
                        <span className="x-small text-t3 uppercase d-block mb-1">Glass Type</span>
                        <span className="small fw-bold">{product.attributes?.glassType || 'Sapphire'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ADDITIONAL SECTIONS (STORY, REVIEWS, RELATED) */}
        <div className="mt-5 pt-5">
           {/* HOROLOGICAL STORY SECTION */}
           <section className="story-block bg-white-5 rounded-5 overflow-hidden border border-border mt-5">
              <div className="row g-0 align-items-center">
                 <div className="col-md-6 story-img-wrap">
                    <img src="https://images.unsplash.com/photo-1622353382113-838c93f4129b?q=80&w=2670&auto=format&fit=crop" alt="Craftsmanship" />
                 </div>
                 <div className="col-md-6 p-5">
                    <span className="section-label">THE ART OF SECONDS</span>
                    <h2 className="font-display h1 mb-4">Engineered for the Infinite.</h2>
                    <p className="text-t2 opacity-75">
                       Every Chronix instrument undergoes a rigorous 400-hour testing cycle across three continents. We don't just measure time; we architecture it. This timepiece utilizes a patented escapement mechanism that defies standard gravitational friction, ensuring chronometric perfection regardless of your environment.
                    </p>
                 </div>
              </div>
           </section>

           {/* REVIEWS SECTION */}
           <section className="mt-5 pt-5">
              <div className="text-center mb-5 pb-4">
                 <span className="section-label">COMMUNITY VERIFIED</span>
                 <h2 className="font-display h1">Customer Experiences</h2>
              </div>
              <div className="row g-4">
                 {reviewsLoading ? (
                   <div className="col-12 text-center py-5 opacity-50 font-display">Archiving Community Feedback...</div>
                 ) : reviews.length === 0 ? (
                    <div className="col-12 text-center py-5 border border-dashed border-border rounded-4 bg-bg-2">
                       <p className="text-t3 uppercase tracking-widest small m-0">No experiences shared yet.</p>
                    </div>
                 ) : (
                    reviews.slice(0, 3).map(r => (
                       <div key={r.id} className="col-md-4">
                          <div className="chronix-card p-4 no-hover h-100">
                             <div className="d-flex text-gold mb-3 hstack gap-1">
                                {[1,2,3,4,5].map(s => <HiStar key={s} className={s <= r.rating ? "opacity-100" : "opacity-20"} />)}
                             </div>
                             <p className="small text-t2 line-height-lg mb-4">"{r.comment}"</p>
                             <div className="d-flex align-items-center gap-3 mt-auto pt-3 border-top border-border">
                                <div className="avatar px-2 py-1 bg-gold text-white rounded-circle small fw-bold">{r.authorName?.[0]}</div>
                                <div>
                                   <span className="d-block small fw-bold">{r.authorName}</span>
                                   <span className="x-small text-t3 opacity-75">Verified Collector</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </section>

           {/* RELATED PRODUCTS */}
           <section className="mt-5 pt-5">
              <div className="d-flex justify-content-between align-items-end mb-5 border-bottom border-border pb-4">
                <div>
                   <span className="section-label">RECOMMENDATIONS</span>
                   <h2 className="font-display h1 m-0">Similar Curations</h2>
                </div>
                <Link to="/allcollection" className="btn-pill-soft d-flex align-items-center gap-2 text-decoration-none x-small fw-bold text-gold uppercase tracking-widest">
                   Access Archive <HiOutlineArrowUpRight />
                </Link>
              </div>
              <div className="row g-4">
                 {relatedProducts.map(p => (
                    <div key={p.id} className="col-6 col-md-3">
                       <Link to={`/product/${p.id}`} className="text-decoration-none group">
                          <div className="p-4 bg-bg-2 rounded-4 mb-3 position-relative overflow-hidden group-hover:shadow-lg transition-all">
                             <img src={p.imageGallery[0]} alt={p.name} className="img-fluid" />
                          </div>
                          <span className="x-small text-t3 uppercase tracking-widest mb-1 d-block">{p.category}</span>
                          <h4 className="h6 fw-bold text-t1 mb-1">{p.name}</h4>
                          <span className="text-gold fw-bold small">₹{p.price.toLocaleString()}</span>
                       </Link>
                    </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
