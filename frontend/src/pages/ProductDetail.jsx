import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineStar, HiStar, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineArrowPath } from 'react-icons/hi2';
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
  const [rating, setRating]       = useState(5);
  const [comment, setComment]     = useState('');

  // Section 2.3 — Product not found 404 handling
  useEffect(() => {
    if (!product) {
      navigate('/404', { replace: true });
    }
  }, [product, navigate]);

  // Section 2.10 — Image gallery bounds safety
  useEffect(() => {
    if (product && activeImg >= (product.imageGallery?.length || 0)) {
      setActiveImg(0);
    }
  }, [product, activeImg]);

  if (!product) return null;

  const reviews = getProductReviews(product.id);

  const handleReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Observation cannot be hollow');
      return;
    }

    // Section 1.4 & 2.7 — Sanitization and Validation
    const sanitizedComment = sanitizeText(comment);
    const userName = authUser?.displayName || authUser?.email?.split('@')[0] || 'Watch Enthusiast';
    const sanitizedUser = sanitizeName(userName);

    addReview({
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Section 2.2 stable ID logic
      productId: product.id,
      user: sanitizedUser,
      rating,
      comment: sanitizedComment,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    });

    setComment('');
    toast.success('Your impression has been archived');
  };

  const handleBuyNow = () => {
    addItem(product);
    navigate('/checkout');
  };

  return (
    <div className="container py-5 my-5">
      {/* Breadcrumb / Back */}
      <button 
        onClick={() => navigate(-1)}
        className="bg-transparent border-0 mb-5 d-flex align-items-center gap-2 p-0"
        style={{ color: '#5A5652', fontSize: '0.8rem', fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: '0.1em' }}
      >
        <span>← Back to Collection</span>
      </button>

      <div className="row gx-lg-5 mb-5">
        {/* LEFT: Gallery */}
        <div className="col-12 col-lg-6 mb-5 mb-lg-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-4 d-flex align-items-center justify-content-center position-relative overflow-hidden"
            style={{ 
              aspectRatio: '1/1', 
              background: '#111',
              padding: '60px'
            }}
          >
            <motion.img
              key={activeImg}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              src={product.imageGallery[activeImg]}
              alt={product.name}
              className="img-fluid"
              style={{ maxHeight: '100%', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
              whileHover={{ scale: 1.04 }}
            />
          </motion.div>

          {/* Thumbnails */}
          <div className="d-flex gap-3 mt-4 overflow-auto pb-2">
            {product.imageGallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className="bg-transparent p-0 rounded-3 overflow-hidden border-2"
                style={{ 
                  width: '80px', height: '80px', flexShrink: 0,
                  border: activeImg === i ? '2px solid #D4AF37' : '2px solid #1e1e1e',
                  transition: 'border-color 0.3s ease'
                }}
              >
                <div style={{ width: '100%', height: '100%', background: '#111', padding: '8px' }}>
                  <img src={img} alt="" className="w-100 h-100 object-fit-contain" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="col-12 col-lg-6 ps-lg-5">
          <div className="mb-4">
            <div className="section-label mb-3">{product.category}</div>
            <h1 className="font-display mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', lineHeight: 1.1 }}>
              {product.name}
            </h1>

            <div className="d-flex align-items-baseline gap-4 mb-4">
              <span className="font-mono text-gold d-block" style={{ fontSize: '2.5rem', fontWeight: 500 }}>
                ₹{(product.dealPrice || product.price).toLocaleString('en-IN')}
              </span>
              {product.isOnDeal && (
                <span className="font-mono text-t3 text-decoration-line-through" style={{ fontSize: '1.2rem' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
              <div 
                className="ms-auto font-body px-3 py-1"
                style={{ background: 'rgba(40, 167, 69, 0.1)', color: '#28a745', fontSize: '0.7rem', fontWeight: 700, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                In Stock
              </div>
            </div>
            
            <div className="mb-5" style={{ height: '1px', background: '#1e1e1e' }}></div>

            <p className="font-body mb-5" style={{ fontSize: '1rem', color: '#9A9690', lineHeight: 1.8 }}>
              {product.description}
            </p>

            {/* Features grid */}
            <div className="row g-4 mb-5">
              {[
                { icon: HiOutlineTruck, label: 'Complimentary Shipping' },
                { icon: HiOutlineShieldCheck, label: '2 Year Master Warranty' },
                { icon: HiOutlineStar, label: 'Certified Chronometer' },
                { icon: HiOutlineArrowPath, label: '30 Day Easy Returns' }
              ].map((item, i) => (
                <div key={i} className="col-6">
                  <div className="d-flex align-items-center gap-3">
                    <item.icon className="text-gold" size={20} />
                    <span className="font-body" style={{ color: '#5A5652', fontSize: '0.85rem' }}>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-5" style={{ height: '1px', background: '#1e1e1e' }}></div>

            <div className="d-flex flex-column gap-3">
              <button
                onClick={() => { addItem(product); toast.success('Added to collection'); }}
                className="btn-ghost w-100 py-3 text-uppercase fw-bold"
                style={{ fontSize: '0.85rem', letterSpacing: '0.1em' }}
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="btn-gold w-100 py-3 text-uppercase fw-bold"
                style={{ fontSize: '0.85rem', letterSpacing: '0.1em' }}
              >
                Acquire Immediately
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mx-auto mt-5 pt-5" style={{ maxWidth: '900px' }}>
        <h2 className="font-display mb-5 text-center" style={{ fontSize: '2.5rem', color: '#fff' }}>
          Client Feedback
        </h2>

        <div className="row g-5">
          {/* Submission */}
          <div className="col-md-5">
            <div className="chronix-card p-4 h-100">
              <div className="section-label mb-4">Leave an Impression</div>
              <form onSubmit={handleReview}>
                <div className="mb-4">
                  <label className="d-block mb-2" style={{ color: '#5A5652', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Rating</label>
                  <div className="d-flex gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setRating(s)} className="p-0 border-0 bg-transparent">
                        {s <= rating ? <HiStar className="text-gold" size={20} /> : <HiOutlineStar className="text-t3" size={20} />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="d-block mb-2" style={{ color: '#5A5652', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Message</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    style={{ background: '#111', border: '1px solid #1e1e1e', color: '#fff', fontSize: '0.9rem' }}
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-gold w-100 py-3 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  Submit Impression
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="col-md-7">
            <div className="d-flex flex-column gap-5">
              {reviews.length === 0 ? (
                <div className="py-5 text-center border rounded-4" style={{ borderColor: '#1e1e1e', borderStyle: 'dashed' }}>
                   <p className="font-display fst-italic fs-5" style={{ color: '#5A5652' }}>Be the first to share your thoughts.</p>
                </div>
              ) : (
                reviews.map(r => (
                  <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-4 border-bottom border-border">
                    <div className="d-flex justify-content-between mb-3">
                      <span className="fw-medium text-white">{r.user}</span>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: '#5A5652' }}>{r.date}</span>
                    </div>
                    <div className="d-flex gap-1 mb-3">
                      {[1,2,3,4,5].map(s => (
                        <HiStar key={s} size={14} className={s <= r.rating ? 'text-gold' : 'text-t3 opacity-25'} />
                      ))}
                    </div>
                    <p className="font-display fst-italic lh-relaxed" style={{ fontSize: '1.2rem', color: '#9A9690' }}>"{r.comment}"</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

