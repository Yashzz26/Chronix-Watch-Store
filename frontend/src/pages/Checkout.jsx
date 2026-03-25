import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineCreditCard, 
  HiOutlineBanknotes, 
  HiCheckBadge,
  HiOutlineTruck,
  HiOutlineMapPin,
  HiOutlineTag,
  HiOutlineGift,
  HiOutlineShieldCheck,
  HiOutlineChevronDown,
  HiOutlineChevronUp
} from 'react-icons/hi2';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { initiateRazorpayPayment } from '../lib/razorpay';

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
              {idx < steps.findIndex(s => s.id === currentStep) ? <HiCheckBadge size={14} className="text-gold" /> : idx + 1}
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

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, appliedCoupon, applyCoupon, removeCoupon } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState('address');
  const [method, setMethod] = useState('online');
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [location, setLocation] = useState('Pune, Maharashtra');
  const [deliveryDate, setDeliveryDate] = useState('28 March');

  const [addressData, setAddressData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: 'Pune',
    zip: ''
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items, navigate]);

  if (items.length === 0) return null;

  const subtotal = items.reduce((s, i) => s + (i.dealPrice || i.price) * i.qty, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const taxes = subtotal * 0.18; // 18% GST example
  const finalTotal = subtotal - discountAmount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'CHRONIX10') {
      applyCoupon({ code: 'CHRONIX10', discount: 10 });
      toast.success('🎉 You saved ₹' + (subtotal * 0.1).toLocaleString());
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handlePlaceOrder = async () => {
    if (!auth.currentUser) {
      toast.error('Please login to place an order');
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const orderPayload = {
        items,
        totalPrice: finalTotal,
        paymentMethod: method,
        address: addressData,
        isGift,
        orderNote,
        couponCode: appliedCoupon?.code
      };

      if (method === 'online') {
        const rezResponse = await fetch(`${backendUrl}/api/orders/create-razorpay-order`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount: finalTotal })
        });
        
        const orderData = await rezResponse.json();
        if (!rezResponse.ok) throw new Error(orderData.error || 'Failed to create payment order');

        await initiateRazorpayPayment({
          orderData,
          userInfo: { email: auth.currentUser.email },
          onSuccess: async (response) => {
            const verifyingToast = toast.loading('Verifying payment...');
            try {
              const finalResponse = await fetch(`${backendUrl}/api/orders`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...orderPayload, razorpayDetails: response })
              });
              
              if (finalResponse.ok) {
                const data = await finalResponse.json();
                toast.success('Payment Verified & Order Placed', { id: verifyingToast });
                clearCart();
                navigate('/confirmation', { state: { orderId: data.orderId } });
              } else {
                throw new Error('Verification failed');
              }
            } catch (err) {
              toast.error(err.message, { id: verifyingToast });
            } finally {
              setLoading(false);
            }
          },
          onFailure: (err) => {
            toast.error(err);
            setLoading(false);
          }
        });
      } else {
        const response = await fetch(`${backendUrl}/api/orders`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderPayload)
        });

        if (response.ok) {
          const data = await response.json();
          clearCart();
          toast.success('Reservation confirmed');
          navigate('/confirmation', { state: { orderId: data.orderId } });
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to place order');
        }
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container py-5 my-5">
      <style>{`
        .checkout-container {
          background: #080808;
          color: #F0EDE8;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }
        .form-input {
          width: 100%;
          background: #0F0F0F;
          border: 1px solid #1e1e1e;
          padding: 14px;
          border-radius: 8px;
          color: #fff;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus { border-color: #D4AF37; }
        .payment-card {
          background: #0F0F0F;
          border: 2px solid #1e1e1e;
          border-radius: 12px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
        }
        .payment-card.selected {
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.05);
        }
        .summary-box {
          background: #0F0F0F;
          border: 1px solid #1e1e1e;
          border-radius: 16px;
          padding: 32px;
        }
        .delivery-pill {
          background: rgba(212,175,55,0.05);
          border: 1px solid rgba(212,175,55,0.1);
          border-radius: 12px;
          padding: 16px;
        }
        .btn-gold-action {
          background: #D4AF37;
          color: #000;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          padding: 16px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.25s;
        }
        .btn-gold-action:hover { background: #F0D060; transform: translateY(-1px); }
      `}</style>

      <div className="container">
        <CheckoutStepper currentStep={currentStep} />
        
        <div className="row g-5">
          {/* Main Content */}
          <div className="col-12 col-lg-8">
            <AnimatePresence mode="wait">
              {currentStep === 'address' && (
                <motion.div 
                  key="address"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="section-label mb-4">Shipping Destination</h2>
                  <div className="row g-3 mb-5">
                    <div className="col-12 col-md-6">
                      <input type="text" placeholder="Full Name" className="form-input" value={addressData.fullName} onChange={e => setAddressData({...addressData, fullName: e.target.value})} />
                    </div>
                    <div className="col-12 col-md-6">
                      <input type="text" placeholder="Phone Number" className="form-input" value={addressData.phone} onChange={e => setAddressData({...addressData, phone: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <input type="text" placeholder="Street Address" className="form-input" value={addressData.address} onChange={e => setAddressData({...addressData, address: e.target.value})} />
                    </div>
                    <div className="col-12 col-md-6">
                      <input type="text" placeholder="City" className="form-input" value={addressData.city} readOnly />
                    </div>
                    <div className="col-12 col-md-6">
                      <input type="text" placeholder="Zip Code" className="form-input" value={addressData.zip} onChange={e => setAddressData({...addressData, zip: e.target.value})} />
                    </div>
                  </div>

                  <div className="delivery-pill mb-5 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-s2 p-3 rounded-circle text-gold"><HiOutlineTruck size={24} /></div>
                      <div>
                        <p className="text-white fw-bold mb-0">Express Concierge Delivery</p>
                        <p className="text-t3 mb-0" style={{ fontSize: '0.8rem' }}>Deliver to {location} — by {deliveryDate}</p>
                      </div>
                    </div>
                    <button className="btn p-0 text-gold fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Change</button>
                  </div>

                  <button 
                    className="btn-gold-action w-100" 
                    onClick={() => {
                      if (!addressData.fullName || !addressData.address) return toast.error('Please fill all fields');
                      setCurrentStep('payment');
                    }}
                  >
                    Proceed to Payment Options
                  </button>
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div 
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="section-label mb-4">Payment Architecture</h2>
                  <div className="row g-4 mb-5">
                    <div className="col-12 col-md-6">
                      <div className={`payment-card ${method === 'online' ? 'selected' : ''}`} onClick={() => setMethod('online')}>
                         <HiOutlineCreditCard size={32} className="mb-3 text-gold" />
                         <h4 className="text-white h5 mb-2">Digital Settlement</h4>
                         <p className="text-t3 mb-0" style={{ fontSize: '0.8rem' }}>UPI, Cards, Net Banking</p>
                         {method === 'online' && <HiCheckBadge className="position-absolute top-0 end-0 m-3 text-gold" size={24} />}
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className={`payment-card ${method === 'cod' ? 'selected' : ''}`} onClick={() => setMethod('cod')}>
                         <HiOutlineBanknotes size={32} className="mb-3 text-gold" />
                         <h4 className="text-white h5 mb-2">Boutique Pickup/COD</h4>
                         <p className="text-t3 mb-0" style={{ fontSize: '0.8rem' }}>Pay upon inspection</p>
                         {method === 'cod' && <HiCheckBadge className="position-absolute top-0 end-0 m-3 text-gold" size={24} />}
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="d-flex align-items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="d-none" checked={isGift} onChange={e => setIsGift(e.target.checked)} />
                      <div className={`rounded d-flex align-items-center justify-content-center transition-all ${isGift ? 'bg-gold' : 'border border-border'}`} style={{ width: 20, height: 20 }}>
                        {isGift && <HiCheckBadge size={14} className="text-black" />}
                      </div>
                      <span className="text-t2 font-body">This is a gift acquisition</span>
                    </label>
                    {isGift && (
                      <motion.textarea 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        placeholder="Add a personalized message for the recipient..."
                        className="form-input mt-3"
                        rows="3"
                        value={orderNote}
                        onChange={e => setOrderNote(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="d-flex gap-3">
                    <button className="btn border border-border text-t3 px-4" onClick={() => setCurrentStep('address')}>Back</button>
                    <button className="btn-gold-action flex-grow-1" onClick={() => setCurrentStep('review')}>Review Order</button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'review' && (
                <motion.div 
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="section-label mb-4">Final Review</h2>
                  <div className="chronix-card p-4 mb-5" style={{ background: '#0F0F0F' }}>
                     <div className="row g-4">
                        <div className="col-12 col-md-6">
                           <p className="text-t3 text-uppercase tracking-widest mb-2" style={{ fontSize: '0.6rem' }}>Ship to</p>
                           <p className="text-white m-0 fw-bold">{addressData.fullName}</p>
                           <p className="text-t2 m-0" style={{ fontSize: '0.85rem' }}>{addressData.address}</p>
                           <p className="text-t2 m-0" style={{ fontSize: '0.85rem' }}>{addressData.city}, {addressData.zip}</p>
                        </div>
                        <div className="col-12 col-md-6">
                           <p className="text-t3 text-uppercase tracking-widest mb-2" style={{ fontSize: '0.6rem' }}>Settlement</p>
                           <p className="text-white m-0 fw-bold">{method === 'online' ? 'Digital Gateway' : 'Pay at Boutique'}</p>
                           <p className="text-gold m-0" style={{ fontSize: '0.85rem' }}>Secure Transaction</p>
                        </div>
                     </div>
                  </div>

                  <button className="btn-gold-action w-100 py-4 shadow-lg" onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Place Absolute Order'}
                  </button>
                  
                  <div className="mt-4 text-center">
                    <button className="btn p-0 text-t3 text-uppercase tracking-widest" style={{ fontSize: '0.65rem' }} onClick={() => setCurrentStep('payment')}>Modify Selection</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="col-12 col-lg-4">
            <div className="summary-box position-sticky" style={{ top: '100px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-label m-0">Consolidated Summary</h3>
                <button className="btn p-0 text-gold" onClick={() => setShowSummary(!showSummary)}>
                   {showSummary ? <HiOutlineChevronUp size={20} /> : <HiOutlineChevronDown size={20} />}
                </button>
              </div>

              <AnimatePresence>
                {showSummary && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4 pb-4 border-bottom border-border border-opacity-25"
                  >
                    {items.map(item => (
                      <div key={item.id} className="d-flex justify-content-between mb-3">
                        <span className="text-t3 text-truncate flex-grow-1 me-3" style={{ fontSize: '0.85rem' }}>{item.name} × {item.qty}</span>
                        <span className="text-t1 font-mono" style={{ fontSize: '0.85rem' }}>₹{((item.dealPrice || item.price) * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-t2">Subtotal</span>
                  <span className="text-white font-mono">₹{subtotal.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="d-flex justify-content-between align-items-center text-success">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-mono">- ₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-t2">Shipping & Handling</span>
                  <span className="text-success font-mono">COMPLIMENTARY</span>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="mb-4">
                <div className="position-relative">
                  <input 
                    type="text" 
                    placeholder="ENTER PROMO CODE" 
                    className="form-input ps-3 text-uppercase" 
                    style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                  />
                  <button onClick={handleApplyPromo} className="position-absolute end-0 top-50 translate-middle-y me-3 btn p-0 text-gold fw-bold" style={{ fontSize: '0.7rem' }}>APPLY</button>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-end pt-3 border-top border-border">
                <span className="section-label m-0">Final Consideration</span>
                <span className="h2 text-gold font-mono fw-bold m-0">₹{finalTotal.toLocaleString()}</span>
              </div>

              <div className="mt-5 pt-4">
                 <div className="d-flex justify-content-around mb-4 opacity-40 grayscale-all">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" height="14" alt="UPI" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Visa.svg" height="12" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" height="14" alt="Mastercard" />
                 </div>
                 <div className="d-flex align-items-center justify-content-center gap-2 text-t3" style={{ fontSize: '0.65rem' }}>
                    <HiOutlineShieldCheck size={14} className="text-gold" />
                    <span className="text-uppercase tracking-widest">Instituional Encryption Active</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

