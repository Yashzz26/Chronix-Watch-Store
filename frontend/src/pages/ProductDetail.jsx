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
      <div className="row gx-lg-5 mb-5 align-items-center">

        {/* Left: Gallery */}
        <div className="col-12 col-lg-6 mb-5 mb-lg-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-s2 rounded-4 p-5 d-flex align-items-center justify-content-center position-relative overflow-hidden"
            style={{ aspectRatio: '1/1' }}
          >
            <img
              src={product.imageGallery[activeImg]}
              alt={product.name}
              className="img-fluid position-relative z-1"
              style={{ maxHeight: '100%', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }}
              loading="lazy"
              decoding="async"
            />
          </motion.div>

          <div className="d-flex gap-3 overflow-auto mt-4 pb-2">
            {product.imageGallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className="btn p-2 rounded-3 bg-s1 border border-2 flex-shrink-0"
                style={{ 
                  width: 90, height: 90, 
                  borderColor: activeImg === i ? 'var(--gold)' : 'var(--border)',
                  opacity: activeImg === i ? 1 : 0.5,
                  transition: 'opacity 150ms ease, border-color 150ms ease'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => activeImg !== i && (e.currentTarget.style.opacity = 0.5)}
              >
                <img src={img} alt={`Gallery view ${i + 1}`} className="w-100 h-100 object-fit-contain" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="col-12 col-lg-6">
          <div className="border-bottom border-border pb-4 mb-4">
            <p className="section-label mb-2">{product.category}</p>
            <h1 className="font-display display-4 text-t1 mb-3">
              {product.name}
            </h1>

            <div className="d-flex align-items-center gap-4">
              <div className="d-flex align-items-center gap-3">
                <span className="h1 text-gold font-mono m-0 fw-bold">
                  ₹{(product.dealPrice || product.price).toLocaleString('en-IN')}
                </span>
                {product.isOnDeal && (
                  <span className="h4 text-t3 font-mono text-decoration-line-through m-0">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <div className="badge bg-success bg-opacity-10 text-success text-uppercase tracking-wider fw-bold p-2" style={{ fontSize: '0.65rem' }}>
                In Stock
              </div>
            </div>
          </div>

          <p className="text-t2 fs-5 mb-5 lh-base">{product.description}</p>

          <div className="row g-4 py-4 border-top border-bottom border-border mb-5">
            {[
              { icon: HiOutlineTruck, label: 'Complimentary Shipping' },
              { icon: HiOutlineShieldCheck, label: '2 Year Master Warranty' },
              { icon: HiOutlineStar, label: 'Certified Chronometer' },
              { icon: HiOutlineArrowPath, label: '30 Day Easy Returns' }
            ].map((item, i) => (
              <div key={i} className="col-6">
                <div className="d-flex align-items-center gap-2 text-t3" style={{ fontSize: '0.875rem' }}>
                  <item.icon className="text-gold" size={18} />
                  <span>{item.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <button
                onClick={() => { addItem(product); toast.success('Added to collection'); }}
                className="btn-chronix-ghost w-100 py-3 text-uppercase tracking-widest fw-bold"
                style={{ fontSize: '0.8rem' }}
              >
                Add to Cart
              </button>
            </div>
            <div className="col-12 col-sm-6">
              <button
                onClick={handleBuyNow}
                className="btn-chronix-primary w-100 py-3 text-uppercase tracking-widest fw-bold"
                style={{ 
                  boxShadow: '0 10px 30px rgba(212,175,55,0.2)',
                  fontSize: '0.8rem'
                }}
              >
                Acquire Immediately
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mx-auto border-top border-border pt-5" style={{ maxWidth: 900 }}>
        <h2 className="font-display h2 text-t1 mb-5 text-center">
          Client Feedback
        </h2>

        <div className="row g-5">
          {/* Submission */}
          <div className="col-12 col-md-4">
            <div className="chronix-card p-4">
              <h3 className="section-label mb-4">Leave an Impression</h3>
              <form onSubmit={handleReview}>
                <div className="mb-4">
                  <label className="text-t3 text-uppercase tracking-widest d-block mb-2" style={{ fontSize: '0.65rem' }}>Your Rating</label>
                  <div className="d-flex gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setRating(s)} className="p-1 btn border-0 bg-transparent">
                        {s <= rating ? <HiStar className="text-gold" /> : <HiOutlineStar className="text-t3" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-t3 text-uppercase tracking-widest d-block mb-2" style={{ fontSize: '0.65rem' }}>Message</label>
                  <textarea
                    className="form-control chronix-input"
                    rows="4"
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-chronix-primary w-100 py-3 text-uppercase tracking-widest fw-bold" style={{ fontSize: '0.7rem' }}>
                  Submit Review
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="col-12 col-md-8">
            {reviews.length === 0 ? (
              <div className="py-5 text-center border-dashed rounded-4">
                 <p className="text-t3 font-display fst-italic fs-5">Be the first to share your thoughts.</p>
              </div>
            ) : (
              reviews.map(r => (
                <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-bottom border-border mb-5 pb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-medium text-t1">{r.user}</span>
                    <span className="text-t3 font-mono" style={{ fontSize: '0.75rem' }}>{r.date}</span>
                  </div>
                  <div className="d-flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <HiStar key={s} size={14} className={s <= r.rating ? 'text-gold' : 'text-t3 opacity-25'} />
                    ))}
                  </div>
                  <p className="text-t2 font-display fst-italic lh-relaxed fs-5">"{r.comment}"</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

