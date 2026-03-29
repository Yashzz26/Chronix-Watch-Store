import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { apiCall } from '../lib/apiHelper';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineTicket, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Coupons = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    description: ''
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const snapshot = await getDocs(query(collection(db, 'coupons'), orderBy('createdAt', 'desc')));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
  });

  const couponMutation = useMutation({
    mutationFn: (data) => apiCall('post', '/api/coupons', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-coupons']);
      toast.success('Coupon created successfully');
      setShowModal(false);
      setFormData({ code: '', discount: '', description: '' });
    },
    onError: () => toast.error('Failed to create coupon')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiCall('delete', `/api/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-coupons']);
      toast.success('Coupon removed');
    },
    onError: () => toast.error('Failed to delete coupon')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    couponMutation.mutate(formData);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ code: '', discount: '', description: '' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 p-lg-5"
    >
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="font-display fw-bold text-white mb-1">Promotional Coupons</h1>
          <p className="text-platinum small mb-0">Manage active discount codes for Chronix</p>
        </div>
        <button
          className="btn btn-amber d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <HiOutlinePlus size={20} /> Create Coupon
        </button>
      </div>

      <div className="glass overflow-hidden border border-white-5">
        <div className="table-responsive">
          <table className="table table-chronix align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4">Code</th>
                <th>Discount</th>
                <th>Description</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="4" className="py-4 px-4">
                      <div className="placeholder-glow">
                        <span className="placeholder col-12 bg-obsidian-700 rounded-2" style={{ height: 44 }} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-platinum opacity-25 fst-italic small">
                    No coupons found. Create your first promotional code.
                  </td>
                </tr>
              ) : coupons.map(c => (
                <tr key={c.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2"
                        style={{ width: 36, height: 36, background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}
                      >
                        <HiOutlineTicket size={18} />
                      </div>
                      <span
                        className="font-mono fw-bold text-amber"
                        style={{ fontSize: '14px', letterSpacing: '0.1em' }}
                      >
                        {c.code}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge status-badge-paid" style={{ fontSize: '13px' }}>
                      {c.discount}% OFF
                    </span>
                  </td>
                  <td className="text-platinum small opacity-75">{c.description}</td>
                  <td className="text-end pe-4">
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete coupon "${c.code}"?`)) deleteMutation.mutate(c.id);
                      }}
                      className="btn btn-sm border-0 shadow-none transition-all p-2 rounded-2"
                      title="Delete coupon"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#8B8FA8' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = '#8B8FA8';
                      }}
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="modal-content glass border-0"
              >
                <div className="modal-header border-bottom border-white-5 px-5 py-4 d-flex align-items-center justify-content-between">
                  <h4 className="text-white fw-bold m-0 font-display">Create Promotional Code</h4>
                  <button
                    className="btn border-0 text-platinum p-2 shadow-none hover-text-white transition-all"
                    style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}
                    onClick={closeModal}
                  >
                    <HiOutlineX size={18} />
                  </button>
                </div>

                <div className="modal-body px-5 py-4">
                  <form onSubmit={handleSubmit}>

                    {/* Coupon Code Input */}
                    <div className="mb-4">
                      <label className="form-label text-platinum small fw-medium mb-2">Coupon Code</label>
                      <input
                        type="text"
                        className="form-control bg-obsidian-800 border-white-5 text-amber font-mono shadow-none"
                        placeholder="E.G. FIRSTBUY10"
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        required
                        style={{
                          height: '52px',
                          fontSize: '16px',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}
                      />

                      {/* Live Coupon Preview */}
                      <AnimatePresence>
                        {formData.code && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="mt-3 d-flex align-items-center gap-3"
                          >
                            <span className="text-platinum x-small opacity-50">Preview:</span>
                            <div className="coupon-preview-badge">
                              <HiOutlineTicket size={16} />
                              {formData.code}
                              {formData.discount && (
                                <span
                                  className="ms-2 px-2 py-1 rounded-2 fw-bold"
                                  style={{ background: 'rgba(245,166,35,0.2)', fontSize: '11px' }}
                                >
                                  {formData.discount}% OFF
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Discount */}
                    <div className="mb-4">
                      <label className="form-label text-platinum small fw-medium mb-2">Discount Percentage (%)</label>
                      <input
                        type="number"
                        className="form-control bg-obsidian-800 border-white-5 text-white shadow-none"
                        placeholder="10"
                        value={formData.discount}
                        onChange={e => setFormData({ ...formData, discount: e.target.value })}
                        required
                        min="1"
                        max="100"
                        style={{ height: '48px', fontSize: '15px' }}
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-5">
                      <label className="form-label text-platinum small fw-medium mb-2">Description</label>
                      <textarea
                        className="form-control bg-obsidian-800 border-white-5 text-white shadow-none"
                        rows="3"
                        placeholder="Valid for first-time customers only..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{ fontSize: '15px', resize: 'none' }}
                      />
                    </div>

                    <div className="d-flex gap-3">
                      <button type="button" className="btn btn-obsidian px-4 py-2 flex-grow-1" onClick={closeModal}>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-amber px-4 py-2 flex-grow-1 fw-bold"
                        disabled={couponMutation.isPending}
                      >
                        {couponMutation.isPending ? 'Creating...' : 'Activate Coupon'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Coupons;
