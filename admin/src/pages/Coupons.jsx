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
  const [formData, setFormData] = useState({ code: '', discount: '', description: '' });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const snapshot = await getDocs(query(collection(db, 'coupons'), orderBy('createdAt', 'desc')));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
  });

  const couponMutation = useMutation({
    mutationFn: (data) => apiCall('post', '/api/coupons', data),
    onSuccess: () => { queryClient.invalidateQueries(['admin-coupons']); toast.success('Coupon created'); setShowModal(false); setFormData({ code: '', discount: '', description: '' }); },
    onError: () => toast.error('Failed to create coupon')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiCall('delete', `/api/coupons/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['admin-coupons']); toast.success('Coupon removed'); },
    onError: () => toast.error('Failed to delete')
  });

  const closeModal = () => { setShowModal(false); setFormData({ code: '', discount: '', description: '' }); };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ padding: '32px 36px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.6rem', color: '#111827', marginBottom: '4px' }}>Coupons</h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Manage promotional discount codes.</p>
        </div>
        <button className="btn btn-amber d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <HiOutlinePlus size={18} /> Create Coupon
        </button>
      </div>

      <div className="glass overflow-hidden">
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
                  <tr key={i}><td colSpan="4" style={{ padding: '16px' }}>
                    <div className="placeholder-glow"><span className="placeholder col-12 rounded-2" style={{ height: 44, background: '#F3F4F6' }} /></div>
                  </td></tr>
                ))
              ) : coupons.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '48px', color: '#D1D5DB', fontStyle: 'italic', fontSize: '14px' }}>
                  No coupons yet. Create your first.
                </td></tr>
              ) : coupons.map(c => (
                <tr key={c.id}>
                  <td className="ps-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <HiOutlineTicket size={18} />
                      </div>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: '14px', color: '#92400E', letterSpacing: '0.08em' }}>
                        {c.code}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge status-badge-paid" style={{ fontSize: '13px' }}>
                      {c.discount}% OFF
                    </span>
                  </td>
                  <td style={{ color: '#6B7280', fontSize: '13px' }}>{c.description}</td>
                  <td className="text-end pe-4">
                    <button
                      onClick={() => { if (window.confirm(`Delete "${c.code}"?`)) deleteMutation.mutate(c.id); }}
                      style={{ width: 34, height: 34, border: 'none', background: '#F3F4F6', color: '#6B7280', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#991B1B'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#6B7280'; }}
                    >
                      <HiOutlineTrash size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal show d-block" style={{ background: 'rgba(17,24,39,0.2)', zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.2 }}
                className="modal-content"
              >
                <div className="modal-header px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: '#111827', margin: 0 }}>
                    Create Coupon
                  </h4>
                  <button
                    onClick={closeModal}
                    style={{ border: 'none', background: '#F3F4F6', color: '#6B7280', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                    onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
                  >
                    <HiOutlineX size={18} />
                  </button>
                </div>

                <div style={{ padding: '28px 40px 32px' }}>
                  <form onSubmit={e => { e.preventDefault(); couponMutation.mutate(formData); }}>
                    {/* Code */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                        Coupon Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="E.G. FIRSTBUY10"
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        required
                        style={{
                          height: '52px',
                          fontFamily: 'DM Mono, monospace',
                          fontSize: '16px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#92400E',
                        }}
                      />

                      {/* Live Preview */}
                      <AnimatePresence>
                        {formData.code && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}
                          >
                            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>Preview:</span>
                            <span className="coupon-preview-badge">
                              <HiOutlineTicket size={14} />
                              {formData.code}
                              {formData.discount && (
                                <span style={{ background: '#FDE68A', color: '#92400E', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                                  {formData.discount}% OFF
                                </span>
                              )}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Discount */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="10"
                        value={formData.discount}
                        onChange={e => setFormData({ ...formData, discount: e.target.value })}
                        required min="1" max="100"
                        style={{ height: '48px', fontSize: '15px' }}
                      />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '28px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Valid for first-time customers..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{ fontSize: '14px', resize: 'none' }}
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-obsidian flex-grow-1 py-2" onClick={closeModal}>Cancel</button>
                      <button type="submit" className="btn btn-amber flex-grow-1 py-2" disabled={couponMutation.isPending}>
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
