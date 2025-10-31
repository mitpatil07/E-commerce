// frontend/src/pages/Orders.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Loader2, CheckCircle, Clock, Truck, XCircle, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      const ordersData = Array.isArray(data) ? data : data.results || [];
      console.log('📦 Orders fetched:', ordersData.length);
      
      // Debug: Log the structure of the first order item
      if (ordersData.length > 0 && ordersData[0].items?.length > 0) {
        console.log('🔍 First order item structure:', JSON.stringify(ordersData[0].items[0], null, 2));
        console.log('🔍 Available fields:', Object.keys(ordersData[0].items[0]));
      }
      
      setOrders(ordersData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'PENDING':
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />;
      case 'PROCESSING':
        return <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />;
      case 'SHIPPED':
        return <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />;
    }
  };

  const getStatusStyles = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'SHIPPED':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'DELIVERED':
        return 'bg-green-50 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-50 text-red-800 border-red-300';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-300';
    }
  };

  const getStatusDotColor = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'PENDING':
        return 'bg-yellow-400';
      case 'PROCESSING':
        return 'bg-blue-400';
      case 'SHIPPED':
        return 'bg-purple-400';
      case 'DELIVERED':
        return 'bg-green-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusUpper = paymentStatus?.toUpperCase();
    const styles = {
      PAID: 'bg-green-100 text-green-800 border-2 border-green-300',
      PENDING: 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300',
      FAILED: 'bg-red-100 text-red-800 border-2 border-red-300',
      REFUNDED: 'bg-gray-100 text-gray-800 border-2 border-gray-300',
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-bold uppercase rounded ${
          styles[statusUpper] || styles.PENDING
        }`}
      >
        {statusUpper || 'PENDING'}
      </span>
    );
  };

  // Enhanced image URL handler with error prevention
  const getImageUrl = (item) => {
    // Default placeholder as a data URI to prevent network requests
    const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
    
    // Try to find image in different possible locations
    let imageUrl = null;
    
    // Check all possible image field locations
    if (item.product?.image) {
      imageUrl = item.product.image;
    } else if (item.product_image) {
      imageUrl = item.product_image;
    } else if (item.image) {
      imageUrl = item.image;
    }

    if (!imageUrl) {
      // console.warn('⚠️ No image found for item:', item.product_name || item.id);
      return PLACEHOLDER;
    }

    // If already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Construct full URL from relative path
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
    const baseUrl = apiBaseUrl.replace('/api', '');
    
    // Ensure proper path construction
    const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    const fullUrl = `${baseUrl}${cleanImageUrl}`;
    
    return fullUrl;
  };

  // Component for order item image with error handling
  const OrderItemImage = ({ item }) => {
    const [imgError, setImgError] = useState(false);
    const imageUrl = getImageUrl(item);

    if (imgError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={item.product_name || 'Product'}
        className="w-full h-full object-cover"
        onError={() => {
          console.error('❌ Image load failed:', item.product_name);
          setImgError(true);
        }}
      />
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
            <p
              className="text-lg font-bold text-black"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                letterSpacing: '0.02em',
              }}
            >
              Loading orders...
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

        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4 sm:py-6 max-w-screen-2xl mx-auto">
            <h1 className="page-title text-3xl sm:text-4xl lg:text-5xl text-black mb-2 uppercase">
              My Orders
            </h1>
            <p className="text-gray-600 text-sm sm:text-base uppercase tracking-wide">
              Track and manage your orders
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 sm:py-8 max-w-screen-2xl mx-auto">
          {orders.length === 0 ? (
            <div className="text-center py-16 sm:py-24">
              <div className="inline-block p-8 bg-gray-100 rounded-2xl mb-6">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="page-title text-2xl sm:text-3xl text-black mb-2 uppercase">
                No Orders Yet
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base uppercase">
                Start shopping to see your orders here
              </p>
              <button
                onClick={() => navigate('/')}
                className="button-text bg-black text-white px-8 py-3 rounded-md hover:bg-gray-900 transition text-sm uppercase"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                const statusUpper = order.status?.toUpperCase() || 'PENDING';
                
                return (
                  <div
                    key={order.id}
                    className="bg-white border-2 border-gray-300 hover:border-black transition"
                  >
                    {/* Order Summary - Always Visible */}
                    <div 
                      className="p-4 sm:p-6 cursor-pointer"
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Left Section */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="section-title text-lg sm:text-xl text-black uppercase">
                              {order.order_number}
                            </h3>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase transition-all ${getStatusStyles(order.status)}`}
                              >
                                {getStatusIcon(order.status)}
                                <span className="tracking-wide">{statusUpper}</span>
                              </div>

                              {statusUpper !== 'CANCELLED' && statusUpper !== 'DELIVERED' && (
                                <div className="flex items-center gap-1">
                                  <div
                                    className={`w-2 h-2 rounded-full ${getStatusDotColor(order.status)} animate-pulse`}
                                  ></div>
                                </div>
                              )}
                            </div>

                            {/* Payment Status Badge */}
                            {getPaymentStatusBadge(order.payment_status)}
                          </div>

                          <p className="text-xs sm:text-sm text-gray-600 uppercase mb-1">
                            Placed on{' '}
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>

                          <p className="text-xs sm:text-sm text-gray-600 uppercase">
                            {order.items?.length || 0} items • {order.payment_method || 'N/A'}
                          </p>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="price-text text-xl sm:text-2xl text-black">
                              Rs. {parseFloat(order.total_amount).toFixed(2)}
                            </p>
                          </div>

                          {/* Expand/Collapse Icon */}
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="w-6 h-6 text-black" />
                            ) : (
                              <ChevronDown className="w-6 h-6 text-black" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="border-t-2 border-gray-200 p-4 sm:p-6 space-y-6">
                        {/* Payment Information */}
                        <div className="bg-gray-50 p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                            <h4 className="section-title text-sm sm:text-base text-black uppercase">
                              Payment Details
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                              <p className="text-xs text-gray-600 mb-1 uppercase font-bold">
                                Payment Status
                              </p>
                              {getPaymentStatusBadge(order.payment_status)}
                            </div>

                            <div>
                              <p className="text-xs text-gray-600 mb-1 uppercase font-bold">
                                Payment Method
                              </p>
                              <p className="text-xs sm:text-sm font-bold text-black uppercase">
                                {order.payment_method || 'N/A'}
                              </p>
                            </div>

                            {order.razorpay_payment_id && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1 uppercase font-bold">
                                  Transaction ID
                                </p>
                                <p className="text-xs sm:text-sm font-mono text-black truncate">
                                  {order.razorpay_payment_id}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="section-title text-sm sm:text-base text-black mb-4 uppercase">
                            Order Items ({order.items?.length || 0})
                          </h4>
                          <div className="space-y-3">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex gap-3 sm:gap-4 bg-gray-50 p-3 border border-gray-200">
                                <div className="w-16 h-20 sm:w-20 sm:h-24 bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                                  <OrderItemImage item={item} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="product-name text-sm sm:text-base text-black line-clamp-2 uppercase">
                                    {item.product_name || 'Unknown Product'}
                                  </h5>
                                  <div className="flex flex-wrap gap-2 mt-1 text-xs sm:text-sm text-gray-600 uppercase">
                                    <span className="font-bold">Qty: {item.quantity}</span>
                                    {item.selected_color && (
                                      <span>• Color: {item.selected_color}</span>
                                    )}
                                    {item.selected_size && (
                                      <span>• Size: {item.selected_size}</span>
                                    )}
                                  </div>
                                  <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                                    Rs. {parseFloat(item.product_price).toFixed(2)} each
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="price-text text-base sm:text-lg text-black">
                                    Rs.{' '}
                                    {(
                                      parseFloat(item.product_price) * item.quantity
                                    ).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="bg-gray-50 p-4 border border-gray-200">
                          <h4 className="section-title text-sm sm:text-base text-black mb-3 uppercase">
                            Shipping Address
                          </h4>
                          <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                            <p className="font-bold text-black">{order.shipping_name}</p>
                            <p>{order.shipping_address}</p>
                            <p>
                              {order.shipping_city}, {order.shipping_state}{' '}
                              {order.shipping_zip_code}
                            </p>
                            <p>{order.shipping_country}</p>
                            <p className="mt-2">
                              <span className="font-bold text-black">Phone:</span>{' '}
                              {order.shipping_phone}
                            </p>
                            <p>
                              <span className="font-bold text-black">Email:</span>{' '}
                              {order.shipping_email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}