import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft } from 'react-icons/hi';
import { getProductById } from '../data/products';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// Star component used in both display and input
function Stars({ rating, interactive = false, onRate, size = 18 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <span
          key={s}
          onClick={() => interactive && onRate?.(s)}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{
            fontSize: size, lineHeight: 1, cursor: interactive ? 'pointer' : 'default',
            color: s <= (hover || rating) ? '#D4AF37' : '#2A2A2A',
            transition: 'color 0.1s',
          }}
        >★</span>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);
  const { addItem } = useCartStore();
  const { isLoggedIn, profile } = useAuthStore();
  const { addReview, getProductReviews } = useCartStore();

  const [activeImg, setActiveImg] = useState(0);
  const [rating, setRating]       = useState(0);
  const [name, setName]           = useState(profile?.name || '');
  const [text, setText]           = useState('');

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '120px 24px' }}>
      <p style={{ color: '#5A5652', marginBottom: 24 }}>Product not found.</p>
      <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
        Back to Collection
      </Link>
    </div>
  );

  const reviews = getProductReviews(product.id);
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  const displayPrice = product.dealPrice || product.price;
  const discount = product.dealPrice
    ? Math.round(((product.price - product.dealPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    addItem(product);
    navigate('/checkout');
  };

  const handleReviewSubmit = e => {
    e.preventDefault();
    if (!name.trim())   { toast.error('Please enter your name'); return; }
    if (rating === 0)   { toast.error('Please select a rating'); return; }
    if (!text.trim())   { toast.error('Please write a review'); return; }
    addReview({ productId: product.id, name, rating, text, date: new Date().toLocaleDateString('en-IN') });
    toast.success('Review submitted!');
    setRating(0); setText(''); setName(profile?.name || '');
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Breadcrumb */}
      <Link to="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        color: '#5A5652', textDecoration: 'none', fontSize: '0.85rem', marginBottom: 40,
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
      onMouseLeave={e => e.currentTarget.style.color = '#5A5652'}
      >
        <HiChevronLeft /> Collection
      </Link>

      {/* Main grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 56, marginBottom: 72,
      }}>

        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          {/* Main image */}
          <div style={{
            background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 12,
            padding: 32, aspectRatio: '1/1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, overflow: 'hidden',
          }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                src={product.imageGallery[activeImg]}
                alt={product.name}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }}
              />
            </AnimatePresence>
          </div>

          {/* Thumbnails */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {product.imageGallery.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} style={{
                background: '#0A0A0A', aspectRatio: '1/1',
                border: `2px solid ${activeImg === i ? '#D4AF37' : '#2A2A2A'}`,
                borderRadius: 8, padding: 6, cursor: 'pointer',
                transition: 'border-color 0.2s', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img src={img} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <span style={{ fontSize: '0.72rem', color: '#5A5652',
            letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {product.category}
          </span>

          <h1 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400,
            color: '#F0EDE8', lineHeight: 1.1, margin: '10px 0 16px',
          }}>
            {product.name}
          </h1>

          {/* Average rating */}
          {reviews.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Stars rating={Math.round(avgRating)} size={16} />
              <span style={{ fontSize: '0.8rem', color: '#5A5652' }}>
                {avgRating.toFixed(1)} · {reviews.length} review{reviews.length > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24,
            paddingBottom: 24, borderBottom: '1px solid #1A1A1A' }}>
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '2rem', color: '#D4AF37', fontWeight: 500 }}>
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {product.dealPrice && (
              <>
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '1rem',
                  color: '#3A3A3A', textDecoration: 'line-through' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37',
                  fontSize: '0.78rem', fontWeight: 700, fontFamily: '"DM Mono", monospace',
                  padding: '3px 8px', borderRadius: 4 }}>
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <p style={{ color: '#9A9690', lineHeight: 1.75, fontSize: '0.95rem', marginBottom: 32 }}>
            {product.description}
          </p>

          {/* Stock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%',
              background: product.stock > 0 ? '#27AE60' : '#C0392B' }} />
            <span style={{ fontSize: '0.85rem', color: '#5A5652' }}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button className="btn-ghost" onClick={handleAddToCart} disabled={product.stock === 0}>
              Add to Cart
            </button>
            <button className="btn-primary" onClick={handleBuyNow} disabled={product.stock === 0}
              style={{ fontSize: '0.9rem' }}>
              Buy Now
            </button>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: 56 }}>
        <p className="section-label" style={{ marginBottom: 8 }}>Reviews</p>
        <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem',
          fontWeight: 400, color: '#F0EDE8', marginBottom: 40 }}>
          Customer Experiences
        </h2>

        {reviews.length === 0 ? (
          <p style={{ color: '#5A5652', marginBottom: 48 }}>No reviews yet. Be the first to share yours.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
            {reviews.map((r, i) => (
              <motion.div key={i} className="card" style={{ padding: '20px 24px' }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#F0EDE8', fontSize: '0.9rem', marginBottom: 4 }}>{r.name}</p>
                    <Stars rating={r.rating} size={14} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#3A3A3A' }}>{r.date}</span>
                </div>
                <p style={{ color: '#9A9690', fontSize: '0.9rem', lineHeight: 1.7 }}>{r.text}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Review form */}
        <div className="card" style={{ padding: 32, maxWidth: 560 }}>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem',
            fontWeight: 500, color: '#F0EDE8', marginBottom: 24 }}>
            Write a Review
          </h3>
          {!isLoggedIn ? (
            <p style={{ color: '#5A5652', fontSize: '0.9rem' }}>
              <Link to="/login" style={{ color: '#D4AF37' }}>Sign in</Link> to leave a review.
            </p>
          ) : (
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#5A5652',
                  marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Name
                </label>
                <input className="input" value={name}
                  onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#5A5652',
                  marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Rating
                </label>
                <Stars rating={rating} interactive onRate={setRating} size={28} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#5A5652',
                  marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Review
                </label>
                <textarea className="input" value={text} onChange={e => setText(e.target.value)}
                  rows={4} placeholder="Share your experience with this timepiece…"
                  style={{ resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
