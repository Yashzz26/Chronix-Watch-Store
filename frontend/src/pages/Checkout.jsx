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
      <h1 className="font-display display-3 text-t1 mb-5">Finalize Acquisition</h1>

      <div className="row g-5 align-items-start">
        {/* Left: Payment */}
        <div className="col-12 col-lg-7">
          <section className="mb-5">
            <h2 className="section-label mb-4">Payment Method</h2>
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <button
                  onClick={() => setMethod('online')}
                  className={`btn w-100 p-4 border rounded-4 d-flex flex-column align-items-start gap-4 position-relative overflow-hidden text-start ${
                    method === 'online' ? 'border-gold' : 'border-border'
                  }`}
                  style={{ 
                    background: method === 'online' ? 'rgba(212,175,55,0.05)' : '#0F0F0F',
                    transition: 'all 0.3s ease',
                    borderWidth: '2px'
                  }}
                >
                  <div className={`p-3 rounded-3 d-flex ${method === 'online' ? 'bg-gold text-dark' : 'bg-secondary bg-opacity-10 text-t3'}`}>
                    <HiOutlineCreditCard size={24} />
                  </div>
                  <div>
                    <p className="fw-medium text-t1 m-0">Pay Online</p>
                    <p className="text-t3 text-uppercase tracking-wider mt-1 mb-0" style={{ fontSize: '0.65rem' }}>UPI / Cards / NetBanking</p>
                  </div>
                  {method === 'online' && <HiCheckBadge className="position-absolute top-0 end-0 m-3 text-gold" size={20} />}
                </button>
              </div>

              <div className="col-12 col-sm-6">
                <button
                  onClick={() => setMethod('cod')}
                  className={`btn w-100 p-4 border rounded-4 d-flex flex-column align-items-start gap-4 position-relative overflow-hidden text-start ${
                    method === 'cod' ? 'border-gold' : 'border-border'
                  }`}
                  style={{ 
                    background: method === 'cod' ? 'rgba(212,175,55,0.05)' : '#0F0F0F',
                    transition: 'all 0.3s ease',
                    borderWidth: '2px'
                  }}
                >
                  <div className={`p-3 rounded-3 d-flex ${method === 'cod' ? 'bg-gold text-dark' : 'bg-secondary bg-opacity-10 text-t3'}`}>
                    <HiOutlineBanknotes size={24} />
                  </div>
                  <div>
                    <p className="fw-medium text-t1 m-0">Pay at Boutique</p>
                    <p className="text-t3 text-uppercase tracking-wider mt-1 mb-0" style={{ fontSize: '0.65rem' }}>Cash on Delivery</p>
                  </div>
                  {method === 'cod' && <HiCheckBadge className="position-absolute top-0 end-0 m-3 text-gold" size={20} />}
                </button>
              </div>
            </div>
          </section>

          <AnimatePresence mode="popLayout">
            {method === 'online' ? (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="chronix-card p-5 d-flex flex-column align-items-center text-center gap-4 bg-black"
                style={{ background: '#0C0C0C', borderStyle: 'dashed' }}
              >
                <div className="bg-s2 p-4 rounded-circle shadow-lg mb-2">
                  <HiOutlineCreditCard size={48} className="text-gold" />
                </div>
                <div className="d-flex flex-column gap-2">
                  <p className="text-t1 fw-medium m-0 fs-5">Secure Payment Gateway</p>
                  <p className="text-t3 text-sm m-0 px-md-5">
                    Upon clicking place order, you will be redirected to our encrypted payment portal 
                    to complete your acquisition securely.
                  </p>
                </div>
                <div className="d-flex gap-4 opacity-50 mt-2">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" style={{ height: 20, filter: 'grayscale(1)' }} />
                   <div style={{ width: 1, height: 20, background: '#2A2A2A' }} />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Visa.svg" alt="Visa" style={{ height: 16, filter: 'grayscale(1)' }} />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="MasterCard" style={{ height: 16, filter: 'grayscale(1)' }} />
                </div>
              </motion.section>
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="chronix-card p-5 border-dashed text-center"
              >
                <p className="text-t2 fs-5 lh-lg m-0">
                  Our white-glove delivery specialist will collect the amount <br />
                  <span className="text-gold font-mono fw-bold">₹{totalPrice().toLocaleString('en-IN')}</span> <br />
                  upon arrival. Please ensure exact change is available.
                </p>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Summary */}
        <div className="col-12 col-lg-5">
          <section className="chronix-card p-4">
            <h2 className="section-label mb-5">Summary</h2>
            <div className="overflow-auto pe-3 mb-5" style={{ maxHeight: 300 }}>
              {items.map((item, idx) => (
                <div key={item.id} className={`d-flex gap-4 mb-4 pb-4 ${idx === items.length - 1 ? '' : 'border-bottom border-border border-opacity-25'}`}>
                  <div className="bg-s2 rounded-3 p-2 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: 64, height: 64 }}>
                    <img src={item.imageGallery[0]} alt="" className="w-100 h-100 object-fit-contain" />
                  </div>
                  <div className="flex-grow-1">
                    <p className="fs-6 fw-medium text-t1 m-0">{item.name}</p>
                    <p className="text-t3 font-mono mt-1 mb-0 text-uppercase tracking-tighter" style={{ fontSize: '0.7rem' }}>
                      ₹{(item.dealPrice || item.price).toLocaleString('en-IN')} × {item.qty}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-top border-border">
              <div className="d-flex justify-content-between align-items-center mb-5">
                <span className="text-t1 fw-semibold">Total Amount</span>
                <span className="h2 text-gold font-mono fw-bold m-0">₹{totalPrice().toLocaleString('en-IN')}</span>
              </div>
              <button
                disabled={loading}
                onClick={handlePlaceOrder}
                className="btn-chronix-primary w-100 py-3 d-flex align-items-center justify-content-center gap-3 position-relative overflow-hidden text-decoration-none"
              >
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-dark" role="status" />
                ) : method === 'online' ? 'Pay & Place Your Order' : 'Place Your Order'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

