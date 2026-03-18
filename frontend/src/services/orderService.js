import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const createOrder = async ({
  userId,
  items,
  totalAmount,
  shippingAddress,
  razorpayOrderId,
  razorpayPaymentId,
}) => {
  return addDoc(collection(db, 'orders'), {
    userId,
    items,
    totalAmount,
    shippingAddress,
    razorpayOrderId,
    razorpayPaymentId,
    status: 'paid',
    createdAt: serverTimestamp(),
  });
};

export const getUserOrders = async (userId) => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};
