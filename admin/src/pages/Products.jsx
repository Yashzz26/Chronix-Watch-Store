import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { apiCall } from '../lib/apiHelper';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineCloudUpload, HiOutlineSearch, HiOutlineFilter,
  HiOutlineSortAscending, HiOutlinePhotograph
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Categories = ['Analog', 'Smart Watch', 'Luxury', 'Gifts for Him', 'Gifts for Her', 'Limited Edition'];
const Tabs = ['All', 'Active', 'Out of Stock'];

const Products = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '', category: 'Luxury', price: '', stock: '',
    description: '', imageGallery: ['', '', '', ''],
    isOnDeal: false, dealPrice: ''
  });
  const [uploading, setUploading] = useState([false, false, false, false]);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    }, (err) => {
      console.error(err);
      toast.error('Failed to sync products');
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const productMutation = useMutation({
    mutationFn: (data) => {
      const method = editingProduct ? 'put' : 'post';
      const endpoint = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      return apiCall(method, endpoint, data);
    },
    onSuccess: () => {
      toast.success(editingProduct ? 'Product updated' : 'Product created');
      setShowModal(false);
      resetForm();
    },
    onError: () => toast.error('Action failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiCall('delete', `/api/products/${id}`),
    onSuccess: () => {
      toast.success('Product removed');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Failed to delete product')
  });

  const handleStockUpdate = async (id, newStock) => {
    try {
      if (isNaN(newStock) || newStock < 0) return;
      await updateDoc(doc(db, 'products', id), { stock: Number(newStock) });
      toast.success('Stock updated inline');
    } catch {
      toast.error('Stock update failed');
    }
  };

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
      name: p.name, category: p.category, price: p.price, stock: p.stock,
      description: p.description,
      imageGallery: [...(p.imageGallery || []), '', '', '', ''].slice(0, 4),
      isOnDeal: p.isOnDeal || false, dealPrice: p.dealPrice || ''
    });
    setShowModal(true);
  };

  const handleImageUpload = async (file, index) => {
    if (!file) return;
    const newUploading = [...uploading];
    newUploading[index] = true;
    setUploading(newUploading);
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed', null,
      () => {
        toast.error('Upload failed');
        const u = [...uploading]; u[index] = false; setUploading(u);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const newGallery = [...formData.imageGallery];
        newGallery[index] = downloadURL;
        setFormData(f => ({ ...f, imageGallery: newGallery }));
        const u = [...uploading]; u[index] = false; setUploading(u);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (uploading.some(u => u)) return toast.error('Images are uploading...');
    const cleanData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      dealPrice: formData.isOnDeal ? Number(formData.dealPrice) : null,
      imageGallery: formData.imageGallery.filter(url => url && url.trim() !== '')
    };
    productMutation.mutate(cleanData);
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredProducts.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredProducts.map(p => p.id)));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const stock = Number(p.stock) || 0;
    const matchesTab = activeTab === 'All' ? true
      : activeTab === 'Active' ? stock > 0
      : activeTab === 'Out of Stock' ? stock === 0 : true;
    return matchesSearch && matchesTab;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 p-md-5"
    >
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-4 mb-4">
        <div>
          <h1 className="font-display fw-bold text-white mb-1">Products ({products.length})</h1>
          <p className="text-platinum small mb-0">Manage your entire timepiece inventory operations.</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-amber d-flex align-items-center gap-2">
          <HiOutlinePlus size={20} /> Add Timepiece
        </button>
      </div>

      <div className="glass border border-white-5 overflow-hidden">
        {/* Filter Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-bottom border-white-5 p-3 gap-3">
          <div className="d-flex gap-4">
            {Tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`btn p-0 border-0 shadow-none x-small text-uppercase tracking-widest bg-transparent transition-all ${activeTab === tab ? 'text-amber fw-bold' : 'text-platinum opacity-75'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="d-flex gap-3 w-100 w-md-auto align-items-center">
            <div className="position-relative flex-grow-1">
              <HiOutlineSearch
                className="position-absolute text-platinum"
                style={{ left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
                size={16}
              />
              <input
                type="text"
                placeholder="Search products..."
                className="form-control bg-obsidian-800 border-white-5 text-white ps-5 shadow-none"
                style={{ height: '48px', fontSize: '15px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-sm btn-obsidian border-white-5 text-platinum" title="Filter">
              <HiOutlineFilter size={16} />
            </button>
            <button className="btn btn-sm btn-obsidian border-white-5 text-platinum" title="Sort">
              <HiOutlineSortAscending size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-chronix mb-0 align-middle">
            <thead>
              <tr>
                <th style={{ width: 40 }} className="ps-4">
                  <input
                    type="checkbox"
                    className="form-check-input bg-obsidian-800 border-white-5 cursor-pointer"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredProducts.length}
                    onChange={toggleAll}
                  />
                </th>
                <th>Product</th>
                <th>Category</th>
                <th>Status</th>
                <th>Stock</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-3 px-4">
                      <div className="placeholder-glow w-100">
                        <span className="placeholder col-12 bg-obsidian-700 rounded-2" style={{ height: 44 }}></span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5 text-platinum opacity-25 fst-italic small">No products found matching criteria.</td></tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td className="ps-4">
                      <input
                        type="checkbox"
                        className="form-check-input bg-obsidian-800 border-white-5 cursor-pointer"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleSelection(p.id)}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-obsidian-900 border border-white-5 rounded-3 flex-shrink-0"
                          style={{ width: '56px', height: '56px', padding: '6px' }}
                        >
                          <img
                            src={p.imageGallery?.[0] || 'https://via.placeholder.com/56'}
                            className="w-100 h-100 object-fit-contain"
                            alt=""
                          />
                        </div>
                        <div>
                          <span className="text-white fw-bold small d-block">{p.name}</span>
                          {p.isOnDeal && (
                            <span className="text-amber x-small">★ Deal — ₹{p.dealPrice?.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-platinum small opacity-75">{p.category}</td>
                    <td>
                      {p.stock > 0
                        ? <span className="status-badge status-badge-active">Active</span>
                        : <span className="status-badge status-badge-cancelled">Out of Stock</span>}
                    </td>
                    <td>
                      <span className={`fw-bold small ${p.stock > 5 ? 'text-success' : p.stock > 0 ? 'text-warning' : 'text-danger'}`}>
                        {p.stock}
                      </span>
                      <span className="text-platinum small opacity-50 ms-1">units</span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          title="Edit product"
                          className="btn btn-sm border-0 shadow-none transition-all p-2 rounded-2"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#8B8FA8' }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(245,166,35,0.15)';
                            e.currentTarget.style.color = '#F5A623';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = '#8B8FA8';
                          }}
                        >
                          <HiOutlinePencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          title="Delete product"
                          className="btn btn-sm border-0 shadow-none transition-all p-2 rounded-2"
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="modal-content glass border-0 overflow-hidden"
              >
                <div className="modal-body p-5 text-center">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                    style={{ width: 56, height: 56, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
                  >
                    <HiOutlineTrash size={24} />
                  </div>
                  <h3 className="h5 fw-bold text-white mb-2">Delete Product?</h3>
                  <p className="text-platinum small mb-4 opacity-75">This action cannot be undone.</p>
                  <div className="d-flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="btn btn-obsidian py-2 flex-grow-1">Cancel</button>
                    <button
                      onClick={() => deleteMutation.mutate(deleteConfirm)}
                      className="btn btn-danger py-2 flex-grow-1 border-0 shadow-none fw-bold"
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal — 800px wide */}
      <AnimatePresence>
        {showModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '800px' }}>
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.98 }}
                className="modal-content glass border-0"
              >
                <div className="modal-header border-bottom border-white-5 px-5 py-4">
                  <h4 className="text-white fw-bold m-0 font-display">
                    {editingProduct ? 'Edit Timepiece' : 'Add New Timepiece'}
                  </h4>
                  <button className="btn-close btn-close-white opacity-50 shadow-none" onClick={() => { setShowModal(false); resetForm(); }} />
                </div>

                <div className="modal-body px-5 py-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                  <form onSubmit={handleSubmit}>

                    {/* Section: Basic Info */}
                    <div className="mb-5">
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <span className="x-small text-amber fw-bold text-uppercase tracking-widest">Basic Info</span>
                        <div className="flex-grow-1" style={{ height: '1px', background: 'rgba(245,166,35,0.15)' }} />
                      </div>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label text-platinum small mb-2">Product Name</label>
                          <input
                            placeholder="e.g. Royal Oak Chronograph"
                            required
                            className="form-control bg-obsidian-800 border-white-5 text-white shadow-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-platinum small mb-2">Category</label>
                          <select
                            className="form-select bg-obsidian-800 border-white-5 text-white shadow-none"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                          >
                            {Categories.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section: Pricing & Inventory */}
                    <div className="mb-5">
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <span className="x-small text-amber fw-bold text-uppercase tracking-widest">Pricing & Inventory</span>
                        <div className="flex-grow-1" style={{ height: '1px', background: 'rgba(245,166,35,0.15)' }} />
                      </div>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label text-platinum small mb-2">Price (₹)</label>
                          <input
                            placeholder="29999"
                            type="number"
                            required
                            className="form-control bg-obsidian-800 border-white-5 text-white shadow-none"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label text-platinum small mb-2">Stock Units</label>
                          <input
                            placeholder="50"
                            type="number"
                            required
                            className="form-control bg-obsidian-800 border-white-5 text-white shadow-none"
                            value={formData.stock}
                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                          />
                        </div>
                        <div className="col-12">
                          <div className="d-flex align-items-center gap-3 p-3 rounded-3 border border-white-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <input
                              type="checkbox"
                              id="isOnDeal"
                              className="form-check-input bg-obsidian-800 border-white-5 cursor-pointer"
                              style={{ width: 18, height: 18 }}
                              checked={formData.isOnDeal}
                              onChange={e => setFormData({ ...formData, isOnDeal: e.target.checked })}
                            />
                            <label htmlFor="isOnDeal" className="text-platinum small cursor-pointer mb-0">
                              This product is currently on deal
                            </label>
                          </div>
                        </div>
                        {formData.isOnDeal && (
                          <div className="col-md-4">
                            <label className="form-label text-amber small mb-2">Deal Price (₹)</label>
                            <input
                              placeholder="19999"
                              type="number"
                              className="form-control bg-obsidian-800 border-white-5 text-white shadow-none"
                              value={formData.dealPrice}
                              onChange={e => setFormData({ ...formData, dealPrice: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section: Images */}
                    <div className="mb-5">
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <span className="x-small text-amber fw-bold text-uppercase tracking-widest">Image Gallery</span>
                        <div className="flex-grow-1" style={{ height: '1px', background: 'rgba(245,166,35,0.15)' }} />
                      </div>
                      <div className="d-flex gap-3 flex-wrap">
                        {formData.imageGallery.map((url, index) => (
                          <label key={index} className={`img-upload-slot ${url ? 'has-image' : ''}`}>
                            <input
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={e => handleImageUpload(e.target.files[0], index)}
                            />
                            {uploading[index] ? (
                              <div className="spinner-border spinner-border-sm text-amber" />
                            ) : url ? (
                              <img src={url} className="w-100 h-100 object-fit-contain" alt="" />
                            ) : (
                              <div className="text-center">
                                <HiOutlinePhotograph size={24} className="text-platinum opacity-40 mb-1" />
                                <p className="x-small text-platinum opacity-40 mb-0">
                                  {index === 0 ? 'Main' : `Photo ${index + 1}`}
                                </p>
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                      <p className="x-small text-platinum opacity-40 mt-2">Drag & drop or click each slot to upload. First image is the primary display.</p>
                    </div>

                    {/* Section: Description */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <span className="x-small text-amber fw-bold text-uppercase tracking-widest">Description</span>
                        <div className="flex-grow-1" style={{ height: '1px', background: 'rgba(245,166,35,0.15)' }} />
                      </div>
                      <textarea
                        placeholder="Describe the timepiece's craftsmanship, materials, and heritage..."
                        rows={4}
                        required
                        className="form-control bg-obsidian-800 border-white-5 text-white shadow-none"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="d-flex justify-content-end gap-3 pt-2">
                      <button
                        type="button"
                        className="btn btn-obsidian px-4"
                        onClick={() => { setShowModal(false); resetForm(); }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={productMutation.isPending}
                        className="btn btn-amber px-5 fw-bold"
                      >
                        {productMutation.isPending ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
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

export default Products;
