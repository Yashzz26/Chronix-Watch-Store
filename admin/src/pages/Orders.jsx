import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { apiCall } from '../lib/apiHelper';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiOutlineEye } from 'react-icons/hi';

const TABS = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'];

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Pending',   cls: 'status-badge-pending' },
  { value: 'paid',      label: 'Paid',       cls: 'status-badge-paid' },
  { value: 'shipped',   label: 'Shipped',    cls: 'status-badge-shipped' },
  { value: 'delivered', label: 'Delivered',  cls: 'status-badge-delivered' },
  { value: 'cancelled', label: 'Cancelled',  cls: 'status-badge-cancelled' },
];

const getStatusClass = (status) => {
  const found = STATUS_OPTIONS.find(o => o.value === (status || '').toLowerCase());
  return found ? `status-badge ${found.cls}` : 'status-badge status-badge-pending';
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDropdown, setStatusDropdown] = useState(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => apiCall('patch', `/api/orders/admin/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order status updated');
      setStatusDropdown(null);
    },
    onError: () => toast.error('Update failed')
  });

  const filteredOrders = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

  if (isLoading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
      <div className="spinner-border" style={{ color: '#D97706' }} />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ padding: '32px 36px' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.6rem', color: '#111827', marginBottom: '4px' }}>Orders</h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Manage customer fulfillment and logistics.</p>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="btn btn-sm"
            style={{
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.03em',
              textTransform: 'capitalize',
              padding: '6px 14px',
              border: activeTab === tab ? '1px solid #111827' : '1px solid #E5E7EB',
              background: activeTab === tab ? '#111827' : '#FFFFFF',
              color: activeTab === tab ? '#FFFFFF' : '#6B7280',
              transition: 'all 0.15s ease',
            }}
          >
            {tab} ({orders.filter(o => tab === 'all' || o.status === tab).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="table-responsive">
          <table className="table table-chronix align-middle mb-0">
            <thead>
              <tr>
                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="ps-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id} style={{ position: 'relative' }}>
                  <td className="ps-4">
                    <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: '#D97706', fontSize: '13px' }}>
                      {o.id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <p style={{ fontWeight: 600, color: '#111827', margin: '0 0 2px', fontSize: '14px' }}>
                      {o.shippingAddress?.name || 'Guest'}
                    </p>
                    <p style={{ color: '#9CA3AF', margin: 0, fontSize: '12px' }}>
                      {o.shippingAddress?.email}
                    </p>
                  </td>
                  <td style={{ color: '#6B7280', fontSize: '13px' }}>{o.items?.length || 0} items</td>
                  <td style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>
                    ₹{o.totalAmount?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button
                      className={getStatusClass(o.status)}
                      style={{ border: 'none', cursor: 'pointer' }}
                      onClick={() => setStatusDropdown(statusDropdown === o.id ? null : o.id)}
                    >
                      {o.status || 'pending'} ▾
                    </button>
                    <AnimatePresence>
                      {statusDropdown === o.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.97 }}
                          transition={{ duration: 0.12 }}
                          style={{
                            position: 'absolute', top: '100%', left: 0, zIndex: 500,
                            background: '#FFFFFF', border: '1px solid #E5E7EB',
                            borderRadius: '12px', padding: '6px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: '160px',
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                border: 'none', background: 'transparent',
                                padding: '6px 8px', borderRadius: '8px', cursor: 'pointer',
                                marginBottom: '2px', transition: 'background 0.1s',
                              }}
                              onClick={() => statusMutation.mutate({ id: o.id, status: opt.value })}
                              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <span className={`status-badge ${opt.cls}`}>{opt.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                  <td style={{ color: '#9CA3AF', fontSize: '12px' }}>
                    {o.createdAt?.toDate?.()?.toLocaleDateString('en-IN') ||
                      (o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'N/A')}
                  </td>
                  <td className="pe-4">
                    <button
                      onClick={() => { setSelectedOrder(o); setStatusDropdown(null); }}
                      className="btn btn-sm d-flex align-items-center gap-2"
                      style={{
                        background: '#F3F4F6', color: '#374151', fontSize: '12px',
                        padding: '6px 12px', borderRadius: '8px', border: 'none',
                        fontWeight: 600, transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#F3F4F6'; }}
                    >
                      <HiOutlineEye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#D1D5DB', fontStyle: 'italic', fontSize: '14px' }}>
              No entries found for this filter.
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {statusDropdown && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 499 }}
          onClick={() => setStatusDropdown(null)}
        />
      )}

      {/* Slide-In Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                background: 'rgba(17, 24, 39, 0.25)',
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="order-drawer"
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="order-drawer-header d-flex align-items-start justify-content-between">
                <div>
                  <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#111827', marginBottom: '4px' }}>
                    Order Details
                  </h3>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, color: '#D97706', margin: 0, fontSize: '13px' }}>
                    #{selectedOrder.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    border: 'none', background: '#F3F4F6', color: '#6B7280',
                    padding: '8px', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
                >
                  <HiOutlineX size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="order-drawer-body scrollbar-hide">

                {/* Shipping */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                    Shipping Destination
                  </p>
                  <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                    <p style={{ fontWeight: 700, color: '#111827', marginBottom: '6px', fontSize: '14px' }}>
                      {selectedOrder.shippingAddress?.name}
                    </p>
                    <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>
                      {selectedOrder.shippingAddress?.address}<br />
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}
                    </p>
                    {selectedOrder.shippingAddress?.email && (
                      <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#9CA3AF', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E5E7EB', marginBottom: 0 }}>
                        {selectedOrder.shippingAddress?.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Analytics */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                    Order Overview
                  </p>
                  <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-3" style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>Payment</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', textTransform: 'uppercase' }}>
                        {selectedOrder.paymentMethod || '—'}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-3" style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>Status</span>
                      <span className={getStatusClass(selectedOrder.status)}>{selectedOrder.status}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>Total</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>
                        ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                    Items ({selectedOrder.items?.length || 0})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedOrder.items?.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          background: '#F9FAFB', border: '1px solid #E5E7EB',
                          borderRadius: '10px', padding: '12px',
                        }}
                      >
                        <div style={{ width: 52, height: 52, borderRadius: '8px', background: '#FFFFFF', border: '1px solid #E5E7EB', padding: 6, flexShrink: 0 }}>
                          <img src={item.imageGallery?.[0]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{item.name}</p>
                          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Qty: {item.qty || item.quantity}</p>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0, flexShrink: 0 }}>
                          ₹{(item.dealPrice || item.price)?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Orders;
