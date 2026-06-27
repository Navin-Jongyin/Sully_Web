import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../lib/formatCurrency';

export function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <main className="container section shop-page">
      <h1>Your cart</h1>
      {items.length === 0 ? (
        <>
          <p className="hint">Your cart is empty.</p>
          <Link to="/shop" className="button button-primary">Browse shop</Link>
        </>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={`${item.productId}_${item.variantId || 'default'}`} className="cart-item">
                <div>
                  <strong>{item.title}</strong>
                  {item.variantLabel && <p className="hint">{item.variantLabel}</p>}
                  <p>{formatCurrency(item.price)}</p>
                </div>
                <div className="cart-item-actions">
                  {item.productType === 'merch' && (
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, item.variantId, Number(e.target.value))}
                    />
                  )}
                  <button type="button" className="button button-secondary" onClick={() => removeFromCart(item.productId, item.variantId)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="cart-total"><strong>Total: {formatCurrency(cartTotal)}</strong></p>
          <Link to="/checkout" className="button button-primary">Proceed to checkout</Link>
        </>
      )}
    </main>
  );
}
