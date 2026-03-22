import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash, HiOutlineShoppingBag, HiPlus, HiMinus, HiArrowLeft } from 'react-icons/hi2';
import useCartStore from '../store/cartStore';

export default function Cart() {
  const { items, removeItem, updateQty } = useCartStore();

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.dealPrice || i.price) * i.qty, 0);

  if (items.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center px-4 text-center" style={{ minHeight: '70vh' }}>
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="d-flex align-items-center justify-content-center rounded-circle mb-4"
           style={{ width: 96, height: 96, background: 'var(--s1)', border: '1px solid var(--border)' }}
        >
          <HiOutlineShoppingBag size={40} className="text-t3" />
        </motion.div>
        <h1 className="font-display display-4 text-t1 mb-3">Your collection is empty.</h1>
        <p className="text-t3 fs-5 mb-5 mx-auto" style={{ maxWidth: 400 }}>
          A man of your stature should have at least one timepiece worthy of the name.
        </p>
        <Link to="/" className="btn-chronix-primary py-3 px-5 text-decoration-none">
          Begin Browsing
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5 my-5">
      <div className="mb-5">
        <Link to="/" className="text-t3 text-decoration-none d-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.875rem' }}>
          <HiArrowLeft /> Continue Selection
        </Link>
        <h1 className="font-display display-3 text-t1">Your Selection</h1>
      </div>

      <div className="row g-5 align-items-start">
        {/* List */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="chronix-card p-4 d-flex flex-column flex-sm-row gap-4 mb-0"
                >
                  <div className="bg-s2 rounded-3 p-3 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: 120, height: 120 }}>
                    <img src={item.imageGallery[0]} alt={item.name} className="w-100 h-100 object-fit-contain" loading="lazy" decoding="async" />
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <p className="section-label mb-1" style={{ fontSize: '0.6rem' }}>{item.category}</p>
                        <Link to={`/product/${item.id}`} className="font-display h4 text-t1 text-decoration-none" style={{ transition: 'color 0.2s' }}>
                          {item.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="btn border-0 p-2 text-t3"
                        style={{ background: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#dc3545'}
                        onMouseLeave={e => e.currentTarget.style.color = '#5A5652'}
                      >
                        <HiOutlineTrash size={20} />
                      </button>
                    </div>

                    <p className="font-mono text-gold fw-medium mt-2 mb-0">
                      ₹{(item.dealPrice || item.price).toLocaleString('en-IN')}
                    </p>

                    <div className="d-flex flex-wrap align-items-center gap-4 mt-3">
                      <div className="d-flex align-items-center bg-s2 border border-border rounded-2 overflow-hidden h-100">
                        <button 
                          onClick={() => updateQty(item.id, item.qty - 1)} 
                          className="btn border-0 py-1 px-3 text-t2"
                        >
                          {item.qty === 1 ? <HiOutlineTrash size={14} className="text-danger" /> : <HiMinus size={14} />}
                        </button>
                        <span className="px-3 py-1 font-mono fs-6 fw-bold text-t1 border-start border-end border-border border-opacity-25">
                          {item.qty}
                        </span>
                        <button 
                          onClick={() => updateQty(item.id, item.qty + 1)} 
                          className="btn border-0 py-1 px-3 text-t2"
                          disabled={item.qty >= 99}
                        >
                          <HiPlus size={14} />
                        </button>
                      </div>
                      <p className="text-t3 text-uppercase tracking-widest m-0" style={{ fontSize: '0.65rem' }}>
                         Subtotal: <span className="text-t2 font-mono ms-2">₹{((item.dealPrice || item.price) * item.qty).toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Summary */}
        <div className="col-12 col-lg-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="chronix-card p-4 position-sticky" style={{ top: '80px' }}>
            <h2 className="font-display h4 text-t1 mb-4">Order Summary</h2>

            <div className="mb-4 pb-4 border-bottom border-border">
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.875rem' }}>
                <span className="text-t3">Items ({totalItems})</span>
                <span className="text-t2 font-mono fw-medium">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="d-flex justify-content-between" style={{ fontSize: '0.875rem' }}>
                <span className="text-t3">VIP Shipping</span>
                <span className="text-success font-mono fw-bold text-uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>Complimentary</span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-end mb-4 pt-2">
              <span className="text-t1 fw-semibold">Total Amount</span>
              <div className="text-end">
                <span className="d-block h3 text-gold font-mono fw-bold m-0">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <Link to="/checkout" className="btn-chronix-primary w-100 py-3 d-flex align-items-center justify-content-center gap-3 text-decoration-none" style={{ boxShadow: '0 10px 30px rgba(212,175,55,0.2)' }}>
              Proceed to Secure Checkout
            </Link>

            <p className="text-t3 text-center mt-4 text-uppercase tracking-wider mb-0" style={{ fontSize: '0.6rem' }}>
              Every transaction is protected <br /> by institutional-grade encryption.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
