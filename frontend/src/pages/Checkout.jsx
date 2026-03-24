import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCreditCard, HiOutlineBanknotes, HiOutlineQrCode, HiCheckBadge } from 'react-icons/hi2';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { initiateRazorpayPayment } from '../lib/razorpay';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const [method, setMethod] = useState('cod');
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

  if (items.length === 0) return null;

  return (
    <div className="container py-5 my-5">
      <div className="mb-5 text-center">
        <div className="section-label mb-3">Secure Acquisition</div>
        <h1 className="font-display mb-2" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#fff' }}>
          Checkout
        </h1>
        <p className="text-t3 font-body" style={{ fontSize: '1rem' }}>Finalize your selection of exceptional timepieces.</p>
      </div>

      <div className="row g-5 align-items-start">
        {/* Left: Payment */}
        <div className="col-12 col-lg-7">
          <section className="mb-5">
            <h2 className="font-display mb-4" style={{ fontSize: '1.8rem', color: '#fff' }}>1. Select Payment Method</h2>
            <div className="row g-4">
              <div className="col-12 col-sm-6">
                <button
                  onClick={() => setMethod('online')}
                  className="w-100 p-4 border rounded-3 text-start position-relative overflow-hidden transition-all"
                  style={{ 
                    background: method === 'online' ? 'rgba(212,175,55,0.05)' : '#0F0F0F',
                    border: method === 'online' ? '2px solid #D4AF37' : '2px solid #1e1e1e',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className={`p-3 rounded-2 ${method === 'online' ? 'bg-gold text-dark' : 'bg-s2 text-t3'}`}>
                      <HiOutlineCreditCard size={28} />
                    </div>
                    {method === 'online' && <HiCheckBadge className="text-gold" size={24} />}
                  </div>
                  <div>
                    <p className="font-display h5 text-white mb-1">Electronic Payment</p>
                    <p className="text-t3 font-body m-0" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      UPI / Cards / Net Banking
                    </p>
                  </div>
                </button>
              </div>

              <div className="col-12 col-sm-6">
                <button
                  onClick={() => setMethod('cod')}
                  className="w-100 p-4 border rounded-3 text-start position-relative overflow-hidden transition-all"
                  style={{ 
                    background: method === 'cod' ? 'rgba(212,175,55,0.05)' : '#0F0F0F',
                    border: method === 'cod' ? '2px solid #D4AF37' : '2px solid #1e1e1e',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className={`p-3 rounded-2 ${method === 'cod' ? 'bg-gold text-dark' : 'bg-s2 text-t3'}`}>
                      <HiOutlineBanknotes size={28} />
                    </div>
                    {method === 'cod' && <HiCheckBadge className="text-gold" size={24} />}
                  </div>
                  <div>
                    <p className="font-display h5 text-white mb-1">Boutique Pickup/COD</p>
                    <p className="text-t3 font-body m-0" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Pay upon delivery/collection
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </section>

          <AnimatePresence mode="wait">
            {method === 'online' ? (
              <motion.div
                key="online"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 border rounded-3 text-center"
                style={{ background: '#080808', border: '1px dashed #D4AF37' }}
              >
                <div className="d-inline-flex p-4 rounded-circle mb-4" style={{ background: 'rgba(212,175,55,0.05)' }}>
                  <HiOutlineQrCode size={48} className="text-gold" />
                </div>
                <h3 className="font-display text-white h4 mb-3">Secure Portal Transfer</h3>
                <p className="font-body text-t3 px-lg-5 mb-0" style={{ lineHeight: 1.7 }}>
                  You will be securely redirected to our verified payment gateway to complete your transaction using encrypted protocols.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="cod"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 border rounded-3 text-center"
                style={{ background: '#080808', border: '1px dashed #1e1e1e' }}
              >
                <div className="d-inline-flex p-4 rounded-circle mb-4" style={{ background: 'rgba(212,175,55,0.02)' }}>
                  <HiOutlineBanknotes size={48} className="text-t3" />
                </div>
                <h3 className="font-display text-white h4 mb-3">White-Glove Collection</h3>
                <p className="font-body text-t3 px-lg-5 mb-0" style={{ lineHeight: 1.7 }}>
                  Our concierge will facilitate the payment of <span className="text-gold font-mono fw-bold">₹{totalPrice().toLocaleString('en-IN')}</span> at the time of delivery. Exact amount is appreciated.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Summary */}
        <div className="col-12 col-lg-5 ps-lg-5">
          <div className="position-sticky" style={{ top: '100px' }}>
            <div className="chronix-card p-4">
              <h2 className="section-label mb-5">Order Résumé</h2>
              
              <div className="overflow-auto mb-5 pe-2" style={{ maxHeight: '350px' }}>
                {items.map((item, idx) => (
                  <div key={item.id} className={`d-flex gap-4 mb-4 pb-4 ${idx !== items.length - 1 ? 'border-bottom border-border border-opacity-50' : ''}`}>
                    <div className="bg-s2 rounded-2 p-2 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
                      <img src={item.imageGallery[0]} alt="" className="w-100 h-100 object-fit-contain" />
                    </div>
                    <div className="flex-grow-1">
                      <p className="text-white fw-medium m-0">{item.name}</p>
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <span className="text-t3" style={{ fontSize: '0.8rem' }}>Qty: {item.qty}</span>
                        <span className="font-mono text-gold" style={{ fontSize: '0.85rem' }}>
                          ₹{(item.dealPrice || item.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-top border-border">
                <div className="d-flex justify-content-between align-items-end mb-5">
                  <div>
                    <span className="section-label d-block mb-1">Total Due</span>
                    <span className="font-mono text-gold" style={{ fontSize: '2.5rem', fontWeight: 600, lineHeight: 1 }}>
                      ₹{totalPrice().toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                
                <button
                  disabled={loading}
                  onClick={handlePlaceOrder}
                  className="btn-gold w-100 py-3 text-uppercase fw-bold d-flex align-items-center justify-content-center gap-3"
                  style={{ fontSize: '0.85rem', letterSpacing: '0.1em' }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      {method === 'online' ? 'Proceed to Gateway' : 'Confirm Reservation'}
                    </>
                  )}
                </button>
                <p className="text-center mt-4 text-t3" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  SSL Encrypted & Secured Transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

