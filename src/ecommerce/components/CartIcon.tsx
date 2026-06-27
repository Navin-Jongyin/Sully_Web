import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import '../ecommerce.css';

export function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link to="/cart" className="cart-icon-link" aria-label={`Cart (${itemCount} items)`}>
      <ShoppingBag size={20} />
      {itemCount > 0 && <span className="cart-icon-badge">{itemCount}</span>}
    </Link>
  );
}
