import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCreditCard, HiOutlineBanknotes, HiOutlineQrCode, HiCheckBadge } from 'react-icons/hi2';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const [method, setMethod] = useState('cod'); // 'cod' or 'online'
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      clearCart();
      toast.success('Reservation confirmed');
      navigate('/confirmation');
    }, 2000);
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
                  className={`w-100 p-4 border-2 rounded-4 d-flex flex-column align-items-start gap-4 transition-all text-start position-relative overflow-hidden ${
                    method === 'online' ? 'border-gold bg-gold/5' : 'border-border bg-s1 opacity-50'
                  }`}
                  style={{ background: method === 'online' ? 'rgba(212,175,55,0.05)' : '#0F0F0F' }}
                >
                  <div className={`p-3 rounded-3 ${method === 'online' ? 'bg-gold text-bg' : 'bg-s2 text-t3'}`}>
                    <HiOutlineCreditCard size={24} />
                  </div>
                  <div>
                    <p className="fw-medium text-t1 m-0">Pay Online</p>
                    <p className="text-[0.65rem] text-t3 uppercase tracking-wider mt-1 mb-0">UPI / Cards / NetBanking</p>
                  </div>
                  {method === 'online' && <HiCheckBadge className="position-absolute top-0 end-0 m-3 text-gold" size={20} />}
                </button>
              </div>

              <div className="col-12 col-sm-6">
                <button
                  onClick={() => setMethod('cod')}
                  className={`w-100 p-4 border-2 rounded-4 d-flex flex-column align-items-start gap-4 transition-all text-start position-relative overflow-hidden ${
                    method === 'cod' ? 'border-gold bg-gold/5' : 'border-border bg-s1 opacity-50'
                  }`}
                  style={{ background: method === 'cod' ? 'rgba(212,175,55,0.05)' : '#0F0F0F' }}
                >
                  <div className={`p-3 rounded-3 ${method === 'cod' ? 'bg-gold text-bg' : 'bg-s2 text-t3'}`}>
                    <HiOutlineBanknotes size={24} />
                  </div>
                  <div>
                    <p className="fw-medium text-t1 m-0">Pay at Boutique</p>
                    <p className="text-[0.65rem] text-t3 uppercase tracking-wider mt-1 mb-0">Cash on Delivery</p>
                  </div>
                  {method === 'cod' && <HiCheckBadge className="position-absolute top-0 end-0 m-3 text-gold" size={20} />}
                </button>
              </div>
            </div>
          </section>

          <AnimatePresence mode="wait">
            {method === 'online' ? (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="chronix-card p-5 d-flex flex-column align-items-center text-center gap-4 bg-[#0C0C0C]"
              >
                <div className="bg-white p-4 rounded-4 shadow-lg">
                  <HiOutlineQrCode size={180} className="text-black" />
                </div>
                <div className="space-y-2">
                  <p className="text-t1 fw-medium m-0 fs-5">Scan to secure your piece</p>
                  <p className="text-t3 text-sm m-0">Transfer ₹{totalPrice().toLocaleString('en-IN')} via any UPI app</p>
                </div>
                <div className="d-flex gap-4 opacity-50 grayscale hover-grayscale-0 transition-grayscale">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" style={{ height: 28 }} />
                </div>
              </motion.section>
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="chronix-card p-5 border-dashed"
              >
                <p className="text-t2 text-center fs-5 leading-relaxed m-0">
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
            <div className="overflow-auto pr-3 mb-5" style={{ maxHeight: 300 }}>
              {items.map(item => (
                <div key={item.id} className="d-flex gap-4 mb-4 pb-4 border-bottom border-border border-opacity-20 last-child-border-0">
                  <div className="bg-s2 rounded-3 p-2 flex-shrink-0" style={{ width: 64, height: 64 }}>
                    <img src={item.imageGallery[0]} alt="" className="w-100 h-100 object-fit-contain" />
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-sm fw-medium text-t1 m-0">{item.name}</p>
                    <p className="text-[0.7rem] text-t3 font-mono mt-1 mb-0 uppercase tracking-tighter">
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
                className="btn-chronix-primary w-100 py-3 d-flex align-items-center justify-content-center gap-3 position-relative overflow-hidden"
              >
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-bg" role="status" />
                ) : 'Place Your Order'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
