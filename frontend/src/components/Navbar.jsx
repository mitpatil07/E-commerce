// Navbar.jsx - Clean production version
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/wyw_logo.png';

export default function Navbar({
  categories = [],
  selectedCategory,
  setSelectedCategory,
  cartCount = 0,
  searchQuery = '',
  setSearchQuery
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (setSearchQuery && typeof setSearchQuery === 'function') {
      setSearchQuery(value);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowMobileSearch(false);
      e.preventDefault();
    }
  };

  const { user, isAuthenticated: isLoggedIn, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const categoryToUrl = (category) => {
    return category.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .navbar-brand {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        
        .nav-link {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        
        .nav-button {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 800;
          letter-spacing: 0.02em;
        }
      `}</style>

      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b-2 border-gray-200">
        {/* Main Navbar */}
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 hover:bg-gray-100 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
              <Link to="/" className="flex items-center">
                <img
                  src={logo}
                  alt="WhatYouWear Logo"
                  className="h-10 w-auto sm:h-12 md:h-12 lg:h-16 object-contain pl-16"
                />
              </Link>

              {/* Desktop Category Navigation */}
              <div className="hidden lg:flex items-center gap-1 ml-8">
                {categories && categories.filter(cat => cat !== 'All').slice(0, 4).map((category) => (
                  <Link
                    key={category}
                    to={`/category/${categoryToUrl(category)}`}
                    onClick={() => setSelectedCategory && setSelectedCategory(category)}
                    className={`nav-link px-3 py-2 text-xs uppercase transition-all duration-200 border-2 ${selectedCategory === category
                        ? 'bg-black text-white border-black'
                        : 'text-black border-transparent hover:border-black'
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
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-black transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="SEARCH FOR PRODUCTS..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-12 pr-4 py-2.5 lg:py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-all duration-200 bg-white text-sm font-bold uppercase placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 hover:bg-gray-100 transition-all duration-200"
                aria-label="Toggle search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User Menu - Desktop */}
              {isLoggedIn ? (
                <div className="hidden lg:block relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="nav-link flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-all duration-200 text-xs uppercase"
                  >
                    <User className="w-5 h-5" />
                    <span>
                      {user?.first_name || user?.email?.split('@')[0] || 'User'}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-gray-300 py-2 z-50">
                      <div className="px-4 py-2 border-b-2 border-gray-200">
                        <p className="text-sm font-bold text-black truncate uppercase">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="nav-link block px-4 py-2 text-xs text-black hover:bg-gray-100 transition-colors duration-200 uppercase"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="nav-link block px-4 py-2 text-xs text-black hover:bg-gray-100 transition-colors duration-200 uppercase"
                      >
                        My Orders
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="nav-link w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-200 uppercase"
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
                    className="nav-link px-4 py-2 text-xs text-black hover:text-gray-600 transition-colors duration-200 uppercase"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="nav-button px-4 py-2 text-xs bg-black text-white hover:bg-gray-900 transition-all duration-200 uppercase"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Cart */}
              <button
                onClick={handleCartClick}
                className="relative p-2 hover:bg-gray-100 transition-all duration-200"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold w-5 h-5 flex items-center justify-center">
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
                  placeholder="SEARCH PRODUCTS..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-300 focus:border-black focus:outline-none transition-all duration-200 bg-white text-sm font-bold uppercase placeholder:text-gray-400"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t-2 border-gray-200 bg-white animate-in slide-in-from-top duration-300">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="nav-link block px-4 py-3 hover:bg-gray-100 transition-all duration-200 text-black text-sm uppercase"
              >
                Home
              </Link>

              {categories && categories.length > 0 && (
                <div className="pt-2 pb-1">
                  <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
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
                      className={`nav-link block w-full text-left px-4 py-2.5 transition-all duration-200 text-sm uppercase ${selectedCategory === category
                          ? 'bg-black text-white'
                          : 'text-black hover:bg-gray-100'
                        }`}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}

              {isLoggedIn ? (
                <>
                  <div className="px-4 py-3 bg-gray-100 border-2 border-gray-300">
                    <p className="text-sm font-bold text-black uppercase">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="nav-link block px-4 py-3 hover:bg-gray-100 transition-all duration-200 text-black flex items-center gap-3 text-sm uppercase"
                  >
                    <User className="w-5 h-5" />
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setShowMobileMenu(false)}
                    className="nav-link block px-4 py-3 hover:bg-gray-100 transition-all duration-200 text-black text-sm uppercase"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="nav-link w-full text-left px-4 py-3 hover:bg-gray-100 transition-all duration-200 text-red-600 flex items-center gap-3 text-sm uppercase"
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
                    className="nav-link block px-4 py-3 hover:bg-gray-100 transition-all duration-200 text-black text-center text-sm uppercase"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="nav-button block px-4 py-3 bg-black text-white transition-all duration-200 text-center text-sm uppercase"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}