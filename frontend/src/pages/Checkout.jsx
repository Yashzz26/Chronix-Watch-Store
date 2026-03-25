import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineCreditCard, 
  HiOutlineBanknotes, 
  HiCheckBadge 
} from 'react-icons/hi2';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { initiateRazorpayPayment } from '../lib/razorpay';
import useAuthStore from '../store/authStore';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const [method, setMethod] = useState('online');
  const [loading, setLoading] = useState(false);

  // Section 2.1 — Guard against empty cart
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items, navigate]);

  if (items.length === 0) return null; // prevent flash of empty checkout

  const handlePlaceOrder = async () => {
    if (!auth.currentUser) {
      toast.error('Please login to place an order');
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      if (method === 'online') {
        const rezResponse = await fetch(`${backendUrl}/api/orders/create-razorpay-order`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount: totalPrice() })
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
                body: JSON.stringify({ 
                  items, 
                  totalPrice: totalPrice(), 
                  paymentMethod: 'online',
                  razorpayDetails: response
                })
              });
              
              if (finalResponse.ok) {
                const data = await finalResponse.json();
                toast.success('Payment Verified & Order Placed', { id: verifyingToast });
                clearCart();
                navigate('/confirmation', { state: { orderId: data.orderId } });
              } else {
                const errorData = await finalResponse.json();
                toast.error(errorData.error || 'Verification failed', { id: verifyingToast });
              }
            } catch (err) {
              toast.error('Network error during verification', { id: verifyingToast });
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
          body: JSON.stringify({ 
            items, 
            totalPrice: totalPrice(), 
            paymentMethod: 'cod' 
          })
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

        .checkout-header {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: clamp(2.5rem, 5vw, 4rem);
          color: #F0EDE8;
          margin-bottom: 48px;
          margin-top: 40px;
        }

        .section-label {
          font-size: 0.65rem;
          color: #D4AF37;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 20px;
        }

        .payment-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 32px;
        }

        .payment-card {
          width: 100%;
          text-align: left;
          cursor: pointer;
          padding: 24px;
          border-radius: 12px;
          border: 2px solid #1e1e1e;
          background: #0f0f0f;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
          color: inherit;
        }

        .payment-card.selected {
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.05);
        }

        .pay-icon-block {
          background: #161616;
          border-radius: 8px;
          padding: 12px;
          display: inline-flex;
          margin-bottom: 16px;
          transition: all 0.25s ease;
        }

        .payment-card.selected .pay-icon-block {
          background: #D4AF37;
          color: #000;
        }

        .pay-title {
          font-weight: 600;
          font-size: 1rem;
          color: #F0EDE8;
          margin-bottom: 4px;
        }

        .pay-subtitle {
          font-size: 0.65rem;
          color: #5A5652;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .checkmark-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          color: #D4AF37;
        }

        .info-panel {
          background: #0c0c0c;
          border: 2px dashed #1e1e1e;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
        }

        .online-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .icon-circle {
          background: #161616;
          border-radius: 50%;
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D4AF37;
        }

        .logos-row {
          display: flex;
          gap: 20px;
          align-items: center;
          opacity: 0.45;
          margin-top: 8px;
        }

        .summary-card {
          background: #0f0f0f;
          border: 1px solid #1e1e1e;
          border-radius: 14px;
          padding: 28px;
          position: sticky;
          top: 80px;
        }

        .items-list {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 24px;
        }

        .items-list::-webkit-scrollbar {
          width: 3px;
        }
        .items-list::-webkit-scrollbar-track {
          background: #080808;
        }
        .items-list::-webkit-scrollbar-thumb {
          background: #1e1e1e;
        }
        .items-list::-webkit-scrollbar-thumb:hover {
          background: #D4AF37;
        }

        .item-row {
          display: flex;
          gap: 14px;
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(30, 30, 30, 0.8);
        }

        .item-row:last-child {
          border-bottom: none;
        }

        .item-thumb {
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          background: #161616;
          border-radius: 8px;
          padding: 8px;
        }

        .item-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .item-name {
          font-weight: 500;
          color: #F0EDE8;
          font-size: 0.9rem;
          margin-bottom: 6px;
        }

        .item-price-row {
          font-family: 'DM Mono', monospace;
          font-size: 0.78rem;
          color: #5A5652;
          text-transform: uppercase;
        }

        .item-subtotal {
          font-family: 'DM Mono', monospace;
          color: #D4AF37;
          font-size: 0.9rem;
          font-weight: 500;
          text-align: right;
          flex-shrink: 0;
        }

        .total-amount {
          font-family: 'DM Mono', monospace;
          font-size: 1.6rem;
          color: #D4AF37;
          font-weight: 500;
        }

        .place-order-btn {
          width: 100%;
          padding: 15px 0;
          background: #D4AF37;
          color: #000;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.18);
          transition: all 0.25s ease;
        }

        .place-order-btn:hover:not(:disabled) {
          background: #F0D060;
          box-shadow: 0 12px 32px rgba(212, 175, 55, 0.3);
          transform: translateY(-1px);
        }

        .place-order-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .security-note {
          text-align: center;
          margin-top: 20px;
          font-size: 0.62rem;
          color: #5A5652;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          line-height: 2;
        }
      `}</style>

      <div className="container">
        <h1 className="checkout-header">Finalize Acquisition</h1>

        <div className="row g-5 align-items-start">
          {/* Left Column */}
          <div className="col-12 col-lg-7">
            <h2 className="section-label">PAYMENT METHOD</h2>
            
            <div className="payment-grid">
              <button 
                className={`payment-card ${method === 'online' ? 'selected' : ''}`}
                onClick={() => setMethod('online')}
              >
                <div className="pay-icon-block">
                  <HiOutlineCreditCard size={26} color={method === 'online' ? '#000' : '#5A5652'} />
                </div>
                {method === 'online' && <HiCheckBadge className="checkmark-badge" size={20} />}
                <div className="pay-title">Pay Online</div>
                <div className="pay-subtitle">UPI / Cards / NetBanking</div>
              </button>

              <button 
                className={`payment-card ${method === 'cod' ? 'selected' : ''}`}
                onClick={() => setMethod('cod')}
              >
                <div className="pay-icon-block">
                  <HiOutlineBanknotes size={26} color={method === 'cod' ? '#000' : '#5A5652'} />
                </div>
                {method === 'cod' && <HiCheckBadge className="checkmark-badge" size={20} />}
                <div className="pay-title">Pay at Boutique</div>
                <div className="pay-subtitle">Cash on Delivery</div>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {method === 'online' ? (
                <motion.div 
                  key="online"
                  className="info-panel online-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="icon-circle">
                    <HiOutlineCreditCard size={34} />
                  </div>
                  <div className="pay-title" style={{ fontSize: '1.1rem' }}>Secure Payment Gateway</div>
                  <p style={{ color: '#9A9690', fontSize: '0.9rem', maxWidth: '360px', lineHeight: 1.7 }}>
                    Upon clicking place order, you will be redirected to our encrypted payment portal to complete your acquisition securely.
                  </p>
                  <div className="logos-row">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" height="18px" alt="UPI" style={{ filter: 'grayscale(1)' }} />
                    <div style={{ width: '1px', height: '20px', background: '#2a2a2a' }}></div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Visa.svg" height="14px" alt="Visa" style={{ filter: 'grayscale(1)' }} />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" height="16px" alt="Mastercard" style={{ filter: 'grayscale(1)' }} />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="cod"
                  className="info-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <p style={{ fontSize: '1.05rem', color: '#9A9690', lineHeight: 2 }}>
                    Our white-glove delivery specialist will collect the amount <br />
                    <span className="total-amount" style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{totalPrice().toLocaleString('en-IN')}</span> <br />
                    upon arrival. Please ensure exact change is available.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column */}
          <div className="col-12 col-lg-5">
            <div className="summary-card">
              <h2 className="section-label" style={{ marginBottom: '28px' }}>SUMMARY</h2>
              
              <div className="items-list">
                {items.map((item) => (
                  <div key={item.id} className="item-row">
                    <div className="item-thumb">
                      <img src={item.imageGallery[0]} alt={item.name} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="item-name">{item.name}</div>
                      <div className="item-price-row">
                        ₹{(item.dealPrice || item.price).toLocaleString()} × {item.qty}
                      </div>
                    </div>
                    <div className="item-subtotal">
                      ₹{((item.dealPrice || item.price) * item.qty).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #1e1e1e', marginBottom: '24px' }}></div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span style={{ fontWeight: 600, color: '#F0EDE8', fontSize: '1rem' }}>Total Amount</span>
                <span className="total-amount">₹{totalPrice().toLocaleString('en-IN')}</span>
              </div>

              <button 
                className="place-order-btn" 
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm text-dark"></span>
                ) : (
                  method === 'online' ? 'Pay & Place Your Order' : 'Confirm Reservation'
                )}
              </button>

              <div className="security-note">
                Every transaction is protected <br />
                by institutional-grade encryption.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

