import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Check, Loader2 } from 'lucide-react';

export default function TopDeals({ addToCart, onProductClick }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [itemsPerView, setItemsPerView] = useState(4);
  const scrollContainerRef = useRef(null);

  // API configuration
  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Helper function to get CSRF token from cookies
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch deals from API
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        console.log('🔄 Fetching top deals...');
        
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
        console.log('✅ Products received for deals:', data);
        
        // Handle paginated response
        const productList = data.results || data;
        
        // Shuffle the products and take 8 random ones for deals
        const shuffledProducts = shuffleArray(productList);
        const limitedDeals = shuffledProducts.slice(0, 8);
        
        setDeals(limitedDeals);
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to fetch deals:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1); // Mobile: 1 item
      } else if (width < 768) {
        setItemsPerView(2); // Small tablet: 2 items
      } else if (width < 1024) {
        setItemsPerView(3); // Tablet: 3 items
      } else {
        setItemsPerView(4); // Desktop: 4 items
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, Math.ceil(deals.length / itemsPerView) - 1);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : maxIndex));
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddToCart = async (deal, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      console.log('🛒 Adding to cart from deals:', deal.name);
      
      const csrfToken = getCookie('csrftoken');
      console.log('🔑 CSRF Token:', csrfToken ? 'Found' : 'Not found');
      
      // Use the API service to add to cart
      const response = await fetch(`${API_BASE_URL}/cart/add_item/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
          product_id: deal.id,
          quantity: 1,
        }),
      });

      const data = await response.json();
      console.log('📦 API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || data.detail || 'Failed to add to cart');
      }
      
      // Also call the parent addToCart function if provided
      if (addToCart && typeof addToCart === 'function') {
        addToCart(deal);
      }
      
      showToastMessage(`${deal.name} added to cart!`);
      console.log('✅ Added to cart successfully');
    } catch (err) {
      console.error('❌ Failed to add to cart:', err);
      console.error('❌ Error details:', err.message);
      showToastMessage('Failed to add to cart. Please try again.');
    }
  };

  const handleProductClick = (deal) => {
    console.log('🖱️ Deal product clicked:', deal);
    console.log('🔗 Navigating to:', `/product/${deal.id}`);
    
    // Call the onProductClick prop function
    if (onProductClick && typeof onProductClick === 'function') {
      onProductClick(deal);
    } else {
      // Fallback: navigate using window.location if no prop provided
      window.location.href = `/product/${deal.id}`;
    }
  };

  // Auto-scroll
  useEffect(() => {
    if (deals.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [maxIndex, deals.length]);

  // Calculate transform
  const translateX = -(currentIndex * 100);

  // Loading state
  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 border-y border-gray-200 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-gray-900 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Loading deals...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 border-y border-gray-200 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-red-100 rounded-2xl mb-4">
              <ShoppingCart className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Deals</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No deals state
  if (deals.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 border-y border-gray-200 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No deals available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 border-y border-gray-200 py-6 sm:py-8 lg:py-12">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Flash Deals
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Limited time offers - Special prices!
            </p>
          </div>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="absolute left-0 sm:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-full p-2 sm:p-3 shadow-xl transition disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
            aria-label="Previous deals"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Cards Container */}
          <div className="overflow-hidden" ref={scrollContainerRef}>
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(${translateX}%)` }}
            >
              {deals.map((deal) => (
                <div 
                  key={deal.id} 
                  className="flex-shrink-0 px-2 sm:px-3"
                  style={{ 
                    width: `${100 / itemsPerView}%`
                  }}
                >
                  <div 
                    className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:border-gray-400 hover:shadow-2xl transition-all duration-300 h-full group cursor-pointer"
                    onClick={() => handleProductClick(deal)}
                  >
                    {/* Image Section */}
                    <div className="relative overflow-hidden aspect-square bg-gray-100">
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      {!deal.in_stock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-3 sm:p-4 lg:p-5">
                      <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide mb-1 sm:mb-2 font-semibold truncate">
                        {deal.category}
                      </p>
                      
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                        {deal.name}
                      </h3>

                      {/* Rating */}
                      {deal.rating && (
                        <div className="flex items-center gap-1 mb-2 sm:mb-3">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs sm:text-sm text-gray-700 font-semibold">{deal.rating}</span>
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            ${parseFloat(deal.price).toFixed(2)}
                          </span>
                          {deal.original_price && parseFloat(deal.original_price) > parseFloat(deal.price) && (
                            <span className="text-sm sm:text-base text-gray-400 line-through">
                              ${parseFloat(deal.original_price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button 
                        onClick={(e) => handleAddToCart(deal, e)}
                        disabled={!deal.in_stock}
                        className={`w-full py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm sm:text-base shadow-lg ${
                          deal.in_stock
                            ? 'bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white hover:shadow-2xl hover:scale-105 active:scale-95'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{deal.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            className="absolute right-0 sm:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-full p-2 sm:p-3 shadow-xl transition disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
            aria-label="Next deals"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Progress Indicators */}
        {maxIndex > 0 && (
          <div className="flex justify-center gap-2 mt-6 sm:mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'w-8 sm:w-10 bg-gradient-to-r from-gray-900 to-gray-700'
                    : 'w-2 sm:w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}