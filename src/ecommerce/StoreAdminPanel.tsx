import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { db, storage } from '../firebase';
import { COUPONS_COLLECTION, PRODUCTS_COLLECTION } from '../ecommerce/constants';
import type { Coupon, Product, ProductType } from '../ecommerce/types';
import { productImagePath } from '../lib/firebase/storage';
import './StoreAdminPanel.css';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const emptyProduct = (): Partial<Product> => ({
  type: 'course',
  title: '',
  slug: '',
  description: '',
  richDescription: '',
  price: 0,
  compareAtPrice: null,
  currency: 'usd',
  imageURL: '',
  galleryURLs: [],
  tags: [],
  isActive: true,
  isFeatured: false,
  instructor: '',
  duration: '',
  level: 'beginner',
  language: 'English',
  totalLessons: 0,
  whatYouLearn: [],
  requirements: [],
  certificate: true,
  sku: '',
  inventory: 0,
  trackInventory: true,
  shippingRequired: true,
  variants: [],
});

export function StoreAdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<'products' | 'coupons'>('products');

  useEffect(() => {
    const unsubProducts = onSnapshot(query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc')), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product));
    });
    const unsubCoupons = onSnapshot(collection(db, COUPONS_COLLECTION), (snap) => {
      setCoupons(snap.docs.map((d) => ({ code: d.id, ...d.data() }) as Coupon));
    });
    return () => {
      unsubProducts();
      unsubCoupons();
    };
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const id = editing.id || `draft-${Date.now()}`;
      const path = productImagePath(id, file.name);
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditing({ ...editing, imageURL: url });
    } finally {
      setUploading(false);
    }
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editing?.title) return;
    const now = serverTimestamp();
    const payload = {
      ...editing,
      slug: editing.slug || slugify(editing.title),
      currency: 'usd' as const,
      updatedAt: now,
    };

    if (isCreating) {
      await addDoc(collection(db, PRODUCTS_COLLECTION), { ...payload, createdAt: now });
    } else if (editing.id) {
      await updateDoc(doc(db, PRODUCTS_COLLECTION, editing.id), payload as Record<string, unknown>);
    }

    setEditing(null);
    setIsCreating(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  }

  async function addCoupon() {
    const code = prompt('Coupon code (e.g. SAVE10)?')?.trim().toUpperCase();
    if (!code) return;
    await setDoc(doc(db, COUPONS_COLLECTION, code), {
      code,
      type: 'percent',
      value: 10,
      minOrderAmount: null,
      maxUses: null,
      usedCount: 0,
      expiresAt: null,
      appliesToProductIds: null,
      isActive: true,
    });
  }

  return (
    <div className="store-admin">
      <div className="store-admin-tabs">
        <button type="button" className={tab === 'products' ? 'is-active' : ''} onClick={() => setTab('products')}>Products</button>
        <button type="button" className={tab === 'coupons' ? 'is-active' : ''} onClick={() => setTab('coupons')}>Coupons</button>
      </div>

      {tab === 'products' && !editing && !isCreating && (
        <>
          <div className="store-admin-toolbar">
            <p className="hint">Manage online courses and merchandise. Images upload to Firebase Storage; product data lives in Firestore.</p>
            <button type="button" className="button button-primary" onClick={() => { setIsCreating(true); setEditing(emptyProduct()); }}>
              <Plus size={18} /> Add product
            </button>
          </div>
          <div className="store-admin-table-wrap">
            <table className="store-admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.type}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{p.isActive ? 'Yes' : 'No'}</td>
                    <td>
                      <button type="button" onClick={() => setEditing(p)}>Edit</button>
                      <button type="button" onClick={() => deleteProduct(p.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'products' && (editing || isCreating) && (
        <form className="store-admin-form" onSubmit={saveProduct}>
          <div className="store-admin-form-head">
            <h3>{isCreating ? 'New product' : 'Edit product'}</h3>
            <button type="button" onClick={() => { setEditing(null); setIsCreating(false); }}><X size={20} /></button>
          </div>
          <label>
            Type
            <select value={editing?.type || 'course'} onChange={(e) => setEditing({ ...editing!, type: e.target.value as ProductType })}>
              <option value="course">Course</option>
              <option value="merch">Merchandise</option>
            </select>
          </label>
          <label>
            Title
            <input value={editing?.title || ''} onChange={(e) => setEditing({ ...editing!, title: e.target.value, slug: slugify(e.target.value) })} required />
          </label>
          <label>
            Slug
            <input value={editing?.slug || ''} onChange={(e) => setEditing({ ...editing!, slug: e.target.value })} required />
          </label>
          <label>
            Price (USD)
            <input type="number" step="0.01" min={0} value={editing?.price ?? 0} onChange={(e) => setEditing({ ...editing!, price: Number(e.target.value) })} required />
          </label>
          <label>
            Short description
            <textarea value={editing?.description || ''} onChange={(e) => setEditing({ ...editing!, description: e.target.value })} rows={3} />
          </label>
          <label>
            Product image (Firebase Storage)
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {editing?.imageURL && <img src={editing.imageURL} alt="" className="store-admin-preview" />}
          </label>
          <label className="store-admin-check">
            <input type="checkbox" checked={editing?.isActive ?? true} onChange={(e) => setEditing({ ...editing!, isActive: e.target.checked })} />
            Active
          </label>
          <label className="store-admin-check">
            <input type="checkbox" checked={editing?.isFeatured ?? false} onChange={(e) => setEditing({ ...editing!, isFeatured: e.target.checked })} />
            Featured
          </label>
          {editing?.type === 'merch' && (
            <label>
              Inventory
              <input type="number" min={0} value={editing.inventory ?? 0} onChange={(e) => setEditing({ ...editing!, inventory: Number(e.target.value) })} />
            </label>
          )}
          <button type="submit" className="button button-primary" disabled={uploading}><Save size={18} /> Save product</button>
        </form>
      )}

      {tab === 'coupons' && (
        <>
          <div className="store-admin-toolbar">
            <p className="hint">Discount codes for checkout.</p>
            <button type="button" className="button button-primary" onClick={addCoupon}><Plus size={18} /> Add coupon</button>
          </div>
          <ul className="coupon-list">
            {coupons.map((c) => (
              <li key={c.code}>
                <strong>{c.code}</strong> — {c.type === 'percent' ? `${c.value}%` : `$${c.value}`} off
                {!c.isActive && ' (inactive)'}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
