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

  // Get category from route state or use default
  useEffect(() => {
    if (location.state?.category) {
      console.log('📍 Category from route:', location.state.category);
      setActiveCategory(location.state.category);
    }
  }, [location.state]);

  // Fetch categories on mount
  useEffect(() => {
    console.log('🚀 Component mounted, fetching categories...');
    
    const fetchCategories = async () => {
      try {
        console.log('🔄 Fetching categories from API...');
        const data = await api.getCategories();
        console.log('✅ Categories received:', data);
        
        // Handle paginated response
        const categoryList = data.results || data;
        console.log('📋 Category list:', categoryList);
        
        setCategories(categoryList);
        
        // Set first category as active if available and no category from route
        if (categoryList.length > 0 && !location.state?.category) {
          console.log('✅ Setting active category to:', categoryList[0].name);
          setActiveCategory(categoryList[0].name);
        } else if (categoryList.length === 0) {
          console.warn('⚠️ No categories found');
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Failed to fetch categories:', err);
        console.error('❌ Error message:', err.message);
        console.error('❌ Error stack:', err.stack);
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
        console.log('⚠️ No active category, skipping product fetch');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Fetching products for category:', activeCategory);
        
        // Fetch products with category filter
        const data = await api.getProducts({
          category: activeCategory,
        });
        
        console.log('✅ Products API response:', data);
        
        // Handle both paginated and non-paginated responses
        const productList = data.results || data;
        console.log('📦 Product list:', productList.length, 'products found');
        
        setProducts(productList);
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to fetch products:', err);
        console.error('❌ Error message:', err.message);
        console.error('❌ Error stack:', err.stack);
        setError(err.message || 'Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  // Calculate category counts from all products
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
      console.log('🛒 Adding to cart:', product.name);
      
      // Use the API service to add to cart
      await api.addToCart(product.id, 1);
      
      // Also call the parent addToCart function if provided
      if (addToCart && typeof addToCart === 'function') {
        addToCart(product);
      }
      
      showToastMessage(`${product.name} added to cart!`);
      console.log('✅ Added to cart successfully');
    } catch (err) {
      console.error('❌ Failed to add to cart:', err);
      showToastMessage('Failed to add to cart. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-gray-900 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700">Loading products...</p>
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="inline-block p-6 bg-red-100 rounded-2xl mb-4">
              <ShoppingCart className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Products</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <style>{`
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
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-semibold text-base">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-6 sm:py-8 max-w-screen-2xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2">
                  {activeCategory || 'All Products'}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
                </p>
              </div>
            </div>
            
            {/* Category Slider */}
            <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-2 pb-2">
                {categoryCounts.map((category) => (
                  <button
                    key={category.id || category.name}
                    onClick={() => setActiveCategory(category.name)}
                    className={`flex-shrink-0 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                      activeCategory === category.name
                        ? 'bg-gray-900 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{category.name}</span>
                      {category.count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          activeCategory === category.name 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {category.count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="flex gap-6 max-w-screen-2xl mx-auto">
            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              {/* Sort Bar */}
              <div className="mb-6 bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 font-medium">
                    Showing <span className="text-gray-900 font-bold">{sortedProducts.length}</span> of <span className="text-gray-900 font-bold">{filteredProducts.length}</span> products
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-bold text-gray-700 whitespace-nowrap">
                      Sort by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer hover:border-gray-300 transition-all"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low-high">Price: Low to High</option>
                      <option value="price-high-low">Price: High to Low</option>
                      <option value="name-a-z">Name: A to Z</option>
                      <option value="name-z-a">Name: Z to A</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-300 cursor-pointer transform hover:-translate-y-1"
                    onClick={() => onProductClick && onProductClick(product)}
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold truncate">
                        {product.category}
                      </p>
                      <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] leading-tight">
                        {product.name}
                      </h3>
                      
                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(parseFloat(product.rating))
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-700">({product.rating})</span>
                        </div>
                      )}

                      {/* Price and Cart */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-lg sm:text-xl font-black text-gray-900">
                          ${parseFloat(product.price).toFixed(2)}
                        </p>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={!product.in_stock}
                          className={`p-2.5 sm:p-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${
                            product.in_stock 
                              ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 hover:scale-110 active:scale-95'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          aria-label="Add to cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
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
                  <p className="text-gray-900 text-2xl font-bold mb-2">No products found</p>
                  <p className="text-gray-600">Try adjusting your filters or selecting a different category</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}