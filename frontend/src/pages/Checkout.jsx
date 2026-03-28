import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineCreditCard, 
  HiOutlineBanknotes, 
  HiOutlineTruck, 
  HiOutlineShieldCheck,
  HiChevronDown,
  HiChevronUp
} from 'react-icons/hi2';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { initiateRazorpayPayment } from '../lib/razorpay';

// Stepper Component
const CheckoutStepper = ({ currentStep }) => {
  const steps = [
    { label: 'Archive', id: 'cart' },
    { label: 'Logistics', id: 'address' },
    { label: 'Settlement', id: 'payment' }
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
              0{idx + (currentStep === 'cart' ? 1 : currentStep === 'address' ? 2 : 3)}
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
        .form-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--t3); margin-bottom: 8px; display: block; }
        .form-control-minimal { 
          width: 100%; 
          border: 1px solid var(--border); 
          padding: 16px; 
          font-size: 0.9rem; 
          border-radius: 4px; 
          background: #fff;
          outline: none;
          transition: var(--transition);
        }
        .form-control-minimal:focus { border-color: var(--gold); }

        .payment-option { 
          border: 1px solid var(--border); 
          border-radius: 8px; 
          padding: 24px; 
          cursor: pointer; 
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 16px;
        }
        .payment-option:hover { border-color: var(--gold); }
        .payment-option.active { border-color: var(--gold); background: var(--bg-2); }
        .payment-icon { color: var(--gold); font-size: 1.5rem; }

        .summary-panel { position: sticky; top: 120px; border: 1px solid var(--border); padding: 40px; border-radius: 12px; background: #fff; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 0.9rem; }
        
        .btn-action { width: 100%; padding: 18px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em; border: none; border-radius: 4px; transition: var(--transition); }
      `}</style>

      <div className="container">
        <CheckoutStepper currentStep={currentStep} />
        
        <div className="row g-5">
          <div className="col-lg-8">
            <h1 className="checkout-title">
              {currentStep === 'address' ? 'Logistics Authorization' : 'Settlement Protocol'}
            </h1>

            <AnimatePresence mode="wait">
              {currentStep === 'address' ? (
                <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control-minimal" value={addressData.fullName} onChange={e => setAddressData({...addressData, fullName: e.target.value})} />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="form-label">Phone Reference</label>
                      <input type="text" className="form-control-minimal" value={addressData.phone} onChange={e => setAddressData({...addressData, phone: e.target.value})} />
                    </div>
                    <div className="col-12 form-group">
                      <label className="form-label">Shipping Destination</label>
                      <input type="text" className="form-control-minimal" value={addressData.address} onChange={e => setAddressData({...addressData, address: e.target.value})} />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="form-label">Archive City</label>
                      <input type="text" className="form-control-minimal" value={addressData.city} readOnly />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="form-label">Postal Registry</label>
                      <input type="text" className="form-control-minimal" value={addressData.zip} onChange={e => setAddressData({...addressData, zip: e.target.value})} />
                    </div>
                  </div>

                  <div className="mt-5">
                    <button className="btn-gold w-100 py-3" onClick={() => {
                        if(!addressData.fullName || !addressData.address) return toast.error('Incomplete credentials');
                        setCurrentStep('payment');
                    }}>Continue to Settlement</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="payment-option active" onClick={() => setMethod('online')}>
                    <HiOutlineCreditCard className="payment-icon" />
                    <div>
                      <h4 className="h6 m-0 fw-bold">Electronic Settlement</h4>
                      <p className="small text-t3 m-0">UPI, Global Cards, Digital Wallets</p>
                    </div>
                  </div>
                  <div className="payment-option" onClick={() => setMethod('cod')}>
                    <HiOutlineBanknotes className="payment-icon" />
                    <div>
                      <h4 className="h6 m-0 fw-bold">Boutique Pickup / COD</h4>
                      <p className="small text-t3 m-0">In-person verification required</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-top border-border">
                    <button className="btn-gold w-100 py-3 mb-3" onClick={handlePlaceOrder} disabled={loading}>
                       {loading ? 'Processing Protocol...' : 'Finalize Acquisition'}
                    </button>
                    <button className="btn w-100 text-t3 small uppercase fw-bold" onClick={() => setCurrentStep('address')}>Return to Logistics</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="col-lg-4">
             <div className="summary-panel">
                <div className="d-flex justify-content-between align-items-center mb-5">
                   <h2 className="section-label m-0">Acquisition Summary</h2>
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
                   <span className="text-t3">Archive Value</span>
                   <span className="text-t1 font-mono">₹{subtotal.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="summary-row text-success">
                     <span>Privilege Discount ({appliedCoupon.code})</span>
                     <span className="font-mono">- ₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="summary-row">
                   <span className="text-t3">Logistics Fee</span>
                   <span className="text-success fw-bold">COMPLIMENTARY</span>
                </div>

                <div className="summary-row align-items-end mt-5 pt-4 border-top border-border mb-5">
                   <span className="section-label m-0 text-gold">Final Investment</span>
                   <span className="h2 text-t1 m-0 fw-bold font-mono">₹{finalTotal.toLocaleString()}</span>
                </div>

                <div className="promo-input mb-5 position-relative">
                   <input 
                     type="text" 
                     className="form-control-minimal pe-5" 
                     placeholder="PRIVILEGE CODE" 
                     style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                     value={promoCode}
                     onChange={e => setPromoCode(e.target.value)}
                   />
                   <button className="position-absolute end-0 top-50 translate-middle-y btn p-0 text-gold fw-bold me-3" style={{ fontSize: '0.7rem' }} onClick={handleApplyPromo}>APPLY</button>
                </div>

                <div className="text-center opacity-30 mt-5">
                   <HiOutlineShieldCheck size={40} className="mb-2" />
                   <p className="x-small tracking-widest uppercase m-0">Encrypted Institutional Gateway</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

