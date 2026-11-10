import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineBanknotes, HiOutlineCreditCard, HiOutlineShieldCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { auth } from '../lib/firebase';
import { initiateRazorpayPayment } from '../lib/razorpay';

const emptyAddress = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  zip: ''
};

const toOrderItems = items => items.map(item => ({
  productId: item.id,
  name: item.name,
  image: item.imageGallery?.[0] || '',
  selectedVariant: item.variants || null,
  priceAtPurchase: Number(item.dealPrice || item.price || 0),
  qty: item.qty,
  sku: item.sku || `CHX-${String(item.id).slice(0, 6)}`,
  variantLabel: item.variants ? Object.values(item.variants).join(' • ') : 'Standard'
}));

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, appliedCoupon, applyCoupon, removeCoupon } = useCartStore();
  const { profile } = useAuthStore();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [address, setAddress] = useState(emptyAddress);
  const [method, setMethod] = useState('online');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');

  useEffect(() => {
    if (!items.length) {
      navigate('/cart', { replace: true });
      return;
    }

    const saved = localStorage.getItem('chronix-checkout-address');
    let savedAddress = null;
    try {
      savedAddress = saved ? JSON.parse(saved) : null;
    } catch {
      savedAddress = null;
    }

    setAddress({
      ...emptyAddress,
      ...(savedAddress || {}),
      ...(profile ? {
        fullName: savedAddress?.fullName || profile.name || '',
        phone: savedAddress?.phone || profile.phone || '',
        address: savedAddress?.address || profile.address || '',
        city: savedAddress?.city || profile.city || '',
        state: savedAddress?.state || profile.state || '',
        country: savedAddress?.country || profile.country || 'India',
        zip: savedAddress?.zip || profile.zip || ''
      } : {})
    });
  }, [items.length, navigate, profile]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.dealPrice || item.price) * item.qty, 0),
    [items]
  );
  const discount = appliedCoupon?.discountAmount ??
    (appliedCoupon?.discount ? subtotal * appliedCoupon.discount / 100 : 0);
  const total = Number(((subtotal - Math.min(discount, subtotal)) * 1.18).toFixed(2));

  const updateAddress = (field, value) => setAddress(current => ({ ...current, [field]: value }));

  const applyCouponCode = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return setCouponMessage('Enter a coupon code.');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
      const response = await fetch(`${backendUrl}/api/coupons/apply`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ couponCode: code, cartTotal: subtotal })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.error || 'Invalid or expired coupon.');
      applyCoupon({
        code: data.coupon?.code || code,
        discount: data.coupon?.discount ?? null,
        discountAmount: Number(data.discountAmount ?? data.coupon?.discountAmount ?? 0),
        description: data.coupon?.description || ''
      });
      setCouponCode('');
      setCouponMessage(data.message || 'Coupon applied.');
    } catch (error) {
      setCouponMessage(error.message);
    }
  };

  const orderPayload = () => ({
    items: toOrderItems(items),
    totalPrice: total,
    finalAmount: total,
    paymentMethod: method,
    address,
    shippingAddress: address,
    couponCode: appliedCoupon?.code || null
  });

  const finishOrder = async (payload, payment) => {
    const response = await fetch(`${backendUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await auth.currentUser.getIdToken()}`
      },
      body: JSON.stringify({ ...payload, razorpayDetails: payment })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Unable to place order.');
    clearCart();
    navigate('/confirmation', { state: { orderId: data.orderId, displayId: data.orderDisplayId } });
  };

  const placeOrder = async () => {
    if (loading || !auth.currentUser) return;
    const required = ['fullName', 'phone', 'address', 'city', 'state', 'country', 'zip'];
    if (required.some(field => !String(address[field] || '').trim())) {
      toast.error('Complete your delivery address first.');
      return;
    }

    setLoading(true);
    localStorage.setItem('chronix-checkout-address', JSON.stringify(address));
    const payload = orderPayload();
    try {
      if (method === 'cod') {
        await finishOrder(payload);
        toast.success('Order placed');
        return;
      }

      const createResponse = await fetch(`${backendUrl}/api/orders/create-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({ items: payload.items, couponCode: payload.couponCode })
      });
      const orderData = await createResponse.json().catch(() => ({}));
      if (!createResponse.ok) throw new Error(orderData.error || 'Unable to start payment.');

      await initiateRazorpayPayment({
        orderData,
        userInfo: { name: address.fullName, email: auth.currentUser.email, phone: address.phone },
        onSuccess: async payment => {
          const verifyingToast = toast.loading('Confirming payment...');
          try {
            const verifyResponse = await fetch(`${backendUrl}/api/orders/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await auth.currentUser.getIdToken()}`
              },
              body: JSON.stringify(payment)
            });
            const verification = await verifyResponse.json().catch(() => ({}));
            if (!verifyResponse.ok || verification.success !== true) {
              throw new Error(verification.error || 'Payment verification failed.');
            }
            await finishOrder(payload, payment);
            toast.success('Order placed', { id: verifyingToast });
          } catch (error) {
            toast.error(error.message || 'Unable to confirm payment.', { id: verifyingToast });
          } finally {
            setLoading(false);
          }
        },
        onFailure: error => {
          toast.error(error);
          setLoading(false);
        }
      });
    } catch (error) {
      toast.error(error.message || 'Unable to place order.');
      setLoading(false);
    }
  };

  if (!items.length) return null;

  return (
    <main className="checkout-page">
      <style>{`
        .checkout-page { background: var(--bg); color: var(--t1); min-height: 100vh; padding: 120px 24px 100px; }
        .checkout-container { width: min(100%, 1120px); margin: 0 auto; }
        .checkout-grid { display: grid; grid-template-columns: minmax(0, 7fr) minmax(320px, 5fr); gap: 4rem; align-items: start; }
        .checkout-card, .checkout-summary { background: #FFFFFF; border: 1px solid var(--border); padding: 32px; }
        .checkout-summary { position: sticky; top: 32px; }
        .checkout-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 24px; }
        .checkout-field.full { grid-column: 1 / -1; }
        .checkout-field input { height: 48px; padding: 0 16px; }
        .payment-choice { border: 1px solid var(--border); padding: 18px; cursor: pointer; display: flex; gap: 14px; align-items: center; }
        .payment-choice.active { border-color: var(--gold); background: var(--bg-1); }
        .coupon-row { display: flex; gap: 8px; }
        .coupon-row input { flex: 1; min-width: 0; height: 44px; padding: 0 14px; }
        @media (max-width: 991px) {
          .checkout-grid { grid-template-columns: 1fr; gap: 2rem; }
          .checkout-summary { position: static; }
        }
        @media (max-width: 575px) {
          .checkout-page { padding-left: 16px; padding-right: 16px; }
          .checkout-card, .checkout-summary { padding: 22px; }
          .checkout-fields { grid-template-columns: 1fr; }
          .checkout-field.full { grid-column: auto; }
        }
      `}</style>
      <div className="checkout-container">
        <button className="btn p-0 text-t3 x-small fw-bold tracking-widest uppercase mb-4" onClick={() => navigate('/cart')}>
          <HiOutlineArrowLeft className="me-2" /> Back to cart
        </button>
        <div className="checkout-grid">
          <section className="checkout-card">
            <div className="d-flex justify-content-between align-items-baseline mb-4">
              <h1 className="font-display h2 m-0">Complete your order</h1>
              <span className="section-label-gold">Secure checkout</span>
            </div>
            <p className="text-t3 small mb-4">Add your delivery address, then continue directly to payment.</p>
            <div className="checkout-fields">
              {[
                ['fullName', 'Full name', 'Anastasia Grey'],
                ['phone', 'Phone number', '+91 00000 00000'],
                ['address', 'Street address', 'Suite 42, Global Plaza'],
                ['city', 'City', 'Pune'],
                ['state', 'State / Province', 'Maharashtra'],
                ['country', 'Country', 'India'],
                ['zip', 'PIN / ZIP', '411011']
              ].map(([field, label, placeholder]) => (
                <div className={`checkout-field ${field === 'address' ? 'full' : ''}`} key={field}>
                  <label className="label-refined mb-2">{label}</label>
                  <input className="input-refined w-100" value={address[field]} placeholder={placeholder} onChange={event => updateAddress(field, event.target.value)} />
                </div>
              ))}
            </div>
            <div className="border-top border-border mt-5 pt-4">
              <p className="section-label mb-3">Payment method</p>
              <div className="d-grid gap-3">
                <div className={`payment-choice ${method === 'online' ? 'active' : ''}`} onClick={() => setMethod('online')}>
                  <HiOutlineCreditCard className="h4 text-gold m-0" />
                  <div><strong className="small">Razorpay checkout</strong><div className="x-small text-t3">UPI, cards and net banking</div></div>
                </div>
                <div className={`payment-choice ${method === 'cod' ? 'active' : ''}`} onClick={() => setMethod('cod')}>
                  <HiOutlineBanknotes className="h4 text-gold m-0" />
                  <div><strong className="small">Cash on delivery</strong><div className="x-small text-t3">Pay when your order arrives</div></div>
                </div>
              </div>
              <button className="btn-gold w-100 py-3 mt-4" onClick={placeOrder} disabled={loading}>
                {loading ? 'Processing...' : method === 'online' ? 'Continue to Razorpay' : 'Confirm COD order'}
              </button>
            </div>
          </section>

          <aside className="checkout-summary">
            <p className="section-label border-bottom border-border pb-3">Order summary</p>
            {items.map(item => (
              <div className="d-flex justify-content-between gap-3 py-2 small" key={`${item.id}-${item.variants?.sku || 'base'}`}>
                <span>{item.name} × {item.qty}</span>
                <strong>₹{((item.dealPrice || item.price) * item.qty).toLocaleString('en-IN')}</strong>
              </div>
            ))}
            <div className="coupon-row mt-4">
              <input className="input-refined" placeholder="Coupon code" value={couponCode} onChange={event => setCouponCode(event.target.value)} />
              <button className="btn btn-outline-dark px-3" onClick={applyCouponCode}>Apply</button>
            </div>
            {couponMessage && <p className="x-small text-t3 mt-2 mb-0">{couponMessage}</p>}
            {appliedCoupon && <button className="btn p-0 x-small text-t3 mt-2" onClick={() => { removeCoupon(); setCouponMessage('Coupon removed.'); }}>Remove coupon</button>}
            <div className="border-top border-border mt-4 pt-4 d-flex justify-content-between">
              <span className="section-label">Estimated total</span>
              <strong className="h4 m-0">₹{total.toLocaleString('en-IN')}</strong>
            </div>
            <div className="d-flex justify-content-center align-items-center gap-2 text-t3 x-small mt-4 pt-3 border-top border-border">
              <HiOutlineShieldCheck className="text-gold" /> Secure payment and verified order
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
