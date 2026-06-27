import { useEffect, useState } from 'react';
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { PRODUCTS_COLLECTION } from '../constants';
import type { Product, ProductType } from '../types';

export function useProducts(type?: ProductType) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints = [where('isActive', '==', true), orderBy('createdAt', 'desc')];
    if (type) constraints.unshift(where('type', '==', type));

    const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
    return onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product));
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [type]);

  return { products, loading };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('isActive', '==', true),
      where('isFeatured', '==', true),
      limit(8),
    );
    return onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product));
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  return { products, loading };
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const q = query(collection(db, PRODUCTS_COLLECTION), where('slug', '==', slug), limit(1));
  const { getDocs } = await import('firebase/firestore');
  const snap = await getDocs(q);
  if (!snap.docs.length) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Product;
}

export function useProductBySlug(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchProductBySlug(slug).then((p) => {
      if (!cancelled) {
        setProduct(p);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { product, loading };
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, PRODUCTS_COLLECTION, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
}
