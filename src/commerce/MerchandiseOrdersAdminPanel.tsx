import React, { useEffect, useMemo, useState } from 'react';
import { Package, RefreshCw } from 'lucide-react';
import { useData } from '../hooks/useData';
import { formatThb } from '../lib/payments';
import { updateMerchandiseOrderStatus } from '../lib/purchases';
import type { PurchaseRecord, PurchaseStatus } from './types';
import {
  formatOrderDate,
  lineImageUrl,
  MERCHANDISE_ORDER_STATUSES,
  orderStatusLabel,
  purchaseItemCount,
  purchaseLineItems,
} from './merchandise-order-utils';
import { useMerchandiseOrders } from './useMerchandiseOrders';

const STATUS_FILTERS: Array<PurchaseStatus | 'all'> = [
  'all',
  'paid',
  'pending',
  'failed',
  'cancelled',
  'refunded',
];

export const MerchandiseOrdersAdminPanel: React.FC = () => {
  const { merchandise } = useData();
  const { orders, loading, error, stats } = useMerchandiseOrders();
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const filteredOrders = useMemo(
    () => (statusFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === statusFilter)),
    [orders, statusFilter],
  );

  const handleStatusUpdate = async (orderId: string, status: PurchaseStatus) => {
    setStatusMessage(null);
    setStatusError(null);
    setSavingId(orderId);
    try {
      await updateMerchandiseOrderStatus(orderId, status);
      setStatusMessage('Order status updated.');
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Could not update order status.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="merch-orders-panel">
      <div className="merch-orders-stats">
        <div className="merch-orders-stat">
          <span>Total orders</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="merch-orders-stat">
          <span>Paid</span>
          <strong>{stats.paid}</strong>
        </div>
        <div className="merch-orders-stat">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="merch-orders-stat">
          <span>Revenue</span>
          <strong>{formatThb(stats.revenueThb)}</strong>
        </div>
      </div>

      <div className="merch-orders-filters">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            className={`merch-orders-filter${statusFilter === status ? ' is-active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status === 'all' ? 'All' : orderStatusLabel(status)}
          </button>
        ))}
      </div>

      {statusMessage && <p className="commerce-notice">{statusMessage}</p>}
      {statusError && <p className="commerce-error">{statusError}</p>}

      {loading && (
        <div className="merch-orders-empty">
          <RefreshCw size={18} />
          Loading orders…
        </div>
      )}

      {error && (
        <p className="commerce-error">{error}</p>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <div className="merch-orders-empty">
          <Package size={36} />
          <p>No merchandise orders yet.</p>
        </div>
      )}

      {!loading && filteredOrders.length > 0 && (
        <div className="admin-list-shell merch-orders-list">
          {filteredOrders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              catalog={merchandise}
              expanded={expandedId === order.id}
              saving={savingId === order.id}
              onToggle={() => setExpandedId((current) => (current === order.id ? null : order.id))}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const OrderRow: React.FC<{
  order: PurchaseRecord;
  catalog: ReturnType<typeof useData>['merchandise'];
  expanded: boolean;
  saving: boolean;
  onToggle: () => void;
  onStatusUpdate: (orderId: string, status: PurchaseStatus) => Promise<void>;
}> = ({ order, catalog, expanded, saving, onToggle, onStatusUpdate }) => {
  const lines = purchaseLineItems(order);
  const itemCount = purchaseItemCount(order);
  const createdLabel = formatOrderDate(order.paidAt ?? order.purchaseDate ?? order.createdAt);
  const [draftStatus, setDraftStatus] = useState<PurchaseStatus>(order.status);

  useEffect(() => {
    setDraftStatus(order.status);
  }, [order.status]);

  const statusChanged = draftStatus !== order.status;

  return (
    <div className="merch-order-row">
      <button type="button" className="merch-order-summary" onClick={onToggle}>
        <div className="merch-order-summary-main">
          <strong>{order.email || 'No email'}</strong>
          <span>
            {createdLabel}
            {order.isGuest ? ' · Guest' : ''}
            {` · ${itemCount} item${itemCount === 1 ? '' : 's'}`}
          </span>
          <span className="merch-order-title">{order.productTitle}</span>
        </div>
        <div className="merch-order-summary-meta">
          <span className={`merch-order-status merch-order-status--${order.status}`}>
            {orderStatusLabel(order.status)}
          </span>
          <strong>{formatThb(Number(order.amountThb) || 0)}</strong>
        </div>
      </button>

      {expanded && (
        <div className="merch-order-detail">
          <div
            className="merch-order-status-editor"
            onClick={(event) => event.stopPropagation()}
          >
            <label>
              Order status
              <div className="merch-order-status-controls">
                <select
                  value={draftStatus}
                  disabled={saving}
                  onChange={(event) => setDraftStatus(event.target.value as PurchaseStatus)}
                >
                  {MERCHANDISE_ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {orderStatusLabel(status)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={!statusChanged || saving}
                  onClick={() => void onStatusUpdate(order.id, draftStatus)}
                >
                  {saving ? 'Saving…' : 'Update status'}
                </button>
              </div>
            </label>
            {order.statusUpdatedAt ? (
              <p className="hint">
                Last status change: {formatOrderDate(order.statusUpdatedAt)}
              </p>
            ) : null}
          </div>

          <div className="merch-order-detail-grid">
            <div>
              <h4>Customer</h4>
              <p>{order.email}</p>
              <p>{order.isGuest ? 'Guest checkout' : `Account: ${order.uid}`}</p>
              {order.stripeSessionId && <p>Stripe session: {order.stripeSessionId}</p>}
            </div>
            {order.shippingAddress && (
              <div>
                <h4>Shipping</h4>
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.email}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.district}, {order.shippingAddress.province}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            )}
            {order.invoiceInfo?.needsInvoice && (
              <div>
                <h4>Tax invoice</h4>
                <p>{order.invoiceInfo.invoiceName}</p>
                <p>Tax ID: {order.invoiceInfo.taxId}</p>
                {order.invoiceInfo.companyName && <p>{order.invoiceInfo.companyName}</p>}
                {order.invoiceInfo.branch && <p>Branch: {order.invoiceInfo.branch}</p>}
              </div>
            )}
          </div>

          <h4>Items</h4>
          <ul className="merch-order-items">
            {lines.map((line) => {
              const imageUrl = lineImageUrl(line, catalog);
              return (
                <li key={`${line.merchandiseId}:${line.colorOptionId ?? 'default'}`}>
                  <div className="merch-order-item-image">
                    {imageUrl ? <img src={imageUrl} alt="" /> : null}
                  </div>
                  <div className="merch-order-item-body">
                    <strong>{line.title}</strong>
                    <span>Product ID: {line.merchandiseId}</span>
                    {line.colorName && <span>Color: {line.colorName}</span>}
                    <span>Qty: {line.quantity} · Unit: {formatThb(line.priceThb)}</span>
                  </div>
                  <strong>{formatThb(line.lineTotalThb)}</strong>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
