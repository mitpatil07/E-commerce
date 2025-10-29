import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Minus, Plus, Truck, Shield, RefreshCw, Check, ChevronDown, ChevronUp, Loader2, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
// import CartSidebar from '../components/CartSidebar';
import Footer from '../components/Footer';
import ClothingSuggestions from './ClothingSuggestions';
import api from '../services/api';

export default function ProductDetailPage({
  cart,
  addToCart,
  showCart,
  
  setShowCart,
  removeFromCart,
  updateQuantity
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    materials: true,
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('No product ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔄 Fetching product details for ID:', id);
        const data = await api.getProductById(id);
        console.log('✅ Product data received:', data);
        
        setProduct(data);
        
        // Set default selections
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to fetch product:', err);
        setError(err.message || 'Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const handleAddToCart = async () => {
    try {
      console.log('🛒 Adding to cart:', product.name);
  
      // Send to backend
      await api.addToCart(product.id, quantity);
  
      // Update local cart once
      if (addToCart && typeof addToCart === 'function') {
        addToCart({
          ...product,
          selectedColor,
          selectedSize,
          quantity,
        });
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
      <div className="min-h-screen bg-white">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          
          .product-title {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 700;
            letter-spacing: -0.02em;
          }
        `}</style>
        <Navbar
          categories={[]}
          selectedCategory=""
          setSelectedCategory={() => {}}
          searchQuery=""
          setSearchQuery={() => {}}
          cartCount={cart?.reduce((sum, item) => sum + item.quantity, 0) || 0}
          onCartOpen={() => setShowCart(true)}
        />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
            <p className="text-lg font-bold text-black product-title">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar
          categories={[]}
          selectedCategory=""
          setSelectedCategory={() => {}}
          searchQuery=""
          setSearchQuery={() => {}}
          cartCount={cart?.reduce((sum, item) => sum + item.quantity, 0) || 0}
          onCartOpen={() => setShowCart(true)}
        />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="inline-block p-6 bg-red-100 rounded-2xl mb-4">
              <ShoppingCart className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-black">
              {error ? 'Failed to Load Product' : 'Product Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The product you're looking for doesn't exist."}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-100 text-black rounded-lg font-bold hover:bg-gray-200 transition"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images || [product.image];
  const cartTotal = cart?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const cartCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .product-title {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        .product-name-main {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        
        .price-text {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        .section-label {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 800;
          letter-spacing: 0.05em;
        }
      `}</style>

      <Navbar
        categories={[]}
        selectedCategory=""
        setSelectedCategory={() => {}}
        searchQuery=""
        setSearchQuery={() => {}}
        cartCount={cartCount}
        onCartOpen={() => setShowCart(true)}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 sm:top-24 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-black text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <Check className="w-5 h-5" />
            <span className="font-bold text-sm">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative bg-gray-50 overflow-hidden aspect-[3/4]">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Heart Icon */}
              <button className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition shadow-md">
                <Heart className="w-5 h-5" />
              </button>

              {!product.in_stock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-black px-6 py-3 rounded-md font-bold">
                    OUT OF STOCK
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative bg-gray-50 overflow-hidden aspect-square border-2 transition ${
                      selectedImage === idx
                        ? 'border-black'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-black" style={{ letterSpacing: '0.1em' }}>
                  {product.category}
                </p>
                <h1 className="product-name-main text-2xl sm:text-3xl lg:text-4xl text-black mb-4 uppercase">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="price-text text-3xl sm:text-4xl text-black">
                    Rs. {parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                    <span className="text-xl text-gray-400 line-through">
                      Rs. {parseFloat(product.original_price).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Rating & Reviews */}
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(parseFloat(product.rating))
                              ? 'fill-black text-black'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {product.rating} {product.reviews ? `(${product.reviews})` : ''}
                    </span>
                  </div>
                )}
              </div>

              {product.description && (
                <div className="border-t border-gray-200 pt-5">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="section-label block text-xs text-black mb-3 uppercase">
                    Color: <span className="font-normal">{selectedColor}</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-5 py-2.5 border text-xs font-bold transition uppercase ${
                          selectedColor === color
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 text-black hover:border-black'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="section-label block text-xs text-black mb-3 uppercase">
                    Size: <span className="font-normal">{selectedSize}</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 border text-sm font-bold transition ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 text-black hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="section-label block text-xs text-black mb-3 uppercase">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center border border-gray-300 hover:border-black transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center border border-gray-300 hover:border-black transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className={`w-full py-4 font-bold text-sm transition flex items-center justify-center gap-2 uppercase tracking-wide ${
                    product.in_stock
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>

              {/* Expandable Sections */}
              <div className="border-t border-gray-200 mt-6">
                {/* DESCRIPTION Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('description')}
                    className="w-full py-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
                  >
                    <span className="section-label text-xs text-black uppercase">
                      Description
                    </span>
                    {expandedSections.description ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections.description && (
                    <div className="pb-6 px-1 space-y-4">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {product.description || 'Premium quality product crafted with attention to detail.'}
                      </p>

                      {product.article_number && (
                        <p className="text-xs text-gray-500 font-medium">
                          Art. No.: {product.article_number}
                        </p>
                      )}

                      <div className="space-y-2">
                        {product.product_type && (
                          <div className="flex gap-4">
                            <span className="text-xs font-bold text-black w-28">PRODUCT TYPE:</span>
                            <span className="text-xs text-gray-600">{product.product_type}</span>
                          </div>
                        )}
                        {product.description_details && (
                          <div className="flex gap-4">
                            <span className="text-xs font-bold text-black w-28">DESCRIPTION:</span>
                            <span className="text-xs text-gray-600">{product.description_details}</span>
                          </div>
                        )}
                        {product.imported !== undefined && (
                          <div className="flex gap-4">
                            <span className="text-xs font-bold text-black w-28">IMPORTED:</span>
                            <span className="text-xs text-gray-600">{product.imported ? 'Yes' : 'No'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* MATERIALS Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('materials')}
                    className="w-full py-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
                  >
                    <span className="section-label text-xs text-black uppercase">
                      Materials
                    </span>
                    {expandedSections.materials ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections.materials && (
                    <div className="pb-6 px-1 space-y-3">
                      {product.specifications && product.specifications.length > 0 ? (
                        <ul className="space-y-2">
                          {product.specifications.map((spec, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              {spec}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-600">Material information not available for this product.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* {showCart && (
        <CartSidebar
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          cartTotal={cartTotal}
        />
      )} */}
      
      <ClothingSuggestions 
        addToCart={addToCart}
        onProductClick={(product) => navigate(`/product/${product.id}`)}
      />
      <Footer />
    </div>
  );
}