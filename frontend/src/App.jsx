// src/App.jsx - WITHOUT CartSidebar import
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductDetailPage from './components/ProductDetailModal';
import CategorySection from './components/CategorySection';
import TopDeals from './components/TopDeals';
import CategoryProductsPage from './components/CategoryProductsPage';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import ScrollToTop from './components/ScrollToTop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import { AuthProvider } from './contexts/AuthContext';
import api from './services/api';

function HomePage({
  categories,
  cartCount,
  wishlist,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  addToCart,
  toggleWishlist,
  isInWishlist
}) {
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleCategorySelect = (category) => {
    navigate(`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <>
      <Navbar
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onCartOpen={handleCartClick}
      />

      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TopDeals
          addToCart={addToCart}
          onProductClick={handleProductClick}
        />
      </div>

      <CategorySection onCategorySelect={handleCategorySelect} />

      <Footer />
    </>
  );
}

function CategoryPage({
  cartCount,
  wishlist,
  addToCart,
  toggleWishlist,
  isInWishlist
}) {
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <CategoryProductsPage
      onClose={handleClose}
      onProductClick={handleProductClick}
      addToCart={addToCart}
      toggleWishlist={toggleWishlist}
      isInWishlist={isInWishlist}
    />
  );
}

export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'T-Shirts',
    'Hoodies',
    'Track Pants',
    'Polo Shirts',
    'Track Suits',
    'Wind Cheaters',
    'Jerseys'
  ];

  useEffect(() => {
    refreshCartCount();
    const interval = setInterval(refreshCartCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshCartCount = async () => {
    try {
      const cartData = await api.getCart();
      setCartCount(cartData.total_items || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      console.log('🛒 Adding to cart:', { product, quantity });
      
      await api.addToCart(
        product.id,
        quantity,
        product.selectedColor || null,
        product.selectedSize || null
      );
      
      console.log('✅ Added to cart successfully');
      await refreshCartCount();
      // alert('Product added to cart!');
      
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('Error adding to cart: ' + error.message);
    }
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      return exists ? prev.filter(item => item.id !== product.id) : [...prev, product];
    });
  };

  const isInWishlist = (productId) => wishlist.some(item => item.id === productId);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            <Route
              path="/"
              element={
                <HomePage
                  categories={categories}
                  cartCount={cartCount}
                  wishlist={wishlist}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  addToCart={addToCart}
                  toggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist}
                />
              }
            />
            <Route
              path="/category/:categoryName"
              element={
                <CategoryPage
                  cartCount={cartCount}
                  wishlist={wishlist}
                  addToCart={addToCart}
                  toggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist}
                />
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProductDetailPage
                  cartCount={cartCount}
                  wishlist={wishlist}
                  addToCart={addToCart}
                  toggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist}
                />
              }
            />

            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}