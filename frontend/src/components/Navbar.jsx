import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({
  categories = [],
  selectedCategory,
  setSelectedCategory,
  cartCount = 0,
  onCartOpen,
  searchQuery = '',
  setSearchQuery
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  
  const { user, isAuthenticated: isLoggedIn, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleCartClick = () => {
    if (onCartOpen && typeof onCartOpen === 'function') {
      onCartOpen();
    }
  };

  // Helper function to convert category name to URL-friendly format
  const categoryToUrl = (category) => {
    return category.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-white via-gray-50 to-white shadow-lg sticky top-0 z-50 backdrop-blur-md border-b border-gray-100">
        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                aria-label="Toggle menu"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
              
              <Link to="/" className="flex items-center">
                <span
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 font-semibold tracking-wide whitespace-nowrap"
                  style={{
                    fontFamily: "'Great Vibes', cursive",
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                  }}
                >
                  WhatYouWear
                </span>
              </Link>

              {/* Desktop Category Navigation - Next to Logo */}
              <div className="hidden lg:flex items-center gap-1 ml-8">
                {categories && categories.filter(cat => cat !== 'All').slice(0, 4).map((category) => (
                  <Link
                    key={category}
                    to={`/category/${categoryToUrl(category)}`}
                    onClick={() => setSelectedCategory && setSelectedCategory(category)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 whitespace-nowrap ${
                      selectedCategory === category 
                        ? 'bg-gray-900 text-white hover:bg-gray-800' 
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-4">
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-gray-900 transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search for products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 lg:py-3 rounded-full border-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-all duration-200 bg-white hover:shadow-md focus:shadow-lg"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                aria-label="Toggle search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User Menu - Desktop */}
              {isLoggedIn ? (
                <div className="hidden lg:block relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {user?.first_name || user?.email?.split('@')[0] || 'User'}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        My Orders
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Cart */}
              <button
                onClick={handleCartClick}
                className="relative p-2 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 rounded-lg transition-all duration-200 hover:scale-105 bg-gray-50"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-gray-900 to-gray-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div className="md:hidden pb-3 animate-in slide-in-from-top duration-300">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-full border-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-all duration-200 bg-white shadow-md focus:shadow-lg"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white animate-in slide-in-from-top duration-300">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Home
              </Link>
              <Link
                to="/shop"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Shop
              </Link>
              
              {/* Categories in Mobile Menu */}
              {categories && categories.length > 0 && (
                <div className="pt-2 pb-1">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Categories
                  </div>
                  {categories.filter(cat => cat !== 'All').map((category) => (
                    <Link
                      key={category}
                      to={`/category/${categoryToUrl(category)}`}
                      onClick={() => {
                        setSelectedCategory && setSelectedCategory(category);
                        setShowMobileMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                        selectedCategory === category
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'text-gray-700 hover:bg-white hover:shadow-md hover:text-gray-900'
                      }`}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}

              {/* User Menu in Mobile */}
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-3 bg-gray-100 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <Link
                    to="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 font-medium text-gray-700 hover:text-gray-900 flex items-center gap-3"
                  >
                    <User className="w-5 h-5" />
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 font-medium text-red-600 hover:text-red-700 flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="pt-2 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 font-medium text-gray-700 hover:text-gray-900 text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-3 rounded-lg bg-gradient-to-r from-gray-900 to-gray-700 text-white font-medium hover:shadow-lg transition-all duration-200 text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}