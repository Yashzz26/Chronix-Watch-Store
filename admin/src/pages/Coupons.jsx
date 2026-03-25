import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { apiCall } from '../lib/apiHelper';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineTicket } from 'react-icons/hi';
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

  return (
    <div className="p-4 p-lg-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="h2 font-display text-white mb-2">Promotional Coupons</h1>
          <p className="text-platinum opacity-50 small mb-0">Manage active discount codes for Chronix</p>
        </div>
        <button 
          className="btn-amber d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <HiOutlinePlus size={20} /> Create Coupon
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden border border-white-5">
        <table className="table table-dark table-hover mb-0 admin-table">
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
                <tr key={i} className="placeholder-glow">
                  <td colSpan="4" className="py-4"><span className="placeholder w-100 bg-white-5"></span></td>
                </tr>
              ))
            ) : coupons.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-5 opacity-50 italic">No coupons found</td></tr>
            ) : coupons.map(c => (
              <tr key={c.id}>
                <td className="ps-4">
                  <span className="badge bg-amber-soft text-amber font-mono py-2 px-3">{c.code}</span>
                </td>
                <td><span className="text-white fw-bold">{c.discount}% OFF</span></td>
                <td><span className="text-platinum small">{c.description}</span></td>
                <td className="text-end pe-4">
                  <button 
                    onClick={() => deleteMutation.mutate(c.id)}
                    className="btn btn-obsidian p-2 text-danger border-0"
                  >
                    <HiOutlineTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-root">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="modal-backdrop" onClick={() => setShowModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content-wrap glass"
            >
              <div className="p-4 border-bottom border-white-5 d-flex justify-content-between align-items-center">
                <h4 className="mb-0 text-white font-display">Create Promotional Code</h4>
                <button className="btn-obsidian border-0 p-2" onClick={() => setShowModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4">
                <div className="mb-4">
                  <label className="form-label admin-label">Coupon Code</label>
                  <input 
                    type="text" className="form-control admin-input uppercase"
                    placeholder="E.G. FIRSTBUY"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                
                <div className="row g-4 mb-4">
                  <div className="col-12">
                    <label className="form-label admin-label">Discount Percentage (%)</label>
                    <input 
                      type="number" className="form-control admin-input"
                      placeholder="10"
                      value={formData.discount}
                      onChange={e => setFormData({...formData, discount: e.target.value})}
                      required min="1" max="100"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label admin-label">Description</label>
                  <textarea 
                    className="form-control admin-input" rows="3"
                    placeholder="Valid for first-time customers..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="d-flex gap-3 justify-content-end pt-3">
                  <button type="button" className="btn btn-obsidian px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-amber px-4" disabled={couponMutation.isLoading}>
                    {couponMutation.isLoading ? 'Processing...' : 'Activate Coupon'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Coupons;
