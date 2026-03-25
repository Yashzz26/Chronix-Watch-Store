import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineTrash, 
  HiOutlineShoppingBag, 
  HiPlus, 
  HiMinus, 
  HiArrowLeft, 
  HiOutlineBookmark, 
  HiOutlineArrowUpRight,
  HiOutlineShieldCheck,
  HiOutlineCheckBadge,
  HiOutlineCreditCard
} from 'react-icons/hi2';
import useCartStore from '../store/cartStore';
import { products } from '../data/products';
import toast from 'react-hot-toast';

// Stepper Component
const CheckoutStepper = ({ currentStep }) => {
  const steps = [
    { label: 'Cart', id: 'cart' },
    { label: 'Address', id: 'address' },
    { label: 'Payment', id: 'payment' },
    { label: 'Review', id: 'review' }
  ];

  return (
    <div className="d-flex align-items-center justify-content-center gap-2 mb-5">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="d-flex align-items-center gap-2">
            <div 
              className={`rounded-circle d-flex align-items-center justify-content-center font-mono`}
              style={{ 
                width: 24, height: 24, fontSize: '0.7rem',
                border: currentStep === step.id ? '2px solid #D4AF37' : '1px solid #1e1e1e',
                background: currentStep === step.id ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: currentStep === step.id ? '#D4AF37' : '#5A5652'
              }}
            >
              {idx < steps.findIndex(s => s.id === currentStep) ? <HiOutlineCheckBadge size={14} className="text-gold" /> : idx + 1}
            </div>
            <span 
              className="text-uppercase tracking-widest font-body"
              style={{ 
                fontSize: '0.65rem', 
                color: currentStep === step.id ? '#D4AF37' : '#5A5652',
                fontWeight: currentStep === step.id ? 700 : 400
              }}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, #1e1e1e, #111)', margin: '0 8px' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function Cart() {
  const navigate = useNavigate();
  const { items, savedItems, removeItem, updateQty, moveToSaved, moveToCart, removeSaved } = useCartStore();

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.dealPrice || i.price) * i.qty, 0);

  // Recommendations logic (simple: products not in cart)
  const recommendations = products.filter(p => !items.find(i => i.id === p.id)).slice(0, 3);

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center px-4 text-center" style={{ minHeight: '70vh' }}>
        <CheckoutStepper currentStep="cart" />
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="d-flex align-items-center justify-content-center rounded-circle mb-4"
           style={{ width: 96, height: 96, background: '#0F0F0F', border: '1px solid #1e1e1e' }}
        >
          <HiOutlineShoppingBag size={40} className="text-t3" />
        </motion.div>
        <h1 className="font-display display-4 text-t1 mb-3">Your trunk is empty.</h1>
        <p className="text-t3 fs-5 mb-5 mx-auto" style={{ maxWidth: 400 }}>
          Exceptional timepieces await your selection.
        </p>
        <Link to="/" className="btn-chronix-primary py-3 px-5 text-decoration-none">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5 my-5">
      <CheckoutStepper currentStep="cart" />
      
      <div className="mb-5 d-flex justify-content-between align-items-end">
        <div>
          <Link to="/" className="text-t3 text-decoration-none d-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.875rem' }}>
            <HiArrowLeft /> Back to Maison
          </Link>
          <h1 className="font-display display-4 text-t1">Portfolio Selection</h1>
        </div>
        <div className="text-end d-none d-md-block">
          <p className="text-t3 text-uppercase tracking-widest mb-1" style={{ fontSize: '0.6rem' }}>Items in Cart</p>
          <p className="font-mono h4 text-white m-0">{totalItems}</p>
        </div>
      </div>

      <div className="row g-5 align-items-start">
        {/* Cart List */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="chronix-card p-4 d-flex flex-column flex-sm-row gap-4 mb-0 group"
                  style={{ background: '#0F0F0F' }}
                >
                  <div className="bg-s2 rounded-2 p-3 flex-shrink-0 d-flex align-items-center justify-content-center position-relative overflow-hidden" style={{ width: 140, height: 140 }}>
                     <div className="position-absolute w-100 h-100 bg-gold opacity-0 group-hover:opacity-5 transition-all" />
                    <img src={item.imageGallery[0]} alt={item.name} className="w-100 h-100 object-fit-contain transition-all" style={{ transform: 'scale(1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                           <span className="section-label m-0" style={{ fontSize: '0.55rem' }}>{item.category}</span>
                           <span className="badge bg-danger-subtle text-danger border-0 font-body" style={{ fontSize: '0.6rem', padding: '2px 6px', opacity: 0.8 }}>Selling Fast 🔥</span>
                        </div>
                        <Link to={`/product/${item.id}`} className="font-display h3 text-white text-decoration-none hover:text-gold transition-all">
                          {item.name}
                        </Link>
                        <p className="text-t3 mt-1" style={{ fontSize: '0.75rem' }}>Reference: #{(item.id % 100000).toString().padStart(5, '0')}</p>
                      </div>
                      <div className="d-flex gap-2">
                        <button onClick={() => moveToSaved(item.id)} className="btn-icon p-2 text-t3 hover:text-gold" title="Save for later">
                          <HiOutlineBookmark size={18} />
                        </button>
                        <button onClick={() => removeItem(item.id)} className="btn-icon p-2 text-t3 hover:text-danger">
                          <HiOutlineTrash size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-4 mt-4 pt-3 border-top border-border border-opacity-25">
                      <div className="d-flex align-items-center bg-black border border-border rounded-2 overflow-hidden" style={{ height: 36 }}>
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="btn border-0 px-3 text-t3 hover:text-white transition-all">
                          {item.qty === 1 ? <HiOutlineTrash size={14} className="text-danger" /> : <HiMinus size={14} />}
                        </button>
                        <span className="px-3 font-mono text-white fw-bold" style={{ fontSize: '0.9rem' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="btn border-0 px-3 text-t3 hover:text-white transition-all">
                          <HiPlus size={14} />
                        </button>
                      </div>
                      <div className="text-end">
                        <span className="text-t3 text-uppercase tracking-tighter d-block" style={{ fontSize: '0.6rem' }}>Unit Price</span>
                        <span className="font-mono text-gold fw-bold">₹{(item.dealPrice || item.price).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {items.length === 0 && savedItems.length > 0 && (
               <div className="p-5 text-center chronix-card border-dashed">
                  <p className="text-t3 m-0">All items are in your Saved Portfolio.</p>
               </div>
            )}

            {/* Saved for Later */}
            <AnimatePresence>
              {savedItems.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 pt-5 border-top border-border border-opacity-50">
                   <h2 className="section-label mb-4">Saved for Later ({savedItems.length})</h2>
                   <div className="row g-4">
                      {savedItems.map(item => (
                        <div key={item.id} className="col-12 col-md-6">
                           <div className="chronix-card p-3 d-flex gap-3 align-items-center bg-black border-opacity-50">
                              <div className="bg-s2 p-2 rounded" style={{ width: 60, height: 60 }}>
                                 <img src={item.imageGallery[0]} alt="" className="w-100 h-100 object-fit-contain" />
                              </div>
                              <div className="flex-grow-1 overflow-hidden">
                                 <h4 className="text-white text-truncate mb-1" style={{ fontSize: '0.9rem' }}>{item.name}</h4>
                                 <div className="d-flex align-items-center gap-3">
                                    <button onClick={() => moveToCart(item.id)} className="btn p-0 text-gold text-uppercase tracking-widest fw-bold" style={{ fontSize: '0.6rem' }}>Move to Trunk</button>
                                    <button onClick={() => removeSaved(item.id)} className="btn p-0 text-t3 text-uppercase tracking-widest fw-bold" style={{ fontSize: '0.6rem' }}>Remove</button>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recommendations */}
            <div className="mt-5 pt-5">
               <h2 className="section-label mb-4">Pair with your selection</h2>
               <div className="row g-4">
                  {recommendations.map(p => (
                    <div key={p.id} className="col-12 col-md-4">
                       <div className="chronix-card p-3 h-100 text-center d-flex flex-column" style={{ background: '#0C0C0C' }}>
                          <div className="bg-s2 rounded p-3 mb-3 mx-auto" style={{ width: 100, height: 100 }}>
                             <img src={p.imageGallery[0]} alt="" className="w-100 h-100 object-fit-contain" />
                          </div>
                          <h4 className="text-white h6 mb-2 text-truncate">{p.name}</h4>
                          <p className="font-mono text-gold mb-3" style={{ fontSize: '0.85rem' }}>₹{p.price.toLocaleString('en-IN')}</p>
                          <button onClick={() => {
                            useCartStore.getState().addItem(p);
                            toast.success(`Exclusive ${p.name} added`);
                          }} className="btn btn-outline-gold py-2 w-100" style={{ fontSize: '0.7rem', fontWeight: 700 }}>Quick Add</button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="col-12 col-lg-4 ps-lg-5">
          <div className="position-sticky" style={{ top: '100px' }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="chronix-card p-4">
              <h2 className="section-label mb-5 text-center">Order Résumé</h2>

              <div className="mb-4 d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-t3 font-body">Subtotal</span>
                  <span className="text-t1 font-mono">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-t3 font-body">Est. Taxes (GST)</span>
                  <span className="text-t3 font-mono">Included</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                   <div className="d-flex flex-column text-start">
                    <span className="text-t3 font-body">Concierge Delivery</span>
                    <span className="text-gold" style={{ fontSize: '0.65rem' }}>PUNE - Tomorrow</span>
                   </div>
                  <span className="text-success font-mono">FREE</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-4 pt-4 border-top border-border border-opacity-25">
                 <div className="position-relative">
                    <input 
                      type="text" 
                      placeholder="Enter promo code" 
                      className="w-100 bg-black border border-border rounded-2 p-3 text-white font-body"
                      style={{ outline: 'none', transition: 'border-color 0.2s', fontSize: '0.85rem' }}
                      onFocus={e => e.target.style.borderColor = '#D4AF37'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                    <button className="position-absolute end-0 top-50 translate-middle-y me-3 btn p-0 text-gold fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Apply</button>
                 </div>
              </div>

              <div className="d-flex justify-content-between align-items-end mb-5 pt-2">
                <span className="section-label m-0">Total Due</span>
                <span className="h1 text-gold font-mono fw-bold m-0" style={{ letterSpacing: '-0.02em' }}>
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="btn-gold w-100 py-3 text-uppercase fw-bold shadow-lg" 
                style={{ fontSize: '0.85rem', letterSpacing: '0.15em' }}
              >
                Continue to Secure Payment
              </button>

              <div className="mt-5 d-flex flex-column gap-3">
                 <div className="d-flex align-items-center gap-3 text-t3" style={{ fontSize: '0.7rem' }}>
                    <div className="bg-s2 p-2 rounded-circle"><HiOutlineShieldCheck size={14} /></div>
                    <span>SSL SECTRITY & END-TO-END ENCRYPTION</span>
                 </div>
                 <div className="d-flex align-items-center gap-3 text-t3" style={{ fontSize: '0.7rem' }}>
                    <div className="bg-s2 p-2 rounded-circle"><HiOutlineCreditCard size={14} /></div>
                    <span>ALL MAJOR CARDS & UPI ACCEPTED</span>
                 </div>
              </div>
            </motion.div>
            
            {/* Mobile Sticky Bar - Hidden on Desktop */}
            <div className="d-lg-none fixed-bottom bg-black border-top border-border p-3 d-flex align-items-center justify-content-between p-4" style={{ zIndex: 1000, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)' }}>
                <div>
                   <span className="text-t3 d-block" style={{ fontSize: '0.65rem' }}>TOTAL DUE</span>
                   <span className="text-gold font-mono h4 m-0 fw-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <button onClick={() => navigate('/checkout')} className="btn-gold px-4 py-3 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Checkout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
