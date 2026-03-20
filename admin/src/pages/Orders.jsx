import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { apiCall } from '../lib/apiHelper';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const STATUS_BADGE = {
  pending: 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25',
  paid: 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25',
  shipped: 'bg-info bg-opacity-10 text-info border border-info border-opacity-25',
  delivered: 'bg-success bg-opacity-10 text-success border border-success border-opacity-25',
  cancelled: 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25',
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
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
    },
    onError: () => toast.error('Check administrative clearance')
  });

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  if (isLoading) return <div className="p-10 text-center text-platinum opacity-50">Accessing Ledger...</div>;

  return (
    <div className="p-4 p-md-5">
      <div className="mb-5">
        <h1 className="font-display fw-bold text-white mb-1">Orders</h1>
        <p className="text-platinum small">Manage customer fulfillment and logistics.</p>
      </div>

      <div className="d-flex gap-2 mb-5 overflow-auto pb-2 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn btn-sm rounded-pill text-uppercase small fw-bold tracking-widest py-2 px-4 shadow-none transition-all ${
              activeTab === tab 
                ? 'btn-amber' 
                : 'bg-white bg-opacity-5 text-platinum hover-text-white'
            }`}
            style={{ fontSize: '10px' }}
          >
            {tab} ({orders.filter(o => tab === 'all' || o.status === tab).length})
          </button>
        ))}
      </div>

      <div className="glass overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="table table-chronix align-middle mb-0">
            <thead>
              <tr>
                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="ps-4 text-uppercase small fw-bold tracking-widest text-platinum" style={{ fontSize: '0.7rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id}>
                  <td className="ps-4 text-amber font-monospace small">{o.id.slice(-8).toUpperCase()}</td>
                  <td>
                    <p className="text-white fw-medium mb-0 small">{o.shippingAddress?.name || 'Guest'}</p>
                    <p className="text-platinum opacity-50 x-small mb-0">{o.shippingAddress?.email}</p>
                  </td>
                  <td className="text-platinum small">{o.items?.length || 0} items</td>
                  <td className="text-white fw-bold small">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                      className={`form-select form-select-sm bg-transparent border-white-5 text-uppercase small fw-bold rounded-3 shadow-none cursor-pointer ${STATUS_BADGE[o.status] || 'text-platinum'}`}
                      style={{ fontSize: '9px', maxWidth: '120px' }}
                    >
                      {TABS.slice(1).map(s => <option key={s} value={s} className="bg-obsidian-800 text-white">{s}</option>)}
                    </select>
                  </td>
                  <td className="text-platinum x-small">
                    {o.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'N/A'}
                  </td>
                  <td className="pe-4">
                    <button 
                      onClick={() => setSelectedOrder(o)}
                      className="btn btn-link text-amber h6 fw-bold text-decoration-none text-uppercase small p-0 tracking-tighter"
                      style={{ fontSize: '11px' }}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && <div className="p-5 text-center text-platinum opacity-25 italic small">No entries found for this category.</div>}
        </div>
      </div>

      <style>{`
        .x-small { font-size: 11px; }
        .hover-text-white:hover { color: #fff !important; background: rgba(255,255,255,0.1) !important; }
      `}</style>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content glass border-0 overflow-hidden shadow-2xl">
                <div className="modal-header border-bottom border-white-5 px-5 py-4 d-flex align-items-center justify-content-between">
                  <h3 className="modal-title font-display h4 fw-bold text-white">Order Manifest — {selectedOrder.id.slice(-8).toUpperCase()}</h3>
                  <button onClick={() => setSelectedOrder(null)} className="btn-close btn-close-white opacity-50 shadow-none" aria-label="Close"></button>
                </div>
                <div className="modal-body p-5 pt-4 scrollbar-hide" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                  <div className="row g-5 mb-5">
                    <div className="col-md-7">
                      <h4 className="text-uppercase small fw-bold text-amber tracking-widest mb-3" style={{ fontSize: '10px' }}>Shipping Destination</h4>
                      <div className="p-4 bg-white bg-opacity-5 rounded-4 border border-white-5">
                        <p className="text-white fw-bold mb-2">{selectedOrder.shippingAddress?.name}</p>
                        <div className="text-platinum small space-y-1">
                          <p className="mb-1">{selectedOrder.shippingAddress?.address}</p>
                          <p className="mb-1">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}</p>
                          <p className="mb-0 pt-2 border-top border-white-5 border-opacity-25 mt-2 opacity-50 font-monospace">{selectedOrder.shippingAddress?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-5">
                      <h4 className="text-uppercase small fw-bold text-amber tracking-widest mb-3" style={{ fontSize: '10px' }}>Order Analytics</h4>
                      <div className="p-4 bg-white bg-opacity-5 rounded-4 border border-white-5 h-100">
                        <div className="d-flex justify-content-between mb-3 border-bottom border-white-5 border-opacity-10 pb-2">
                           <span className="text-platinum small uppercase">Strategy</span>
                           <span className="text-white font-monospace small uppercase">{selectedOrder.paymentMethod}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-4">
                           <span className="text-platinum small uppercase">Status</span>
                           <span className={`badge rounded-pill ${STATUS_BADGE[selectedOrder.status]} border-0`} style={{ fontSize: '9px' }}>{selectedOrder.status}</span>
                        </div>
                        <div className="mt-auto">
                           <p className="text-platinum x-small uppercase mb-1">Settlement Total</p>
                           <p className="h2 font-display fw-bold text-white mb-0">₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <h4 className="text-uppercase small fw-bold text-amber tracking-widest mb-4" style={{ fontSize: '10px' }}>Acquisition Record</h4>
                    <div className="row g-3">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="d-flex align-items-center gap-4 bg-white bg-opacity-5 p-3 rounded-4 border border-white-5 hover-bg-obsidian-700 transition-all">
                            <div className="bg-obsidian-800 p-2 rounded-3" style={{ width: '64px', height: '64px' }}>
                              <img src={item.imageGallery?.[0]} className="w-100 h-100 object-fit-contain" alt="" />
                            </div>
                            <div className="flex-grow-1">
                              <p className="text-white fw-bold mb-1 small">{item.name}</p>
                              <p className="text-platinum x-small mb-0 opacity-75">Unit Count: {item.quantity} units</p>
                            </div>
                            <div className="text-end">
                              <p className="text-white font-monospace mb-0 fw-bold">₹{(item.dealPrice || item.price).toLocaleString('en-IN')}</p>
                              <p className="text-platinum x-small opacity-50 mb-0">Per Unit</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
