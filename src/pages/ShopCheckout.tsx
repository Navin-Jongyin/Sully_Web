import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useTranslation } from '../hooks/useTranslation';
import { createMerchandiseCartCheckout, formatThb } from '../lib/payments';
import type { MerchandiseInvoiceInfo, MerchandiseShippingAddress } from '../commerce/types';
import { useShopCart } from '../commerce/useShopCart';
import '../commerce/commerce.css';

const emptyShipping = (): MerchandiseShippingAddress => ({
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  district: '',
  province: '',
  postalCode: '',
  country: 'TH',
});

const emptyInvoice = (): MerchandiseInvoiceInfo => ({
  needsInvoice: false,
  invoiceName: '',
  taxId: '',
  companyName: '',
  branch: '',
});

const ShopCheckout: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { merchandise } = useData();
  const { displayLines, totalThb, items } = useShopCart(merchandise);
  const [shipping, setShipping] = useState<MerchandiseShippingAddress>(emptyShipping);
  const [invoice, setInvoice] = useState<MerchandiseInvoiceInfo>(emptyInvoice);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.displayName && !shipping.fullName) {
      setShipping((current) => ({ ...current, fullName: user.displayName ?? '' }));
    }
    if (user?.email && !shipping.email) {
      setShipping((current) => ({ ...current, email: user.email ?? '' }));
    }
  }, [user?.displayName, user?.email, shipping.fullName, shipping.email]);

  if (items.length === 0) {
    return <Navigate to="/shop" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setProcessing(true);
    try {
      const { url } = await createMerchandiseCartCheckout(items, {
        shippingAddress: {
          ...shipping,
          addressLine2: shipping.addressLine2?.trim() || undefined,
        },
        invoiceInfo: invoice.needsInvoice
          ? {
              needsInvoice: true,
              invoiceName: invoice.invoiceName?.trim(),
              taxId: invoice.taxId?.trim().replace(/\s+/g, ''),
              companyName: invoice.companyName?.trim() || undefined,
              branch: invoice.branch?.trim() || undefined,
            }
          : { needsInvoice: false },
      });
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.commerce.purchaseError);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="page-transition commerce-page">
      <section className="container section shop-checkout-page">
        <div className="section-head shop-section-head">
          <div>
            <p className="eyebrow">{t.commerce.shopEyebrow}</p>
            <h2>{t.commerce.checkoutDetailsTitle}</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '1rem 0 0' }}>
              {t.commerce.checkoutDetailsDesc}
            </p>
          </div>
          <Link to="/shop" className="button button-secondary shop-checkout-back">
            <ArrowLeft size={16} />
            {t.commerce.backToShop}
          </Link>
        </div>

        <div className="shop-checkout-layout">
          <form
            className="admin-form-shell shop-checkout-form contact-form contact-form-plain"
            onSubmit={handleSubmit}
          >
            <section className="shop-checkout-section">
              <h3>{t.commerce.shippingAddressTitle}</h3>
              <label>
                {t.commerce.fullName}
                <input
                  required
                  value={shipping.fullName}
                  onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                />
              </label>
              <label>
                {t.commerce.email}
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={shipping.email}
                  onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                />
              </label>
              <label>
                {t.commerce.phone}
                <input
                  required
                  type="tel"
                  value={shipping.phone}
                  onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                />
              </label>
              <label>
                {t.commerce.addressLine1}
                <input
                  required
                  value={shipping.addressLine1}
                  onChange={(e) => setShipping({ ...shipping, addressLine1: e.target.value })}
                />
              </label>
              <label>
                {t.commerce.addressLine2}
                <input
                  value={shipping.addressLine2 ?? ''}
                  onChange={(e) => setShipping({ ...shipping, addressLine2: e.target.value })}
                />
              </label>
              <div className="shop-checkout-grid">
                <label>
                  {t.commerce.district}
                  <input
                    required
                    value={shipping.district}
                    onChange={(e) => setShipping({ ...shipping, district: e.target.value })}
                  />
                </label>
                <label>
                  {t.commerce.province}
                  <input
                    required
                    value={shipping.province}
                    onChange={(e) => setShipping({ ...shipping, province: e.target.value })}
                  />
                </label>
              </div>
              <div className="shop-checkout-grid">
                <label>
                  {t.commerce.postalCode}
                  <input
                    required
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                  />
                </label>
                <label>
                  {t.commerce.country}
                  <input
                    required
                    value={shipping.country}
                    onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                  />
                </label>
              </div>
            </section>

            <section className="shop-checkout-section">
              <h3>{t.commerce.invoiceTitle}</h3>
              <label className="shop-checkout-checkbox">
                <input
                  type="checkbox"
                  checked={invoice.needsInvoice}
                  onChange={(e) => setInvoice({ ...invoice, needsInvoice: e.target.checked })}
                />
                {t.commerce.needsInvoice}
              </label>

              {invoice.needsInvoice && (
                <div className="shop-checkout-invoice-fields">
                  <label>
                    {t.commerce.invoiceName}
                    <input
                      required
                      value={invoice.invoiceName ?? ''}
                      onChange={(e) => setInvoice({ ...invoice, invoiceName: e.target.value })}
                    />
                  </label>
                  <label>
                    {t.commerce.taxId}
                    <input
                      required
                      inputMode="numeric"
                      pattern="\d{13}"
                      maxLength={13}
                      value={invoice.taxId ?? ''}
                      onChange={(e) => setInvoice({ ...invoice, taxId: e.target.value.replace(/\D/g, '') })}
                    />
                  </label>
                  <label>
                    {t.commerce.companyName}
                    <input
                      value={invoice.companyName ?? ''}
                      onChange={(e) => setInvoice({ ...invoice, companyName: e.target.value })}
                    />
                  </label>
                  <label>
                    {t.commerce.branch}
                    <input
                      value={invoice.branch ?? ''}
                      onChange={(e) => setInvoice({ ...invoice, branch: e.target.value })}
                    />
                  </label>
                </div>
              )}
            </section>

            {error && <p role="alert" className="commerce-error">{error}</p>}

            <button type="submit" className="button button-primary" disabled={processing}>
              {processing ? t.commerce.processing : t.commerce.continueToPayment}
            </button>
          </form>

          <aside className="admin-form-shell shop-checkout-summary">
            <h3>{t.commerce.orderSummary}</h3>
            <ul className="shop-checkout-summary-list">
              {displayLines.map((line) => (
                <li key={line.key}>
                  <div className="shop-checkout-summary-item">
                    <div className="shop-checkout-summary-image">
                      {line.imageUrl ? (
                        <img src={line.imageUrl} alt="" />
                      ) : null}
                    </div>
                    <div>
                      <strong>{line.name}</strong>
                      {line.colorName && <span>{line.colorName}</span>}
                      <small>{t.commerce.quantity}: {line.quantity}</small>
                    </div>
                  </div>
                  <span className="shop-checkout-summary-price">{formatThb(line.lineTotalThb)}</span>
                </li>
              ))}
            </ul>
            <p className="shop-checkout-summary-total">
              <span>{t.commerce.cartTotal}</span>
              <strong>{formatThb(totalThb)}</strong>
            </p>
            <p className="hint">{t.commerce.checkoutSummaryHint}</p>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default ShopCheckout;
