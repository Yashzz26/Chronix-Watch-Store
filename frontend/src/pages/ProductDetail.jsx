import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineStar, HiStar, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineArrowPath } from 'react-icons/hi2';
import { getProductById } from '../data/products';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);
  const { addItem, addReview, getProductReviews } = useCartStore();

  const [activeImg, setActiveImg] = useState(0);
  const [rating, setRating]       = useState(5);
  const [comment, setComment]     = useState('');

  if (!product) return (
    <div className="py-40 text-center font-display text-2xl text-t3">Timepiece not found.</div>
  );

  const reviews = getProductReviews(product.id);

  const handleReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addReview({
      id: Date.now(),
      productId: product.id,
      user: 'Watch Enthusiast',
      rating,
      comment,
      date: new Date().toLocaleDateString(),
    });
    setComment('');
    toast.success('Review submitted');
  };

  const handleBuyNow = () => {
    addItem(product);
    navigate('/checkout');
  };

  return (
    <div className="container py-5 my-5">
      <div className="row gx-5 mb-5 align-items-center">

        {/* Left: Gallery */}
        <div className="col-12 col-lg-6 mb-5 mb-lg-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-s2 rounded-4 p-5 d-flex align-items-center justify-content-center position-relative overflow-hidden group"
            style={{ aspectRatio: '1/1' }}
          >
            <div className="position-absolute inset-0 bg-gold opacity-0 hover-opacity-10 transition-opacity" style={{ zIndex: 0 }} />
            <img
              src={product.imageGallery[activeImg]}
              alt={product.name}
              className="img-fluid position-relative z-1 drop-shadow-2xl"
              style={{ maxHeight: '100%' }}
            />
          </motion.div>

          <div className="d-flex gap-3 overflow-auto mt-4 pb-2">
            {product.imageGallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 rounded-3 bg-s1 border-2 transition-all p-2 ${
                  activeImg === i ? 'border-gold' : 'border-border opacity-50 hover-opacity-100'
                }`}
                style={{ width: 90, height: 90 }}
              >
                <img src={img} alt="" className="w-100 h-100 object-fit-contain" />
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
                <span className="h1 text-gold font-mono m-0">
                  ₹{(product.dealPrice || product.price).toLocaleString('en-IN')}
                </span>
                {product.isOnDeal && (
                  <span className="h4 text-t3 font-mono text-decoration-line-through m-0">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <div className="badge bg-success bg-opacity-10 text-success text-[0.7rem] px-2 py-1 rounded">
                In Stock
              </div>
            </div>
          </div>

          <p className="text-t2 fs-5 mb-5">{product.description}</p>

          <div className="row g-4 py-4 border-top border-bottom border-border mb-5">
            {[
              { icon: HiOutlineTruck, label: 'Complimentary Shipping' },
              { icon: HiOutlineShieldCheck, label: '2 Year Master Warranty' },
              { icon: HiOutlineStar, label: 'Certified Chronometer' },
              { icon: HiOutlineArrowPath, label: '30 Day Easy Returns' }
            ].map((item, i) => (
              <div key={i} className="col-6">
                <div className="d-flex align-items-center gap-2 text-sm text-t3">
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
                className="btn-chronix-ghost w-100 py-3"
              >
                Add to Cart
              </button>
            </div>
            <div className="col-12 col-sm-6">
              <button
                onClick={handleBuyNow}
                className="btn-chronix-primary w-100 py-3"
                style={{ boxShadow: '0 10px 30px rgba(212,175,55,0.2)' }}
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
                  <label className="text-[0.7rem] uppercase text-t3 mb-2 d-block">Your Rating</label>
                  <div className="d-flex gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setRating(s)} className="p-1 btn border-0">
                        {s <= rating ? <HiStar className="text-gold" /> : <HiOutlineStar className="text-t3" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-[0.7rem] uppercase text-t3 mb-2 d-block">Message</label>
                  <textarea
                    className="form-control chronix-input"
                    rows="4"
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-chronix-primary w-100 py-2 text-xs">
                  Submit Review
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="col-12 col-md-8">
            {reviews.length === 0 ? (
              <div className="py-5 text-center border-dashed rounded-4">
                 <p className="text-t3 font-display fst-italic">Be the first to share your thoughts.</p>
              </div>
            ) : (
              reviews.map(r => (
                <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-bottom border-border mb-5 pb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-medium text-t1">{r.user}</span>
                    <span className="text-xs text-t3 font-mono">{r.date}</span>
                  </div>
                  <div className="d-flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <HiStar key={s} size={14} className={s <= r.rating ? 'text-gold' : 'text-t3 opacity-20'} />
                    ))}
                  </div>
                  <p className="text-t2 font-serif fst-italic leading-relaxed">"{r.comment}"</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
