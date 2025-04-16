import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Public Pages
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/shop/HomePage';
import CategoryPage from './pages/shop/CategoryPage';
import ProductDetailPage from './pages/shop/ProductDetailPage';
import HotDealsPage from './pages/shop/HotDealsPage';
import SearchResultsPage from './pages/shop/SearchResultsPage';
import CheckoutPage from './pages/shop/CheckoutPage';
import CheckoutSuccessPage from './pages/shop/CheckoutSuccessPage';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import BannersAdminPage from './pages/admin/BannersAdminPage';
import OrdersPage from './pages/admin/OrdersPage';
import EditProductPage from './pages/admin/EditProductPage';
import EditBannerPage from './pages/admin/EditBannerPage';
import { CartProvider } from './contexts/CartContext';

// THIS IS THE FIX - Make sure the ProtectedRoute component works correctly
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }
  
  // THIS IS IMPORTANT - Properly redirect to login if not authenticated
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <CartProvider>
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/category/all" element={<CategoryPage category="all" />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/hotdeals" element={<HotDealsPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <AdminLayout>
                <ProductsAdminPage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products/add" element={
            <ProtectedRoute>
              <AdminLayout>
                <EditProductPage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products/:id" element={
            <ProtectedRoute>
              <AdminLayout>
                <EditProductPage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/banners" element={
            <ProtectedRoute>
              <AdminLayout>
                <BannersAdminPage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/banners/add" element={
            <ProtectedRoute>
              <AdminLayout>
                <EditBannerPage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/banners/:id" element={
            <ProtectedRoute>
              <AdminLayout>
                <EditBannerPage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute>
              <AdminLayout>
                <OrdersPage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch-all / 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </CartProvider>
  );
}

export default App;