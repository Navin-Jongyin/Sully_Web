import React from 'react';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { formatThb } from '../lib/payments';
import type { ShopCartDisplayLine } from './shop-cart';

type ShopCartPanelProps = {
  open: boolean;
  onClose: () => void;
  lines: ShopCartDisplayLine[];
  totalThb: number;
  disabled: boolean;
  onCheckout: () => void;
  onUpdateQuantity: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
  labels: {
    cart: string;
    cartEmpty: string;
    checkout: string;
    total: string;
    remove: string;
    quantity: string;
    processing: string;
  };
};

export const ShopCartPanel: React.FC<ShopCartPanelProps> = ({
  open,
  onClose,
  lines,
  totalThb,
  disabled,
  onCheckout,
  onUpdateQuantity,
  onRemove,
  labels,
}) => (
  <>
    <button
      type="button"
      className={`shop-cart-backdrop${open ? ' is-open' : ''}`}
      aria-hidden={!open}
      onClick={onClose}
    />
    <aside className={`shop-cart-panel${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="shop-cart-panel-head">
        <h3><ShoppingCart size={18} /> {labels.cart}</h3>
        <button type="button" className="shop-cart-close" onClick={onClose} aria-label="Close cart">
          <X size={18} />
        </button>
      </div>

      {lines.length === 0 ? (
        <p className="shop-cart-empty">{labels.cartEmpty}</p>
      ) : (
        <>
          <ul className="shop-cart-list">
            {lines.map((line) => (
              <li key={line.key} className="shop-cart-item">
                <div className="shop-cart-item-image">
                  {line.imageUrl ? <img src={line.imageUrl} alt="" /> : null}
                </div>
                <div className="shop-cart-item-body">
                  <strong>{line.name}</strong>
                  {line.colorName && <span>{line.colorName}</span>}
                  <div className="shop-cart-item-meta">
                    <label>
                      {labels.quantity}
                      <input
                        className="admin-no-spinner"
                        type="number"
                        min={1}
                        max={line.maxQuantity}
                        value={line.quantity}
                        onChange={(e) => onUpdateQuantity(line.key, Number(e.target.value))}
                      />
                    </label>
                    <span>{formatThb(line.lineTotalThb)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="shop-cart-item-remove"
                  aria-label={labels.remove}
                  onClick={() => onRemove(line.key)}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
          <div className="shop-cart-footer">
            <p className="shop-cart-total">
              <span>{labels.total}</span>
              <strong>{formatThb(totalThb)}</strong>
            </p>
            <button
              type="button"
              className="button button-primary shop-cart-checkout"
              disabled={disabled || lines.length === 0}
              onClick={onCheckout}
            >
              {labels.checkout}
            </button>
          </div>
        </>
      )}
    </aside>
  </>
);
