import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Minus, Plus, Truck, Shield, RefreshCw, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import CartSidebar from '../components/CartSidebar';
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
      
      // Use the API service to add to cart
      await api.addToCart(product.id, quantity);
      
      // Also call the parent addToCart function if provided
      if (addToCart && typeof addToCart === 'function') {
        for (let i = 0; i < quantity; i++) {
          addToCart({
            ...product,
            selectedColor,
            selectedSize
          });
        }
      }
      
      showToastMessage(`${product.name} added to cart!`);
      setShowCart(true);
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
            <Loader2 className="w-12 h-12 animate-spin text-gray-900 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700">Loading product details...</p>
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
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              {error ? 'Failed to Load Product' : 'Product Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The product you're looking for doesn't exist."}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
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
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <span className="font-semibold text-base">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-50 rounded-lg overflow-hidden aspect-square">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {!product.in_stock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-black px-6 py-3 rounded-md font-semibold">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative bg-gray-50 rounded-md overflow-hidden aspect-square border-2 transition ${
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
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2 font-medium">
                  {product.category}
                </p>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                {product.rating && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
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
                    <span className="text-sm text-gray-600">
                      {product.rating} {product.reviews ? `(${product.reviews} reviews)` : ''}
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                    <span className="text-xl text-gray-400 line-through">
                      ${parseFloat(product.original_price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {product.description && (
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Color: {selectedColor}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-5 py-2.5 border rounded-md text-sm font-medium transition ${
                          selectedColor === color
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 text-gray-900 hover:border-gray-400'
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
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Size: {selectedSize}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 border rounded-md text-sm font-medium transition ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 text-gray-900 hover:border-gray-400'
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
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:border-gray-400 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:border-gray-400 transition"
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
                  className={`w-full py-4 rounded-md font-semibold transition flex items-center justify-center gap-2 ${
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
              <div className="border-t border-gray-200">
                {/* DESCRIPTION Section */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('description')}
                    className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                  >
                    <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Description
                    </span>
                    {expandedSections.description ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections.description && (
                    <div className="pb-6 space-y-4">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {product.description || 'Premium quality product crafted with attention to detail.'}
                      </p>

                      {product.article_number && (
                        <p className="text-sm text-gray-500">
                          Art. No.: {product.article_number}
                        </p>
                      )}

                      <div className="space-y-2">
                        {product.product_type && (
                          <div className="flex">
                            <span className="text-sm font-medium text-gray-900 w-32">Product type:</span>
                            <span className="text-sm text-gray-600">{product.product_type}</span>
                          </div>
                        )}
                        {product.description_details && (
                          <div className="flex">
                            <span className="text-sm font-medium text-gray-900 w-32">Description:</span>
                            <span className="text-sm text-gray-600">{product.description_details}</span>
                          </div>
                        )}
                        {product.imported !== undefined && (
                          <div className="flex">
                            <span className="text-sm font-medium text-gray-900 w-32">Imported:</span>
                            <span className="text-sm text-gray-600">{product.imported ? 'Yes' : 'No'}</span>
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
                    className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                  >
                    <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Materials
                    </span>
                    {expandedSections.materials ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections.materials && (
                    <div className="pb-6 space-y-4">
                      {product.specifications && product.specifications.length > 0 ? (
                        <ul className="space-y-1">
                          {product.specifications.map((spec, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              {spec}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600">Material information not available for this product.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCart && (
        <CartSidebar
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          cartTotal={cartTotal}
        />
      )}
      
      <ClothingSuggestions 
  addToCart={addToCart}
  onProductClick={(product) => navigate(`/product/${product.id}`)}
/>
      <Footer />
    </div>
  );
}