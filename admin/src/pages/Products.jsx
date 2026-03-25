import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { apiCall } from '../lib/apiHelper';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlinePhotograph, HiOutlineCloudUpload } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Categories = ['Analog', 'Smart Watch', 'Luxury', 'Gifts for Him', 'Gifts for Her', 'Limited Edition'];

const Products = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Luxury',
    price: '',
    stock: '',
    description: '',
    imageGallery: ['', '', '', ''],
    isOnDeal: false,
    dealPrice: ''
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const snapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
  });

  const productMutation = useMutation({
    mutationFn: (data) => {
      const method = editingProduct ? 'put' : 'post';
      const endpoint = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      return apiCall(method, endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success(editingProduct ? 'Product updated' : 'Product created');
      setShowModal(false);
      resetForm();
    },
    onError: () => toast.error('Check server status and admin role')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiCall('delete', `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success('Product removed from archive');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Failed to delete product')
  });

  const resetForm = () => {
    setFormData({
      name: '', category: 'Luxury', price: '', stock: '',
      description: '', imageGallery: ['', '', '', ''],
      isOnDeal: false, dealPrice: ''
    });
    setEditingProduct(null);
  };

  const handleEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      description: p.description,
      imageGallery: [...(p.imageGallery || []), '', '', '', ''].slice(0, 4),
      isOnDeal: p.isOnDeal || false,
      dealPrice: p.dealPrice || ''
    });
    setShowModal(true);
  };

  const [uploading, setUploading] = useState([false, false, false, false]);

  const handleImageUpload = async (file, index) => {
    if (!file) return;
    
    const newUploading = [...uploading];
    newUploading[index] = true;
    setUploading(newUploading);

    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      null, 
      (error) => {
        toast.error('Upload failed: ' + error.message);
        newUploading[index] = false;
        setUploading(newUploading);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const newGallery = [...formData.imageGallery];
        newGallery[index] = downloadURL;
        setFormData({ ...formData, imageGallery: newGallery });
        newUploading[index] = false;
        setUploading(newUploading);
        toast.success(`Image ${index + 1} uploaded`);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (uploading.some(u => u)) {
      toast.error('Please wait for images to finish uploading');
      return;
    }
    const cleanData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      dealPrice: formData.isOnDeal ? Number(formData.dealPrice) : null,
      imageGallery: formData.imageGallery.filter(url => url && url.trim() !== '')
    };
    productMutation.mutate(cleanData);
  };

  if (isLoading) return <div className="p-5 text-center text-platinum opacity-50">Scanning Inventory...</div>;

  return (
    <div className="p-4 p-md-5">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-4 mb-5">
        <div>
          <h1 className="font-display fw-bold text-white mb-1">Products</h1>
          <p className="text-platinum small">Manage your timepiece collection.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn btn-amber d-flex align-items-center justify-content-center gap-2"
        >
          <HiOutlinePlus size={20} /> Add Timepiece
        </button>
      </div>

      <div className="glass overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="table table-chronix mb-0">
            <thead>
              <tr>
                {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="ps-4 text-platinum text-uppercase small tracking-widest fw-bold" style={{ fontSize: '0.7rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className="ps-4">
                    <img src={p.imageGallery?.[0]} className="rounded bg-obsidian-800 p-1 border border-white-5 object-fit-contain" style={{ width: '48px', height: '48px' }} alt="" />
                  </td>
                  <td>
                    <p className="text-white fw-bold mb-0 small">{p.name}</p>
                    <p className="text-platinum opacity-50 font-monospace mb-0" style={{ fontSize: '10px' }}>{p.id.slice(0, 8)}</p>
                  </td>
                  <td className="text-platinum small">{p.category}</td>
                  <td>
                    <p className="text-white fw-bold mb-0 small">₹{p.price.toLocaleString('en-IN')}</p>
                    {p.isOnDeal && <p className="text-amber fw-bold mb-0" style={{ fontSize: '10px' }}>Deal: ₹{p.dealPrice?.toLocaleString('en-IN')}</p>}
                  </td>
                  <td className="text-platinum small">{p.stock} units</td>
                  <td>
                    {p.isOnDeal ? <span className="badge bg-amber bg-opacity-10 text-amber border border-amber border-opacity-20 text-uppercase" style={{ fontSize: '9px' }}>On Sale</span> : <span className="text-platinum opacity-25">—</span>}
                  </td>
                  <td className="pe-4">
                    <div className="d-flex gap-2">
                      <button onClick={() => handleEdit(p)} className="btn btn-sm bg-white bg-opacity-5 hover-amber text-platinum border-0 rounded-2 p-2 shadow-none transition-all">
                        <HiOutlinePencil size={18} />
                      </button>
                      <button onClick={() => setDeleteConfirm(p.id)} className="btn btn-sm bg-white bg-opacity-5 hover-danger text-platinum border-0 rounded-2 p-2 shadow-none transition-all">
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content glass border-0 overflow-hidden">
                <div className="modal-body p-5 text-center">
                  <div className="p-3 d-inline-block bg-danger bg-opacity-10 rounded-circle border border-danger border-opacity-20 mb-4">
                    <HiOutlineTrash size={32} className="text-danger" />
                  </div>
                  <h3 className="h4 fw-bold text-white mb-2">Deaccession Product?</h3>
                  <p className="text-platinum small mb-5">This action will permanently remove this timepiece from the active archives.</p>
                  <div className="d-flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="btn btn-obsidian py-3 flex-grow-1 border border-white-5 text-white shadow-none">Cancel</button>
                    <button onClick={() => deleteMutation.mutate(deleteConfirm)} className="btn btn-danger py-3 flex-grow-1 fw-bold border-0 shadow-none">Confirm Deletion</button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="modal-content glass border-0 overflow-hidden shadow-2xl">
                <div className="modal-header border-bottom border-white-5 px-5 py-4 d-flex align-items-center justify-content-between">
                  <h3 className="modal-title font-display h3 fw-bold text-white">{editingProduct ? 'Edit Timepiece' : 'New Archive Entry'}</h3>
                  <button onClick={() => setShowModal(false)} className="btn-close btn-close-white opacity-50 hover-opacity-100 shadow-none border-0" aria-label="Close"></button>
                </div>
                <div className="modal-body p-5 pt-4">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4 mb-4">
                      <div className="col-md-6">
                        <div className="mb-4">
                          <label className="form-label text-uppercase small tracking-widest fw-bold text-platinum mb-2">Product Name</label>
                          <input required className="form-control bg-obsidian-800 border-white-5 rounded-3 p-3 text-white shadow-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="mb-4">
                          <label className="form-label text-uppercase small tracking-widest fw-bold text-platinum mb-2">Category</label>
                          <select className="form-select bg-obsidian-800 border-white-5 rounded-3 p-3 text-white shadow-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {Categories.map(c => <option key={c} value={c} className="bg-obsidian-800">{c}</option>)}
                          </select>
                        </div>
                        <div className="row g-3">
                          <div className="col-6">
                            <label className="form-label text-uppercase small tracking-widest fw-bold text-platinum mb-2">Price (₹)</label>
                            <input type="number" required className="form-control bg-obsidian-800 border-white-5 rounded-3 p-3 text-white shadow-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                          </div>
                          <div className="col-6">
                            <label className="form-label text-uppercase small tracking-widest fw-bold text-platinum mb-2">Stock</label>
                            <input type="number" required className="form-control bg-obsidian-800 border-white-5 rounded-3 p-3 text-white shadow-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-uppercase small tracking-widest fw-bold text-platinum mb-2">Manifest Description</label>
                        <textarea rows={8} required className="form-control bg-obsidian-800 border-white-5 rounded-3 p-3 text-white shadow-none h-100" style={{ resize: 'none' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                      </div>
                    </div>

                    <div className="mb-4">
                       <label className="form-label text-uppercase small tracking-widest fw-bold text-platinum mb-3 d-flex align-items-center gap-2">
                         <HiOutlinePhotograph /> Image Archive (Upload)
                       </label>
                       <div className="row g-3">
                         {formData.imageGallery.map((url, i) => (
                           <div key={i} className="col-6 col-md-3">
                             <div className="position-relative chronix-upload-slot overflow-hidden rounded-3 border border-white-5 bg-obsidian-800 d-flex flex-column align-items-center justify-content-center" style={{ height: 100 }}>
                                {url ? (
                                  <img src={url} className="w-100 h-100 object-fit-contain p-2" alt="" />
                                ) : (
                                  <div className="text-center opacity-50">
                                    <HiOutlineCloudUpload size={24} className="mb-1" />
                                    <p className="mb-0" style={{ fontSize: '8px' }}>Slot {i+1}</p>
                                  </div>
                                )}
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer" 
                                  onChange={e => handleImageUpload(e.target.files[0], i)}
                                />
                                {uploading[i] && (
                                  <div className="position-absolute top-0 start-0 w-100 h-100 bg-obsidian bg-opacity-75 d-flex align-items-center justify-content-center">
                                    <div className="spinner-border spinner-border-sm text-amber" />
                                  </div>
                                )}
                                {url && (
                                  <button 
                                    type="button" 
                                    className="position-absolute top-0 end-0 m-1 btn btn-sm bg-danger bg-opacity-20 text-danger border-0 p-1 rounded-circle"
                                    onClick={() => {
                                      const newGallery = [...formData.imageGallery];
                                      newGallery[i] = '';
                                      setFormData({...formData, imageGallery: newGallery});
                                    }}
                                  >
                                    <HiOutlineTrash size={12} />
                                  </button>
                                )}
                             </div>
                           </div>
                         ))}
                       </div>
                    </div>

                    <div className="p-4 bg-amber bg-opacity-5 border border-amber border-opacity-10 rounded-4 mb-5">
                      <div className="form-check d-flex align-items-center gap-2 mb-3">
                        <input type="checkbox" className="form-check-input bg-transparent border-amber shadow-none" id="dealCheck" checked={formData.isOnDeal} onChange={e => setFormData({...formData, isOnDeal: e.target.checked})} />
                        <label className="form-check-label text-uppercase small fw-bold text-amber tracking-tighter" htmlFor="dealCheck">Apply Deal of the Day Status</label>
                      </div>
                      {formData.isOnDeal && (
                        <div className="d-flex align-items-center gap-3">
                          <span className="text-platinum opacity-75 small">Deal Price:</span>
                          <input type="number" className="form-control bg-obsidian-900 border-amber border-opacity-30 rounded-3 p-2 text-white shadow-none w-auto" placeholder="Deal amount" value={formData.dealPrice} onChange={e => setFormData({...formData, dealPrice: e.target.value})} />
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-3 pt-3">
                      <button type="button" onClick={() => setShowModal(false)} className="btn border-0 text-platinum hover-text-white transition-all flex-grow-1 shadow-none">Cancel</button>
                      <button type="submit" disabled={productMutation.isPending} className="btn btn-amber flex-grow-1 py-3 fw-bold shadow-none active-scale">
                        {productMutation.isPending ? 'Syncing with Server...' : (editingProduct ? 'Commit Changes' : 'Publish Collection Piece')}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      <style>{`
        .btn-obsidian { background: #111118; border: 1px solid rgba(255,255,255,0.05); }
        .btn-obsidian:hover { background: #1A1A24; }
        .hover-amber:hover { background-color: rgba(245, 166, 35, 0.15) !important; color: #F5A623 !important; }
        .hover-danger:hover { background-color: rgba(220, 53, 69, 0.15) !important; color: #dc3545 !important; }
        .active-scale:active { transform: scale(0.98); }
        .modal-body { max-height: 80vh; overflow-y: auto; }
      `}</style>
    </div>
  );
};

export default Products;
