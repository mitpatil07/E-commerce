// src/App.jsx - FIXED with search on all pages
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
import SearchResultsPopup from './pages/SearchResults';
import { AuthProvider } from './contexts/AuthContext';
import api from './services/api';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

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
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.trim().length >= 2) {
        setDebouncedQuery(searchQuery);
        setShowSearchPopup(true);
      } else {
        setShowSearchPopup(false);
        setDebouncedQuery('');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleProductClick = (product) => {
    setShowSearchPopup(false);
    setSearchQuery('');
    navigate(`/product/${product.id}`);
  };

  const handleCategorySelect = (category) => {
    const categoryUrl = category.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/category/${categoryUrl}`, {
      state: { category: category.name }
    });
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const closeSearchPopup = () => {
    setShowSearchPopup(false);
    setSearchQuery('');
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

      <CategorySection
        onCategorySelect={handleCategorySelect}
      />

      <Footer />

      {/* Search Results Popup Overlay */}
      {showSearchPopup && (
        <SearchResultsPopup
          query={debouncedQuery}
          onProductClick={handleProductClick}
          onClose={closeSearchPopup}
          addToCart={addToCart}
        />
      )}
    </>
  );
}

function CategoryPage({
  cartCount,
  addToCart,
  toggleWishlist,
  isInWishlist,
  searchQuery,
  setSearchQuery
}) {
  const navigate = useNavigate();
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.trim().length >= 2) {
        setDebouncedQuery(searchQuery);
        setShowSearchPopup(true);
      } else {
        setShowSearchPopup(false);
        setDebouncedQuery('');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleProductClick = (product) => {
    setShowSearchPopup(false);
    setSearchQuery('');
    navigate(`/product/${product.id}`);
  };

  const closeSearchPopup = () => {
    setShowSearchPopup(false);
    setSearchQuery('');
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <>
      <CategoryProductsPage
        onClose={handleClose}
        onProductClick={handleProductClick}
        addToCart={addToCart}
        toggleWishlist={toggleWishlist}
        isInWishlist={isInWishlist}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
      />

      {/* Search Results Popup Overlay */}
      {showSearchPopup && (
        <SearchResultsPopup
          query={debouncedQuery}
          onProductClick={handleProductClick}
          onClose={closeSearchPopup}
          addToCart={addToCart}
        />
      )}
    </>
  );
}

export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);

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
      setCart(cartData.items || []);
      setCartCount(cartData.total_items || 0);
    } catch (error) {
      setCart([]);
      setCartCount(0);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      await api.addToCart(
        product.id,
        quantity,
        product.selectedColor || null,
        product.selectedSize || null
      );
  
      await refreshCartCount();
      const updatedCart = await api.getCart();
      setCart(updatedCart.items || []);
      setCartCount(updatedCart.total_items || 0);
      // console.log("✅ Added to cart successfully");
    } catch (error) {
      console.error("❌ Failed to add to cart", error);
      alert(error.message || "Failed to add to cart");
    }
  };
  
  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const removeFromCart = async (itemId) => {
    try {
      await api.removeFromCart(itemId);
      await refreshCartCount();
    } catch (err) {
      console.error('Failed to remove from cart', err);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.updateCartItem(itemId, quantity);
      await refreshCartCount();
    } catch (err) {
      console.error('Failed to update cart item', err);
    }
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-white border-y border-gray-200">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />

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
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              }
            />

            <Route
              path="/product/:id"
              element={
                <ProductDetailPage
                  cart={cart}
                  cartCount={cartCount}
                  wishlist={wishlist}
                  addToCart={addToCart}
                  toggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist}
                  removeFromCart={removeFromCart}
                  updateQuantity={updateQuantity}
                />
              }
            />

            <Route
              path="/cart"
              element={
                <Cart
                  cart={cart}
                  refreshCart={refreshCartCount}
                  removeFromCart={removeFromCart}
                  updateQuantity={updateQuantity}
                />
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

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