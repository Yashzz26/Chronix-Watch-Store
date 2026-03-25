import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiArrowLeft, 
  HiStar, 
  HiOutlineStar, 
  HiOutlineShieldCheck, 
  HiOutlineTruck, 
  HiOutlineArrowPath,
  HiOutlineTicket,
  HiOutlineCheckBadge,
  HiOutlineMapPin,
  HiOutlineShoppingBag,
  HiArrowRight
} from 'react-icons/hi2';
import { getProductById } from '../data/products';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { sanitizeText, sanitizeName } from '../utils/sanitize';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);
  const { user: authUser } = useAuthStore();
  const { addItem, addReview, getProductReviews } = useCartStore();

  const [activeImg, setActiveImg] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  // Fetch Coupons 
  useEffect(() => {
    fetch('http://localhost:5000/api/coupons')
      .then(res => res.json())
      .then(data => setCoupons(data.coupons || []))
      .catch(() => {
        setCoupons([
          { code: 'CHRONIX10', discount: 10, description: '10% off on your first acquisition' },
          { code: 'LUXURY20', discount: 20, description: 'Special 20% discount for repeat clients' }
        ]);
      });
  }, []);

  // Sticky Bar Visibility on Scroll
  useEffect(() => {
    const handleScroll = () => {
      const trigger = document.getElementById('main-buy-trigger');
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        setIsStickyVisible(rect.top < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!product) {
      navigate('/404', { replace: true });
    }
  }, [product, navigate]);

  if (!product) return null;

  const reviews = getProductReviews(product.id);
  const discountPercent = Math.round(((product.price - (product.dealPrice || product.price)) / product.price) * 100) || 30;

  const handleReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) { toast.error('Review cannot be empty'); return; }
    addReview({
      id: `rev-${Date.now()}`,
      productId: product.id,
      user: sanitizeName(authUser?.displayName || 'Guest'),
      rating,
      comment: sanitizeText(comment),
      date: new Date().toLocaleDateString(),
    });
    setComment('');
    toast.success('Thank you for your feedback');
  };

  const handleBuyNow = () => {
    addItem(product);
    navigate('/checkout');
  };

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon ${code} copied!`);
  };

  return (
    <div className="product-page-v2">
      <style>{`
        .product-page-v2 { background: #080808; color: #F0EDE8; padding-top: 40px; padding-bottom: 150px; }
        .breadcrumb-v2 { color: #5A5652; font-size: 0.8rem; margin-bottom: 30px; }
        .breadcrumb-v2 a { color: #5A5652; text-decoration: none; transition: color 0.2s; }
        .breadcrumb-v2 a:hover { color: #D4AF37; }

        /* Thumbnails Vertical Left */
        .thumb-col { width: 80px; flex-shrink: 0; }
        .v-thumb { 
          width: 70px; height: 70px; background: #0f0f0f; border: 1px solid #1e1e1e;
          border-radius: 8px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s;
          display: flex; align-items: center; justify-content: center; padding: 6px;
          opacity: 0.6;
        }
        .v-thumb.active { opacity: 1; border-color: #D4AF37; box-shadow: 0 0 15px rgba(212,175,55,0.2); }
        .v-thumb img { max-width: 100%; max-height: 100%; object-fit: contain; }

        .image-col { flex-grow: 1; background: #0f0f0f; border-radius: 12px; border: 1px solid #1e1e1e; overflow: hidden; position: relative; }
        .main-hero-img { width: 100%; height: auto; aspect-ratio: 1/1; object-fit: contain; padding: 40px; }

        /* Info Section */
        .badge-premium { background: #D4AF37; color: #000; font-size: 0.6rem; font-weight: 800; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 12px; }
        .product-name { font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem, 4vw, 3rem); line-height: 1.1; margin-bottom: 15px; }
        .rating-summary { display: flex; align-items: center; gap: 8px; color: #9A9690; font-size: 0.9rem; margin-bottom: 25px; }
        
        .price-section { display: flex; align-items: baseline; gap: 15px; margin-bottom: 10px; }
        .price-now { font-size: 2.2rem; font-weight: 500; font-family: 'DM Mono', monospace; color: #D4AF37; }
        .price-was { font-size: 1.2rem; text-decoration: line-through; color: #5A5652; font-family: 'DM Mono', monospace; }
        .discount-pct { color: #27ae60; font-weight: 700; font-size: 1.1rem; }

        .offers-title { font-size: 0.85rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 40px 0 20px; color: #F0EDE8; }
        .coupon-card { 
          background: #0f0f0f; border: 1px dashed #333; border-radius: 8px; padding: 16px; margin-bottom: 12px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .coupon-code { font-family: 'DM Mono', monospace; color: #D4AF37; font-weight: 700; }
        .copy-btn { background: none; border: none; color: #5A5652; font-size: 0.8rem; text-decoration: underline; cursor: pointer; }

        .service-row { display: flex; flex-wrap: wrap; gap: 20px; margin: 40px 0; padding: 25px 0; border: 1px solid #1e1e1e; border-left: 0; border-right: 0; }
        .service-item { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; width: 85px; }
        .service-item span { font-size: 0.6rem; color: #9A9690; line-height: 1.2; text-transform: uppercase; font-weight: 600; }

        .action-row { display: flex; gap: 15px; margin-top: 30px; }
        .cta-cart { flex: 1; height: 56px; border: 1px solid #333; color: #fff; background: transparent; font-weight: 700; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s; }
        .cta-cart:hover { border-color: #D4AF37; color: #D4AF37; }
        .cta-buy { flex: 1; height: 56px; background: #D4AF37; color: #000; border: none; font-weight: 700; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s; }
        .cta-buy:hover { background: #f1c40f; transform: translateY(-2px); }

        /* Sticky Bar */
        .sticky-bar { 
          position: fixed; bottom: 0; left: 0; right: 0; background: #0f0f0f; border-top: 1px solid #1e1e1e;
          z-index: 1000; padding: 12px 0; box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
        }
        .sticky-product-info { display: flex; align-items: center; gap: 15px; }
        .sticky-thumb { width: 50px; height: 50px; object-fit: contain; background: #161616; border-radius: 4px; padding: 4px; }
      `}</style>

      <div className="container">
        <div className="breadcrumb-v2">
          <Link to="/">Home</Link> / <Link to={`/allcollection?cat=${product.category}`}>{product.category}</Link> / {product.name}
        </div>

        <div className="row gx-lg-5 align-items-start">
          {/* GALLERY PANEL */}
          <div className="col-12 col-lg-6 d-flex gap-4">
            <div className="thumb-col d-none d-md-block">
              {(product.imageGallery || [product.image]).map((img, i) => (
                <div 
                  key={i} 
                  className={`v-thumb ${activeImg === i ? 'active' : ''}`}
                  onMouseEnter={() => setActiveImg(i)}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
            <div className="image-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImg}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="h-100 d-flex align-items-center justify-content-center"
                >
                  <img src={product.imageGallery[activeImg]} alt={product.name} className="main-hero-img" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* CONTENT PANEL */}
          <div className="col-12 col-lg-6">
            <div className="ps-lg-4 mt-5 mt-lg-0">
               <span className="badge-premium">CHRONIX EXCLUSIVE</span>
               <h1 className="product-name">{product.name}</h1>
               <div className="rating-summary">
                 <div className="d-flex text-gold">
                    {[...Array(5)].map((_, i) => <HiStar key={i} />)}
                 </div>
                 <span>(4.8 • {reviews.length + 12} Authentic Reviews)</span>
               </div>

               <div className="price-section">
                  <span className="price-now">₹{(product.dealPrice || product.price).toLocaleString('en-IN')}</span>
                  {product.isOnDeal && <span className="price-was">₹{product.price.toLocaleString('en-IN')}</span>}
                  <span className="discount-pct">{discountPercent}% OFF</span>
               </div>
               <p className="text-secondary small">Inclusive of all taxes</p>

               <div className="offers-title">Available Offers</div>
               <div className="row g-3 mb-4">
                 {coupons.length > 0 ? coupons.slice(0, 2).map(c => (
                   <div className="col-12 col-md-6" key={c.code || Math.random()}>
                     <div className="coupon-card">
                       <div>
                         <div className="coupon-code">{c.code}</div>
                         <div className="x-small text-t3" style={{ fontSize: '0.65rem' }}>{c.description}</div>
                       </div>
                       <button className="copy-btn" onClick={() => copyCoupon(c.code)}>COPY</button>
                     </div>
                   </div>
                 )) : (
                   <div className="col-12 p-3 border-border border-dashed text-center rounded">
                      <HiOutlineTicket size={24} className="text-t3 mb-2" />
                      <p className="small text-t3">Sign in for exclusive member-only offers</p>
                   </div>
                 )}
               </div>

               <div className="service-row">
                 <div className="service-item">
                    <HiOutlineShieldCheck size={28} color="#D4AF37" />
                    <span>12 Months Warranty</span>
                 </div>
                 <div className="service-item">
                    <HiOutlineTruck size={28} color="#D4AF37" />
                    <span>Free Shipping</span>
                 </div>
                 <div className="service-item">
                    <HiOutlineArrowPath size={28} color="#D4AF37" />
                    <span>Easy Returns</span>
                 </div>
                 <div className="service-item">
                    <HiOutlineCheckBadge size={28} color="#D4AF37" />
                    <span>Pay on Delivery</span>
                 </div>
                 <div className="service-item">
                    <HiOutlineMapPin size={28} color="#D4AF37" />
                    <span>Serviced Across India</span>
                 </div>
               </div>

               <div id="main-buy-trigger" className="action-row">
                 <button className="cta-cart" onClick={() => { addItem(product); toast.success('Added to collection'); }}>
                   Add to Cart
                 </button>
                 <button className="cta-buy" onClick={handleBuyNow}>
                   Buy Now
                 </button>
               </div>

               <div className="mt-5 pt-4">
                  <h4 className="offers-title">Craftsmanship & Details</h4>
                  <p className="text-t2 lead" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                    {product.description}
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* FEEDBACK MODULE */}
        <div className="reviews-v2 mt-5 pt-5 border-top border-border">
          <div className="row">
            <div className="col-lg-4">
               <h3 className="font-display h2 mb-4">Client Feedback</h3>
               <div className="review-stats glass p-4 rounded-xl mb-4">
                  <div className="h1 text-gold mb-1">4.8</div>
                  <div className="d-flex text-gold mb-2">
                    {[...Array(5)].map((_, i) => <HiStar key={i} />)}
                  </div>
                  <p className="text-t3 small uppercase tracking-wider">Based on {reviews.length + 12} Verified Records</p>
               </div>
               
               <div className="glass p-4 rounded-xl border border-white-5">
                  <span className="small uppercase tracking-widest text-gold d-block mb-3">Add Your Mark</span>
                  <form onSubmit={handleReview}>
                     <div className="d-flex gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map(s => (
                          <HiStar 
                            key={s} 
                            style={{ cursor: 'pointer', color: s <= rating ? '#D4AF37' : '#1e1e1e' }}
                            onClick={() => setRating(s)}
                            size={20}
                          />
                        ))}
                     </div>
                     <textarea 
                        className="form-control bg-s2 border-border text-t1 shadow-none mb-3"
                        style={{ height: '100px', fontSize: '0.9rem', background: '#161616' }}
                        placeholder="Your impression..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                     />
                     <button type="submit" className="btn btn-outline-gold w-100 py-2">Submit Review</button>
                  </form>
               </div>
            </div>
            
            <div className="col-lg-7 offset-lg-1">
              {reviews.length > 0 ? reviews.map(r => (
                <motion.div 
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                  key={r.id} className="pb-4 mb-4 border-bottom border-white-5"
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">{r.user}</span>
                    <span className="x-small text-t3">{r.date}</span>
                  </div>
                  <div className="d-flex text-gold gap-1 mb-2">
                    {[...Array(5)].map((_, i) => <HiStar key={i} style={{ color: i < r.rating ? '#D4AF37' : '#1e1e1e' }} />)}
                  </div>
                  <p className="font-display italic text-t2" style={{ fontSize: '1.1rem' }}>"{r.comment}"</p>
                </motion.div>
              )) : (
                <div className="py-5 text-center opacity-30">
                  <HiOutlineShoppingBag size={48} className="mb-3" />
                  <p>Awaiting the first verified impression of this piece.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {isStickyVisible && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="sticky-bar"
          >
            <div className="container d-flex align-items-center justify-content-between">
              <div className="sticky-product-info d-none d-md-flex">
                 <img src={product.imageGallery[0]} alt="" className="sticky-thumb" />
                 <div>
                    <div className="small fw-bold text-white text-truncate" style={{ maxWidth: '200px' }}>{product.name}</div>
                    <div className="text-gold font-mono small">₹{(product.dealPrice || product.price).toLocaleString()}</div>
                 </div>
              </div>

              <div className="d-flex gap-3 flex-grow-1 flex-md-grow-0">
                 <button 
                  className="cta-cart flex-grow-1 flex-md-grow-0 px-4" 
                  onClick={() => { addItem(product); toast.success('Added'); }}
                 >
                   <HiOutlineShoppingBag className="me-2" /> Cart
                 </button>
                 <button className="cta-buy flex-grow-1 flex-md-grow-0 px-4" onClick={handleBuyNow}>
                   Buy Now <HiArrowRight className="ms-2" />
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
