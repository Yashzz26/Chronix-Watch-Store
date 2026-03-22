import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCamera, HiOutlineUser, HiOutlineEnvelope, HiOutlineMapPin } from 'react-icons/hi2';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const { profile, updateProfile, user } = useAuthStore();
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    address: profile?.address || '',
    photo: profile?.photo || '',
  });

  const fileRef = useRef(null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setForm({ ...form, photo: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  const save = (e) => {
    e.preventDefault();
    updateProfile(form);
    toast.success('Dossier updated');
  };

  return (
    <div className="container py-5 my-5 mx-auto" style={{ maxWidth: 800 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="text-center text-md-start border-bottom border-border pb-5 mb-5">
          <h1 className="font-display display-3 text-t1 mb-3">Member Dossier</h1>
          <p className="text-t3 font-mono text-uppercase tracking-widest fw-medium m-0" style={{ fontSize: '0.8rem', letterSpacing: '0.2em' }}>
            Verified since 2024 • Rank: Premium Collector
          </p>
        </div>

        <form onSubmit={save} className="row g-5">
          {/* Left: Avatar */}
          <div className="col-12 col-md-4 d-flex flex-column align-items-center">
            <div className="position-relative overflow-hidden cursor-pointer rounded-circle" style={{ width: 180, height: 180 }} onClick={() => fileRef.current.click()}>
              <div className="w-100 h-100 rounded-circle border border-2 border-border p-1 bg-s1 transition-all">
                <div className="w-100 h-100 rounded-circle overflow-hidden bg-s2 d-flex align-items-center justify-content-center">
                  {form.photo ? (
                    <img src={form.photo} alt="Profile" className="w-100 h-100 object-fit-cover" />
                  ) : (
                    <HiOutlineUser size={80} className="text-t3" />
                  )}
                </div>
              </div>
              <div 
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 opacity-0 rounded-circle transition-all"
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
                style={{ transition: 'opacity 0.3s ease' }}
              >
                <HiOutlineCamera size={36} className="text-gold" />
              </div>
              <input type="file" hidden ref={fileRef} accept="image/*" onChange={handlePhoto} />
            </div>
            <p className="mt-4 text-t3 text-uppercase tracking-widest text-center lh-lg mb-0" style={{ fontSize: '0.6rem' }}>
              Click circle <br /> to update portrait
            </p>
          </div>

          {/* Right: Fields */}
          <div className="col-12 col-md-8">
            <div className="row g-4">
              {[
                { label: 'Full Appellation', key: 'name', icon: HiOutlineUser, ph: 'Your name' },
                { label: 'Electronic Mail', key: 'email', icon: HiOutlineEnvelope, ph: 'your@email.com' },
                { label: 'Dispatch Address', key: 'address', icon: HiOutlineMapPin, ph: 'Full residence address', area: true }
              ].map((f) => (
                <div key={f.key} className="col-12">
                  <label className="text-uppercase text-t3 tracking-widest ps-1 mb-2 d-block" style={{ fontSize: '0.65rem' }}>{f.label}</label>
                  <div className="position-relative">
                    <f.icon className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" style={f.area ? {top: 24, transform: 'none'} : {}} size={16} />
                    {f.area ? (
                      <textarea
                        className="form-control chronix-input ps-5 py-3"
                        style={{ minHeight: 120 }}
                        placeholder={f.ph}
                        value={form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      />
                    ) : (
                      <input
                        className="form-control chronix-input ps-5"
                        placeholder={f.ph}
                        value={form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="btn-chronix-primary py-3 px-5 mt-5">
              Preserve Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
