// frontend/src/pages/Checkout.jsx - Updated with CategoryProducts theme
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
  // console.log("🌍 VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // DEBUG: Check authentication
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    // console.log('🔐 Auth Debug:');
    // console.log('  - Has token:', !!token);
    // console.log('  - Token preview:', token ? token.substring(0, 20) + '...' : 'NONE');
    // console.log('  - Has user:', !!user);
    // console.log('  - User:', user ? JSON.parse(user) : 'NONE');
    
    if (!token) {
      setError('Please login first');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
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
      // console.log('📦 Creating Razorpay order...');
      
      const orderPayload = {
        shipping_address: {
          name: formData.shipping_name,
          email: formData.shipping_email,
          phone: formData.shipping_phone,
          address: formData.shipping_address,
          city: formData.shipping_city,
          state: formData.shipping_state,
          zip_code: formData.shipping_zip_code,
          country: formData.shipping_country
        }
      };
      
      // console.log('📤 Sending payload:', orderPayload);
      
      // Step 1: Create Razorpay order
      const razorpayData = await api.createRazorpayOrder(orderPayload);
      
      // console.log('✅ Razorpay order created:', razorpayData);
      
      // Step 2: Open Razorpay payment modal
      const options = {
        key: razorpayData.key,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: 'WhatYouWear',
        description: 'Order Payment',
        order_id: razorpayData.razorpay_order_id,
        handler: async function (response) {
          // console.log('✅ Payment successful:', response);
          
          try {
            // Step 3: Verify payment and create order
            const orderData = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shipping_name: formData.shipping_name,
              shipping_email: formData.shipping_email,
              shipping_phone: formData.shipping_phone,
              shipping_address: formData.shipping_address,
              shipping_city: formData.shipping_city,
              shipping_state: formData.shipping_state,
              shipping_zip_code: formData.shipping_zip_code,
              shipping_country: formData.shipping_country
            });
            
            // console.log('✅ Order created:', orderData);
            setShowSuccess(true);
            
            setTimeout(() => {
              navigate('/orders');
            }, 2000);
            
          } catch (err) {
            console.error('❌ Verification error:', err);
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
            // console.log('⚠️ Payment cancelled by user');
            setSubmitting(false);
            setError('Payment was cancelled. Please try again.');
          }
        }
      };
  
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (err) {
      console.error('❌ Error creating order:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack
      });
      setError(err.message || 'Failed to initiate payment');
      setSubmitting(false);
    }
  };

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
      // console.error('Error:', err);
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




  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
            <p className="text-lg font-bold text-black" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em' }}>
              Loading checkout...
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-white">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          
          .page-title {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 900;
            letter-spacing: -0.04em;
            line-height: 1;
          }
          
          .section-title {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 700;
            letter-spacing: -0.01em;
          }
          
          .label-text {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 700;
            letter-spacing: -0.01em;
          }
          
          .button-text {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            font-weight: 800;
            letter-spacing: 0.02em;
          }
        `}</style>

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-20 sm:top-24 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-green-600 text-white px-6 py-4 flex items-center gap-3 border-2 border-green-700">
              <div className="w-8 h-8 bg-white flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold uppercase text-sm">Payment Successful!</p>
                <p className="text-xs uppercase">Redirecting to orders...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="fixed top-20 sm:top-24 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-red-600 text-white px-6 py-4 flex items-center gap-3 max-w-md border-2 border-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold uppercase text-sm">Error</p>
                <p className="text-xs uppercase">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-white hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4 sm:py-6 max-w-screen-2xl mx-auto">
            <h1 className="page-title text-3xl sm:text-4xl lg:text-5xl text-black uppercase">
              Checkout
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 sm:py-8 max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="bg-white border-2 border-gray-300 p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <h2 className="section-title text-xl sm:text-2xl text-black uppercase">
                      Contact Information
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="shipping_name"
                        value={formData.shipping_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
                        // placeholder="Enter Name"
                      />
                    </div>

                    <div>
                      <label className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="shipping_email"
                        value={formData.shipping_email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
                        // placeholder="john@example.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="shipping_phone"
                        value={formData.shipping_phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
                        // placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white border-2 border-gray-300 p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
                      2
                    </div>
                    <h2 className="section-title text-xl sm:text-2xl text-black uppercase">
                      Shipping Address
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                        Street Address *
                      </label>
                      <textarea
                        name="shipping_address"
                        value={formData.shipping_address}
                        onChange={handleChange}
                        required
                        rows="3"
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
                        // placeholder="123 Main Street, Apartment 4B"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                          City *
                        </label>
                        <input
                          type="text"
                          name="shipping_city"
                          value={formData.shipping_city}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
                          // placeholder="Mumbai"
                        />
                      </div>

                      <div>
                        <label className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                          State / Province *
                        </label>
                        <input
                          type="text"
                          name="shipping_state"
                          value={formData.shipping_state}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
                          // placeholder="Maharashtra"
                        />
                      </div>

                      <div>
                        <label className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                          ZIP / Postal Code *
                        </label>
                        <input
                          type="text"
                          name="shipping_zip_code"
                          value={formData.shipping_zip_code}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-sm"
                          // placeholder="400001"
                        />
                      </div>

                      <div>
                        <label className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                          Country
                        </label>
                        <input
                          type="text"
                          name="shipping_country"
                          value={formData.shipping_country}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 bg-gray-100 cursor-not-allowed text-sm"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    disabled={submitting}
                    className="button-text flex-1 bg-white border-2 border-gray-300 text-black py-3 sm:py-4 hover:border-black transition text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="button-text flex-1 bg-black text-white py-3 sm:py-4 rounded-md hover:bg-gray-900 transition text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <div className="bg-white border-2 border-gray-300 p-6 sticky top-24">
                <h2 className="section-title text-xl sm:text-2xl text-black mb-6 uppercase">
                  Order Summary
                </h2>
                
                {/* Order Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-black line-clamp-2 uppercase">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500 uppercase">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-black">
                          Rs. {parseFloat(item.subtotal).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t-2 border-gray-300 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-700 text-sm">
                    <span className="uppercase font-bold">Subtotal</span>
                    <span className="font-bold">Rs. {parseFloat(cart?.total_price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-sm">
                    <span className="flex items-center gap-2 uppercase font-bold">
                      <Truck className="w-4 h-4" />
                      Shipping
                    </span>
                    <span className="text-green-600 font-bold uppercase">Free</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                    <span className="section-title text-lg sm:text-xl text-black uppercase">Total</span>
                    <span className="section-title text-lg sm:text-xl text-black">Rs. {parseFloat(cart?.total_price || 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                    <div className="w-8 h-8 bg-green-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-black uppercase">Secure Checkout</p>
                      <p className="text-xs uppercase">Powered by Razorpay</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}