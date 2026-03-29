import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { apiCall } from '../lib/apiHelper';
import { 
  HiOutlineArrowLeft, HiOutlineSave, HiOutlinePlus, 
  HiOutlineTrash, HiOutlinePhotograph, HiOutlineInformationCircle,
  HiOutlineHashtag, HiOutlineTag,
  HiOutlineCube, HiOutlineClock, HiOutlineEye
} from 'react-icons/hi';
import { 
  HiOutlineBold, HiOutlineItalic, HiOutlineListBullet,
  HiOutlineLink, HiOutlineExclamationCircle 
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Categories = ['Analog', 'Smart Watch', 'Luxury', 'Gifts for Him', 'Gifts for Her', 'Limited Edition'];
const StatusOptions = ['Draft', 'Published', 'Scheduled'];
const AvailabilityOptions = ['In Stock', 'Out of Stock', 'Pre-Order'];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Luxury',
    brand: 'Chronix Maison',
    productType: 'Watch',
    gender: 'Unisex',
    description: '',
    featuresMarkdown: '',
    imageGallery: [],
    status: 'Published',
    availability: 'In Stock',
    publishDate: new Date().toISOString().split('T')[0],
    publishTime: '12:00',
    tags: [],
    variants: [],
    attributes: {
      movement: '',
      material: '',
      waterResistance: '',
      glassType: '',
      weight: ''
    }
  });

  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch Product Data if Editing
  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const docRef = doc(db, 'products', id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setFormData({
              ...data,
              imageGallery: data.imageGallery || [],
              variants: data.variants || [],
              attributes: data.attributes || { movement: '', material: '', waterResistance: '', glassType: '', weight: '' },
              tags: data.tags || [],
              publishDate: data.publishDate || new Date().toISOString().split('T')[0],
              publishTime: data.publishTime || '12:00',
            });
          } else {
            toast.error('Product not found');
            navigate('/products');
          }
        } catch (err) {
          console.error(err);
          toast.error('Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate]);

  const productMutation = useMutation({
    mutationFn: (data) => {
      const method = isEdit ? 'put' : 'post';
      const endpoint = isEdit ? `/api/products/${id}` : '/api/products';
      return apiCall(method, endpoint, data);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Product sequence updated' : 'New masterpiece established');
      queryClient.invalidateQueries(['products']);
      navigate('/products');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Transmission failure.');
    }
  });

  // ── VARIANT LOGIC ───────────────────────────────────────────

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { dialSize: '40mm', colorName: 'Midnight Noir', colorHex: '#1A1A1A', strap: 'Oyster Steel', price: '', stock: '', sku: '' }
      ]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index, field, value) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      
      // 🚀 Auto SKU Generation: ${productId}-${color}-${size}
      if (['colorName', 'dialSize'].includes(field)) {
        const prodPrefix = prev.name ? prev.name.substring(0, 3).toUpperCase() : 'CX';
        const colorCode = newVariants[index].colorName ? newVariants[index].colorName.substring(0, 3).toUpperCase() : 'CLR';
        const sizeCode = newVariants[index].dialSize ? newVariants[index].dialSize.replace('mm', '') : 'XX';
        newVariants[index].sku = `${prodPrefix}-${colorCode}-${sizeCode}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      
      return { ...prev, variants: newVariants };
    });
  };

  // ── MEDIA LOGIC ──────────────────────────────────────────────

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          uploadedUrls.push(url);
          resolve();
        });
      });
    }

    setFormData(prev => ({
      ...prev,
      imageGallery: [...prev.imageGallery, ...uploadedUrls]
    }));
    setUploading(false);
    toast.success(`${uploadedUrls.length} assets deployed`);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imageGallery: prev.imageGallery.filter((_, i) => i !== index)
    }));
  };

  // ── TAGS LOGIC ───────────────────────────────────────────────

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  // ── SAVE LOGIC ───────────────────────────────────────────────

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (productMutation.isPending) return;

    // Validation
    if (!formData.name.trim()) return toast.error('Product naming is mandatory.');
    if (formData.variants.length === 0) return toast.error('A luxury timepiece requires at least one variation.');
    
    const skus = formData.variants.map(v => v.sku?.trim()).filter(Boolean);
    if (new Set(skus).size !== skus.length) return toast.error('Ambiguous SKUs detected. Uniqueness required.');

    // Calculations
    const totalStock = formData.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    const minPrice = Math.min(...formData.variants.map(v => Number(v.price) || Infinity));

    const payload = {
      ...formData,
      price: minPrice === Infinity ? 0 : minPrice,
      totalInv, // Helpful context
      // Ensure numeric types
      variants: formData.variants.map(v => ({
        ...v,
        price: Number(v.price),
        stock: Number(v.stock)
      }))
    };

    productMutation.mutate(payload);
  };

  // ── RICH TEXT TOOLBAR ────────────────────────────────────────

  const insertText = (before, after = '') => {
    const textarea = document.getElementById('features-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    setFormData({ ...formData, featuresMarkdown: newText });
    
    // Reset focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 10);
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-white">
      <div className="spinner-border text-amber" />
    </div>
  );

  const minVariantPrice = formData.variants.length > 0 ? Math.min(...formData.variants.map(v => Number(v.price) || 0)).toLocaleString() : '0';
  const maxVariantPrice = formData.variants.length > 0 ? Math.max(...formData.variants.map(v => Number(v.price) || 0)).toLocaleString() : '0';
  const totalInv = formData.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <div className="edit-product-page pb-5">
      <style>{`
        .edit-product-page { background: #F9FAFB; min-height: 100vh; font-family: 'DM Sans', sans-serif; }
        .editor-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); padding: 32px; margin-bottom: 24px; }
        .section-title { font-size: 14px; font-weight: 700; color: #111827; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
        .form-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
        .form-control, .form-select { border-radius: 8px; border: 1px solid #D1D5DB; padding: 10px 14px; font-size: 14px; transition: all 0.2s; }
        .form-control:focus, .form-select:focus { border-color: #F5A623; box-shadow: 0 0 0 3px rgba(245,166,35,0.1); outline: none; }
        .variant-table td { padding: 12px 8px; vertical-align: middle; }
        .variant-table th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6B7280; font-weight: 700; padding: 8px; border-bottom: 1px solid #F3F4F6; }
        .img-slot { width: 100px; height: 100px; border-radius: 8px; border: 1.5px dashed #D1D5DB; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; transition: all 0.2s; overflow: hidden; background: #fafafa; }
        .img-slot:hover { border-color: #F5A623; background: #fff; }
        .img-slot img { width: 100%; height: 100%; object-fit: cover; }
        .remove-img { position: absolute; top: 4px; right: 4px; background: rgba(220,38,38,0.9); color: white; border: none; border-radius: 4px; padding: 2px; display: none; }
        .img-slot:hover .remove-img { display: block; }
        .toolbar-btn { background: transparent; border: none; color: #6B7280; padding: 6px; border-radius: 4px; transition: all 0.2s; }
        .toolbar-btn:hover { background: #F3F4F6; color: #111827; }
        .tag-pill { background: #F3F4F6; color: #374151; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .sticky-summary { position: sticky; top: 32px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
      `}</style>

      {/* ── TOP NAVIGATION BAR ─────────────────────────────────── */}
      <div className="bg-white border-bottom py-3 px-4 position-sticky top-0 shadow-sm" style={{ zIndex: 100 }}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-4">
            <button onClick={() => navigate('/products')} className="btn btn-sm btn-link text-t3 p-0 d-flex align-items-center gap-2" style={{ textDecoration: 'none' }}>
              <HiOutlineArrowLeft /> Back
            </button>
            <div>
              <h1 className="h5 m-0 fw-bold text-t1">{isEdit ? `Edit: ${formData.name || 'Masterpiece'}` : 'New Piece Discovery'}</h1>
            </div>
          </div>
          <div className="d-flex gap-2">
             <button className="btn btn-obsidian px-4" onClick={() => navigate('/products')}>Discard</button>
             <button 
              className="btn btn-amber px-4 d-flex align-items-center gap-2" 
              onClick={handleSave}
              disabled={productMutation.isPending}
             >
               <HiOutlineSave size={18} /> {productMutation.isPending ? 'Syncing...' : 'Save Product'}
             </button>
          </div>
        </div>
      </div>

      <div className="container-fluid mt-4 px-4">
        <div className="row g-4">
          
          {/* ────── LEFT COLUMN (CORE CONTENT) ────── */}
          <div className="col-lg-8">
            
            {/* 1. Basic Information */}
            <div className="editor-card">
              <h2 className="section-title"><HiOutlineInformationCircle /> Basic Information</h2>
              <div className="mb-4">
                <label className="form-label">Product Name</label>
                <input 
                  className="form-control" 
                  placeholder="e.g. Royal Oak Selfwinding" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-4">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {Categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label">Brand</label>
                  <input className="form-control" placeholder="Chronix Maison" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-0">
                  <label className="form-label">Product Type</label>
                  <input className="form-control" value={formData.productType} readOnly style={{ background: '#f9f9f9' }} />
                </div>
                <div className="col-md-6 mb-0">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                    <option>Men</option><option>Women</option><option>Unisex</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Variant System (CORE) */}
            <div className="editor-card">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="section-title m-0"><HiOutlineCube /> Luxury Variations</h2>
                <button className="btn btn-sm btn-obsidian" onClick={addVariant}>
                  <HiOutlinePlus className="me-1" /> Add Variant
                </button>
              </div>
              
              <div className="table-responsive">
                <table className="table variant-table w-100">
                  <thead>
                    <tr>
                      <th style={{ width: 100 }}>Size</th>
                      <th>Color</th>
                      <th>Strap</th>
                      <th style={{ width: 120 }}>Price (₹)</th>
                      <th style={{ width: 90 }}>Stock</th>
                      <th style={{ width: 140 }}>SKU</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.variants.map((v, i) => (
                      <tr key={i}>
                        <td>
                          <select className="form-select form-select-sm" value={v.dialSize} onChange={e => updateVariant(i, 'dialSize', e.target.value)}>
                             <option>38mm</option><option>40mm</option><option>42mm</option><option>44mm</option>
                          </select>
                        </td>
                        <td>
                          <input className="form-control form-control-sm" value={v.colorName} onChange={e => updateVariant(i, 'colorName', e.target.value)} placeholder="Noir" />
                        </td>
                        <td>
                          <input className="form-control form-control-sm" value={v.strap} onChange={e => updateVariant(i, 'strap', e.target.value)} placeholder="Steel" />
                        </td>
                        <td>
                          <input className="form-control form-control-sm" type="number" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} />
                        </td>
                        <td>
                          <input className="form-control form-control-sm" type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} />
                        </td>
                        <td>
                          <input className="form-control form-control-sm border-0 bg-light font-mono x-small" value={v.sku} readOnly style={{ fontSize: '10px' }} />
                        </td>
                        <td>
                          <button className="toolbar-btn text-danger" onClick={() => removeVariant(i)}><HiOutlineTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {formData.variants.length === 0 && (
                <div className="text-center py-4 text-t3 opacity-50 small">No variants added. Luxury products require at least one variation.</div>
              )}
            </div>

            {/* 3. Description & Features */}
            <div className="editor-card">
              <h2 className="section-title"><HiOutlineEye /> Visual Composer</h2>
              <div className="mb-4">
                <label className="form-label">Product Description</label>
                <textarea 
                  className="form-control" 
                  rows={4} 
                  placeholder="Tell the story of this masterpiece..." 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Product Features (Rich Syntax)</label>
                <div className="border border-bottom-0 rounded-top p-2 bg-light d-flex gap-1">
                   {[
                     { icon: HiOutlineBold, action: () => insertText('**', '**') },
                     { icon: HiOutlineItalic, action: () => insertText('_', '_') },
                     { icon: HiOutlineListBullet, action: () => insertText('\n- ') },
                     { icon: HiOutlineLink, action: () => insertText('[', '](url)') },
                   ].map((Tool, idx) => (
                     <button key={idx} className="toolbar-btn" onClick={Tool.action} type="button">
                       <Tool.icon size={16} />
                     </button>
                   ))}
                </div>
                <textarea 
                  id="features-textarea"
                  className="form-control rounded-0 rounded-bottom" 
                  rows={6} 
                  placeholder="Key selling points..." 
                  value={formData.featuresMarkdown}
                  onChange={e => setFormData({ ...formData, featuresMarkdown: e.target.value })}
                  style={{ borderTop: 'none', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

          </div>

          {/* ────── RIGHT COLUMN (METADATA & MEDIA) ────── */}
          <div className="col-lg-4">
            
            {/* 1. Pricing Summary (Auto) */}
            <div className="editor-card sticky-summary">
               <h2 className="section-title"><HiOutlineTag /> Pricing Insight</h2>
               <div className="d-flex justify-content-between mb-2">
                 <span className="small text-t3">Price Range</span>
                 <span className="fw-bold text-t1">₹{minVariantPrice} – ₹{maxVariantPrice}</span>
               </div>
               <div className="d-flex justify-content-between mb-4">
                 <span className="small text-t3">Total Global Stock</span>
                 <span className={`fw-bold ${totalInv < 5 ? 'text-danger' : 'text-success'}`}>{totalInv} Units</span>
               </div>
               <div className="p-3 rounded-3 bg-gold bg-opacity-10 border border-gold border-opacity-20">
                 <p className="m-0 x-small text-gold-dim d-flex align-items-center gap-2">
                   <HiOutlineExclamationCircle /> Dynamic pricing active across {formData.variants.length} variations.
                 </p>
               </div>
            </div>

            {/* 2. Media Upload */}
            <div className="editor-card">
              <h2 className="section-title"><HiOutlinePhotograph /> Media Portfolio</h2>
              <div className="d-flex gap-2 flex-wrap mb-3">
                <AnimatePresence>
                  {formData.imageGallery.map((url, i) => (
                    <motion.div 
                      key={url} 
                      className="img-slot"
                      initial={{ opacity:0, scale:0.8 }}
                      animate={{ opacity:1, scale:1 }}
                      exit={{ opacity:0, scale:0.8 }}
                    >
                      <img src={url} alt="" />
                      {i === 0 && <span className="position-absolute bottom-0 start-0 w-100 py-1 text-center bg-dark text-white x-small opacity-75">Cover</span>}
                      <button className="remove-img" onClick={() => removeImage(i)}><HiOutlineTrash size={12} /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="img-slot" onClick={() => fileInputRef.current.click()}>
                   {uploading ? (
                     <div className="spinner-border spinner-border-sm text-amber" />
                   ) : (
                     <HiOutlinePlus size={24} className="text-t3" />
                   )}
                </div>
              </div>
              <input 
                type="file" 
                multiple 
                hidden 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*"
              />
              <p className="x-small text-t3 m-0 opacity-75">Maximum 8 assets. First image will be the primary editorial cover.</p>
            </div>

            {/* 3. Status & Publishing */}
            <div className="editor-card">
              <h2 className="section-title"><HiOutlineClock /> Status & Presence</h2>
              <div className="mb-4">
                <label className="form-label">Publishing Status</label>
                <select className="form-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                   {StatusOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="form-label">Availability</label>
                <select className="form-select" value={formData.availability} onChange={e => setFormData({ ...formData, availability: e.target.value })}>
                   {AvailabilityOptions.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="row">
                <div className="col-6">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={formData.publishDate} onChange={e => setFormData({ ...formData, publishDate: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label">Time</label>
                  <input type="time" className="form-control" value={formData.publishTime} onChange={e => setFormData({ ...formData, publishTime: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 4. Tags & Attributes */}
            <div className="editor-card">
              <h2 className="section-title"><HiOutlineHashtag /> Tags & Identity</h2>
              <div className="mb-4">
                <label className="form-label">Product Tags</label>
                <input 
                  className="form-control" 
                  placeholder="Type and press Enter..." 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                />
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {formData.tags.map(t => (
                    <span key={t} className="tag-pill">
                      {t} <HiOutlineTrash className="cursor-pointer text-danger" onClick={() => removeTag(t)} />
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '20px', marginTop: '20px' }}>
                 <p className="form-label mb-3">Watch Specifications</p>
                 <div className="mb-3">
                   <input className="form-control form-control-sm mb-2" placeholder="Movement (e.g. Automatic)" value={formData.attributes.movement} onChange={e => setFormData({ ...formData, attributes: { ...formData.attributes, movement: e.target.value } })} />
                   <input className="form-control form-control-sm mb-2" placeholder="Material (e.g. Sapphire Crystal)" value={formData.attributes.material} onChange={e => setFormData({ ...formData, attributes: { ...formData.attributes, material: e.target.value } })} />
                   <input className="form-control form-control-sm" placeholder="Water Resistance" value={formData.attributes.waterResistance} onChange={e => setFormData({ ...formData, attributes: { ...formData.attributes, waterResistance: e.target.value } })} />
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
