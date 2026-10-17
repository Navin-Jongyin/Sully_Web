import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { PurchaseRecord } from './types';
import { isMerchandisePurchase, purchaseSortTime } from './merchandise-order-utils';

export function useMerchandiseOrders() {
  const [orders, setOrders] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'purchases'),
      where('productType', 'in', ['merchandise', 'merchandise_cart']),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as PurchaseRecord))
          .filter(isMerchandisePurchase)
          .sort((a, b) => purchaseSortTime(b) - purchaseSortTime(a));
        setOrders(rows);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const stats = useMemo(() => ({
    total: orders.length,
    paid: orders.filter((order) => order.status === 'paid').length,
    pending: orders.filter((order) => order.status === 'pending').length,
    revenueThb: orders
      .filter((order) => order.status === 'paid')
      .reduce((sum, order) => sum + (Number(order.amountThb) || 0), 0),
  }), [orders]);

  return { orders, loading, error, stats };
}
