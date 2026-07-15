import React, { useState } from 'react';
import { Edit2, Plus, Save, Trash2, X, ShoppingBag } from 'lucide-react';
import { useData } from '../hooks/useData';
import type { MerchandiseProduct } from '../commerce/types';

const emptyForm = (): Omit<MerchandiseProduct, 'id'> => ({
  name: '',
  description: '',
  priceThb: 0,
  imageUrl: '',
  category: 'apparel',
  inStock: true,
  stripePriceId: '',
});

export const MerchandiseAdminPanel: React.FC = () => {
  const { merchandise, addMerchandise, updateMerchandise, deleteMerchandise } = useData();
  const [editing, setEditing] = useState<MerchandiseProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setCreating(true);
  };

  const openEdit = (item: MerchandiseProduct) => {
    setCreating(false);
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      priceThb: item.priceThb,
      imageUrl: item.imageUrl,
      category: item.category,
      inStock: item.inStock,
      stripePriceId: item.stripePriceId ?? '',
      order: item.order,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  };

  const reset = () => {
    setEditing(null);
    setCreating(false);
    setForm(emptyForm());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const payload: MerchandiseProduct = {
        id: editing?.id ?? `merch-${Date.now()}`,
        name: form.name.trim(),
        description: form.description.trim(),
        priceThb: Number(form.priceThb) || 0,
        imageUrl: form.imageUrl.trim(),
        category: form.category,
        inStock: form.inStock,
        stripePriceId: form.stripePriceId?.trim() || undefined,
        order: editing?.order,
        createdAt: editing?.createdAt ?? now,
        updatedAt: now,
      };
      if (editing) await updateMerchandise(payload);
      else await addMerchandise(payload);
      reset();
    } finally {
      setSaving(false);
    }
  };

  const showForm = creating || editing !== null;

  return (
    <div>
      {!showForm && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button type="button" className="button button-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Product
          </button>
        </div>
      )}

      {!showForm && (
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {merchandise.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <ShoppingBag size={40} style={{ margin: '0 auto 1rem' }} />
              No merchandise yet. Add products for the shop.
            </div>
          ) : (
            merchandise.map((item) => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', alignItems: 'center' }}>
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.category}</div>
                </div>
                <div>฿{item.priceThb.toLocaleString()}</div>
                <div>{item.inStock ? 'In stock' : 'Out'}</div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => openEdit(item)} style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '0.5rem', cursor: 'pointer' }}>
                    <Edit2 size={16} />
                  </button>
                  <button type="button" onClick={() => window.confirm(`Delete ${item.name}?`) && deleteMerchandise(item.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)', padding: '0.5rem', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2>{creating ? 'Add Merchandise' : `Edit: ${editing?.name}`}</h2>
            <button type="button" onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
          </div>
          <form className="contact-form" style={{ padding: 0, border: 'none', background: 'transparent' }} onSubmit={handleSave}>
            <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Description<textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', marginTop: '0.5rem', padding: '1rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'inherit' }} /></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label>Price (THB)<input type="number" min={0} required value={form.priceThb} onChange={(e) => setForm({ ...form, priceThb: Number(e.target.value) })} /></label>
              <label>Category
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MerchandiseProduct['category'] })} style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)' }}>
                  <option value="apparel">Apparel</option>
                  <option value="accessory">Accessory</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
            <label>Image URL<input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." /></label>
            <label>Stripe Price ID (optional)<input value={form.stripePriceId} onChange={(e) => setForm({ ...form, stripePriceId: e.target.value })} placeholder="price_..." /></label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />
              In stock
            </label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="button button-primary" disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save'}</button>
              <button type="button" className="button button-secondary" onClick={reset}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
