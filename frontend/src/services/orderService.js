import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const generateDisplayId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export const createOrder = async ({
  userId,
  items,
  totalAmount,
  shippingAddress,
  razorpayOrderId,
  razorpayPaymentId,
}) => {
  const suffix = generateDisplayId();
  return addDoc(collection(db, 'orders'), {
    userId,
    items,
    totalAmount,
    shippingAddress,
    razorpayOrderId,
    razorpayPaymentId,
    status: 'paid',
    createdAt: serverTimestamp(),
    orderDisplayId: `ORD-${suffix}`,
    invoiceId: `INV-${suffix}`,
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
