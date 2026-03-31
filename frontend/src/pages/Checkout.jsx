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
  HiOutlineArrowLeft,
  HiOutlineMapPin
} from 'react-icons/hi2';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { initiateRazorpayPayment } from '../lib/razorpay';

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

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, appliedCoupon, applyCoupon } = useCartStore();
  const { profile } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState('address');
  const [method, setMethod] = useState('online');
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [autoLocationAttempted, setAutoLocationAttempted] = useState(false);

  const [addressData, setAddressData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: 'Pune',
    zip: ''
  });

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return toast.error('Location not available on this device');
    const locToast = toast.loading('Locating you...');
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data && data.address) {
          const { road, suburb, city, town, village, postcode } = data.address;
          setAddressData(prev => ({
            ...prev,
            address: prev.address || road || suburb || '',
            city: city || town || village || prev.city,
            zip: postcode || prev.zip
          }));
          toast.success('Address found', { id: locToast });
        }
      } catch (err) { toast.error("Couldn't fetch location", { id: locToast }); }
    }, () => toast.error('Location permission blocked', { id: locToast }));
  };

  useEffect(() => {
    if (items.length === 0) navigate('/cart', { replace: true });
    
    const savedLocally = localStorage.getItem('chronix-checkout-address');
    if (savedLocally) {
      try { setAddressData(JSON.parse(savedLocally)); } catch (err) {}
    } else if (profile) {
      setAddressData(prev => ({
        ...prev,
        fullName: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: 'Pune',
      }));
    }
  }, [items, navigate, profile]);

  useEffect(() => {
    if (currentStep === 'address' && !autoLocationAttempted) {
      handleDetectLocation();
      setAutoLocationAttempted(true);
    }
  }, [currentStep, autoLocationAttempted]);

  if (items.length === 0) return null;

  const subtotal = items.reduce((s, i) => s + (i.dealPrice || i.price) * i.qty, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const grandTotal = (subtotal - discountAmount) * 1.18; // Including GST estimate

  const handleApplyPromo = async () => {
    const trimmed = promoCode.trim().toUpperCase();
    if (!trimmed) return toast.error('Enter a code first');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/coupons`);
      const { coupons } = await res.json();
      const match = coupons.find(c => c.code.toUpperCase() === trimmed);
      if (match) {
        applyCoupon({ code: match.code, discount: Number(match.discount) });
        toast.success(`Code applied. ${match.discount}% off`);
      } else { toast.error('Code not valid'); }
    } catch (err) { toast.error("Couldn't verify code"); }
  };

  const handlePlaceOrder = async () => {
    if (loading || !auth.currentUser) return;
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const orderPayload = {
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          image: item.imageGallery[0],
          selectedVariant: item.variants || null,
          priceAtPurchase: Number(item.dealPrice || item.price || 0),
          qty: item.qty,
          sku: item.sku || `CHX-${item.id.slice(0, 6)}`,
          variantLabel: item.variants ? Object.values(item.variants).join(' • ') : 'Standard'
        })),
        totalPrice: grandTotal,
        paymentMethod: method,
        address: addressData,
        couponCode: appliedCoupon?.code
      };

      if (method === 'online') {
        const rezResponse = await fetch(`${backendUrl}/api/orders/create-razorpay-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ amount: grandTotal })
        });
        const orderData = await rezResponse.json();
        if (!rezResponse.ok) throw new Error(orderData.error);

        await initiateRazorpayPayment({
          orderData,
          userInfo: { email: auth.currentUser.email },
          onSuccess: async (response) => {
            const verifyingToast = toast.loading('Confirming payment...');
            const finalResponse = await fetch(`${backendUrl}/api/orders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ ...orderPayload, razorpayDetails: response })
            });
            if (finalResponse.ok) {
              const data = await finalResponse.json();
              toast.success('Order placed', { id: verifyingToast });
              clearCart();
              navigate('/confirmation', { state: { orderId: data.orderId, displayId: data.orderDisplayId } });
            }
          },
          onFailure: (err) => toast.error(err)
        });
      } else {
        const response = await fetch(`${backendUrl}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(orderPayload)
        });
        if (response.ok) {
          const data = await response.json();
          clearCart();
          toast.success('Order placed');
          navigate('/confirmation', { state: { orderId: data.orderId, displayId: data.orderDisplayId } });
        }
      }
    } catch (error) { toast.error(error.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="checkout-page">
      <style>{`
        .checkout-page {
          background: var(--bg);
          color: var(--t1);
          min-height: 100vh;
          padding-top: 120px;
          padding-bottom: 100px;
        }

        .checkout-section-box {
          background: #FFFFFF;
          border: 1px solid var(--border);
          padding: 40px;
          margin-bottom: 30px;
        }

        .payment-card {
          border: 1px solid var(--border);
          padding: 30px;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 20px;
          background: transparent;
        }
        .payment-card.active {
          border-color: var(--gold);
          background: var(--bg-1);
        }
        .payment-card:hover:not(.active) {
          background: var(--bg-1);
        }

        .acquisition-statement {
          position: sticky;
          top: 120px;
          background: #FFFFFF;
          border: 1px solid var(--border);
          padding: 40px;
        }

        .statement-label {
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

        .statement-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          font-size: 0.875rem;
          color: var(--t2);
        }

        .statement-total-row {
          border-top: 1px solid var(--border);
          margin-top: 24px;
          padding-top: 24px;
          color: var(--t1);
        }

        .item-row-sm {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 12px;
          color: var(--t3);
        }
      `}</style>

      <div className="container">
        <CheckoutStepper currentStep={currentStep} />
        
        <div className="row g-5">
          {/* LEFT: FORMS */}
          <div className="col-lg-8">
            <AnimatePresence>
              {currentStep === 'address' ? (
                <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="checkout-section-box">
                    <div className="d-flex justify-content-between align-items-end mb-5">
                       <h2 className="font-display h3 m-0">Shipping address</h2>
                       <button onClick={handleDetectLocation} className="btn p-0 x-small fw-bold text-gold tracking-widest uppercase">
                          <HiOutlineMapPin className="me-1" /> Use current location
                       </button>
                    </div>

                    <div className="row">
                       <div className="col-md-6 mb-4">
                          <label className="label-refined mb-2">Full name</label>
                          <input type="text" className="input-refined" placeholder="Anastasia Grey" value={addressData.fullName} onChange={e => setAddressData({...addressData, fullName: e.target.value})} />
                       </div>
                       <div className="col-md-6 mb-4">
                          <label className="label-refined mb-2">Phone number</label>
                          <input type="text" className="input-refined" placeholder="+91 00000 00000" value={addressData.phone} onChange={e => setAddressData({...addressData, phone: e.target.value})} />
                       </div>
                       <div className="col-12 mb-4">
                          <label className="label-refined mb-2">Street address</label>
                          <input type="text" className="input-refined" placeholder="Suite 42, Global Plaza" value={addressData.address} onChange={e => setAddressData({...addressData, address: e.target.value})} />
                       </div>
                       <div className="col-md-6 mb-4">
                          <label className="label-refined mb-2">City</label>
                          <input type="text" className="input-refined" value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value})} />
                       </div>
                       <div className="col-md-6 mb-4">
                          <label className="label-refined mb-2">PIN / ZIP</label>
                          <input type="text" className="input-refined" placeholder="411011" value={addressData.zip} onChange={e => setAddressData({...addressData, zip: e.target.value})} />
                       </div>
                    </div>

                    <div className="mt-5 pt-3">
                       <button className="btn-gold w-100 py-3" onClick={() => {
                          if(!addressData.fullName || !addressData.address) return toast.error('Add your name and address first');
                          localStorage.setItem('chronix-checkout-address', JSON.stringify(addressData));
                          setCurrentStep('payment');
                       }}>Save address</button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="checkout-section-box">
                    <h2 className="font-display h3 mb-5">Payment</h2>
                    
                    <div className="row g-4">
                       <div className="col-12">
                          <div className={`payment-card ${method === 'online' ? 'active' : ''}`} onClick={() => setMethod('online')}>
                             <HiOutlineCreditCard className="h3 text-gold m-0" />
                             <div>
                                <h4 className="small fw-bold m-0 mb-1">Online payment</h4>
                                <p className="x-small text-t3 m-0 uppercase tracking-wider">UPI • Cards • Net banking</p>
                             </div>
                          </div>
                       </div>
                       <div className="col-12">
                          <div className={`payment-card ${method === 'cod' ? 'active' : ''}`} onClick={() => setMethod('cod')}>
                             <HiOutlineBanknotes className="h3 text-gold m-0" />
                             <div>
                                <h4 className="small fw-bold m-0 mb-1">Cash on delivery</h4>
                                <p className="x-small text-t3 m-0 uppercase tracking-wider">Pay when it arrives</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="mt-5 pt-5 border-top border-border">
                       <button className="btn-gold w-100 py-3 mb-4" onClick={handlePlaceOrder} disabled={loading}>
                          {loading ? 'Placing order...' : 'Place order'}
                       </button>
                       <button className="btn w-100 x-small fw-bold text-t3 tracking-widest uppercase d-flex align-items-center justify-content-center gap-2" onClick={() => setCurrentStep('address')}>
                          <HiOutlineArrowLeft /> EDIT ADDRESS
                       </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="col-lg-4">
            <div className="acquisition-statement">
              <div className="d-flex justify-content-between align-items-center mb-4">
                 <span className="statement-label m-0 border-0">Order summary</span>
                 <button className="btn p-0 x-small fw-bold text-gold" onClick={() => setShowSummary(!showSummary)}>
                    {showSummary ? 'Hide' : 'Show'}
                 </button>
              </div>

              <AnimatePresence>
                {showSummary && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4 border-bottom border-border pb-3">
                    {items.map(item => (
                       <div key={item.id + JSON.stringify(item.variants || {})} className="item-row-sm">
                          <span className="text-truncate flex-grow-1 pe-3">{item.name} × {item.qty}</span>
                          <span className="fw-bold">₹{((item.dealPrice || item.price) * item.qty).toLocaleString()}</span>
                       </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="statement-row">
                <span>Items</span>
                <span className="fw-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                 <div className="statement-row text-success">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="fw-bold">- ₹{discountAmount.toLocaleString()}</span>
                 </div>
              )}
              <div className="statement-row">
                <span>Shipping</span>
                <span className="text-success fw-bold x-small uppercase tracking-widest">Free</span>
              </div>

              <div className="statement-total-row d-flex justify-content-between align-items-end mb-5">
                <span className="section-label m-0">Estimated total</span>
                <span className="h3 fw-bold m-0 text-gold">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="promo-input mb-5 position-relative">
                 <input 
                   type="text" 
                   className="input-refined pe-5 x-small fw-bold tracking-widest uppercase" 
                   placeholder="Promo code" 
                   value={promoCode}
                   onChange={e => setPromoCode(e.target.value)}
                 />
                 <button className="position-absolute end-0 top-50 translate-middle-y btn p-0 text-gold fw-bold me-4 x-small" onClick={handleApplyPromo}>APPLY</button>
              </div>

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



