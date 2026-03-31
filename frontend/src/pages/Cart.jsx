import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineTrash, 
  HiOutlineShoppingBag, 
  HiPlus, 
  HiMinus, 
  HiOutlineShieldCheck 
} from 'react-icons/hi2';
import useCartStore from '../store/cartStore';

const CheckoutStepper = ({ currentStep }) => {
  const steps = [
    { label: 'Cart', id: 'cart' },
    { label: 'Address', id: 'address' },
    { label: 'Payment', id: 'payment' }
  ];

  return (
    <div className="d-flex align-items-center justify-content-center gap-5 mb-5 pb-4 border-bottom border-border border-opacity-30">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="d-flex align-items-center gap-3">
            <span className="font-mono x-small fw-bold" style={{ color: currentStep === step.id ? 'var(--gold)' : 'var(--t3)' }}>0{idx + 1}</span>
            <span className="text-uppercase tracking-widest fw-bold" style={{ fontSize: '0.7rem', color: currentStep === step.id ? 'var(--t1)' : 'var(--t3)' }}>{step.label}</span>
          </div>
          {idx < steps.length - 1 && <div style={{ width: '30px', height: '1px', background: 'var(--border)' }} />}
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
      <div className="cart-empty-state d-flex flex-column align-items-center justify-content-center vh-100 bg-bg text-center">
        <HiOutlineShoppingBag size={80} className="text-gold mb-4 opacity-10" />
        <h1 className="font-display display-4 text-t1 mb-3">Your bag is empty</h1>
        <p className="text-t3 mb-5 tracking-wide max-w-sm">Browse the collection to add a watch you’d like to wear every day.</p>
        <Link to="/allcollection" className="btn-gold px-5 py-3 text-uppercase">Shop the line</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <style>{`
        .cart-page {
          background: var(--bg);
          color: var(--t1);
          min-height: 100vh;
          padding-top: 120px;
          padding-bottom: 100px;
        }

        .cart-item {
          border-bottom: 1px solid var(--border);
          padding: 32px 0;
        }
        .cart-item:first-child { border-top: 1px solid var(--border); }

        .item-image-box {
          width: 140px;
          height: 140px;
          background: #FFFFFF;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: hidden;
        }

        .item-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.5s ease;
        }
        .item-image-box:hover .item-image { transform: scale(1.05); }

        .qty-stepper-cart {
          display: flex;
          align-items: center;
          border: 1px solid var(--border);
          background: transparent;
        }
        .qty-btn-cart {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: var(--t1);
          transition: var(--transition);
        }
        .qty-btn-cart:hover { background: var(--bg-1); }
        .qty-val-cart {
          width: 40px;
          text-align: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .acquisition-summary {
          position: sticky;
          top: 120px;
          background: #FFFFFF;
          border: 1px solid var(--border);
          padding: 40px;
        }

        .summary-label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--t3);
          margin-bottom: 24px;
          display: block;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          font-size: 0.875rem;
          color: var(--t2);
        }

        .summary-total-row {
          border-top: 1px solid var(--border);
          margin-top: 24px;
          padding-top: 24px;
          color: var(--t1);
        }

        .action-link-btn {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--t3);
          background: transparent;
          border: none;
          padding: 0;
          transition: var(--transition);
        }
        .action-link-btn:hover { color: var(--gold); }
        .action-link-btn.danger:hover { color: #dc3545; }

        @media (max-width: 991px) {
          .item-image-box { width: 100px; height: 100px; }
          .acquisition-summary { margin-top: 48px; }
        }
      `}</style>

      <div className="container">
        <CheckoutStepper currentStep="cart" />
        
        <div className="row g-5">
          {/* LEFT: ITEM LIST */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-end mb-5">
               <h1 className="font-display h1 m-0">Your bag</h1>
               <span className="section-label m-0">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
            </div>

            <div className="cart-list">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id + JSON.stringify(item.variants || {})}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="cart-item"
                  >
                    <div className="row align-items-center g-4">
                      <div className="col-auto">
                        <Link to={`/product/${item.id}`} className="item-image-box">
                          <img src={item.imageGallery[0]} alt={item.name} className="item-image" />
                        </Link>
                      </div>
                      <div className="col">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <span className="section-label-gold mb-1" style={{ fontSize: '0.6rem' }}>{item.category}</span>
                            <h3 className="h5 font-display m-0 mb-1">{item.name}</h3>
                            {item.variants && (
                              <p className="x-small text-t3 fw-bold uppercase tracking-widest m-0">
                                {item.variants.size} • {item.variants.color} • {item.variants.strap}
                              </p>
                            )}
                          </div>
                          <div className="text-end">
                            <span className="small fw-bold">₹{item.price.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-4">
                          <div className="qty-stepper-cart">
                            <button className="qty-btn-cart" onClick={() => updateQty(item.id, item.variants, item.qty - 1)}>
                               {item.qty === 1 ? <HiOutlineTrash size={14} /> : <HiMinus size={14} />}
                            </button>
                            <span className="qty-val-cart">{item.qty}</span>
                            <button className="qty-btn-cart" onClick={() => updateQty(item.id, item.variants, item.qty + 1)}>
                               <HiPlus size={14} />
                            </button>
                          </div>
                          <div className="d-flex gap-4">
                            <button className="action-link-btn" onClick={() => moveToSaved(item.id, item.variants)}>Save for later</button>
                            <button className="action-link-btn danger" onClick={() => removeItem(item.id, item.variants)}>Remove</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* SAVED */}
            {savedItems.length > 0 && (
              <div className="mt-5 pt-5">
                <span className="summary-label">Saved for later</span>
                <div className="row g-4">
                   {savedItems.map(item => (
                      <div key={item.id + JSON.stringify(item.variants || {})} className="col-md-6">
                        <div className="bg-white border border-border p-3 d-flex gap-3 align-items-center">
                           <img src={item.imageGallery[0]} style={{ width: 60, height: 60, objectFit: 'contain' }} alt="" />
                           <div className="flex-grow-1">
                              <h4 className="small fw-bold m-0 mb-1">{item.name}</h4>
                              <div className="d-flex gap-3">
                                 <button className="action-link-btn text-gold" onClick={() => moveToCart(item.id, item.variants)}>RESTORE</button>
                                 <button className="action-link-btn danger" onClick={() => removeSaved(item.id, item.variants)}>DELETE</button>
                              </div>
                           </div>
                        </div>
                      </div>
                   ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="col-lg-4">
            <div className="acquisition-summary">
                <span className="summary-label">Order summary</span>
              
              <div className="summary-row">
                <span>Subtotal</span>
                <span className="fw-bold">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="text-success fw-bold text-uppercase tracking-widest small">Complimentary</span>
              </div>
              <div className="summary-row">
                <span>Tax Allocation</span>
                <span className="text-t3">₹{(totalPrice * 0.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })} (Estimated)</span>
              </div>

              <div className="summary-total-row d-flex justify-content-between align-items-end mb-5">
                <span className="section-label m-0">Estimated total</span>
                <span className="h3 fw-bold m-0">₹{(totalPrice * 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>

              <button className="btn-gold w-100 py-3 mb-4" onClick={() => navigate('/checkout')}>
                Go to checkout
              </button>
              
              <div className="d-flex align-items-center gap-2 justify-content-center opacity-40">
                <HiOutlineShieldCheck className="text-gold" />
                <span className="x-small fw-bold tracking-widest uppercase">Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

