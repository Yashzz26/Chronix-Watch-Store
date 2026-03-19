import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash, HiOutlineShoppingBag, HiPlus, HiMinus, HiArrowLeft } from 'react-icons/hi2';
import useCartStore from '../store/cartStore';

export default function Cart() {
  const { items, removeItem, updateQty, totalPrice, totalItems } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-24 h-24 bg-s1 border border-border rounded-full flex items-center justify-center mb-8"
        >
          <HiOutlineShoppingBag size={40} className="text-t3" />
        </motion.div>
        <h1 className="font-display text-4xl text-t1 mb-4">Your collection is empty.</h1>
        <p className="text-t3 text-lg mb-10 max-w-sm">
          A man of your stature should have at least one timepiece worthy of the name.
        </p>
        <Link to="/" className="btn-primary py-4 px-10">
          Begin Browsing
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5 my-5">
      <div className="mb-5">
        <Link to="/" className="text-t3 hover-text-gold text-sm d-flex align-items-center gap-2 mb-3 text-decoration-none">
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
                  className="chronix-card p-4 d-flex flex-column flex-sm-row gap-4"
                  style={{ marginBottom: 0 }}
                >
                  <div className="bg-s2 rounded-3 p-3 flex-shrink-0" style={{ width: 120, height: 120 }}>
                    <img src={item.imageGallery[0]} alt={item.name} className="w-100 h-100 object-fit-contain" />
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start gap-4">
                      <div>
                        <p className="section-label mb-1" style={{ fontSize: '0.6rem' }}>{item.category}</p>
                        <Link to={`/product/${item.id}`} className="font-display h4 text-t1 text-decoration-none hover-text-gold">
                          {item.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="btn border-0 p-2 text-t3 hover:text-danger"
                      >
                        <HiOutlineTrash size={20} />
                      </button>
                    </div>

                    <p className="font-mono text-gold fw-medium mt-2">
                      ₹{(item.dealPrice || item.price).toLocaleString('en-IN')}
                    </p>

                    <div className="d-flex flex-wrap align-items-center gap-4 mt-3">
                      <div className="d-flex align-items-center bg-s2 border border-border rounded-2 overflow-hidden h-100">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="btn border-0 py-1 px-3 text-t2" disabled={item.qty <= 1}>
                          <HiMinus size={14} />
                        </button>
                        <span className="px-3 py-1 font-mono text-sm fw-bold text-t1 border-start border-end border-border border-opacity-20">
                          {item.qty}
                        </span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="btn border-0 py-1 px-3 text-t2">
                          <HiPlus size={14} />
                        </button>
                      </div>
                      <p className="text-[0.7rem] text-t3 uppercase tracking-widest m-0">
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="chronix-card p-4 position-sticky" style={{ top: '100px' }}>
            <h2 className="font-display h4 text-t1 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 pb-4 border-bottom border-border">
              <div className="d-flex justify-content-between text-sm">
                <span className="text-t3">Items ({totalItems()})</span>
                <span className="text-t2 font-mono fw-medium">₹{totalPrice().toLocaleString('en-IN')}</span>
              </div>
              <div className="d-flex justify-content-between text-sm">
                <span className="text-t3">VIP Shipping</span>
                <span className="text-success font-mono text-[0.65rem] fw-bold uppercase tracking-widest">Complimentary</span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-end mb-4 pt-2">
              <span className="text-t1 fw-semibold">Total Amount</span>
              <div className="text-end">
                <span className="d-block h3 text-gold font-mono fw-bold m-0">
                  ₹{totalPrice().toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <Link to="/checkout" className="btn-chronix-primary w-100 py-3 d-flex align-items-center justify-content-center gap-3 text-sm" style={{ boxShadow: '0 10px 30px rgba(212,175,55,0.2)' }}>
              Proceed to Secure Checkout
            </Link>

            <p className="text-[0.6rem] text-t3 text-center mt-4 uppercase tracking-wider mb-0">
              Every transaction is protected <br /> by institutional-grade encryption.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
