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
          setActiveCategory(categoryList[0].name);
        } else if (categoryList.length === 0) {
          setLoading(false);
        }
      } catch (err) {
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
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await api.getProducts({
          category: activeCategory,
        });
        
        const productList = data.results || data;
        
        setProducts(productList);
        setLoading(false);
      } catch (err) {
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
      await api.addToCart(product.id, 1);
      
      if (addToCart && typeof addToCart === 'function') {
        addToCart(product);
      }
      
      showToastMessage(`${product.name} added to cart!`);
    } catch (err) {
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
            <p className="text-lg font-bold text-black uppercase tracking-wide">
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
            <div className="inline-block p-6 bg-red-100 rounded-lg mb-4">
              <ShoppingCart className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-black mb-2 uppercase">Failed to Load Products</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-900 transition uppercase"
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
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-20 sm:top-24 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-black text-white px-6 py-4 shadow-2xl flex items-center gap-3">
              <Check className="w-5 h-5" />
              <span className="font-bold text-sm uppercase">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="py-6 px-4">
            {/* Title */}
{/* Title */}
<div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight mb-2">
                {activeCategory || 'All Products'}
              </h1>
            </div>
            
            {/* Category Pills */}
            <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              <div className="flex gap-2 pb-2">
                {categoryCounts.map((category) => (
                  <button
                    key={category.id || category.name}
                    onClick={() => setActiveCategory(category.name)}
                    className={`flex-shrink-0 px-4 py-2 text-xs font-bold transition-all duration-200 whitespace-nowrap uppercase ${
                      activeCategory === category.name
                        ? 'bg-black text-white'
                        : 'bg-white text-black border-2 border-gray-300 hover:border-black'
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
          <div className="py-3 px-4">
            <div className="flex items-center justify-between gap-4">
              {/* Sort By Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowSortMenu(!showSortMenu);
                    setShowFilterMenu(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold border-2 border-gray-300 hover:border-black transition uppercase"
                >
                  SORT BY
                  <span className="text-lg">{showSortMenu ? '−' : '+'}</span>
                </button>
                
                {showSortMenu && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border-2 border-gray-300 shadow-lg z-50">
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
                          className={`w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-100 transition uppercase ${
                            sortBy === option.value ? 'bg-gray-100' : ''
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold border-2 border-gray-300 hover:border-black transition uppercase"
                >
                  FILTER
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 8h18M10 12h11M10 16h11" />
                  </svg>
                </button>
                
                {showFilterMenu && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white border-2 border-gray-300 shadow-lg z-50">
                    <div className="p-4">
                      <div className="mb-4">
                        <h3 className="text-sm font-bold mb-3 uppercase">Price Range</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block uppercase">
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
                            <label className="text-xs font-bold text-gray-600 mb-1 block uppercase">
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
                          className="flex-1 px-4 py-2 text-sm font-bold border-2 border-gray-300 hover:border-black transition uppercase"
                        >
                          RESET
                        </button>
                        <button
                          onClick={() => setShowFilterMenu(false)}
                          className="flex-1 px-4 py-2 text-sm font-bold bg-black text-white hover:bg-gray-900 transition uppercase"
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
        <div className="py-8 px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white cursor-pointer flex flex-col"
                onClick={() => onProductClick && onProductClick(product)}
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Product Info - Flexbox to push button to bottom */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-black mb-2 uppercase line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="mb-2">
                    <p className="text-lg font-black text-black">
                      Rs. {parseFloat(product.price).toFixed(2)}
                    </p>
                  </div>

                  {/* Color Options */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-gray-800 rounded-full border border-gray-300"></div>
                      <div className="w-4 h-4 bg-gray-400 rounded-full border border-gray-300"></div>
                      <div className="w-4 h-4 bg-blue-900 rounded-full border border-gray-300"></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600">+3</span>
                  </div>

                  {/* Add to Cart Button - mt-auto pushes it to bottom */}
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={!product.in_stock}
                    className={`w-full py-3 text-sm font-bold transition mt-auto uppercase ${
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
            <div className="text-center py-24">
              <div className="inline-block p-8 bg-gray-100 mb-6">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-black text-2xl font-black mb-2 uppercase">No products found</p>
              <p className="text-gray-600 uppercase">Try adjusting your filters or selecting a different category</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}