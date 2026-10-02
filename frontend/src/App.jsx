import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { AuthModal } from './components/common/AuthModal';
import { PaymentReceiptModal } from './components/receipt/PaymentReceiptModal';

import { HomePage } from './pages/customer/HomePage';
import { ProductListingPage } from './pages/customer/ProductListingPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';
import { MyOrdersPage } from './pages/customer/MyOrdersPage';
import { WishlistPage } from './pages/customer/WishlistPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { productAPI } from './api/api';

function MainLayout() {
  const { user, isAdmin } = useAuth();
  const { setIsCartOpen } = useCart();

  const [currentPage, setCurrentPage] = useState('home');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [lastOrder, setLastOrder] = useState(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Fetch initial catalog
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await productAPI.getProducts();
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleNavigate = (page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = () => {
    setCurrentPage('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (orderData) => {
    setLastOrder(orderData);
    setSelectedReceiptOrder(orderData);
    setCurrentPage('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReceiptModal = (order) => {
    setSelectedReceiptOrder(order);
    setIsReceiptOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfb] text-slate-900 font-sans">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        products={products}
        onSelectProduct={handleSelectProduct}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1">
        {loadingProducts && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Loading NovaMart Storefront...</p>
          </div>
        ) : (
          <>
            {currentPage === 'home' && (
              <HomePage
                products={products}
                onSelectProduct={handleSelectProduct}
                onNavigate={handleNavigate}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {currentPage === 'catalog' && (
              <ProductListingPage
                products={products}
                onSelectProduct={handleSelectProduct}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}

            {currentPage === 'product-detail' && (
              <ProductDetailPage
                product={selectedProduct}
                onSelectProduct={handleSelectProduct}
                onBack={() => handleNavigate('catalog')}
                onBuyNow={() => handleNavigate('checkout')}
              />
            )}

            {currentPage === 'checkout' && (
              <CheckoutPage
                onOrderSuccess={handleOrderSuccess}
                onBack={() => handleNavigate('catalog')}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}

            {currentPage === 'order-confirmation' && (
              <OrderConfirmationPage
                order={lastOrder}
                onOpenReceipt={() => setIsReceiptOpen(true)}
                onContinueShopping={() => handleNavigate('catalog')}
                onNavigateOrders={() => handleNavigate('orders')}
              />
            )}

            {currentPage === 'orders' && (
              <MyOrdersPage
                onSelectOrderReceipt={handleOpenReceiptModal}
                onStartShopping={() => handleNavigate('catalog')}
              />
            )}

            {currentPage === 'wishlist' && (
              <WishlistPage
                onSelectProduct={handleSelectProduct}
                onStartShopping={() => handleNavigate('catalog')}
              />
            )}

            {currentPage === 'admin' && (
              <AdminDashboard
                onExitAdmin={() => handleNavigate('home')}
                onSelectOrderReceipt={handleOpenReceiptModal}
              />
            )}
          </>
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => handleNavigate('checkout')}
      />

      {/* Payment Receipt / Tax Invoice Modal */}
      <PaymentReceiptModal
        order={selectedReceiptOrder}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          loadProducts();
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <MainLayout />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
