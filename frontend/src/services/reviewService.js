import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const getReviewsByProduct = async (productId) => {
  const q = query(
    collection(db, 'reviews'),
    where('productId', '==', productId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addReview = async ({ productId, userId, userName, rating, text }) => {
  return addDoc(collection(db, 'reviews'), {
    productId,
    userId,
    userName,
    rating,
    text,
    createdAt: serverTimestamp(),
  });
};
