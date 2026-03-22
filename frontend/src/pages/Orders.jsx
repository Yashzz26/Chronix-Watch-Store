import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineClock, HiOutlineCheckCircle, HiOutlineTruck, HiOutlineXCircle } from 'react-icons/hi2';
import { auth } from '../lib/firebase';
import useAuthStore from '../store/authStore';

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'pending': return <HiOutlineClock className="text-warning" />;
    case 'paid':    return <HiOutlineCheckCircle className="text-success" />;
    case 'shipped': return <HiOutlineTruck className="text-info" />;
    case 'delivered': return <HiOutlineCheckCircle className="text-primary" />;
    case 'cancelled': return <HiOutlineXCircle className="text-danger" />;
    default: return <HiOutlineClock className="text-t3" />;
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.currentUser) return;
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/my`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Fetch orders error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="spinner-border text-gold" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 my-5 mx-auto" style={{ maxWidth: 900 }}>
      <header className="mb-5 border-bottom border-border pb-4">
        <h1 className="font-display display-4 text-t1 mb-2">My Acquisitions</h1>
        <p className="text-t3 text-uppercase tracking-widest m-0" style={{ fontSize: '0.75rem' }}>
          Historical record of your luxury timepieces
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="text-center py-5 chronix-card">
          <HiOutlineShoppingBag size={64} className="text-t3 opacity-25 mb-4" />
          <h3 className="text-t2">No acquisitions found</h3>
          <p className="text-t3">Your journey with Chronix begins with your first selection.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="chronix-card p-4 p-md-5 overflow-hidden position-relative"
            >
              <div className="row g-4 align-items-center">
                <div className="col-12 col-md-8">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="text-t3 text-uppercase tracking-widest font-mono" style={{ fontSize: '0.65rem' }}>
                      Ref: {order.id}
                    </span>
                    <div className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-s2 border border-border">
                      <StatusIcon status={order.status} />
                      <span className="text-uppercase tracking-wider fw-medium text-t2" style={{ fontSize: '0.6rem' }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="d-flex flex-wrap gap-3 mt-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="d-flex align-items-center gap-3 bg-s1 p-2 rounded-3 border border-border border-opacity-25" style={{ minWidth: 200 }}>
                        <div className="bg-s2 rounded-2 p-1" style={{ width: 40, height: 40 }}>
                          <img src={item.imageGallery?.[0]} alt="" className="w-100 h-100 object-fit-contain" />
                        </div>
                        <div>
                          <p className="text-t1 text-sm fw-medium m-0 truncate" style={{ maxWidth: 140 }}>{item.name}</p>
                          <p className="text-t3 text-xs m-0">Qty: {item.qty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-12 col-md-4 text-md-end pt-4 pt-md-0 border-top border-md-top-0 border-border border-opacity-25 mt-4 mt-md-0">
                  <p className="text-t3 text-uppercase tracking-widest mb-1" style={{ fontSize: '0.65rem' }}>Amount</p>
                  <h2 className="text-gold font-mono fw-bold m-0">₹{order.totalPrice.toLocaleString('en-IN')}</h2>
                  <p className="text-t3 mt-3 mb-0" style={{ fontSize: '0.75rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
