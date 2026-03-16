import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const total = totalPrice();

  const [method, setMethod] = useState('online');

  const handlePlaceOrder = () => {
    if (method === 'online') {
      // Mock Razorpay / UPI flow
      toast.loading('Redirecting to payment...', { duration: 1500 });
      setTimeout(() => {
        clearCart();
        navigate('/confirmation');
        toast.success('Order placed successfully!');
      }, 1500);
    } else {
      // COD flow
      clearCart();
      navigate('/confirmation');
      toast.success('Order placed (COD)!');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
      <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2.4rem',
        fontWeight: 400, color: '#F0EDE8', marginBottom: 40 }}>
        Checkout
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40, alignItems: 'start' }}
        className="checkout-layout">
        <style>{`@media(max-width:768px){.checkout-layout{grid-template-columns:1fr!important}}`}</style>

        {/* Payment */}
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F0EDE8', marginBottom: 20 }}>
            Payment Method
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { id: 'online', label: 'Online Payment (UPI / Card)', icon: '💳' },
              { id: 'cod', label: 'Cash on Delivery', icon: '📦' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', width: '100%', cursor: 'pointer',
                  textAlign: 'left', background: method === m.id ? '#121212' : '#0F0F0F',
                  borderColor: method === m.id ? '#D4AF37' : '#2A2A2A',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                <span style={{ flex: 1, color: '#F0EDE8', fontSize: '0.95rem' }}>{m.label}</span>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', border: '2px solid #2A2A2A',
                  position: 'relative', background: method === m.id ? '#D4AF37' : 'transparent',
                }}>
                  {method === m.id && <div style={{
                    position: 'absolute', inset: 4, background: '#080808', borderRadius: '50%'
                  }} />}
                </div>
              </button>
            ))}
          </div>

          <p style={{ color: '#5A5652', fontSize: '0.85rem', marginTop: 24, lineHeight: 1.6 }}>
            {method === 'online'
              ? 'Secure payment via Razorpay. Powered by bank-grade encryption.'
              : 'Pay with cash upon delivery. A small processing fee may apply.'}
          </p>
        </div>

        {/* Summary */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#F0EDE8', marginBottom: 16 }}>
            Order Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {items.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#9A9690' }}>{i.name} x {i.qty}</span>
                <span style={{ color: '#F0EDE8', fontFamily: '"DM Mono", monospace' }}>
                  ₹{((i.dealPrice || i.price) * i.qty).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#5A5652', fontSize: '0.85rem' }}>Total Amount</span>
              <span style={{ fontSize: '1.2rem', color: '#D4AF37', fontWeight: 600, fontFamily: '"DM Mono", monospace' }}>
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={handlePlaceOrder}>
            {method === 'online' ? 'Pay Now' : 'Confirm Order'}
          </button>
          <Link to="/cart" style={{ display: 'block', textAlign: 'center', marginTop: 16,
            fontSize: '0.85rem', color: '#5A5652', textDecoration: 'none' }}>
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
