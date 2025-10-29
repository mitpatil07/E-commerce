// frontend/src/pages/Cart.jsx - UPDATED with CategoryProducts theme
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setError(null);
      // console.log('🛒 Fetching cart...');
      const data = await api.getCart();
      // console.log('✅ Cart data:', data);
      setCart(data);
    } catch (err) {
      // console.error('❌ Error fetching cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating({ ...updating, [itemId]: true });
    
    try {
      // console.log('📝 Updating quantity:', { itemId, newQuantity });
      await api.updateCartItem(itemId, newQuantity);
      await fetchCart();
    } catch (err) {
      // console.error('❌ Failed to update quantity:', err);
      alert('Failed to update quantity: ' + err.message);
    } finally {
      setUpdating({ ...updating, [itemId]: false });
    }
  };

  const removeItem = async (itemId) => {
    try {
      // console.log('🗑️ Removing item:', itemId);
      await api.removeFromCart(itemId);
      await fetchCart();
    } catch (err) {
      // console.error('❌ Failed to remove item:', err);
      alert('Failed to remove item: ' + err.message);
    }
  };

  const clearCart = async () => {

    
    try {
      // console.log('🗑️ Clearing cart...');
      await api.clearCart();
      await fetchCart();
    } catch (err) {
      // console.error('❌ Failed to clear cart:', err);
      alert('Failed to clear cart: ' + err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
            <p className="text-lg font-bold text-black" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em' }}>
              Loading cart...
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center p-8">
            <div className="inline-block p-6 bg-red-100 rounded-2xl mb-4">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Error Loading Cart</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchCart}
              className="px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-900 transition"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <>
      <Navbar 
        cartCount={cart?.total_items || 0} 
        onCartOpen={() => {}}
      />
      
      <div className="min-h-screen bg-white">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          
          .page-title {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 900;
            letter-spacing: -0.04em;
            line-height: 1;
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
          
          .button-text {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 800;
            letter-spacing: 0.02em;
          }
        `}</style>

        {isEmpty ? (
          <div className="px-4 py-16 sm:py-24 max-w-screen-2xl mx-auto">
            <div className="text-center">
              <div className="inline-block p-8 bg-gray-100 rounded-2xl mb-6">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="page-title text-3xl sm:text-4xl text-black mb-4 uppercase">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8 text-lg">Add some products to get started!</p>
              <button
                onClick={() => navigate('/')}
                className="button-text bg-black text-white px-8 py-4 rounded-md hover:bg-gray-900 transition text-sm uppercase"
              >
                Shop Now
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
              <div className="px-4 py-4 sm:py-6 max-w-screen-2xl mx-auto">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="page-title text-3xl sm:text-4xl lg:text-5xl text-black uppercase mb-1">
                      Shopping Cart
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-bold transition uppercase"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Cart Content */}
            <div className="px-4 py-6 sm:py-8 max-w-screen-2xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.items.map((item) => {
                    const product = item.product || item;
                    const productImage = product.image || product.images?.[0] || 'https://via.placeholder.com/150';
                    const productName = product.name || 'Unknown Product';
                    const productCategory = product.category || '';
                    const productPrice = parseFloat(product.price || 0);
                    const itemQuantity = item.quantity || 1;
                    const itemSubtotal = parseFloat(item.subtotal || productPrice * itemQuantity);

                    return (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-black transition">
                        <div className="flex gap-4 sm:gap-6">
                          {/* Product Image */}
                          <div className="w-24 h-32 sm:w-32 sm:h-40 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={productImage}
                              alt={productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150';
                              }}
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 min-w-0 pr-2">
                                <h3 className="product-name text-base sm:text-lg text-black mb-1 uppercase truncate">
                                  {productName}
                                </h3>
                                {productCategory && (
                                  <p className="text-xs sm:text-sm text-gray-500 uppercase">{productCategory}</p>
                                )}
                                {item.selected_color && (
                                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Color: {item.selected_color}</p>
                                )}
                                {item.selected_size && (
                                  <p className="text-xs sm:text-sm text-gray-600">Size: {item.selected_size}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 bg-white rounded-md border-2 border-gray-300 p-1">
                                <button
                                  onClick={() => updateQuantity(item.id, itemQuantity - 1)}
                                  disabled={itemQuantity <= 1 || updating[item.id]}
                                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                                <span className="font-bold w-8 sm:w-10 text-center text-sm sm:text-base">
                                  {updating[item.id] ? '...' : itemQuantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, itemQuantity + 1)}
                                  disabled={updating[item.id]}
                                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition disabled:opacity-50"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-left sm:text-right">
                                <p className="text-xs sm:text-sm text-gray-500 mb-0.5">
                                  Rs. {productPrice.toFixed(2)} each
                                </p>
                                <p className="price-text text-lg sm:text-xl text-black">
                                  Rs. {itemSubtotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white border-2 border-gray-300 rounded-lg p-6 sticky top-24">
                    <h2 className="page-title text-2xl sm:text-3xl text-black mb-6 uppercase">
                      Order Summary
                    </h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-gray-700">
                        <span className="text-sm sm:text-base">Subtotal ({cart.total_items} items)</span>
                        <span className="price-text text-sm sm:text-base">Rs. {parseFloat(cart.total_price || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span className="text-sm sm:text-base">Shipping</span>
                        <span className="text-green-600 font-bold text-sm sm:text-base uppercase">Free</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span className="text-sm sm:text-base">Tax</span>
                        <span className="text-xs sm:text-sm">Calculated at checkout</span>
                      </div>
                      <div className="border-t-2 border-gray-300 pt-4 flex justify-between">
                        <span className="page-title text-xl sm:text-2xl text-black uppercase">Total</span>
                        <span className="price-text text-xl sm:text-2xl text-black">Rs. {parseFloat(cart.total_price || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/checkout')}
                      className="button-text w-full bg-black text-white py-3 sm:py-4 rounded-md hover:bg-gray-900 transition text-sm uppercase mb-3"
                    >
                      Proceed to Checkout
                    </button>
                    
                    <button
                      onClick={() => navigate('/')}
                      className="button-text w-full bg-white text-black py-3 sm:py-4 rounded-md border-2 border-gray-300 hover:border-black transition text-sm uppercase"
                    >
                      Continue Shopping
                    </button>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-6 border-t border-gray-300 space-y-3">
                      <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          ✓
                        </div>
                        <span>Secure checkout</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          ✓
                        </div>
                        <span>Free shipping on all orders</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          ✓
                        </div>
                        <span>Easy returns within 30 days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}