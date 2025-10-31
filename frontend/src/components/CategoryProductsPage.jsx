import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingCart, Star, Check, Loader2 } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../services/api';

export default function CategoryProductsPage({ 
  onProductClick,
  addToCart,
}) {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('featured');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Close menus on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (showSortMenu || showFilterMenu) {
        setShowSortMenu(false);
        setShowFilterMenu(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showSortMenu, showFilterMenu]);

  // Get category from route state or use default
  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);
    }
  }, [location.state]);

  // Fetch categories on mount
  useEffect(() => {
    
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        
        const categoryList = data.results || data;
        
        setCategories(categoryList);
        
        if (categoryList.length > 0 && !location.state?.category) {
          // console.log('✅ Setting active category to:', categoryList[0].name);
          setActiveCategory(categoryList[0].name);
        } else if (categoryList.length === 0) {
          // console.warn('⚠️ No categories found');
          setLoading(false);
        }
      } catch (err) {
        // console.error('❌ Failed to fetch categories:', err);
        // console.error('❌ Error message:', err.message);
        // console.error('❌ Error stack:', err.stack);
        setError('Failed to load categories: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [location.state]);

  // Fetch products when category changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!activeCategory) {
        // console.log('⚠️ No active category, skipping product fetch');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // console.log('🔄 Fetching products for category:', activeCategory);
        
        const data = await api.getProducts({
          category: activeCategory,
        });
        
        // console.log('✅ Products API response:', data);
        
        const productList = data.results || data;
        // console.log('📦 Product list:', productList.length, 'products found');
        
        setProducts(productList);
        setLoading(false);
      } catch (err) {
        // console.error('❌ Failed to fetch products:', err);
        // console.error('❌ Error message:', err.message);
        // console.error('❌ Error stack:', err.stack);
        setError(err.message || 'Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  const categoryCounts = categories.map(cat => ({
    ...cat,
    count: products.filter(p => p.category === cat.name).length
  }));

  const filteredProducts = products.filter(product => {
    const matchCategory = product.category === activeCategory;
    const matchPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchCategory && matchPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low-high':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high-low':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name-a-z':
        return a.name.localeCompare(b.name);
      case 'name-z-a':
        return b.name.localeCompare(a.name);
      case 'rating':
        return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      default:
        return 0;
    }
  });

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddToCart = async (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      // console.log('🛒 Adding to cart:', product.name);
      
      await api.addToCart(product.id, 1);
      
      if (addToCart && typeof addToCart === 'function') {
        addToCart(product);
      }
      
      showToastMessage(`${product.name} added to cart!`);
      // console.log('✅ Added to cart successfully');
    } catch (err) {
      // console.error('❌ Failed to add to cart:', err);
      showToastMessage('Failed to add to cart. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
            <p className="text-lg font-bold text-black" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.02em' }}>
              Loading products...
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center p-8">
            <div className="inline-block p-6 bg-red-100 rounded-2xl mb-4">
              <ShoppingCart className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Failed to Load Products</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-900 transition"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white" onClick={() => {
        setShowSortMenu(false);
        setShowFilterMenu(false);
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          
          .product-title {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 900;
            letter-spacing: -0.04em;
            line-height: 1;
          }
          
          .category-btn {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 800;
            letter-spacing: 0.02em;
          }
          
          .product-name {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 600;
            letter-spacing: -0.01em;
            line-height: 1.3;
          }
          
          .price-text {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 700;
            letter-spacing: -0.02em;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-20 sm:top-24 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-black text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
              <Check className="w-10 h-10" />
              <span className="font-bold text-sm">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4 sm:py-6 max-w-screen-2xl mx-auto">
            {/* Title */}
            <div className="mb-4">
              <h1 className="product-title text-3xl sm:text-4xl lg:text-5xl text-black uppercase mb-2">
                {activeCategory || 'All Products'}
              </h1>
            </div>
            
            {/* Category Pills */}
            <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-2 pb-2">
                {categoryCounts.map((category) => (
                  <button
                    key={category.id || category.name}
                    onClick={() => setActiveCategory(category.name)}
                    className={`category-btn flex-shrink-0 px-4 py-2 rounded-md text-xs transition-all duration-200 whitespace-nowrap uppercase ${
                      activeCategory === category.name
                        ? 'bg-black text-white'
                        : 'bg-white text-black border border-gray-300 hover:border-black'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sort By & Filter Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20" onClick={(e) => e.stopPropagation()}>
          <div className="px-4 py-3 max-w-screen-2xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              {/* Sort By Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowSortMenu(!showSortMenu);
                    setShowFilterMenu(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold border border-gray-300 rounded-md hover:border-black transition"
                >
                  SORT BY
                  <span className="text-lg">{showSortMenu ? '−' : '+'}</span>
                </button>
                
                {showSortMenu && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                    <div className="py-2">
                      {[
                        { value: 'featured', label: 'Featured' },
                        { value: 'price-low-high', label: 'Price: Low to High' },
                        { value: 'price-high-low', label: 'Price: High to Low' },
                        { value: 'rating', label: 'Highest Rated' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-100 transition ${
                            sortBy === option.value ? 'bg-gray-100 font-bold' : ''
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowFilterMenu(!showFilterMenu);
                    setShowSortMenu(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold border border-gray-300 rounded-md hover:border-black transition"
                >
                  FILTER
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 8h18M10 12h11M10 16h11" />
                  </svg>
                </button>
                
                {showFilterMenu && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                    <div className="p-4">
                      <div className="mb-4">
                        <h3 className="text-sm font-bold mb-3 uppercase">Price Range</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Min: ${priceRange[0]}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="500"
                              value={priceRange[0]}
                              onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Max: ${priceRange[1]}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="500"
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-3 border-t">
                        <button
                          onClick={() => {
                            setPriceRange([0, 500]);
                          }}
                          className="flex-1 px-4 py-2 text-sm font-bold border border-gray-300 rounded-md hover:border-black transition"
                        >
                          RESET
                        </button>
                        <button
                          onClick={() => setShowFilterMenu(false)}
                          className="flex-1 px-4 py-2 text-sm font-bold bg-black text-white rounded-md hover:bg-gray-900 transition"
                        >
                          APPLY
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="px-2 sm:px-4 lg:px-8 py-4 sm:py-6 max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white cursor-pointer"
                onClick={() => onProductClick && onProductClick(product)}
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                </div>

                {/* Product Info */}
                <div className="px-1 sm:px-2">
                  <h3 className="product-name text-sm sm:text-base lg:text-lg text-black mb-1 sm:mb-2 uppercase line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <p className="price-text text-base sm:text-lg lg:text-xl text-black">
                      Rs. {parseFloat(product.price).toFixed(2)}
                    </p>
                  </div>

                  {/* Color Options */}
                  <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-800 rounded-full border border-gray-300"></div>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded-full border border-gray-300"></div>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-900 rounded-full border border-gray-300"></div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">+3</span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={!product.in_stock}
                    className={`w-full py-2 sm:py-3 rounded-md text-xs sm:text-sm font-bold transition ${
                      product.in_stock 
                        ? 'bg-black text-white hover:bg-gray-900'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {product.in_stock ? 'ADD TO CART' : 'OUT OF STOCK'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {sortedProducts.length === 0 && (
            <div className="text-center py-16 sm:py-24">
              <div className="inline-block p-8 bg-gray-100 rounded-2xl mb-6">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-black text-2xl font-bold mb-2">No products found</p>
              <p className="text-gray-600">Try adjusting your filters or selecting a different category</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}