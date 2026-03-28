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
    { label: 'Cart', id: 'cart' },
    { label: 'Shipping', id: 'address' },
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
        <h1 className="font-display display-4 text-t1 mb-3">Your Cart is Empty</h1>
        <p className="text-t3 mb-5 mx-auto" style={{ maxWidth: 400 }}>No timepieces have been selected for purchase at this moment.</p>
        <Link to="/allcollection" className="btn-gold px-5 py-3">Explore Inventory</Link>
      </div>
    );
  }

  return (
    <div className="cart-page pb-5">
      <style>{`
        .cart-page { background: var(--bg); min-height: 100vh; padding-top: 120px; color: var(--t1); font-family: var(--font-body); }
        
        .cart-item { border-bottom: 1px solid var(--border); padding: 40px 0; transition: var(--transition); }
        .cart-item:first-child { border-top: 1px solid var(--border); }
        
        .item-img-wrap { width: 160px; height: 160px; background: var(--bg-2); border-radius: 12px; padding: 24px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .item-img { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.6s ease; }
        .item-img-wrap:hover .item-img { transform: scale(1.1); }
        
        .qty-control { display: flex; align-items: center; border: 1px solid var(--border); border-radius: 30px; padding: 4px; background: #fff; }
        .qty-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: var(--t1); border-radius: 50%; transition: var(--transition); }
        .qty-btn:hover { background: var(--bg-2); color: var(--gold); }
        .qty-val { width: 40px; text-align: center; font-family: var(--font-body); font-weight: 700; font-size: 0.9rem; }

        .summary-card { 
          position: sticky; 
          top: 120px; 
          border: 1px solid var(--border); 
          padding: 40px; 
          border-radius: 16px; 
          background: #fff; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.03);
        }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 0.9rem; color: var(--t2); }
        .summary-total { border-top: 1px solid var(--border); padding-top: 30px; margin-top: 30px; color: var(--t1); }
        
        .action-link { font-size: 0.7rem; letter-spacing: 0.1em; font-weight: 700; color: var(--t3); text-decoration: none; text-transform: uppercase; transition: var(--transition); border: none; background: transparent; }
        .action-link:hover { color: var(--gold); }
        .action-link.remove:hover { color: #dc3545; }
      `}</style>

      <div className="container">
        <CheckoutStepper currentStep="cart" />
        
        <div className="row g-5">
          {/* Main List */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-end mb-5">
              <h1 className="font-display display-4 m-0">Your Cart</h1>
              <span className="small text-t3 uppercase tracking-widest">{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
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
                    <div className="row align-items-center g-4">
                      <div className="col-12 col-sm-3 col-md-2">
                        <Link to={`/product/${item.id}`} className="item-img-wrap">
                          <img src={item.imageGallery[0]} alt={item.name} className="item-img" />
                        </Link>
                      </div>
                      <div className="col-12 col-sm-9 col-md-10">
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
                            <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease quantity">
                               {item.qty === 1 ? <HiOutlineTrash size={14} /> : <HiMinus size={14} />}
                            </button>
                            <span className="qty-val">{item.qty}</span>
                            <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase quantity">
                               <HiPlus size={14} />
                            </button>
                          </div>
                          <div className="d-flex gap-4">
                            <button className="action-link" onClick={() => moveToSaved(item.id)}>Save for Later</button>
                            <button className="action-link remove" onClick={() => removeItem(item.id)}>Remove Item</button>
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
                <h2 className="section-label mb-4 opacity-50">Saved for Later</h2>
                <div className="row g-4">
                  {savedItems.map(item => (
                    <div key={item.id} className="col-md-6">
                      <div className="chronix-card p-4 d-flex gap-4 align-items-center border border-border rounded-4">
                        <img src={item.imageGallery[0]} className="img-fluid" style={{ width: 60 }} alt="" />
                        <div className="flex-grow-1">
                           <h4 className="h6 text-t1 m-0 mb-2">{item.name}</h4>
                           <div className="d-flex gap-3">
                             <button className="action-link text-gold" style={{ fontSize: '0.6rem' }} onClick={() => moveToCart(item.id)}>Add to Cart</button>
                             <button className="action-link" style={{ fontSize: '0.6rem' }} onClick={() => removeSaved(item.id)}>Delete</button>
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
                <h2 className="section-label mb-5 text-center">Order Summary</h2>
                
                <div className="summary-row">
                   <span>Subtotal</span>
                   <span className="text-t1 fw-bold">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                   <span>Shipping</span>
                   <span className="text-success fw-bold">FREE</span>
                </div>
                <div className="summary-row">
                   <span>Taxes</span>
                   <span className="text-t3">Calculated at checkout</span>
                </div>

                <div className="summary-total summary-row align-items-end mb-5">
                   <span className="section-label m-0">Estimated Total</span>
                   <span className="h2 text-t1 m-0 fw-bold">₹{totalPrice.toLocaleString()}</span>
                </div>

                <button className="btn-gold w-100 py-3 mb-4 transition-all hover:-translate-y-1" onClick={() => navigate('/checkout')}>Continue to Shipping</button>
                
                <div className="d-flex align-items-center gap-3 justify-content-center text-t3 opacity-50" style={{ fontSize: '0.7rem' }}>
                   <HiOutlineShieldCheck size={18} className="text-gold" />
                   <span className="uppercase tracking-widest font-mono">Secure Payment</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
