import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2, Check } from 'lucide-react';

export default function ClothingSuggestions({ onProductClick, addToCart }) {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // API configuration
  const API_BASE_URL = 'api.whatyouwear.store/api';
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
        
        const response = await fetch(`${API_BASE_URL}/products/`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-gray-900 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Loading suggestions...</p>
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Suggestions</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-20 sm:top-24 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="font-medium text-sm sm:text-base">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Recommended for You
          </h2>
          <p className="text-gray-600 text-sm">
            Curated selections based on your style
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {suggestions.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
              onClick={() => handleProductClick(product)}
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {!product.in_stock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white text-black px-3 py-1.5 rounded-lg font-bold text-xs">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-1.5 line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-base font-bold text-gray-900">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                    <span className="text-xs text-gray-400 line-through">
                      ${parseFloat(product.original_price).toFixed(2)}
                    </span>
                  )}
                </div>
                <button 
                  className={`w-full text-xs font-medium py-2 rounded transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                    product.in_stock 
                      ? 'bg-gray-900 text-white hover:bg-gray-800' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!product.in_stock}
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
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