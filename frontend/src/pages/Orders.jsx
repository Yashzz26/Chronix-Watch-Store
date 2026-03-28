import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineShoppingBag, 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineTruck, 
  HiOutlineXCircle,
  HiOutlineCreditCard,
  HiOutlineBanknotes
} from 'react-icons/hi2';
import { auth } from '../lib/firebase';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const configs = {
    pending: { color: '#B45309', bg: '#FEF3C7', icon: <HiOutlineClock /> },
    paid: { color: '#059669', bg: '#D1FAE5', icon: <HiOutlineCheckCircle /> },
    shipped: { color: '#2563EB', bg: '#DBEAFE', icon: <HiOutlineTruck /> },
    delivered: { color: '#7C3AED', bg: '#EDE9FE', icon: <HiOutlineCheckCircle /> },
    cancelled: { color: '#DC2626', bg: '#FEE2E2', icon: <HiOutlineXCircle /> }
  };
  const config = configs[status] || configs.pending;

  return (
    <div className="d-flex align-items-center gap-1 px-3 py-1 rounded-pill" style={{ backgroundColor: config.bg, color: config.color, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>
      {config.icon}
      <span>{status}</span>
    </div>
  );
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.currentUser) return;
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) setOrders(data.orders || []);
      } catch (error) {
        console.error('Fetch orders error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => ['delivered', 'paid'].includes(o.status)).length
  };

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

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
    <div className="orders-standalone-page py-5">
      <style>{`
        .orders-standalone-page { background: var(--bg); min-height: 100vh; padding-top: 100px; color: var(--t1); font-family: var(--font-body); }
        .order-card { border-radius: 20px; border: 1px solid var(--border); background: #fff; transition: all 0.3s ease; }
        .order-card:hover { border-color: var(--gold); transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0,0,0,0.03); }
        .order-card-header { padding: 30px 40px; }
        .order-card-detail { background: var(--bg-2); padding: 40px; border-top: 1px solid var(--border); }
        .action-btn { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 12px 24px; border-radius: 100px; transition: all 0.2s; white-space: nowrap; }
        .action-btn-primary { background: var(--t1); color: #fff; border: 1px solid var(--t1); }
        .action-btn-primary:hover { background: #000; transform: translateY(-1px); }
        .action-btn-outline { background: transparent; color: var(--t2); border: 1px solid var(--border); }
        .action-btn-outline:hover { background: var(--bg-2); border-color: var(--t1); }
        
        .input-refined { width: 100%; border: 1px solid var(--border); border-radius: 14px; padding: 14px 20px; font-size: 0.95rem; background: #fff; outline: none; transition: var(--transition); color: var(--t1); }
        .input-refined:focus { border-color: var(--gold); box-shadow: 0 0 15px rgba(212,175,55,0.05); }

        @media (max-width: 768px) {
          .order-card-header { padding: 24px; }
          .order-card-detail { padding: 24px; }
        }
      `}</style>

      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 pb-4 border-bottom border-border">
          <div>
            <h1 className="font-display display-4 text-t1 mb-2">My Orders</h1>
            <p className="text-t3 tracking-widest text-uppercase m-0" style={{ fontSize: '0.75rem' }}>Track and manage your luxury acquisitions</p>
          </div>
          <div className="d-flex gap-4 mt-4 mt-md-0">
            <div className="text-center">
              <span className="h3 m-0 fw-bold">{stats.total}</span>
              <p className="x-small text-t3 uppercase tracking-widest m-0">Total</p>
            </div>
            <div className="text-center border-start border-border ps-4">
              <span className="h3 m-0 fw-bold text-warning">{stats.pending}</span>
              <p className="x-small text-t3 uppercase tracking-widest m-0">Pending</p>
            </div>
            <div className="text-center border-start border-border ps-4">
              <span className="h3 m-0 fw-bold text-success">{stats.completed}</span>
              <p className="x-small text-t3 uppercase tracking-widest m-0">Completed</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row g-3 mb-5">
          <div className="col-md-9">
             <input 
               type="text" 
               className="input-refined" 
               placeholder="Search by Order ID..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
          <div className="col-md-3">
             <select className="input-refined" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
             </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-5 rounded-4 bg-white border border-border">
            <HiOutlineShoppingBag size={80} className="text-t3 opacity-10 mb-4" />
            <h3 className="text-t2">No entries found</h3>
            <p className="text-t3 mb-4">No acquisitions match your current filter parameters.</p>
            <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="btn-gold px-5 py-2">Reset Global Filter</button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-5">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`order-card overflow-hidden ${expandedOrderId === order.id ? 'expanded' : ''}`}
              >
                {/* Header View */}
                <div className="order-card-header">
                  <div className="row align-items-center g-4">
                    <div className="col-lg-4">
                      <div className="d-flex align-items-center gap-4">
                        <div className="bg-bg-2 rounded-4 p-2 border border-border" style={{ width: 80, height: 80 }}>
                          <img src={order.items[0]?.imageGallery?.[0]} alt="" className="w-100 h-100 object-fit-contain" />
                        </div>
                        <div>
                          <h4 className="h5 m-0 fw-bold">{order.items[0]?.name}</h4>
                          <span className="small text-t3 font-mono opacity-50 d-block mt-1">ID: {order.id.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4 text-lg-center">
                       <div className="d-inline-flex flex-column align-items-center gap-2">
                          <StatusBadge status={order.status} />
                          <span className="small text-t3 mt-1 fw-medium">Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                       </div>
                    </div>

                    <div className="col-lg-4 text-lg-end">
                       <div>
                          <p className="h4 m-0 fw-bold mb-3 font-mono">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                          <div className="d-flex justify-content-lg-end gap-2">
                             <button className="action-btn action-btn-primary" onClick={() => toggleExpand(order.id)}>View Details</button>
                             {order.status === 'delivered' && <button className="action-btn action-btn-outline">Reorder</button>}
                             {order.status === 'pending' && <button className="action-btn action-btn-outline text-danger border-danger border-opacity-25" onClick={() => toast.success('Cancellation request sent')}>Cancel Order</button>}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Details View */}
                <AnimatePresence>
                  {expandedOrderId === order.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="order-card-detail">
                       <div className="row g-5">
                          <div className="col-lg-7">
                             <h5 className="section-label mb-4 opacity-50">Detailed Breakdown</h5>
                             <div className="d-flex flex-column gap-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="d-flex align-items-center justify-content-between p-3 bg-white rounded-3 border border-border border-opacity-50 transition-all hover:border-gold">
                                     <div className="d-flex align-items-center gap-4">
                                        <img src={item.imageGallery?.[0]} style={{ width: 50 }} alt="" />
                                        <div>
                                           <p className="m-0 fw-bold">{item.name}</p>
                                           <span className="small text-t3 opacity-50">Quantity: {item.qty} | Model Ref: CH-{idx+102}</span>
                                        </div>
                                     </div>
                                     <span className="fw-bold font-mono">₹{((item.dealPrice || item.price) * item.qty).toLocaleString()}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                          <div className="col-lg-5">
                             <div className="mb-5">
                                <h5 className="section-label mb-3 opacity-50">Delivery Logistics</h5>
                                <div className="p-4 bg-white rounded-4 border border-border border-opacity-50">
                                   <p className="mb-2 text-t1 fw-bold h6">{order.address?.fullName || user?.name || 'Authorized Recipient'}</p>
                                   <p className="small text-t3 mb-0">{order.address?.address}, {order.address?.city}</p>
                                   <p className="small text-t3 mb-0">{order.address?.zip} • Contact: {order.address?.phone}</p>
                                </div>
                             </div>
                             <div>
                                <h5 className="section-label mb-3 opacity-50">Financial Protocol</h5>
                                <div className="p-4 bg-white rounded-4 border border-border border-opacity-50 d-flex align-items-center gap-4">
                                   <div className="bg-bg-2 p-3 rounded-circle text-gold border border-border">
                                      {order.paymentMethod === 'online' ? <HiOutlineCreditCard size={24} /> : <HiOutlineBanknotes size={24} />}
                                   </div>
                                   <div>
                                      <p className="small fw-bold m-0 text-uppercase tracking-widest">{order.paymentMethod === 'online' ? 'Digital Clearing' : 'COD Settlement'}</p>
                                      <span className="x-small text-t3 opacity-50">Status: Secure Authorization</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
