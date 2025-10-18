// frontend/src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, CreditCard, Truck, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_email: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip_code: '',
    shipping_country: 'India'
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    fetchCart();
    loadUserData();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.getCart();
      const cartData = response.results?.[0] || response[0] || response;
      
      if (!cartData?.items || cartData.items.length === 0) {
        navigate('/cart');
        return;
      }
      setCart(cartData);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const loadUserData = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user) {
      setFormData(prev => ({
        ...prev,
        shipping_name: user.username || '',
        shipping_email: user.email || '',
        shipping_phone: user.phone || '',
        shipping_address: user.address || ''
      }));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.shipping_name || !formData.shipping_email || 
        !formData.shipping_phone || !formData.shipping_address ||
        !formData.shipping_city || !formData.shipping_state || 
        !formData.shipping_zip_code) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Step 1: Create Razorpay order
      const razorpayData = await api.createRazorpayOrder();
      
      // Step 2: Open Razorpay payment modal
      const options = {
        key: razorpayData.key,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: 'Your Store Name',
        description: 'Order Payment',
        order_id: razorpayData.razorpay_order_id,
        handler: async function (response) {
          console.log('Payment successful:', response);
          
          try {
            // Step 3: Verify payment and create order
            const orderData = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ...formData
            });
            
            setShowSuccess(true);
            
            setTimeout(() => {
              navigate('/orders');
            }, 2000);
            
          } catch (err) {
            console.error('Verification error:', err);
            setError(err.message || 'Payment verification failed');
            setSubmitting(false);
          }
        },
        prefill: {
          name: formData.shipping_name,
          email: formData.shipping_email,
          contact: formData.shipping_phone
        },
        notes: {
          address: formData.shipping_address
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled');
            setSubmitting(false);
            setError('Payment was cancelled. Please try again.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to initiate payment');
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">Payment Successful!</p>
              <p className="text-sm text-white/90">Redirecting to orders...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm text-white/90">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="shipping_name"
                      value={formData.shipping_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                      placeholder="Enter Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="shipping_email"
                      value={formData.shipping_email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="shipping_phone"
                      value={formData.shipping_phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Street Address *
                    </label>
                    <textarea
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                      placeholder="123 Main Street, Apartment 4B"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="shipping_city"
                        value={formData.shipping_city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                        placeholder="Mumbai"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        name="shipping_state"
                        value={formData.shipping_state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                        placeholder="Maharashtra"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        ZIP / Postal Code *
                      </label>
                      <input
                        type="text"
                        name="shipping_zip_code"
                        value={formData.shipping_zip_code}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                        placeholder="400001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="shipping_country"
                        value={formData.shipping_country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 text-gray-900 py-4 rounded-lg hover:bg-gray-300 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-24 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart?.items?.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-gray-900">
                        ₹{parseFloat(item.subtotal).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t-2 border-gray-300 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{parseFloat(cart?.total_price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Shipping
                  </span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{parseFloat(cart?.total_price || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-300">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Secure Checkout</p>
                    <p className="text-xs">Powered by Razorpay</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}