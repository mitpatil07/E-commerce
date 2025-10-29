import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Check, Loader2, Heart } from 'lucide-react';
import api from '../services/api';

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
  const API_BASE_URL = 'https://api.whatyouwear.store/api';
  // const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
        
        const data = await api.getProducts();
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
        setItemsPerView(2); // Mobile: 2 items
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
      <div className="w-full bg-white border-y border-gray-200 py-8 sm:py-12">
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
              <p className="text-black font-bold product-title">Loading deals...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full bg-white border-y border-gray-200 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-red-100 rounded-2xl mb-4">
              <ShoppingCart className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Failed to Load Deals</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition"
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
      <div className="w-full bg-white border-y border-gray-200 py-8 sm:py-12">
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
    <div className="w-full bg-white border-y border-gray-200 py-8 sm:py-12">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
          <div>
            <h2 className="section-title text-2xl sm:text-3xl lg:text-4xl text-black mb-2 uppercase">
              Flash Deals
            </h2>
            <p className="text-sm text-gray-600 font-medium">
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
            className="absolute left-0 sm:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 hover:bg-gray-50 text-black rounded-full p-2 sm:p-3 shadow-xl transition disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
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
                  className="flex-shrink-0 px-2"
                  style={{ 
                    width: `${100 / itemsPerView}%`
                  }}
                >
                  <div 
                    className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 h-full group cursor-pointer"
                    onClick={() => handleProductClick(deal)}
                  >
                    {/* Image Section */}
                    <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
                      <img
                        src={deal.image}
                        alt={deal.name}
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

                      {!deal.in_stock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-white text-black px-4 py-2 font-bold text-xs uppercase tracking-wide">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-3 sm:p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-black truncate" style={{ letterSpacing: '0.1em' }}>
                        {deal.category}
                      </p>
                      
                      <h3 className="product-name text-sm sm:text-base text-black line-clamp-2 min-h-[2.5rem] mb-2 uppercase">
                        {deal.name}
                      </h3>

                      {/* Pricing */}
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="price-text text-lg sm:text-xl text-black">
                            Rs. {parseFloat(deal.price).toFixed(2)}
                          </span>
                          {deal.original_price && parseFloat(deal.original_price) > parseFloat(deal.price) && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                              Rs. {parseFloat(deal.original_price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Color Options */}
                      <div className="flex items-center gap-1 sm:gap-2 mb-3">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-800 rounded-full border border-gray-300"></div>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded-full border border-gray-300"></div>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-900 rounded-full border border-gray-300"></div>
                        </div>
                        <span className="text-xs text-gray-600">+3</span>
                      </div>

                      {/* Add to Cart Button */}
                      <button 
                        onClick={(e) => handleAddToCart(deal, e)}
                        disabled={!deal.in_stock}
                        className={`w-full py-2.5 sm:py-3 flex items-center justify-center gap-2 transition-all font-bold text-xs sm:text-sm uppercase tracking-wide ${
                          deal.in_stock
                            ? 'bg-black text-white hover:bg-gray-800 hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
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
            className="absolute right-0 sm:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 hover:bg-gray-50 text-black rounded-full p-2 sm:p-3 shadow-xl transition disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
            aria-label="Next deals"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Progress Indicators */}
        {maxIndex > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'w-8 sm:w-10 bg-black'
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