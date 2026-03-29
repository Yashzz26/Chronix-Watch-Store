import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';

const getStatusClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'delivered' || s === 'completed') return 'status-badge status-badge-completed';
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
      const snapshot = await getDocs(query(collection(db, 'orders'), where('userId', '==', selectedCustomer.uid), orderBy('createdAt', 'desc')));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    enabled: !!selectedCustomer
  });

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const getColor = (name) => {
    const colors = ['#FEF3C7:#92400E', '#DBEAFE:#1E40AF', '#D1FAE5:#065F46', '#E0E7FF:#3730A3', '#FCE7F3:#9D174D'];
    const idx = (name?.charCodeAt(0) || 0) % colors.length;
    const [bg, color] = colors[idx].split(':');
    return { background: bg, color };
  };

  if (isLoading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
      <div className="spinner-border" style={{ color: '#D97706' }} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.6rem', color: '#111827', marginBottom: '4px' }}>Customers</h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Directory of Chronix patrons and their lifecycle data.</p>
      </div>

      <div className="glass overflow-hidden">
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
              {customers.map(c => {
                const { background, color } = getColor(c.name);
                return (
                  <tr key={c.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{ width: 44, height: 44, borderRadius: '50%', background, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color, flexShrink: 0, border: '2px solid rgba(255,255,255,0.8)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}
                        >
                          {c.photo ? <img src={c.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : getInitials(c.name)}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{c.name || 'Anonymous'}</p>
                          <p style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#D1D5DB', margin: 0 }}>{c.uid?.slice(0, 10)}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#6B7280', fontSize: '13px' }}>{c.email}</td>
                    <td style={{ color: '#6B7280', fontSize: '13px' }}>{c.phone || '—'}</td>
                    <td><span className="status-badge status-badge-active">Active</span></td>
                    <td style={{ color: '#9CA3AF', fontSize: '12px' }}>
                      {c.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'N/A'}
                    </td>
                    <td className="pe-4">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                        onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Drawer */}
      <AnimatePresence>
        {selectedCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(17,24,39,0.2)' }}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="order-drawer" style={{ zIndex: 9999 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="order-drawer-header d-flex align-items-center justify-content-between">
                <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#111827', margin: 0 }}>
                  Customer Profile
                </h3>
                <button onClick={() => setSelectedCustomer(null)} style={{ border: 'none', background: '#F3F4F6', color: '#6B7280', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'} onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}>
                  <HiOutlineX size={18} />
                </button>
              </div>

              <div className="order-drawer-body scrollbar-hide">
                {/* Avatar */}
                <div className="text-center mb-5">
                  {(() => {
                    const { background, color } = getColor(selectedCustomer.name);
                    return (
                      <div style={{ display: 'inline-flex', padding: 4, borderRadius: '50%', background: '#F3F4F6', marginBottom: 16 }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '26px', color, overflow: 'hidden' }}>
                          {selectedCustomer.photo ? <img src={selectedCustomer.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : getInitials(selectedCustomer.name)}
                        </div>
                      </div>
                    );
                  })()}
                  <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: '#111827', marginBottom: '4px', fontSize: '1.2rem' }}>
                    {selectedCustomer.name}
                  </h4>
                  <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>{selectedCustomer.email}</p>
                </div>

                {/* Stats */}
                <div className="row g-3 mb-5">
                  {[
                    { label: 'Total Orders', value: customerOrders.length },
                    { label: 'Lifetime Value', value: `₹${customerOrders.reduce((s, o) => s + (o.totalPrice || 0), 0).toLocaleString('en-IN')}` }
                  ].map(({ label, value }) => (
                    <div className="col-6" key={label}>
                      <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px 16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{label}</p>
                        <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order History */}
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                    Order History
                  </p>
                  {ordersLoading ? (
                    <p style={{ color: '#D1D5DB', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>Loading...</p>
                  ) : customerOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                      <p style={{ color: '#D1D5DB', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>No orders yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {customerOrders.map(o => (
                        <div
                          key={o.id}
                          className="hover-lift"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', transition: 'all 0.2s' }}
                        >
                          <div>
                            <p style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: '12px', color: '#374151', margin: '0 0 3px', textTransform: 'uppercase' }}>
                              #{o.id.slice(-8)}
                            </p>
                            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                              {o.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || (o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'N/A')}
                            </p>
                          </div>
                          <div className="text-end">
                            <p style={{ fontWeight: 700, color: '#111827', margin: '0 0 4px', fontSize: '14px' }}>₹{o.totalPrice?.toLocaleString('en-IN')}</p>
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
