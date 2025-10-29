// frontend/src/pages/Cart.jsx - UPDATED for Django backend
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
      console.log('🛒 Fetching cart...');
      const data = await api.getCart();
      console.log('✅ Cart data:', data);
      setCart(data);
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating({ ...updating, [itemId]: true });
    
    try {
      console.log('📝 Updating quantity:', { itemId, newQuantity });
      await api.updateCartItem(itemId, newQuantity);
      await fetchCart(); // Reload cart
    } catch (err) {
      console.error('❌ Failed to update quantity:', err);
      alert('Failed to update quantity: ' + err.message);
    } finally {
      setUpdating({ ...updating, [itemId]: false });
    }
  };

  const removeItem = async (itemId) => {
    // if (!confirm('Remove this item from cart?')) return;
    
    try {
      console.log('🗑️ Removing item:', itemId);
      await api.removeFromCart(itemId);
      await fetchCart();
    } catch (err) {
      console.error('❌ Failed to remove item:', err);
      alert('Failed to remove item: ' + err.message);
    }
  };

  const clearCart = async () => {
    if (!confirm('Clear all items from cart?')) return;
    
    try {
      console.log('🗑️ Clearing cart...');
      await api.clearCart();
      await fetchCart();
    } catch (err) {
      console.error('❌ Failed to clear cart:', err);
      alert('Failed to clear cart: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Cart</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchCart}
                className="mt-3 text-red-600 hover:text-red-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        cartCount={cart?.total_items || 0} 
        onCartOpen={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isEmpty ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition font-semibold text-lg"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  Shopping Cart ({cart.total_items} {cart.total_items === 1 ? 'item' : 'items'})
                </h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                >
                  Clear Cart
                </button>
              </div>

              {cart.items.map((item) => {
                // Extract product data - handle both nested and flat structures
                const product = item.product || item;
                const productImage = product.image || product.images?.[0] || 'https://via.placeholder.com/150';
                const productName = product.name || 'Unknown Product';
                const productCategory = product.category || '';
                const productPrice = parseFloat(product.price || 0);
                const itemQuantity = item.quantity || 1;
                const itemSubtotal = parseFloat(item.subtotal || productPrice * itemQuantity);

                return (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-32 h-32 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200">
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
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{productName}</h3>
                            <p className="text-sm text-gray-500">{productCategory}</p>
                            {item.selected_color && (
                              <p className="text-sm text-gray-600 mt-1">Color: {item.selected_color}</p>
                            )}
                            {item.selected_size && (
                              <p className="text-sm text-gray-600">Size: {item.selected_size}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 bg-white rounded-lg border-2 border-gray-200 p-1">
                            <button
                              onClick={() => updateQuantity(item.id, itemQuantity - 1)}
                              disabled={itemQuantity <= 1 || updating[item.id]}
                              className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold w-10 text-center text-lg">
                              {updating[item.id] ? '...' : itemQuantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, itemQuantity + 1)}
                              disabled={updating[item.id]}
                              className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">
                              ${productPrice.toFixed(2)} each
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              ${itemSubtotal.toFixed(2)}
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
              <div className="bg-gray-50 rounded-xl p-6 sticky top-24 border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({cart.total_items} items)</span>
                    <span className="font-semibold">${parseFloat(cart.total_price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="text-green-600 font-bold">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span className="text-sm">Calculated at checkout</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-4 flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${parseFloat(cart.total_price || 0).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition font-bold text-lg mb-3 shadow-lg hover:shadow-xl"
                >
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-200 text-gray-900 py-4 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Continue Shopping
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-300 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span>Free shipping on all orders</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span>Easy returns within 30 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}