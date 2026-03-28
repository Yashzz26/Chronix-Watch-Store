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
  HiOutlineShieldCheck
} from 'react-icons/hi2';
import useCartStore from '../store/cartStore';
import { products } from '../data/products';
import toast from 'react-hot-toast';

// Stepper Component
const CheckoutStepper = ({ currentStep }) => {
  const steps = [
    { label: 'Archive', id: 'cart' },
    { label: 'Logistics', id: 'address' },
    { label: 'Payment', id: 'payment' }
  ];

  return (
    <div className="d-flex align-items-center justify-content-center gap-4 mb-5 pb-5">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="d-flex align-items-center gap-3">
            <span 
              className="font-mono"
              style={{ 
                fontSize: '0.75rem', 
                color: currentStep === step.id ? 'var(--gold)' : 'var(--t3)',
                fontWeight: currentStep === step.id ? 700 : 400
              }}
            >
              0{idx + 1}
            </span>
            <span 
              className="text-uppercase tracking-widest fw-bold"
              style={{ 
                fontSize: '0.65rem', 
                color: currentStep === step.id ? 'var(--t1)' : 'var(--t3)'
              }}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div style={{ width: '40px', height: '1px', background: 'var(--border)' }} />
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

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="cart-empty-state d-flex flex-column align-items-center justify-content-center px-4 text-center">
        <style>{`
          .cart-empty-state { min-height: 80vh; background: var(--bg); }
        `}</style>
        <HiOutlineShoppingBag size={60} className="text-gold mb-4 opacity-20" />
        <h1 className="font-display display-4 text-t1 mb-3">Institutional Archive Empty</h1>
        <p className="text-t3 mb-5 mx-auto" style={{ maxWidth: 400 }}>No instruments have been selected for acquisition at this moment.</p>
        <Link to="/allcollection" className="btn-gold px-5 py-3">Explore Inventory</Link>
      </div>
    );
  }

  return (
    <div className="cart-page pb-5">
      <style>{`
        .cart-page { background: var(--bg); min-height: 100vh; padding-top: 120px; color: var(--t1); }
        
        .cart-item { border-bottom: 1px solid var(--border); padding: 40px 0; }
        .cart-item:first-child { border-top: 1px solid var(--border); }
        
        .item-img-wrap { width: 140px; height: 140px; background: var(--bg-2); border-radius: 8px; padding: 20px; display: flex; align-items: center; justify-content: center; }
        .item-img { max-width: 100%; max-height: 100%; object-fit: contain; }
        
        .qty-control { display: flex; border: 1px solid var(--border); border-radius: 4px; overflow: hidden; max-width: 120px; }
        .qty-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: none; background: #fff; color: var(--t1); transition: var(--transition); }
        .qty-btn:hover { background: var(--bg-2); }
        .qty-val { flex: 1; display: flex; align-items: center; justify-content: center; font-family: var(--font-body); font-weight: 700; border-left: 1px solid var(--border); border-right: 1px solid var(--border); }

        .summary-card { position: sticky; top: 120px; border: 1px solid var(--border); padding: 40px; border-radius: 12px; background: #fff; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 0.9rem; }
        .summary-total { border-top: 1px solid var(--border); padding-top: 30px; margin-top: 30px; }
      `}</style>

      <div className="container">
        <CheckoutStepper currentStep="cart" />
        
        <div className="row g-5">
          {/* Main List */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-end mb-5">
              <h1 className="font-display display-4 m-0">Consolidated Archive</h1>
              <span className="small text-t3 uppercase tracking-widest">{totalItems} Instruments</span>
            </div>

            <div className="cart-list">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="cart-item"
                  >
                    <div className="row align-items-center">
                      <div className="col-3 col-md-2">
                        <Link to={`/product/${item.id}`} className="item-img-wrap">
                          <img src={item.imageGallery[0]} alt={item.name} className="item-img" />
                        </Link>
                      </div>
                      <div className="col-9 col-md-10">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                          <div>
                            <span className="section-label mb-1" style={{ fontSize: '0.6rem' }}>{item.category}</span>
                            <h3 className="h4 font-display text-t1 m-0">{item.name}</h3>
                          </div>
                          <div className="text-end">
                            <span className="h5 font-body fw-bold">₹{item.price.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <div className="qty-control">
                            <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>
                               {item.qty === 1 ? <HiOutlineTrash size={14} /> : <HiMinus size={14} />}
                            </button>
                            <span className="qty-val">{item.qty}</span>
                            <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>
                               <HiPlus size={14} />
                            </button>
                          </div>
                          <div className="d-flex gap-4">
                            <button className="btn p-0 text-t3 small uppercase tracking-widest fw-bold hover:text-gold" onClick={() => moveToSaved(item.id)}>Archive Later</button>
                            <button className="btn p-0 text-t3 small uppercase tracking-widest fw-bold hover:text-danger" onClick={() => removeItem(item.id)}>Remove</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Saved Portfolio */}
            {savedItems.length > 0 && (
              <div className="mt-5 pt-5">
                <h2 className="section-label mb-4">Saved for Future Consideration</h2>
                <div className="row g-4">
                  {savedItems.map(item => (
                    <div key={item.id} className="col-md-6 text-decoration-none">
                      <div className="chronix-card p-3 d-flex gap-4 align-items-center">
                        <img src={item.imageGallery[0]} className="img-fluid" style={{ width: 60 }} alt="" />
                        <div className="flex-grow-1">
                           <h4 className="h6 text-t1 m-0 mb-2">{item.name}</h4>
                           <div className="d-flex gap-3">
                             <button className="btn p-0 text-gold small uppercase fw-bold" style={{ fontSize: '0.6rem' }} onClick={() => moveToCart(item.id)}>Add to Trunk</button>
                             <button className="btn p-0 text-t3 small uppercase fw-bold" style={{ fontSize: '0.6rem' }} onClick={() => removeSaved(item.id)}>Delete</button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="col-lg-4">
             <div className="summary-card">
                <h2 className="section-label mb-5 text-center">Logistics Overview</h2>
                
                <div className="summary-row">
                   <span className="text-t3">Sub-Archive Total</span>
                   <span className="text-t1 fw-bold">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                   <span className="text-t3">Allocation Fees</span>
                   <span className="text-success fw-bold">COMPLIMENTARY</span>
                </div>
                <div className="summary-row">
                   <span className="text-t3">Statutory Duties</span>
                   <span className="text-t3">INCLUDED</span>
                </div>

                <div className="summary-total summary-row align-items-end mb-5">
                   <span className="section-label m-0">Total Investment</span>
                   <span className="h2 text-t1 m-0 fw-bold">₹{totalPrice.toLocaleString()}</span>
                </div>

                <button className="btn-gold w-100 py-3 mb-4" onClick={() => navigate('/checkout')}>Proceed to Logistics</button>
                
                <div className="d-flex align-items-center gap-3 justify-content-center text-t3" style={{ fontSize: '0.7rem' }}>
                   <HiOutlineShieldCheck size={18} className="text-gold" />
                   <span className="uppercase tracking-widest font-mono">SECURE ACQUISITION PROTOCOL</span>
                </div>
                
                <div className="mt-5 pt-4 border-top border-border">
                   <p className="small text-t3 mb-0">Every acquisition is secured with institutional grade encryption and dispatched via our global concierge network.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
