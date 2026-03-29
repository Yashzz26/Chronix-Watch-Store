import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';

const getStatusClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'delivered' || s === 'completed') return 'status-badge status-badge-delivered';
  if (s === 'paid') return 'status-badge status-badge-paid';
  if (s === 'shipped') return 'status-badge status-badge-shipped';
  if (s === 'cancelled') return 'status-badge status-badge-cancelled';
  return 'status-badge status-badge-pending';
};

const Customers = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'customer')));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
  });

  const { data: customerOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-orders', selectedCustomer?.uid],
    queryFn: async () => {
      if (!selectedCustomer) return [];
      const snapshot = await getDocs(
        query(collection(db, 'orders'), where('userId', '==', selectedCustomer.uid), orderBy('createdAt', 'desc'))
      );
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    enabled: !!selectedCustomer
  });

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (isLoading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
      <div className="spinner-border text-amber" role="status" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 p-md-5"
    >
      <div className="mb-5">
        <h1 className="font-display fw-bold text-white mb-1">Customers</h1>
        <p className="text-platinum small">Directory of Chronix patrons and their lifecycle data.</p>
      </div>

      <div className="glass overflow-hidden border border-white-5">
        <div className="table-responsive">
          <table className="table table-chronix align-middle mb-0">
            <thead>
              <tr>
                {['Patron', 'Email', 'Contact', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="ps-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-amber fw-bold flex-shrink-0 overflow-hidden"
                        style={{
                          width: '48px', height: '48px', fontSize: '14px',
                          background: 'rgba(245,166,35,0.1)',
                          border: '1px solid rgba(245,166,35,0.2)',
                          boxShadow: '0 0 12px rgba(245,166,35,0.2)',
                        }}
                      >
                        {c.photo
                          ? <img src={c.photo} className="w-100 h-100 object-fit-cover" alt="" />
                          : getInitials(c.name)}
                      </div>
                      <div>
                        <p className="text-white fw-bold mb-0 small">{c.name || 'Anonymous User'}</p>
                        <p className="text-platinum opacity-25 font-mono mb-0" style={{ fontSize: '9px' }}>
                          {c.uid?.slice(0, 12)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-platinum small">{c.email}</td>
                  <td className="text-platinum small">{c.phone || '—'}</td>
                  <td>
                    <span className="status-badge status-badge-active">Active</span>
                  </td>
                  <td className="text-platinum x-small">
                    {c.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'N/A'}
                  </td>
                  <td className="pe-4">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="btn btn-sm fw-bold border-0 shadow-none transition-all"
                      style={{
                        background: 'rgba(245,166,35,0.1)',
                        color: '#F5A623',
                        fontSize: '11px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        letterSpacing: '0.04em',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,166,35,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,166,35,0.1)'}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      <AnimatePresence>
        {selectedCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
              }}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="order-drawer"
              style={{ zIndex: 9999 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="order-drawer-header d-flex align-items-center justify-content-between">
                <h3 className="font-display h4 fw-bold text-white mb-0">Patron Dossier</h3>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="btn border-0 text-platinum p-2 hover-text-white transition-all shadow-none"
                  style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}
                >
                  <HiOutlineX size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="order-drawer-body scrollbar-hide">
                {/* Avatar + Name */}
                <div className="text-center mb-5">
                  <div
                    className="d-inline-block mb-4 rounded-circle"
                    style={{ padding: '3px', background: 'radial-gradient(circle, rgba(245,166,35,0.25), rgba(245,166,35,0.05))' }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-amber fw-bold overflow-hidden"
                      style={{
                        width: '140px', height: '140px', fontSize: '42px',
                        background: 'rgba(26,26,36,0.9)',
                        border: '2px solid rgba(245,166,35,0.25)',
                        boxShadow: '0 0 40px rgba(245,166,35,0.15)',
                      }}
                    >
                      {selectedCustomer.photo
                        ? <img src={selectedCustomer.photo} className="w-100 h-100 object-fit-cover" alt="" />
                        : getInitials(selectedCustomer.name)}
                    </div>
                  </div>
                  <h4 className="font-display h3 fw-bold text-white mb-1">{selectedCustomer.name}</h4>
                  <p className="text-platinum small opacity-75 fst-italic mb-0">{selectedCustomer.email}</p>
                </div>

                {/* Stat Cards */}
                <div className="row g-3 mb-5">
                  <div className="col-6">
                    <div className="glass p-5 rounded-4 text-center h-100">
                      <p className="text-platinum text-uppercase small fw-bold tracking-widest opacity-50 mb-2" style={{ fontSize: '9px' }}>
                        Total Orders
                      </p>
                      <p className="h3 fw-bold text-amber mb-0">{customerOrders.length}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="glass p-5 rounded-4 text-center h-100">
                      <p className="text-platinum text-uppercase small fw-bold tracking-widest opacity-50 mb-2" style={{ fontSize: '9px' }}>
                        Lifetime Value
                      </p>
                      <p className="h3 fw-bold text-amber mb-0">
                        ₹{customerOrders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <p className="x-small text-amber fw-bold text-uppercase tracking-widest mb-3">
                    📋 Acquisition History
                  </p>
                  {ordersLoading ? (
                    <div className="text-center py-5 text-platinum opacity-50 small fst-italic">
                      Scanning Ledger...
                    </div>
                  ) : customerOrders.length === 0 ? (
                    <div className="text-center py-5 glass rounded-4 opacity-25">
                      <p className="small fst-italic mb-0">No prior acquisitions registered.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {customerOrders.map(o => (
                        <div
                          key={o.id}
                          className="p-4 rounded-4 border border-white-5 d-flex align-items-center justify-content-between hover-lift"
                          style={{ background: 'rgba(255,255,255,0.02)' }}
                        >
                          <div>
                            <p className="text-white font-mono fw-bold small text-uppercase mb-1">
                              #{o.id.slice(-8)}
                            </p>
                            <p className="text-platinum opacity-50 x-small mb-0">
                              {o.createdAt?.toDate?.()?.toLocaleDateString('en-IN') ||
                               (o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'N/A')}
                            </p>
                          </div>
                          <div className="text-end">
                            <p className="text-white fw-bold mb-1">₹{o.totalAmount?.toLocaleString('en-IN')}</p>
                            <span className={getStatusClass(o.status)}>{o.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Customers;
