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
  const [statusDropdown, setStatusDropdown] = useState(null); // order id with open dropdown
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
    onError: () => toast.error('Check administrative clearance')
  });

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status === activeTab);

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
        <h1 className="font-display fw-bold text-white mb-1">Orders</h1>
        <p className="text-platinum small">Manage customer fulfillment and logistics.</p>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-5 overflow-auto pb-2 scrollbar-hide flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn btn-sm rounded-pill text-uppercase fw-bold shadow-none transition-all ${
              activeTab === tab
                ? 'btn-amber'
                : 'bg-white bg-opacity-5 text-platinum hover-text-white'
            }`}
            style={{ fontSize: '10px', letterSpacing: '0.08em', padding: '6px 16px' }}
          >
            {tab} ({orders.filter(o => tab === 'all' || o.status === tab).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass overflow-hidden border border-white-5">
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
                    <span
                      className="font-mono fw-bold text-amber"
                      style={{ fontSize: '14px', letterSpacing: '0.02em' }}
                    >
                      {o.id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <p className="text-white fw-medium mb-0 small">{o.shippingAddress?.name || 'Guest'}</p>
                    <p className="text-platinum opacity-50 mb-0" style={{ fontSize: '11px' }}>
                      {o.shippingAddress?.email}
                    </p>
                  </td>
                  <td className="text-platinum small">{o.items?.length || 0} items</td>
                  <td className="text-white fw-bold small">₹{o.totalAmount?.toLocaleString('en-IN')}</td>

                  {/* Custom Status Badge Dropdown */}
                  <td style={{ position: 'relative' }}>
                    <button
                      className={`${getStatusClass(o.status)} border-0 cursor-pointer`}
                      style={{ background: 'inherit' }}
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
                          transition={{ duration: 0.15 }}
                          className="position-absolute bg-obsidian-800 border border-white-5 rounded-3 p-2 shadow-2xl"
                          style={{ top: '100%', left: 0, zIndex: 500, minWidth: '160px' }}
                          onClick={e => e.stopPropagation()}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              className={`d-block w-100 text-start border-0 bg-transparent mb-1 p-2 rounded-2 cursor-pointer transition-all hover-bg-obsidian-700`}
                              onClick={() => statusMutation.mutate({ id: o.id, status: opt.value })}
                            >
                              <span className={`status-badge ${opt.cls}`}>{opt.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>

                  <td className="text-platinum x-small">
                    {o.createdAt?.toDate?.()?.toLocaleDateString('en-IN') ||
                     (o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'N/A')}
                  </td>
                  <td className="pe-4">
                    <button
                      onClick={() => { setSelectedOrder(o); setStatusDropdown(null); }}
                      className="btn btn-sm d-flex align-items-center gap-2 fw-bold border-0 shadow-none transition-all"
                      style={{
                        background: 'rgba(245,166,35,0.1)',
                        color: '#F5A623',
                        fontSize: '11px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        letterSpacing: '0.04em',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(245,166,35,0.2)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(245,166,35,0.1)';
                      }}
                    >
                      <HiOutlineEye size={14} /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-5 text-center text-platinum opacity-25 fst-italic small">
              No entries found for this category.
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {statusDropdown && (
        <div
          className="position-fixed inset-0"
          style={{ zIndex: 499, top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setStatusDropdown(null)}
        />
      )}

      {/* ── Slide-In Order Drawer ── */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
              }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="order-drawer"
              style={{ zIndex: 9999 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="order-drawer-header d-flex align-items-start justify-content-between">
                <div>
                  <h3 className="font-display h4 fw-bold text-white mb-1">
                    Order Manifest
                  </h3>
                  <p className="font-mono text-amber fw-bold mb-0" style={{ fontSize: '13px', letterSpacing: '0.05em' }}>
                    #{selectedOrder.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn border-0 text-platinum p-2 hover-text-white transition-all shadow-none"
                  style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}
                >
                  <HiOutlineX size={20} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="order-drawer-body scrollbar-hide">

                {/* Shipping Destination */}
                <div className="mb-4">
                  <p className="x-small text-amber fw-bold text-uppercase tracking-widest mb-3">
                    📦 Shipping Destination
                  </p>
                  <div className="p-4 rounded-4 border border-white-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-white fw-bold mb-2">{selectedOrder.shippingAddress?.name}</p>
                    <div className="text-platinum small">
                      <p className="mb-1">{selectedOrder.shippingAddress?.address}</p>
                      <p className="mb-1">
                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}
                      </p>
                      <p className="mb-0 mt-2 pt-2 border-top border-white-5 font-mono opacity-60" style={{ fontSize: '11px' }}>
                        {selectedOrder.shippingAddress?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Analytics */}
                <div className="mb-4">
                  <p className="x-small text-amber fw-bold text-uppercase tracking-widest mb-3">
                    📊 Order Analytics
                  </p>
                  <div className="p-4 rounded-4 border border-white-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-white-5">
                      <span className="text-platinum small">Payment Method</span>
                      <span className="text-white font-mono small text-uppercase">{selectedOrder.paymentMethod || '—'}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <span className="text-platinum small">Status</span>
                      <span className={getStatusClass(selectedOrder.status)}>{selectedOrder.status}</span>
                    </div>
                    <div>
                      <p className="text-platinum x-small text-uppercase tracking-widest mb-1">Settlement Total</p>
                      <p className="font-display fw-bold text-white mb-0" style={{ fontSize: '2rem' }}>
                        ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acquisition Record */}
                <div>
                  <p className="x-small text-amber fw-bold text-uppercase tracking-widest mb-3">
                    🛍️ Acquisition Record
                  </p>
                  <div className="d-flex flex-column gap-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="d-flex align-items-center gap-3 p-3 rounded-4 border border-white-5 transition-all hover-bg-obsidian-700"
                        style={{ background: 'rgba(255,255,255,0.02)' }}
                      >
                        <div
                          className="bg-obsidian-800 rounded-3 flex-shrink-0 border border-white-5"
                          style={{ width: '64px', height: '64px', padding: '6px' }}
                        >
                          <img
                            src={item.imageGallery?.[0]}
                            className="w-100 h-100 object-fit-contain"
                            alt=""
                          />
                        </div>
                        <div className="flex-grow-1">
                          <p className="text-white fw-bold mb-1 small">{item.name}</p>
                          <div className="d-flex align-items-center gap-3">
                            <p className="text-platinum x-small mb-0 opacity-75">
                              Qty: {item.qty || item.quantity}
                            </p>
                            {item.variants && (
                              <p className="text-amber x-small mb-0 fw-bold text-uppercase" style={{ fontSize: '9px' }}>
                                {item.variants.size} • {item.variants.color}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-end flex-shrink-0">
                          <p className="text-white font-mono fw-bold mb-0 small">
                            ₹{(item.dealPrice || item.price)?.toLocaleString('en-IN')}
                          </p>
                          <p className="text-platinum x-small opacity-50 mb-0">per unit</p>
                        </div>
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
