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
  const { items, clearCart, appliedCoupon, applyCoupon, removeCoupon } = useCartStore();
  const { profile } = useAuthStore();
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [currentStep, setCurrentStep] = useState('address');
  const [method, setMethod] = useState('online');
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [autoLocationAttempted, setAutoLocationAttempted] = useState(false);

  const [addressData, setAddressData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip: ''
  });

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return toast.error('Location not available on this device');
    const locToast = toast.loading('Detecting your location...');
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;
        
        // Primary: OpenCage API (Detailed)
        let url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
        let res = await fetch(url);
        let data = await res.json();

        if (data && data.results && data.results.length > 0) {
          const comp = data.results[0].components;
          const formatted = data.results[0].formatted;

          const street = comp.road || comp.neighbourhood || comp.suburb || comp.building || comp.attraction || "";
          const city = comp.city || comp.town || comp.village || comp.municipality || "";
          
          setAddressData(prev => ({
            ...prev,
            address: street || formatted.split(',')[0],
            city: city,
            state: comp.state || "",
            country: comp.country || "",
            zip: comp.postcode || ""
          }));
          toast.success('Address auto-filled', { id: locToast });
        } else {
          // Fallback: Nominatim (Basic)
          res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          data = await res.json();
          if (data && data.address) {
            const { road, suburb, city, town, village, state, country, postcode } = data.address;
            setAddressData(prev => ({
              ...prev,
              address: road || suburb || '',
              city: city || town || village || '',
              state: state || '',
              country: country || '',
              zip: postcode || ''
            }));
            toast.success('Address auto-filled', { id: locToast });
          } else {
            throw new Error('Could not resolve address');
          }
        }
      } catch (err) { 
        console.error('Location error:', err);
        toast.error("Couldn't fetch location details", { id: locToast }); 
      }
    }, (error) => {
      const msg = error.code === 1 ? 'Location permission denied' : 'Unable to retrieve location';
      toast.error(msg, { id: locToast });
    });
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
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        zip: profile.zip || ''
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
  const gstRate = 0.18;
  const couponDiscountAmount = appliedCoupon
    ? (appliedCoupon.discountAmount ??
        (appliedCoupon.discount ? (subtotal * appliedCoupon.discount) / 100 : 0))
    : 0;
  const discountedSubtotal = Math.max(0, subtotal - couponDiscountAmount);
  const estimatedTax = discountedSubtotal * gstRate;
  const grandTotal = discountedSubtotal + estimatedTax;
  const payableTotal = Number(grandTotal.toFixed(2));

  const handleApplyCoupon = async () => {
    if (couponLoading) return;
    const trimmed = couponCode.trim().toUpperCase();
    if (!trimmed) {
      setCouponStatus({ type: 'error', message: 'Enter a coupon code first.' });
      return;
    }
    if (appliedCoupon && appliedCoupon.code === trimmed) {
      setCouponStatus({ type: 'info', message: 'Coupon already applied.' });
      return;
    }
    setCouponLoading(true);
    setCouponStatus(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (auth.currentUser) {
        headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
      }
      const response = await fetch(`${backendUrl}/api/coupons/apply`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ couponCode: trimmed, cartTotal: subtotal })
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || data.message || 'Invalid or expired coupon.');
      }

      const normalizedDiscount = Number(
        data.discountAmount ?? data.coupon?.discountAmount ?? 0
      );

      applyCoupon({
        code: data.coupon?.code || trimmed,
        discount: data.coupon?.discount ?? null,
        discountAmount: normalizedDiscount,
        description: data.coupon?.description || '',
        finalSubtotal: Number(data.finalAmount ?? data.finalSubtotal ?? subtotal)
      });
      setCouponStatus({ type: 'success', message: data.message || 'Coupon applied successfully.' });
      setCouponCode('');
    } catch (error) {
      setCouponStatus({ type: 'error', message: error.message || 'Unable to apply coupon.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponStatus({ type: 'info', message: 'Coupon removed.' });
    setCouponCode('');
  };

  const handlePlaceOrder = async () => {
    if (loading || !auth.currentUser) return;
    if (!profile?.isPhoneVerified) {
      toast.error('Please verify your phone number before placing an order.');
      navigate('/verify-otp', { replace: true });
      return;
    }
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();

      const orderPayload = {
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          image: item.imageGallery[0],
          selectedVariant: item.variants || null,
          priceAtPurchase: Number(item.dealPrice || item.price || 0),
          qty: item.qty,
          sku: item.sku || `CHX-${item.id.slice(0, 6)}`,
          variantLabel: item.variants ? Object.values(item.variants).join(' â€¢ ') : 'Standard'
        })),
        totalPrice: payableTotal,
        paymentMethod: method,
        address: addressData,
        couponCode: appliedCoupon?.code || null,
        discountAmount: couponDiscountAmount,
        finalAmount: payableTotal
      };

      if (method === 'online') {
        const rezResponse = await fetch(`${backendUrl}/api/orders/create-razorpay-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            items: orderPayload.items,
            couponCode: appliedCoupon?.code || null
          })
        });
        const orderData = await rezResponse.json();
        if (!rezResponse.ok) throw new Error(orderData.error);

        await initiateRazorpayPayment({
          orderData,
          userInfo: { email: auth.currentUser.email },
          onSuccess: async (response) => {
            const verifyingToast = toast.loading('Confirming payment...');
            try {
              const finalResponse = await fetch(`${backendUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...orderPayload, razorpayDetails: response })
              });
              const data = await finalResponse.json().catch(() => ({}));
              if (!finalResponse.ok) {
                throw new Error(data.error || 'Payment verification failed. Any amount debited will be auto-refunded.');
              }
              toast.success('Order placed', { id: verifyingToast });
              clearCart();
              navigate('/confirmation', { state: { orderId: data.orderId, displayId: data.orderDisplayId } });
            } catch (verificationError) {
              if (verificationError.message === 'PRICE_UPDATED') {
                toast.dismiss(verifyingToast);
                // The main handlePlaceOrder catch will handle the UI update
                return;
              }
              toast.error(verificationError.message || 'Unable to confirm payment. Please contact support.', { id: verifyingToast });
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
        } else {
          const data = await response.json().catch(() => ({}));
          if (response.status === 409 && data.message === 'Price updated') {
            const newTotal = data.updatedTotal;
            toast.error(`Price updated to ₹${newTotal.toLocaleString()}. Please confirm one last time.`, { duration: 5000 });
            setLoading(false);
            return;
          }
          throw new Error(data.error || 'Unable to place order. Please try again.');
        }
      }
    } catch (error) {
      if (error.message === 'PRICE_UPDATED' || error.message?.includes('409')) {
        toast.error('Price has changed. Please review the total and try again.');
      } else {
        toast.error(error.message || 'Unable to place order.');
      }
    } finally {
      setLoading(false);
    }
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

        .coupon-feedback {
          font-size: 0.75rem;
          font-weight: 600;
        }
        .coupon-feedback.success { color: #198754; }
        .coupon-feedback.error { color: #b02a37; }
        .coupon-feedback.info { color: var(--t2); }
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
                          <input type="text" className="input-refined" placeholder="Pune" value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value})} />
                       </div>
                       <div className="col-md-6 mb-4">
                          <label className="label-refined mb-2">State / Province</label>
                          <input type="text" className="input-refined" placeholder="Maharashtra" value={addressData.state} onChange={e => setAddressData({...addressData, state: e.target.value})} />
                       </div>
                       <div className="col-md-6 mb-4">
                          <label className="label-refined mb-2">Country</label>
                          <input type="text" className="input-refined" placeholder="India" value={addressData.country} onChange={e => setAddressData({...addressData, country: e.target.value})} />
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
                                <p className="x-small text-t3 m-0 uppercase tracking-wider">UPI â€¢ Cards â€¢ Net banking</p>
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
                          <span className="text-truncate flex-grow-1 pe-3">{item.name} Ã— {item.qty}</span>
                          <span className="fw-bold">â‚¹{((item.dealPrice || item.price) * item.qty).toLocaleString()}</span>
                       </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="statement-row">
                <span>Items</span>
                <span className="fw-bold">?{subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                 <div className="statement-row text-success flex-column align-items-start">
                    <div className="w-100 d-flex justify-content-between">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="fw-bold">- ?{couponDiscountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    {appliedCoupon.description && (
                      <span className="x-small text-success opacity-75">{appliedCoupon.description}</span>
                    )}
                 </div>
              )}
              <div className="statement-row">
                <span>Shipping</span>
                <span className="text-success fw-bold x-small uppercase tracking-widest">Free</span>
              </div>
              <div className="statement-row">
                <span>Tax (18% GST)</span>
                <span className="fw-bold">?{estimatedTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="statement-total-row d-flex justify-content-between align-items-end mb-5">
                <span className="section-label m-0">Estimated total</span>
                <span className="h3 fw-bold m-0 text-gold">?{payableTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="promo-input mb-5">
                 <label className="label-refined mb-2">Apply coupon</label>
                 <div className="d-flex gap-2">
                   <input
                     type="text"
                     className="input-refined x-small fw-bold tracking-widest text-uppercase"
                     placeholder="Enter coupon code"
                     value={couponCode}
                     onChange={e => setCouponCode(e.target.value)}
                     disabled={couponLoading || Boolean(appliedCoupon)}
                   />
                   <button
                     className="btn btn-outline-dark text-uppercase x-small fw-bold"
                     disabled={couponLoading || !couponCode.trim() || Boolean(appliedCoupon)}
                     onClick={handleApplyCoupon}
                   >
                     {couponLoading ? 'Applying...' : 'Apply'}
                   </button>
                   {appliedCoupon && (
                     <button className="btn btn-link x-small fw-bold text-danger text-uppercase" onClick={handleRemoveCoupon}>
                       Remove
                     </button>
                   )}
                 </div>
                 {couponStatus && (
                   <p className={`coupon-feedback ${couponStatus.type} mt-2`}>{couponStatus.message}</p>
                 )}
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



