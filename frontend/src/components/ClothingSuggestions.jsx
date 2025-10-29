import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2, Check, Heart } from 'lucide-react';
import api from '../services/api';

export default function ClothingSuggestions({ onProductClick, addToCart }) {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // API configuration
  const API_BASE_URL = 'https://api.whatyouwear.store/api';
    // const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch suggestions from API
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        console.log('🔄 Fetching product suggestions...');
        
        const data = await api.getProducts();

        console.log('✅ Products received:', data);
        
        // Handle paginated response
        const productList = data.results || data;
        
        // Shuffle the products and take 10 random ones
        const shuffledProducts = shuffleArray(productList);
        const limitedProducts = shuffledProducts.slice(0, 10);
        
        setSuggestions(limitedProducts);
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to fetch suggestions:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddToCart = (product, e) => {
    // Stop event propagation to prevent triggering product click
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🛒 ClothingSuggestions: handleAddToCart called for:', product.name);
    console.log('🔍 addToCart prop type:', typeof addToCart);
    console.log('🔍 addToCart prop exists:', !!addToCart);
    
    // Check if addToCart function is provided
    if (!addToCart || typeof addToCart !== 'function') {
      console.error('❌ addToCart function is not provided or not a function!');
      showToastMessage('Error: Cannot add to cart');
      return;
    }
    
    try {
      // Call the parent's addToCart function with the product
      console.log('🎯 Calling parent addToCart function...');
      addToCart(product, 1);
      console.log('✅ Parent addToCart function called successfully');
      
      // Show success message
      showToastMessage(`${product.name} added to cart!`);
    } catch (error) {
      console.error('❌ Error calling addToCart:', error);
      showToastMessage('Failed to add to cart. Please try again.');
    }
  };

  const handleProductClick = (product) => {
    console.log('🖱️ Product clicked:', product);
    console.log('🔗 Navigating to:', `/product/${product.id}`);
    
    // If onProductClick prop is provided, use it
    if (onProductClick && typeof onProductClick === 'function') {
      console.log('✅ Using onProductClick prop');
      onProductClick(product);
    } else {
      // Otherwise, navigate directly to the product detail page
      console.log('✅ Using navigate function');
      navigate(`/product/${product.id}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="bg-white py-12">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          
          .product-title {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 700;
            letter-spacing: -0.02em;
          }
        `}</style>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-black mx-auto mb-3" />
              <p className="text-black font-bold product-title">Loading suggestions...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-red-100 rounded-2xl mb-4">
              <ShoppingCart className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Failed to Load Suggestions</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // No products state
  if (suggestions.length === 0) {
    return (
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No suggestions available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .section-title {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 900;
          letter-spacing: -0.03em;
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
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-20 sm:top-24 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-black text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
              <Check className="w-5 h-5" />
              <span className="font-bold text-sm">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h2 className="section-title text-2xl sm:text-3xl text-black mb-2 uppercase">
            You Might Also Like
          </h2>
          <p className="text-gray-600 text-sm font-medium">
            Curated selections based on your style
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {suggestions.map((product) => (
            <div
              key={product.id}
              className="group bg-white cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Heart Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition shadow-md"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {!product.in_stock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white text-black px-4 py-2 font-bold text-xs uppercase tracking-wide">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="px-1 sm:px-2">
                <h3 className="product-name text-sm text-black mb-1 sm:mb-2 uppercase line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h3>
                
                <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
                  <span className="price-text text-base sm:text-lg text-black">
                    Rs. {parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                    <span className="text-xs text-gray-400 line-through">
                      Rs. {parseFloat(product.original_price).toFixed(2)}
                    </span>
                  )}
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

                <button 
                  className={`w-full text-xs sm:text-sm font-bold py-2 sm:py-3 transition-colors duration-200 flex items-center justify-center gap-2 uppercase tracking-wide ${
                    product.in_stock 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!product.in_stock}
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}