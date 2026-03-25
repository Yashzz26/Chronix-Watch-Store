import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiArrowLeft, 
  HiStar, 
  HiOutlineStar, 
  HiOutlineShieldCheck, 
  HiOutlineTruck, 
  HiOutlineArrowPath 
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

    const sanitizedComment = sanitizeText(comment);
    const userName = authUser?.displayName || authUser?.email?.split('@')[0] || 'Watch Enthusiast';
    const sanitizedUser = sanitizeName(userName);

    addReview({
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    <div className="product-detail-container">
      <style>{`
        .product-detail-container {
          background: #080808;
          color: #F0EDE8;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }

        /* --- PART 1: BREADCRUMB --- */
        .breadcrumb-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #5A5652;
          font-size: 0.85rem;
          text-decoration: none;
          margin-bottom: 40px;
          margin-top: 8px;
          transition: color 0.2s;
        }

        .breadcrumb-link:hover {
          color: #D4AF37;
        }

        /* --- PART 2: MAIN GRID --- */
        .main-img-outer {
          background: #111111;
          border-radius: 16px;
          aspect-ratio: 1/1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 48px;
          position: relative;
          cursor: zoom-in;
        }

        .main-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.6));
          transition: transform 0.5s ease;
        }

        .main-img-outer:hover .main-img {
          transform: scale(1.05);
        }

        .thumbnail-strip {
          margin-top: 16px;
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .thumbnail-strip::-webkit-scrollbar { display: none; }

        .thumb-btn {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          background: #161616;
          border: 2px solid #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
          opacity: 0.5;
        }

        .thumb-btn.active {
          border-color: #D4AF37;
          opacity: 1;
        }

        .thumb-btn:hover {
          opacity: 1;
        }

        .category-label {
          font-size: 0.65rem;
          color: #D4AF37;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          margin-bottom: 12px;
        }

        .product-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: clamp(2rem, 5vw, 3.2rem);
          color: #F0EDE8;
          line-height: 1.1;
          margin-bottom: 20px;
        }

        .price-current {
          font-family: 'DM Mono', monospace;
          font-size: 1.8rem;
          color: #D4AF37;
          font-weight: 500;
        }

        .price-original {
          font-family: 'DM Mono', monospace;
          font-size: 1.1rem;
          color: #5A5652;
          text-decoration: line-through;
        }

        .stock-badge {
          background: rgba(39, 174, 96, 0.1);
          color: #27ae60;
          border: 1px solid rgba(39, 174, 96, 0.25);
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 700;
        }

        .description {
          font-size: 1rem;
          color: #9A9690;
          line-height: 1.85;
          margin-bottom: 32px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 24px 0;
          border-top: 1px solid #1e1e1e;
          border-bottom: 1px solid #1e1e1e;
          margin-bottom: 32px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.875rem;
          color: #5A5652;
        }

        .btn-add-cart {
          background: transparent;
          border: 2px solid #1e1e1e;
          border-radius: 8px;
          color: #9A9690;
          padding: 14px 0;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          transition: all 0.25s ease;
        }

        .btn-add-cart:hover {
          border-color: #D4AF37;
          color: #D4AF37;
          background: rgba(212, 175, 55, 0.04);
        }

        .btn-acquire {
          background: #D4AF37;
          color: #000;
          border: none;
          border-radius: 8px;
          padding: 14px 0;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.2);
          transition: all 0.25s ease;
        }

        .btn-acquire:hover {
          background: #F0D060;
          transform: translateY(-1px);
          box-shadow: 0 12px 32px rgba(212, 175, 55, 0.3);
        }

        /* --- PART 3: REVIEWS --- */
        .reviews-section {
          max-width: 920px;
          margin: 0 auto;
          padding-top: 64px;
          border-top: 1px solid #1e1e1e;
        }

        .reviews-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem;
          text-align: center;
          margin-bottom: 48px;
          color: #F0EDE8;
        }

        .title-separator {
          width: 48px;
          height: 1px;
          background: #D4AF37;
          margin: 0 auto 48px;
        }

        .review-form-card {
          background: #0f0f0f;
          border: 1px solid #1e1e1e;
          border-radius: 12px;
          padding: 28px;
        }

        .input-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: #5A5652;
          letter-spacing: 0.15em;
          margin-bottom: 10px;
          display: block;
        }

        .star-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .star-btn:hover {
          transform: scale(1.15);
        }

        .review-textarea {
          width: 100%;
          background: #161616;
          border: 1px solid #1e1e1e;
          border-radius: 8px;
          color: #F0EDE8;
          padding: 12px;
          font-size: 0.9rem;
          resize: vertical;
          min-height: 120px;
        }

        .review-textarea:focus {
          border-color: #D4AF37;
          outline: none;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .review-item {
          margin-bottom: 28px;
          padding-bottom: 28px;
          border-bottom: 1px solid #1e1e1e;
        }

        .review-item:last-child {
          border-bottom: none;
        }

        .reviewer-name {
          font-weight: 600;
          color: #F0EDE8;
          font-size: 0.95rem;
        }

        .review-date {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: #5A5652;
        }

        .review-comment {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 1.1rem;
          color: #9A9690;
          line-height: 1.75;
        }
      `}</style>

      <div className="container py-5">
        <Link to="/" className="breadcrumb-link">
          <HiArrowLeft size={16} /> Back to Collection
        </Link>

        <div className="row gx-lg-5 align-items-start" style={{ marginBottom: '80px' }}>
          {/* LEFT: IMAGE GALLERY */}
          <div className="col-12 col-lg-6">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeImg}
                className="main-img-outer"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <img 
                  src={product.imageGallery[activeImg]} 
                  alt={product.name} 
                  className="main-img" 
                />
              </motion.div>
            </AnimatePresence>

            <div className="thumbnail-strip">
              {product.imageGallery.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  className={`thumb-btn ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO */}
          <div className="col-12 col-lg-6">
            <div className="category-label">{product.category}</div>
            <h1 className="product-title">{product.name}</h1>

            <div className="d-flex align-items-center gap-3 mb-2">
              <span className="price-current">₹{(product.dealPrice || product.price).toLocaleString('en-IN')}</span>
              {product.isOnDeal && (
                <span className="price-original">₹{product.price.toLocaleString()}</span>
              )}
              <div className="stock-badge ms-auto">IN STOCK</div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #1e1e1e', margin: '24px 0' }} />

            <p className="description">{product.description}</p>

            <div className="features-grid">
              <div className="feature-item">
                <HiOutlineTruck size={18} color="#D4AF37" /> Complimentary Shipping
              </div>
              <div className="feature-item">
                <HiOutlineShieldCheck size={18} color="#D4AF37" /> 2 Year Master Warranty
              </div>
              <div className="feature-item">
                <HiStar size={18} color="#D4AF37" /> Certified Chronometer
              </div>
              <div className="feature-item">
                <HiOutlineArrowPath size={18} color="#D4AF37" /> 30 Day Easy Returns
              </div>
            </div>

            <div className="row g-3">
              <div className="col-6">
                <button 
                  className="btn-add-cart w-100"
                  onClick={() => { addItem(product); toast.success('Added to collection'); }}
                >
                  Add to Cart
                </button>
              </div>
              <div className="col-6">
                <button className="btn-acquire w-100" onClick={handleBuyNow}>
                  Acquire Immediately
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PART 3: REVIEWS */}
        <section className="reviews-section">
          <h2 className="reviews-title">Client Feedback</h2>
          <div className="title-separator"></div>

          <div className="row g-5">
            {/* Form */}
            <div className="col-12 col-md-5">
              <div className="review-form-card">
                <div className="section-label" style={{ marginBottom: '24px' }}>Leave an Impression</div>
                
                <form onSubmit={handleReview}>
                  <label className="input-label">YOUR RATING</label>
                  <div className="d-flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => setRating(s)}
                        className="star-btn"
                      >
                        {s <= rating ? <HiStar size={20} color="#D4AF37" /> : <HiOutlineStar size={20} color="#5A5652" />}
                      </button>
                    ))}
                  </div>

                  <label className="input-label">MESSAGE</label>
                  <textarea 
                    className="review-textarea"
                    placeholder="Share your experience…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  <button type="submit" className="btn-acquire w-100 mt-3" style={{ padding: '12px 0', fontSize: '0.8rem' }}>
                    Submit Impression
                  </button>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="col-12 col-md-7">
              {reviews.length === 0 ? (
                <div className="info-panel" style={{ border: '2px dashed #1e1e1e', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
                  <p className="review-comment" style={{ fontSize: '1.2rem', color: '#5A5652' }}>
                    Be the first to share your thoughts.
                  </p>
                </div>
              ) : (
                <div className="reviews-list">
                  {reviews.map((r) => (
                    <div key={r.id} className="review-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="reviewer-name">{r.user}</span>
                        <span className="review-date">{r.date}</span>
                      </div>
                      <div className="d-flex gap-1" style={{ marginTop: '6px', marginBottom: '12px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <HiStar key={s} size={14} color={s <= r.rating ? '#D4AF37' : 'rgba(212,175,55,0.15)'} />
                        ))}
                      </div>
                      <p className="review-comment">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

