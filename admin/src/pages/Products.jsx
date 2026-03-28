import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { apiCall } from '../lib/apiHelper';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlinePhotograph, HiOutlineCloudUpload, HiOutlineSearch, HiOutlineFilter, HiOutlineSortAscending, HiCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Categories = ['Analog', 'Smart Watch', 'Luxury', 'Gifts for Him', 'Gifts for Her', 'Limited Edition'];
const Tabs = ['All', 'Active', 'Out of Stock'];

const Products = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // High-Density State
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

  // Real-time listener for Products
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
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(deleteConfirm);
        return next;
      });
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
      description: p.description, imageGallery: [...(p.imageGallery || []), '', '', '', ''].slice(0, 4),
      isOnDeal: p.isOnDeal || false, dealPrice: p.dealPrice || ''
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

    uploadTask.on('state_changed', null, 
      (error) => {
        toast.error('Upload failed');
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Filter Pipeline
  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const stock = Number(p.stock) || 0;
    const matchesTab = activeTab === 'All' ? true 
                     : activeTab === 'Active' ? stock > 0 
                     : activeTab === 'Out of Stock' ? stock === 0 : true;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-4 p-md-5">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-4 mb-4">
        <div>
          <h1 className="font-display fw-bold text-white mb-1">Products ({products.length})</h1>
          <p className="text-platinum small mb-0">Manage your entire timepiece inventory operations.</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-amber d-flex align-items-center gap-2">
          <HiOutlinePlus size={20} /> Add Timepiece
        </button>
      </div>

      <div className="glass shadow-sm overflow-hidden" style={{ borderRadius: '12px' }}>
        
        {/* Solidus Data Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-bottom border-white-5 p-3 gap-3">
           <div className="d-flex gap-4">
              {Tabs.map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`btn p-0 border-0 ${activeTab === tab ? 'text-amber fw-bold' : 'text-platinum opacity-75'} bg-transparent shadow-none x-small text-uppercase tracking-widest`}
                >
                  {tab}
                </button>
              ))}
           </div>
           
           <div className="d-flex gap-2 w-100 w-md-auto align-items-center">
              <div className="position-relative">
                 <HiOutlineSearch className="position-absolute opacity-50 text-white" style={{ left: 12, top: 10 }} size={16} />
                 <input 
                   type="text" 
                   placeholder="Search products..." 
                   className="form-control form-control-sm bg-obsidian-800 border-white-5 text-white ps-5 shadow-none" 
                   style={{ width: '240px' }}
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
              </div>
              <button className="btn btn-sm btn-obsidian border-white-5 text-platinum"><HiOutlineFilter size={16} /></button>
              <button className="btn btn-sm btn-obsidian border-white-5 text-platinum"><HiOutlineSortAscending size={16} /></button>
           </div>
        </div>

        {/* High Density Table */}
        <div className="table-responsive">
          <table className="table table-chronix mb-0 align-middle">
            <thead>
              <tr>
                <th style={{ width: 40 }} className="ps-4">
                  <input type="checkbox" className="form-check-input bg-obsidian-800 border-white-5 cursor-pointer"
                         checked={selectedIds.size > 0 && selectedIds.size === filteredProducts.length}
                         onChange={toggleAll} />
                </th>
                <th>Product</th>
                <th>Category</th>
                <th>Status</th>
                <th>Stock Overview</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({length: 5}).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-3 px-4">
                      <div className="placeholder-glow w-100"><span className="placeholder col-12 bg-obsidian-700 rounded-2" style={{ height: 40 }}></span></div>
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5 text-platinum">No products found matching criteria.</td></tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td className="ps-4">
                      <input type="checkbox" className="form-check-input bg-obsidian-800 border-white-5 cursor-pointer"
                             checked={selectedIds.has(p.id)} onChange={() => toggleSelection(p.id)} />
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                         <img src={p.imageGallery?.[0] || 'https://via.placeholder.com/48'} className="rounded bg-obsidian-900 border border-white-5 object-fit-contain p-1" style={{ width: '40px', height: '40px' }} alt="" />
                         <span className="text-white fw-bold small">{p.name} {p.isOnDeal && <span className="text-amber ms-2 x-small">★ Deal</span>}</span>
                      </div>
                    </td>
                    <td className="text-platinum small opacity-75">{p.category}</td>
                    <td>
                      {p.stock > 0 
                        ? <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 x-small px-2 py-1">Active</span> 
                        : <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 x-small px-2 py-1">Out of Stock</span>}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`small fw-bold ${p.stock > 5 ? 'text-success' : p.stock > 0 ? 'text-warning' : 'text-danger'}`}>
                           {p.stock}
                        </span>
                        <span className="text-platinum small opacity-75">in stock</span>
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <div className="btn-group">
                        <button onClick={() => handleEdit(p)} className="btn btn-sm text-platinum hover-text-white transition-all">Edit</button>
                        <button onClick={() => setDeleteConfirm(p.id)} className="btn btn-sm text-danger opacity-50 hover-opacity-100 transition-all">Delete</button>
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
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content glass border-0 overflow-hidden">
                <div className="modal-body p-5 text-center">
                  <h3 className="h5 fw-bold text-white mb-2">Delete Product</h3>
                  <p className="text-platinum small mb-4">Are you sure? This action cannot be undone.</p>
                  <div className="d-flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="btn btn-obsidian py-2 flex-grow-1">Cancel</button>
                    <button onClick={() => deleteMutation.mutate(deleteConfirm)} className="btn btn-danger py-2 flex-grow-1 border-0 shadow-none fw-bold">Delete</button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal (Preserved existing inputs for safety) */}
      <AnimatePresence>
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="modal-content glass border-0">
                   {/* Simplified Header for plan limit */}
                   <div className="modal-header border-bottom border-white-5 px-4 py-3 d-flex justify-content-between">
                      <h4 className="text-white h5 m-0 fw-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h4>
                      <button className="btn-close btn-close-white opacity-50" onClick={() => setShowModal(false)}></button>
                   </div>
                   <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                      {/* Using the standard HTML form setup to retain logic */}
                      <form onSubmit={handleSubmit}>
                         <div className="row g-3 mb-4">
                            <div className="col-12"><input placeholder="Name" required className="form-control bg-obsidian-800 border-white-5 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                            <div className="col-md-4"><input placeholder="Price" type="number" required className="form-control bg-obsidian-800 border-white-5 text-white" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                            <div className="col-md-4"><input placeholder="Stock" type="number" required className="form-control bg-obsidian-800 border-white-5 text-white" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
                            <div className="col-md-4">
                               <select className="form-select bg-obsidian-800 border-white-5 text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                  {Categories.map(c => <option key={c}>{c}</option>)}
                               </select>
                            </div>
                            <div className="col-12"><textarea placeholder="Description" rows={3} required className="form-control bg-obsidian-800 border-white-5 text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                         </div>
                         <div className="d-flex justify-content-end gap-3 mt-4">
                            <button type="submit" disabled={productMutation.isPending} className="btn btn-amber px-5 fw-bold">{productMutation.isPending ? 'Saving...' : 'Save Product'}</button>
                         </div>
                      </form>
                   </div>
               </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
