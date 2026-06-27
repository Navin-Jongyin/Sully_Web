import { Navigate, Route, Routes } from 'react-router-dom';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import './ecommerce.css';

/** Catalog routes mounted at /shop/* */
export function ShopRoutes() {
  return (
    <Routes>
      <Route index element={<ShopPage />} />
      <Route path="courses" element={<ShopPage type="course" />} />
      <Route path="merch" element={<ShopPage type="merch" />} />
      <Route path=":slug" element={<ProductDetailPage />} />
      <Route path="*" element={<Navigate to="/shop" replace />} />
    </Routes>
  );
}
