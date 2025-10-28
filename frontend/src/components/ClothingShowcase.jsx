import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShoppingCart } from 'lucide-react';

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

  // Assign random sizes for masonry layout
  const assignSizes = (products) => {
    const sizes = ['large', 'medium', 'medium', 'wide', 'medium', 'medium', 'wide', 'medium'];
    return products.map((product, index) => ({
      ...product,
      size: sizes[index % sizes.length]
    }));
  };

  // Fetch products from API
  useEffect(() => {
    const fetchShowcaseProducts = async () => {
      try {
        console.log('🔄 Fetching showcase products...');
        
        // const response = await fetch(`${API_BASE_URL}/products/`, {
        //   method: 'GET',
        //   credentials: 'include',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        // });

        const data = await api.getProducts();

        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }

        // const data = await response.json();
        console.log('✅ Products received for showcase:', data);
        
        // Handle paginated response
        const productList = data.results || data;
        
        // Shuffle and take 8 products for showcase
        const shuffledProducts = shuffleArray(productList);
        const selectedProducts = shuffledProducts.slice(0, 8);
        
        // Assign sizes for masonry layout
        const productsWithSizes = assignSizes(selectedProducts);
        
        setShowcaseProducts(productsWithSizes);
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to fetch showcase products:', err);
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
    console.log('🖱️ Showcase product clicked:', product);
    console.log('🔗 Navigating to:', `/product/${product.id}`);
    navigate(`/product/${product.id}`);
  };

  // Loading state
  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-gray-900 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Loading showcase...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-red-100 rounded-2xl mb-4">
              <ShoppingCart className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Showcase</h3>
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
  if (showcaseProducts.length === 0) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No products available for showcase</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Optional Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Featured Collection
          </h2>
          <p className="text-gray-600 text-lg">
            Discover our handpicked selection of trending styles
          </p>
        </div>

        {/* Album-style Masonry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[250px]">
          {showcaseProducts.map((product, index) => (
            <div
              key={product.id}
              className={`relative overflow-hidden rounded-lg shadow-lg cursor-pointer group ${getSizeClass(product.size)}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleProductClick(product)}
            >
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  hoveredIndex === index ? 'scale-110 brightness-75' : 'scale-100'
                }`}
              />
              
              {/* Hover Overlay with Product Info */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
                hoveredIndex === index ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                  <p className="text-xs uppercase tracking-wide mb-1 opacity-90">
                    {product.category}
                  </p>
                  <h3 className="text-base sm:text-lg font-bold mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl sm:text-2xl font-bold">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      className="bg-white text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-all transform hover:scale-105"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Out of Stock Badge */}
              {!product.in_stock && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  Out of Stock
                </div>
              )}

              {/* Discount Badge */}
              {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  {Math.round(((parseFloat(product.original_price) - parseFloat(product.price)) / parseFloat(product.original_price)) * 100)}% OFF
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Optional CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gray-900 text-white rounded-lg font-bold text-lg hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
          >
            Explore All Products
          </button>
        </div>
      </div>
    </section>
  );
}