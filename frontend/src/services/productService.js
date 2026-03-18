import { collection, getDocs, getDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const getProducts = async ({ category = 'all', limitCount = 12 } = {}) => {
  try {
    let q;
    if (category && category !== 'all') {
      q = query(
        collection(db, 'products'),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getProducts error:', err);
    throw err;
  }
};

export const getProductById = async (id) => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Product not found');
  return { id: docSnap.id, ...docSnap.data() };
};

export const getDealProducts = async () => {
  const q = query(
    collection(db, 'products'),
    where('isOnDeal', '==', true),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};
