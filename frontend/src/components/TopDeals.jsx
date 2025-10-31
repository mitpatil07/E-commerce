import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Check, Loader2 } from 'lucide-react';
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
        const data = await api.getProducts();
        const productList = data.results || data;
        const shuffledProducts = shuffleArray(productList);
        const limitedDeals = shuffledProducts.slice(0, 8);
        
        setDeals(limitedDeals);
        setLoading(false);
      } catch (err) {
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
        setItemsPerView(2);
      } else if (width < 768) {
        setItemsPerView(2);
      } else if (width < 1024) {
        setItemsPerView(3);
      } else if (width < 1280) {
        setItemsPerView(4);
      } else {
        setItemsPerView(5);
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
      const csrfToken = getCookie('csrftoken');
      
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

      if (!response.ok) {
        throw new Error(data.message || data.detail || 'Failed to add to cart');
      }
      
      if (addToCart && typeof addToCart === 'function') {
        addToCart(deal);
      }
      
      showToastMessage(`${deal.name} added to cart!`);
    } catch (err) {
      showToastMessage('Failed to add to cart. Please try again.');
    }
  };

  const handleProductClick = (deal) => {
    if (onProductClick && typeof onProductClick === 'function') {
      onProductClick(deal);
    } else {
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

  const translateX = -(currentIndex * 100);

  if (loading) {
    return (
      <div className="w-full bg-white py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-black mx-auto mb-3" />
              <p className="text-black font-bold">Loading deals...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-red-50 rounded-lg mb-4">
              <ShoppingCart className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Failed to Load Deals</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="w-full bg-white py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No deals available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-12 sm:py-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-20 sm:top-24 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-black text-white px-6 py-4 shadow-2xl flex items-center gap-3">
              <Check className="w-10 h-10" />
              <span className="font-bold text-sm">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black mb-2 uppercase tracking-tight">
            Flash Deals
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Limited time offers - Special prices!
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Previous Button */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 text-black rounded-full p-3 shadow-lg transition hover:scale-110 active:scale-95"
              aria-label="Previous deals"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

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
                    className="bg-white group cursor-pointer h-full"
                    onClick={() => handleProductClick(deal)}
                  >
                    {/* Image Section */}
                    <div className="relative overflow-hidden aspect-[3/4] bg-gray-100 mb-4">
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />


                      {!deal.in_stock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="bg-white text-black px-4 py-2 font-bold text-xs uppercase tracking-wider">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div>
                      {/* Category */}
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold truncate">
                        {deal.category}
                      </p>
                      
                      {/* Product Name */}
                      <h3 className="text-sm sm:text-base font-bold text-black line-clamp-2 mb-2 min-h-[2.5rem] uppercase tracking-tight">
                        {deal.name}
                      </h3>

                      {/* Pricing */}
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg sm:text-xl font-black text-black">
                            Rs. {parseFloat(deal.price).toFixed(2)}
                          </span>
                          {deal.original_price && parseFloat(deal.original_price) > parseFloat(deal.price) && (
                            <span className="text-sm text-gray-400 line-through">
                              Rs. {parseFloat(deal.original_price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Color Options */}
                      {deal.in_stock && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex gap-1.5">
                            <div className="w-5 h-5 bg-gray-800 rounded-full border-2 border-gray-300"></div>
                            <div className="w-5 h-5 bg-gray-400 rounded-full border-2 border-gray-300"></div>
                            <div className="w-5 h-5 bg-blue-900 rounded-full border-2 border-gray-300"></div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">+3</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          {currentIndex < maxIndex && (
            <button
              onClick={handleNext}
              className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 text-black rounded-full p-3 shadow-lg transition hover:scale-110 active:scale-95"
              aria-label="Next deals"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Progress Indicators */}
        {maxIndex > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'w-8 bg-black'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
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