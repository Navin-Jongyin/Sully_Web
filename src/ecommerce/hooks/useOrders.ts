import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { useEcommerceAuth } from '../../context/EcommerceAuthContext';
import type { Order } from '../types';

export function useOrders() {
  const { user } = useEcommerceAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ orderId: d.id, ...d.data() }) as Order));
      setLoading(false);
    });
  }, [user]);

  return { orders, loading };
}

/**
 * TODO: connect Cloud Function — orders should be written server-side after payment confirmation.
 * Client scaffold writes directly for development only; disable in production rules.
 */
export async function createOrderClientSide(
  userId: string,
  order: Omit<Order, 'orderId'>,
): Promise<string> {
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
  const ref = await addDoc(collection(db, 'users', userId, 'orders'), {
    ...order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function createEnrollmentsForOrder(
  userId: string,
  orderId: string,
  items: Order['items'],
): Promise<void> {
  const { doc, serverTimestamp, setDoc } = await import('firebase/firestore');
  const courseItems = items.filter((i) => i.productType === 'course');

  await Promise.all(
    courseItems.map((item) =>
      setDoc(doc(db, 'users', userId, 'enrollments', item.productId), {
        courseId: item.productId,
        orderId,
        title: item.title,
        thumbnailURL: item.imageURL,
        enrolledAt: serverTimestamp(),
        progress: {
          completedLessonIds: [],
          lastLessonId: null,
          lastAccessedAt: null,
          completionPercent: 0,
          completedAt: null,
        },
        certificateIssued: false,
        certificateURL: null,
      }),
    ),
  );
}
