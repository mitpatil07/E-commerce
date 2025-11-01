import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShoppingCart } from 'lucide-react';
import api from '../services/api';

export default function ClothingShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showcaseProducts, setShowcaseProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  // Assign random sizes for masonry layout - NO REPEATING PATTERN
  const assignSizes = (products) => {
    // Create a sizes array that matches the exact number of products
    const sizes = [];
    const sizeOptions = ['large', 'medium', 'wide', 'tall'];
    
    for (let i = 0; i < products.length; i++) {
      // Randomly pick a size for each product
      const randomSize = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];
      sizes.push(randomSize);
    }
    
    return products.map((product, index) => ({
      ...product,
      size: sizes[index]
    }));
  };

  // Fetch products from API
  useEffect(() => {
    const fetchShowcaseProducts = async () => {
      try {
        const data = await api.getProducts();
        
        // Handle paginated response
        const productList = data.results || data;
        
        // Shuffle and take 14 products for showcase
        const shuffledProducts = shuffleArray(productList);
        const selectedProducts = shuffledProducts.slice(0, 14);
        
        // Assign random sizes for masonry layout (no repeating pattern)
        const productsWithSizes = assignSizes(selectedProducts);
        
        setShowcaseProducts(productsWithSizes);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchShowcaseProducts();
  }, []);

  const getSizeClass = (size) => {
    switch(size) {
      case 'large':
        return 'md:col-span-2 md:row-span-2';
      case 'wide':
        return 'md:col-span-2 md:row-span-1';
      case 'tall':
        return 'md:col-span-1 md:row-span-2';
      default:
        return 'md:col-span-1 md:row-span-1';
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  // Loading state
  if (loading) {
    return (
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
              <p className="text-black font-bold uppercase tracking-wide">
                Loading showcase...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-red-100 mb-4">
              <ShoppingCart className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2 uppercase">Failed to Load Showcase</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-900 transition uppercase"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // No products state
  if (showcaseProducts.length === 0) {
    return (
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-bold uppercase">No products available for showcase</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black mb-2 uppercase tracking-tight">
            Featured Collection
          </h2>
          <p className="text-gray-600 text-sm sm:text-base uppercase tracking-wide font-medium">
            Discover our handpicked selection of trending styles
          </p>
        </div>

        {/* Album-style Masonry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[250px]">
          {showcaseProducts.map((product, index) => (
            <div
              key={product.id}
              className={`relative overflow-hidden bg-gray-100 cursor-pointer group ${getSizeClass(product.size)}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleProductClick(product)}
            >
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  hoveredIndex === index ? 'scale-110 brightness-90' : 'scale-100'
                }`}
              />
              
              {/* Hover Overlay with Product Info */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
                hoveredIndex === index ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white">
                  <p className="text-xs uppercase tracking-wider mb-1 opacity-90 font-bold">
                    {product.category}
                  </p>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold mb-2 line-clamp-2 uppercase">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg sm:text-xl md:text-2xl font-black">
                      Rs. {parseFloat(product.price).toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      className="bg-white text-black px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold hover:bg-gray-100 transition-all uppercase"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>

              {/* Out of Stock Badge */}
              {!product.in_stock && (
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-red-600 text-white px-2 sm:px-3 py-1 text-xs font-bold uppercase">
                  Out of Stock
                </div>
              )}

              {/* Discount Badge */}
              {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-green-600 text-white px-2 sm:px-3 py-1 text-xs font-bold uppercase">
                  {Math.round(((parseFloat(product.original_price) - parseFloat(product.price)) / parseFloat(product.original_price)) * 100)}% OFF
                </div>
              )}

              {/* Border on hover */}
              <div className={`absolute inset-0 border-2 border-black transition-opacity duration-300 pointer-events-none ${
                hoveredIndex === index ? 'opacity-100' : 'opacity-0'
              }`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}