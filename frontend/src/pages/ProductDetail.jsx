import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineShieldCheck, 
  HiOutlineTruck, 
  HiOutlineArrowPath,
  HiOutlineHeart,
  HiStar,
  HiPlus,
  HiMinus,
  HiOutlineArrowUpRight
} from 'react-icons/hi2';
import { HiHeart } from 'react-icons/hi2';
import { doc, getDoc, collection, query, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import useCartStore from '../store/cartStore';
import useWishlistStore from '../store/wishlistStore';
import useReviewStore from '../store/reviewStore';
import useAuthStore from '../store/authStore';
import RecentlyViewed, { addToRecentlyViewed } from '../components/RecentlyViewed';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { reviews, loading: reviewsLoading, error: reviewsError, fetchReviews, postReview } = useReviewStore();
  const { isLoggedIn, profile } = useAuthStore();

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStrap, setSelectedStrap] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

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
  }, [id, navigate, fetchReviews]);

  // Track recently viewed products
  useEffect(() => {
    if (product?.id) addToRecentlyViewed(product.id);
  }, [product?.id]);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const v = product.variants[0];
      setSelectedSize(v.dialSize);
      setSelectedColor(v.colorName);
      setSelectedStrap(v.strap);
    } else if (product) {
      setSelectedSize('42mm');
      setSelectedColor('Steel');
      setSelectedStrap('Oystersteel');
    }
  }, [product]);

  // ── All hooks MUST be called before any conditional return (React Rules of Hooks) ──
  const productReviews = useMemo(
    () => (product ? reviews.filter((rev) => rev.productId === product.id) : []),
    [product, reviews]
  );
  
  const averageRating = useMemo(() => {
    if (!productReviews || !productReviews.length) return 0;
    const total = productReviews.reduce((sum, rev) => sum + Number(rev.rating || 0), 0);
    return Number((total / productReviews.length).toFixed(1));
  }, [productReviews]);

  const reviewCount = productReviews?.length || 0;
  const roundedAverage = reviewCount ? Math.round(averageRating) : 0;
  const ratingSelectionValue = hoverRating || ratingValue;
  
  const alreadyReviewed = useMemo(() => {
    if (!isLoggedIn || !profile?.uid || !productReviews) return false;
    return productReviews.some((rev) => rev.userId === profile.uid);
  }, [isLoggedIn, profile?.uid, productReviews]);

  const isWishlisted = isInWishlist(product?.id);

  // ── Preload Gallery Images ─────────────────────────
  useEffect(() => {
    if (product?.imageGallery?.length > 0) {
      product.imageGallery.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [product?.imageGallery]);

  // ── HOOKS COMPLETE: Start of conditional returns ───────────────────
  if (loading) return <DetailedSkeleton />;

  if (!product) return null;

  const activeVariant = product?.variants?.find(v => 
    v.dialSize === selectedSize && 
    v.colorName === selectedColor && 
    v.strap === selectedStrap
  ) || null;

  const currentPrice = activeVariant?.price || product?.price || 0;
  const currentStock = activeVariant ? activeVariant.stock : (product?.variants?.length > 0 ? 0 : (product?.stock || 0));
  const isAvailable = currentStock > 0 && (product?.variants?.length > 0 ? !!activeVariant : true);

  const handleAddToCart = () => {
    addItem({ 
      ...product, 
      price: currentPrice,
      qty,
      variants: {
        size: selectedSize,
        color: selectedColor,
        strap: selectedStrap,
        sku: activeVariant?.sku || `LEGACY-${product.id}`
      }
    });
    toast.success('Added to collection', {
      style: { background: '#080808', color: '#fff', border: '1px solid var(--gold)', borderRadius: '0px' }
    });
  };

  const redirectToLogin = () => {
    navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewStatus(null);
    if (!isLoggedIn) {
      toast.error('Please sign in to write a review.');
      redirectToLogin();
      return;
    }
    if (alreadyReviewed) {
      setReviewStatus({ type: 'info', message: 'You have already reviewed this watch.' });
      return;
    }
    if (!ratingValue) {
      setReviewStatus({ type: 'error', message: 'Select a rating before submitting.' });
      return;
    }
    if (!reviewComment.trim()) {
      setReviewStatus({ type: 'error', message: 'Share a few words about your experience.' });
      return;
    }

    setSubmittingReview(true);
    try {
      await postReview({
        productId: product.id,
        rating: ratingValue,
        comment: reviewComment.trim()
      });
      setReviewStatus({ type: 'success', message: 'Review submitted. Thank you!' });
      toast.success('Review submitted');
      setRatingValue(0);
      setHoverRating(0);
      setReviewComment('');
      setShowReviewForm(false);
      fetchReviews(product.id);
    } catch (err) {
      setReviewStatus({ type: 'error', message: err.message || 'Unable to submit review right now.' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const sizes = Array.from(new Set(product?.variants?.map(v => v.dialSize) || ['38mm', '40mm', '42mm', '44mm']));
  const availableColors = product?.variants?.reduce((acc, v) => {
    if (!acc.some(c => c.name === v.colorName)) {
      acc.push({ name: v.colorName, color: v.colorHex || '#BFC1C2' });
    }
    return acc;
  }, []) || [{ name: 'Steel', color: '#BFC1C2' }];
  const straps = Array.from(new Set(product?.variants?.map(v => v.strap) || ['Oystersteel']));

  return (
    <div className="product-detail-page">
      <style>{`
        .product-detail-page {
          background: var(--bg);
          color: var(--t1);
          padding-top: 100px;
        }

        .gallery-container {
          position: sticky;
          top: 120px;
        }

        .main-image-wrap {
          background: #FFFFFF;
          border: 1px solid var(--border);
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 40px;
        }

        .thumb-grid {
          display: flex;
          gap: 16px;
          margin-top: 24px;
          justify-content: center;
        }

        .thumb-btn {
          width: 80px;
          height: 80px;
          border: 1px solid var(--border);
          background: #FFFFFF;
          padding: 8px;
          cursor: pointer;
          transition: var(--transition);
        }

        .thumb-btn.active {
          border-color: var(--gold);
          box-shadow: var(--shadow-sm);
        }

        .product-info-stack {
          padding-left: 40px;
        }

        .product-title {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 5vw, 3.5rem);
          line-height: 1.1;
          margin-bottom: 16px;
          font-weight: 700;
        }

        .product-price {
          font-size: 2rem;
          font-weight: 700;
          color: var(--t1);
          margin-bottom: 32px;
        }

        .price-original {
          font-size: 1.2rem;
          color: var(--t3);
          text-decoration: line-through;
          margin-left: 16px;
          font-weight: 400;
        }

        .spec-label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--t3);
          margin-bottom: 12px;
          display: block;
        }

        .variant-options {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 32px;
        }

        .option-pill {
          padding: 10px 24px;
          border: 1px solid var(--border);
          background: transparent;
          font-size: 0.875rem;
          font-weight: 600;
          transition: var(--transition);
          min-width: 80px;
        }

        .option-pill.active {
          background: var(--t1);
          color: #FFFFFF;
          border-color: var(--t1);
        }

        .color-swatch-wrap {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }

        .color-swatch {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          padding: 3px;
          cursor: pointer;
          transition: var(--transition);
        }

        .color-swatch.active {
          border-color: var(--gold);
          transform: scale(1.1);
        }

        .color-inner {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        .qty-stepper {
          display: flex;
          align-items: center;
          border: 1px solid var(--border);
          width: fit-content;
          margin-bottom: 40px;
        }

        .qty-btn {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: var(--transition);
        }
        .qty-btn:hover { background: var(--bg-1); }

        .qty-val {
          width: 60px;
          text-align: center;
          font-weight: 700;
        }

        .action-group {
          display: flex;
          gap: 16px;
          margin-bottom: 48px;
        }

        .btn-wishlist {
          width: 64px;
          height: 64px;
          border: 1.5px solid var(--border);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .btn-wishlist:hover { border-color: var(--t1); }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 24px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 48px;
        }

        .trust-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--t2);
          gap: 8px;
        }
        .trust-item svg { color: var(--gold); font-size: 1.25rem; }

        .pdp-section-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          margin-bottom: 24px;
          font-weight: 600;
        }

        .description-text {
          font-size: 1rem;
          line-height: 1.8;
          color: var(--t2);
          margin-bottom: 48px;
        }

        .spec-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .spec-box {
          background: #FFFFFF;
          border: 1px solid var(--border);
          padding: 20px;
        }
        .spec-box span:first-child { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--t3); display: block; margin-bottom: 4px; }
        .spec-box span:last-child { font-weight: 600; color: var(--t1); }

        .star-select {
          display: flex;
          gap: 10px;
        }
        .star-select button {
          background: transparent;
          border: none;
          font-size: 1.75rem;
          color: #d0d0d0;
          padding: 0;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .star-select button.active {
          color: var(--gold);
        }

        .review-form textarea {
          width: 100%;
          border: 1px solid var(--border);
          padding: 16px;
          min-height: 140px;
          background: #fff;
          color: var(--t1);
        }
        .review-form textarea:focus {
          outline: 1px solid var(--gold);
        }

        .review-feedback {
          font-size: 0.9rem;
          font-weight: 600;
        }
        .review-feedback.success { color: #198754; }
        .review-feedback.error { color: #b02a37; }
        .review-feedback.info { color: var(--t2); }

        @media (max-width: 991px) {
          .product-info-stack { padding-left: 0; margin-top: 48px; }
          .gallery-container { position: relative; top: 0; }
        }
      `}</style>

      <div className="container">
        <div className="row g-5">
          {/* LEFT: GALLERY */}
          <div className="col-lg-7">
            <div className="gallery-container">
              <div className="main-image-wrap">
                <AnimatePresence>
                  <motion.img 
                    key={activeImg}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    src={product.imageGallery[activeImg]} 
                    alt={product.name}
                    className="img-fluid"
                  />
                </AnimatePresence>
              </div>
              <div className="thumb-grid">
                {product.imageGallery.map((img, i) => (
                  <button 
                    key={i} 
                    className={`thumb-btn ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt="" className="img-fluid" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: INFO */}
          <div className="col-lg-5">
            <div className="product-info-stack">
              <span className="section-label-gold mb-2">Chronix collection</span>
              <h1 className="product-title">{product.name}</h1>
              
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-flex text-gold">
                  {[1,2,3,4,5].map(star => (
                    <HiStar key={star} className={star <= (roundedAverage || 0) ? '' : 'opacity-20'} />
                  ))}
                </div>
                <span className="small fw-bold">{reviewCount ? `${(averageRating || 0).toFixed(1)} / 5.0` : 'New arrival'}</span>
                <span className="small text-t3 border-bottom border-border ms-2">
                  {reviewCount > 0 ? `${reviewCount} Verified Review${reviewCount > 1 ? 's' : ''}` : 'Be the first to review'}
                </span>
              </div>

              <div className="product-price">
                ₹{currentPrice.toLocaleString()}
                {product.isOnDeal && <span className="price-original">₹{(currentPrice + 9500).toLocaleString()}</span>}
              </div>

              {/* SELECTION */}
              <div className="selection-area">
                <label className="spec-label">Case size</label>
                <div className="variant-options">
                  {sizes.map(s => (
                    <button 
                      key={s} 
                      className={`option-pill ${selectedSize === s ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <label className="spec-label">Case finish</label>
                <div className="color-swatch-wrap">
                  {availableColors.map(c => (
                    <div 
                      key={c.name} 
                      className={`color-swatch ${selectedColor === c.name ? 'active' : ''}`}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                    >
                      <span className="color-inner" style={{ backgroundColor: c.color }}></span>
                    </div>
                  ))}
                </div>

                <label className="spec-label">Strap</label>
                <div className="variant-options">
                  {straps.map(m => (
                    <button 
                      key={m} 
                      className={`option-pill ${selectedStrap === m ? 'active' : ''}`}
                      onClick={() => setSelectedStrap(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <label className="spec-label">Quantity</label>
              <div className="qty-stepper">
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}><HiMinus /></button>
                <span className="qty-val">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(qty + 1)}><HiPlus /></button>
              </div>

              <div className="action-group">
                <button
                  className={`btn-gold flex-grow-1 py-4 ${!isAvailable ? 'opacity-50' : ''}`}
                  onClick={isAvailable ? handleAddToCart : null}
                  disabled={!isAvailable}
                >
                  {isAvailable ? 'Add to bag' : 'Out of stock'}
                </button>
                <button className="btn-wishlist" onClick={() => toggleWishlist(product.id)}>
                   <AnimatePresence mode="wait">
                      {isInWishlist(product.id) ? (
                         <motion.div key="heart-filled" initial={{ scale: 0.5 }} animate={{ scale: [0.5, 1.2, 1] }} transition={{ duration: 0.3 }}>
                            <HiHeart size={24} className="text-danger" />
                         </motion.div>
                      ) : (
                         <motion.div key="heart-outline" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                            <HiOutlineHeart size={24} />
                         </motion.div>
                      )}
                   </AnimatePresence>
                </button>
              </div>

              {/* TRUST */}
              <div className="trust-grid">
                <div className="trust-item"><HiOutlineTruck /> <span>Free shipping</span></div>
                <div className="trust-item"><HiOutlineArrowPath /> <span>14-day returns</span></div>
                <div className="trust-item"><HiOutlineShieldCheck /> <span>2-year warranty</span></div>
              </div>

              {/* STORY & SPECS */}
              <h3 className="pdp-section-title">Product notes</h3>
              <p className="description-text">
                Built for daily wear, the {product.name} keeps the dial clean, the proportions balanced, and the serviceability honest. Every watch ships regulated, pressure-tested, and ready to live on your wrist rather than in a display box.
              </p>

              <h3 className="pdp-section-title">Specifications</h3>
              <div className="spec-grid">
                <div className="spec-box">
                  <span>Movement</span>
                  <span>{product.attributes?.movement || 'Calibre 3235'}</span>
                </div>
                <div className="spec-box">
                  <span>Material</span>
                  <span>{product.attributes?.material || 'Oystersteel'}</span>
                </div>
                <div className="spec-box">
                  <span>Resistance</span>
                  <span>{product.attributes?.waterResistance || '10ATM'}</span>
                </div>
                <div className="spec-box">
                  <span>Glass</span>
                  <span>{product.attributes?.glassType || 'Sapphire'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTIONS */}
           <div className="mt-5 pt-5">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end border-bottom border-border pb-4 mb-5">
                 <div>
                   <span className="section-label">Customer stories</span>
                   <h2 className="product-title m-0">Recent experiences</h2>
                 </div>
                 <div className="mt-3 mt-md-0 text-md-end">
                   {isLoggedIn ? (
                     <>
                       <button
                         type="button"
                         className="btn-pill-soft d-inline-flex align-items-center gap-2 text-uppercase x-small fw-bold"
                         onClick={() => {
                           if (alreadyReviewed) return;
                           setShowReviewForm((prev) => !prev);
                         }}
                         disabled={alreadyReviewed}
                       >
                         {showReviewForm ? 'Close review form' : 'Write a review'}
                       </button>
                       {alreadyReviewed && (
                         <p className="x-small text-success m-0 mt-2">Thanks! You have already reviewed this watch.</p>
                       )}
                     </>
                   ) : (
                     <p className="x-small text-t3 m-0">Sign in to share your experience.</p>
                   )}
                 </div>
              </div>

           <div className="row g-4 align-items-start mb-5">
              <div className="col-lg-4">
                <div className="chronix-card tight h-100">
                  <span className="x-small text-t3 uppercase fw-bold tracking-widest">Average rating</span>
                  <div className="display-4 fw-bold text-gold my-2">{reviewCount ? (averageRating || 0).toFixed(1) : '—'}</div>
                  <div className="d-flex text-gold mb-3">
                    {[1,2,3,4,5].map(star => (
                      <HiStar key={star} className={star <= (roundedAverage || 0) ? '' : 'opacity-20'} />
                    ))}
                  </div>
                  <p className="small text-t2 m-0">
                    {reviewCount > 0 ? `${reviewCount} collector${reviewCount > 1 ? 's' : ''} sharing insights.` : 'Be the first to review this watch.'}
                  </p>
                </div>
              </div>
              <div className="col-lg-8">
                {showReviewForm && isLoggedIn ? (
                  <form className="chronix-card tight review-form" onSubmit={handleReviewSubmit}>
                    <label className="spec-label">Your rating</label>
                    <div className="star-select mb-3">
                      {[1,2,3,4,5].map((value) => (
                        <button
                          type="button"
                          key={value}
                          className={value <= ratingSelectionValue ? 'active' : ''}
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRatingValue(value)}
                          aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                        >
                          <HiStar />
                        </button>
                      ))}
                    </div>
                    <label className="spec-label">Share your thoughts</label>
                    <textarea
                      placeholder="Tell fellow collectors about fit, finishing, and ownership experience..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                    {reviewStatus && (
                      <p className={`review-feedback ${reviewStatus.type} mt-2`}>{reviewStatus.message}</p>
                    )}
                    <button className="btn-gold w-100 mt-3" type="submit" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Post review'}
                    </button>
                  </form>
                ) : (
                  <div className="chronix-card tight bg-bg-1 text-t2 small">
                    Share how the {product.name} wears in real life. Tap "Write a review" to start the conversation.
                  </div>
                )}
              </div>
           </div>

           <div className="row g-4">
              {reviewsLoading ? (
                <div className="col-12 py-5 text-center opacity-50">Archiving Community Feedback...</div>
              ) : reviewsError ? (
                <div className="col-12 py-4 text-center text-danger small">{reviewsError}</div>
              ) : productReviews.length === 0 ? (
                <div className="col-12 py-5 text-center bg-bg-1 border border-dashed border-border">
                  <span className="x-small text-t3 uppercase fw-bold tracking-widest">No reviews yet.</span>
                </div>
              ) : (
                productReviews.map(r => {
                  const reviewDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';
                  const initials = (r.authorName?.[0] || 'C').toUpperCase();
                  return (
                    <div key={r.id} className="col-md-4">
                      <div className="chronix-card tight no-hover h-100 d-flex flex-column">
                        <div className="text-gold mb-3 d-flex">
                          {[1,2,3,4,5].map(s => <HiStar key={s} className={s <= r.rating ? 'opacity-100' : 'opacity-20'} />)}
                        </div>
                        <p className="small text-t2 line-height-lg mb-4 italic">"{r.comment}"</p>
                        <div className="mt-auto pt-3 border-top border-border d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar px-2 py-1 bg-gold text-white small fw-bold">{initials}</div>
                            <div>
                              <span className="d-block small fw-bold">{r.authorName}</span>
                              <span className="x-small text-t3">{reviewDate}</span>
                            </div>
                          </div>
                          <span className="x-small text-success fw-bold">Verified</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>
           {/* RELATED */}
           <div className="mt-5 pt-5">
              <div className="d-flex justify-content-between align-items-end border-bottom border-border pb-4 mb-5">
                <div>
                  <span className="section-label">You may also like</span>
                  <h2 className="product-title m-0">Similar pieces</h2>
                </div>
                <Link to="/allcollection" className="btn-pill-soft d-flex align-items-center gap-2 text-decoration-none x-small fw-bold text-gold uppercase tracking-widest">
                   See all watches <HiOutlineArrowUpRight />
                </Link>
              </div>
              <div className="row g-4">
                {relatedProducts.map(p => (
                  <div key={p.id} className="col-6 col-md-3">
                    <Link to={`/product/${p.id}`} className="text-decoration-none">
                      <div className="bg-white border border-border p-4 mb-3 transition" style={{ aspectRatio: '1' }}>
                        <img src={p.imageGallery[0]} alt={p.name} className="img-fluid" />
                      </div>
                      <span className="x-small text-t3 uppercase tracking-widest mb-1 d-block">{p.category}</span>
                      <h4 className="h6 fw-bold text-t1 mb-1">{p.name}</h4>
                      <span className="text-gold fw-bold small">₹{p.price.toLocaleString()}</span>
                    </Link>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Recently Viewed Products */}
        <RecentlyViewed excludeId={id} />
      </div>
  );
}
// ─── Sub-Component: DetailedSkeleton ──────────────────────────────────────────
function DetailedSkeleton() {
  return (
    <div className="container" style={{ paddingTop: '120px' }}>
      <style>{`
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
      <div className="row g-5">
        <div className="col-lg-7">
          <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: '4px' }}></div>
          <div className="d-flex gap-3 mt-4 justify-content-center">
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ width: '80px', height: '80px' }}></div>)}
          </div>
        </div>
        <div className="col-lg-5">
          <div className="skeleton mb-3" style={{ height: '14px', width: '120px' }}></div>
          <div className="skeleton mb-4" style={{ height: '48px', width: '80%' }}></div>
          <div className="skeleton mb-4" style={{ height: '20px', width: '40%' }}></div>
          <div className="skeleton mb-5" style={{ height: '32px', width: '30%' }}></div>
          <div className="skeleton mb-3" style={{ height: '20px', width: '100%' }}></div>
          <div className="skeleton mb-3" style={{ height: '20px', width: '100%' }}></div>
          <div className="skeleton mb-5" style={{ height: '100px', width: '100%' }}></div>
          <div className="skeleton" style={{ height: '64px', width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
}
