import { useState } from 'react';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Analog', 
  'Smart Watch', 
  'Luxury', 
  'Gifts for Him', 
  'Gifts for Her', 
  'Limited Edition'
];

const placeholderImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop';

const SeedFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSeed = async () => {
    if (loading) return;
    setLoading(true);
    setProgress(0);

    try {
      const batch = writeBatch(db);
      let total = 0;

      CATEGORIES.forEach((cat, catIdx) => {
        for (let i = 1; i <= 10; i++) {
          const productData = {
            name: `${cat} Series ${String.fromCharCode(64 + i)} ${2024 + i}`,
            price: 5000 + (total * 2500) % 50000,
            category: cat,
            description: `An exquisite timepiece from our ${cat} collection. Crafted with precision and designed for the modern connoisseur.`,
            imageGallery: [placeholderImg, placeholderImg],
            tags: [cat.toLowerCase().replace(' ', ''), 'timepiece', 'chronix'],
            stock: 10 + (total % 40),
            isOnDeal: i === 1,
            dealPrice: i === 1 ? (Math.floor((5000 + (total * 2500) % 50000) * 0.8)) : null,
            createdAt: new Date().toISOString()
          };
          
          const newDocRef = doc(collection(db, 'products'));
          batch.set(newDocRef, productData);
          total++;
        }
      });

      await batch.commit();
      toast.success(`Successfully migrated ${total} products to Firestore!`);
      setProgress(100);
    } catch (err) {
      console.error(err);
      toast.error('Migration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 min-vh-100 d-flex align-items-center justify-content-center bg-obsidian-900">
      <div className="glass p-5 rounded-4 text-center max-w-500 w-100">
        <h2 className="font-display fw-bold text-white mb-4">Database Seeding Utility</h2>
        <p className="text-platinum small mb-5">
          Proceeding will generate exactly **10 products per category** (Total: 60) 
          and push them into your Firestore `products` collection.
        </p>
        
        <button 
          onClick={handleSeed}
          disabled={loading}
          className="btn btn-amber py-3 px-5 fw-bold w-100 shadow-lg"
        >
          {loading ? 'Executing Migration...' : 'Initiate Seeding (60 Products)'}
        </button>

        {progress > 0 && (
          <div className="mt-4">
            <div className="progress bg-white-5" style={{ height: '4px' }}>
              <div 
                className="progress-bar bg-amber" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}

        <div className="mt-5 pt-4 border-top border-white-5">
           <a href="/" className="text-amber x-small text-uppercase tracking-widest text-decoration-none fw-bold">Return to Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default SeedFirestore;
