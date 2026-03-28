import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineCreditCard, 
  HiOutlineBanknotes, 
  HiOutlineTruck, 
  HiOutlineShieldCheck,
  HiChevronDown,
  HiChevronUp,
  HiArrowLeft
} from 'react-icons/hi2';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { initiateRazorpayPayment } from '../lib/razorpay';

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

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, appliedCoupon, applyCoupon } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState('address');
  const [method, setMethod] = useState('online');
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const [addressData, setAddressData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: 'Pune',
    zip: ''
  });

  useEffect(() => {
    if (items.length === 0) navigate('/cart', { replace: true });
  }, [items, navigate]);

  if (items.length === 0) return null;

  const subtotal = items.reduce((s, i) => s + (i.dealPrice || i.price) * i.qty, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const finalTotal = subtotal - discountAmount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'CHRONIX10') {
      applyCoupon({ code: 'CHRONIX10', discount: 10 });
      toast.success('CHRONIX10 Applied');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handlePlaceOrder = async () => {
    if (!auth.currentUser) {
      toast.error('Authentication Required');
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
        if (!rezResponse.ok) throw new Error(orderData.error || 'Payment Gateway Error');

        await initiateRazorpayPayment({
          orderData,
          userInfo: { email: auth.currentUser.email },
          onSuccess: async (response) => {
            const verifyingToast = toast.loading('Synchronizing...');
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
                toast.success('Order Recorded', { id: verifyingToast });
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
          toast.success('Reservation Confirmed');
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
    <div className="checkout-page pb-5">
      <style>{`
        .checkout-page { background: var(--bg); min-height: 100vh; padding-top: 120px; color: var(--t1); font-family: var(--font-body); }
        
        .checkout-title { font-family: var(--font-display); font-size: 2.5rem; font-weight: 700; margin-bottom: 40px; }
        
        .form-group { margin-bottom: 24px; }
        .form-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: var(--t3); margin-bottom: 10px; display: block; }
        .form-control-minimal { 
          width: 100%; 
          border: 1px solid var(--border); 
          padding: 18px; 
          font-size: 0.9rem; 
          border-radius: 8px; 
          background: #fff;
          outline: none;
          transition: var(--transition);
        }
        .form-control-minimal:focus { border-color: var(--gold); box-shadow: 0 0 15px rgba(212,175,55,0.05); }

        .payment-option { 
          border: 1px solid var(--border); 
          border-radius: 12px; 
          padding: 24px; 
          cursor: pointer; 
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 16px;
          background: #fff;
        }
        .payment-option:hover { border-color: var(--gold); transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.03); }
        .payment-option.active { border-color: var(--gold); background: var(--bg-2); }
        .payment-icon { color: var(--gold); font-size: 1.8rem; }

        .summary-panel { 
          position: sticky; 
          top: 120px; 
          border: 1px solid var(--border); 
          padding: 40px; 
          border-radius: 16px; 
          background: #fff; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.03);
        }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 0.9rem; color: var(--t2); }
        
        .btn-action { width: 100%; padding: 18px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em; border: none; border-radius: 4px; transition: var(--transition); }
      `}</style>

      <div className="container">
        <CheckoutStepper currentStep={currentStep} />
        
        <div className="row g-5">
          <div className="col-lg-8">
            <h1 className="checkout-title">
              {currentStep === 'address' ? 'Shipping Information' : 'Select Payment Method'}
            </h1>

            <AnimatePresence mode="wait">
              {currentStep === 'address' ? (
                <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control-minimal" placeholder="John Doe" value={addressData.fullName} onChange={e => setAddressData({...addressData, fullName: e.target.value})} />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="text" className="form-control-minimal" placeholder="+91 00000 00000" value={addressData.phone} onChange={e => setAddressData({...addressData, phone: e.target.value})} />
                    </div>
                    <div className="col-12 form-group">
                      <label className="form-label">Address</label>
                      <input type="text" className="form-control-minimal" placeholder="Street, Apartment, Locality" value={addressData.address} onChange={e => setAddressData({...addressData, address: e.target.value})} />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="form-label">City</label>
                      <input type="text" className="form-control-minimal" value={addressData.city} readOnly />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="form-label">Postal Code</label>
                      <input type="text" className="form-control-minimal" placeholder="411011" value={addressData.zip} onChange={e => setAddressData({...addressData, zip: e.target.value})} />
                    </div>
                  </div>

                  <div className="mt-5">
                    <button className="btn-gold w-100 py-3 transition-all hover:-translate-y-1" onClick={() => {
                        if(!addressData.fullName || !addressData.address) return toast.error('Please fill in all required fields');
                        setCurrentStep('payment');
                    }}>Continue to Payment</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className={`payment-option ${method === 'online' ? 'active' : ''}`} onClick={() => setMethod('online')}>
                    <HiOutlineCreditCard className="payment-icon" />
                    <div>
                      <h4 className="h6 m-0 fw-bold">Online Payment</h4>
                      <p className="small text-t3 m-0">UPI, Cards, Wallets, and NetBanking</p>
                    </div>
                  </div>
                  <div className={`payment-option ${method === 'cod' ? 'active' : ''}`} onClick={() => setMethod('cod')}>
                    <HiOutlineBanknotes className="payment-icon" />
                    <div>
                      <h4 className="h6 m-0 fw-bold">Cash on Delivery</h4>
                      <p className="small text-t3 m-0">Pay upon physical hand-over</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-top border-border">
                    <button className="btn-gold w-100 py-3 mb-3 transition-all hover:-translate-y-1" onClick={handlePlaceOrder} disabled={loading}>
                       {loading ? 'Processing Transaction...' : 'Place Order'}
                    </button>
                    <button className="btn w-100 text-t3 small uppercase fw-bold d-flex align-items-center justify-content-center gap-2" onClick={() => setCurrentStep('address')}>
                       <HiArrowLeft size={14} /> Back to Shipping
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="col-lg-4">
             <div className="summary-panel">
                <div className="d-flex justify-content-between align-items-center mb-5">
                   <h2 className="section-label m-0">Order Summary</h2>
                   <button className="btn p-0 text-gold" onClick={() => setShowSummary(!showSummary)}>
                      {showSummary ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
                   </button>
                </div>

                <AnimatePresence>
                   {showSummary && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4 border-bottom border-border pb-3">
                        {items.map(item => (
                          <div key={item.id} className="d-flex justify-content-between mb-3 small">
                             <span className="text-t2 text-truncate pe-3">{item.name} × {item.qty}</span>
                             <span className="text-t1 font-mono">₹{((item.dealPrice || item.price) * item.qty).toLocaleString()}</span>
                          </div>
                        ))}
                     </motion.div>
                   )}
                </AnimatePresence>

                <div className="summary-row">
                   <span>Subtotal</span>
                   <span className="text-t1 font-mono">₹{subtotal.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                   <div className="summary-row text-success">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="font-mono">- ₹{discountAmount.toLocaleString()}</span>
                   </div>
                )}
                <div className="summary-row">
                   <span>Shipping</span>
                   <span className="text-success fw-bold">FREE</span>
                </div>

                <div className="summary-row align-items-end mt-5 pt-4 border-top border-border mb-5">
                   <span className="section-label m-0 text-gold">Total Amount</span>
                   <span className="h2 text-t1 m-0 fw-bold font-mono">₹{finalTotal.toLocaleString()}</span>
                </div>

                <div className="promo-input mb-5 position-relative">
                   <input 
                     type="text" 
                     className="form-control-minimal pe-5" 
                     placeholder="PROMO CODE" 
                     style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                     value={promoCode}
                     onChange={e => setPromoCode(e.target.value)}
                   />
                   <button className="position-absolute end-0 top-50 translate-middle-y btn p-0 text-gold fw-bold me-3" style={{ fontSize: '0.7rem' }} onClick={handleApplyPromo}>APPLY</button>
                </div>

                <div className="text-center opacity-30 mt-5">
                   <HiOutlineShieldCheck size={40} className="mb-2" />
                   <p className="x-small tracking-widest uppercase m-0">Secure Gateway Integration</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

