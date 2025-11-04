import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Loader2, CheckCircle, Clock, Truck, XCircle, CreditCard, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [refundReason, setRefundReason] = useState('');
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
      setOrders(ordersData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    setActionLoading(orderId);
    try {
      const response = await api.cancelOrder(orderId);
      await fetchOrders();
      setShowConfirmModal(null);
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefundOrder = async (orderId) => {
    if (!refundReason.trim()) {
      alert('Please provide a reason for refund');
      return;
    }
    
    setActionLoading(orderId);
    try {
      const response = await api.refundOrder(orderId, refundReason);
      await fetchOrders();
      setShowConfirmModal(null);
      setRefundReason('');
    } catch (err) {
      alert(err.message || 'Failed to process refund');
    } finally {
      setActionLoading(null);
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
      REFUND_PENDING: 'bg-orange-100 text-orange-800 border-2 border-orange-300',
      REFUNDED: 'bg-gray-100 text-gray-800 border-2 border-gray-300',
    };

    const displayText = statusUpper === 'REFUND_PENDING' ? 'REFUND PENDING' : statusUpper;

    return (
      <span
        className={`px-3 py-1 text-xs font-bold uppercase rounded ${
          styles[statusUpper] || styles.PENDING
        }`}
      >
        {displayText || 'PENDING'}
      </span>
    );
  };

  const getImageUrl = (item) => {
    const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
    
    let imageUrl = null;
    
    if (item.product?.image) {
      imageUrl = item.product.image;
    } else if (item.product_image) {
      imageUrl = item.product_image;
    } else if (item.image) {
      imageUrl = item.image;
    }

    if (!imageUrl) {
      return PLACEHOLDER;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
    const baseUrl = apiBaseUrl.replace('/api', '');
    const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    const fullUrl = `${baseUrl}${cleanImageUrl}`;
    
    return fullUrl;
  };

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
        onError={() => setImgError(true)}
      />
    );
  };

  const ConfirmModal = ({ order, type }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className={`w-6 h-6 ${type === 'cancel' ? 'text-red-600' : 'text-blue-600'}`} />
          <h3 className="section-title text-xl text-black uppercase">
            {type === 'cancel' ? 'Cancel Order' : 'Request Refund'}
          </h3>
        </div>

        <p className="text-gray-700 mb-4">
          {type === 'cancel' 
            ? 'Are you sure you want to cancel this order? This action cannot be undone.'
            : 'Please provide a reason for requesting a refund:'
          }
        </p>

        {type === 'refund' && (
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Enter reason for refund..."
            className="w-full border-2 border-gray-300 rounded p-3 mb-4 focus:border-black focus:outline-none"
            rows="3"
          />
        )}

        <div className="bg-gray-50 border border-gray-200 p-3 mb-4">
          <p className="text-sm text-gray-600 uppercase font-bold mb-1">Order: {order.order_number}</p>
          <p className="text-lg font-bold">Rs. {parseFloat(order.total_amount).toFixed(2)}</p>
          {order.payment_status === 'PAID' && (
            <p className="text-xs text-gray-600 mt-1">
              ✓ Refund will be processed within 5-7 business days
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowConfirmModal(null);
              setRefundReason('');
            }}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded hover:bg-gray-50 button-text uppercase"
            disabled={actionLoading === order.id}
          >
            Cancel
          </button>
          <button
            onClick={() => type === 'cancel' ? handleCancelOrder(order.id) : handleRefundOrder(order.id)}
            className={`flex-1 px-4 py-2 rounded button-text uppercase text-white ${
              type === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            } ${actionLoading === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={actionLoading === order.id}
          >
            {actionLoading === order.id ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              type === 'cancel' ? 'Confirm Cancel' : 'Submit Refund'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
            <p className="text-lg font-bold text-black" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em' }}>
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
          .page-title { font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; font-weight: 900; letter-spacing: -0.04em; line-height: 1; }
          .section-title { font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; font-weight: 700; letter-spacing: -0.01em; }
          .product-name { font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; font-weight: 600; letter-spacing: -0.01em; line-height: 1.3; }
          .price-text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; font-weight: 700; letter-spacing: -0.02em; }
          .button-text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; font-weight: 800; letter-spacing: 0.02em; }
        `}</style>

        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4 sm:py-6 max-w-screen-2xl mx-auto">
            <h1 className="page-title text-3xl sm:text-4xl lg:text-5xl text-black mb-2 uppercase">My Orders</h1>
            <p className="text-gray-600 text-sm sm:text-base uppercase tracking-wide">Track and manage your orders</p>
          </div>
        </div>

        <div className="px-4 py-6 sm:py-8 max-w-screen-2xl mx-auto">
          {orders.length === 0 ? (
            <div className="text-center py-16 sm:py-24">
              <div className="inline-block p-8 bg-gray-100 rounded-2xl mb-6">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="page-title text-2xl sm:text-3xl text-black mb-2 uppercase">No Orders Yet</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base uppercase">Start shopping to see your orders here</p>
              <button onClick={() => navigate('/')} className="button-text bg-black text-white px-8 py-3 rounded-md hover:bg-gray-900 transition text-sm uppercase">
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                const statusUpper = order.status?.toUpperCase() || 'PENDING';
                
                return (
                  <div key={order.id} className="bg-white border-2 border-gray-300 hover:border-black transition">
                    <div className="p-4 sm:p-6 cursor-pointer" onClick={() => toggleOrderExpansion(order.id)}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="section-title text-lg sm:text-xl text-black uppercase">{order.order_number}</h3>

                            <div className="flex items-center gap-2">
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase transition-all ${getStatusStyles(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="tracking-wide">{statusUpper}</span>
                              </div>

                              {statusUpper !== 'CANCELLED' && statusUpper !== 'DELIVERED' && (
                                <div className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${getStatusDotColor(order.status)} animate-pulse`}></div>
                                </div>
                              )}
                            </div>

                            {getPaymentStatusBadge(order.payment_status)}
                          </div>

                          <p className="text-xs sm:text-sm text-gray-600 uppercase mb-1">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>

                          <p className="text-xs sm:text-sm text-gray-600 uppercase">
                            {order.items?.length || 0} items • {order.payment_method || 'N/A'}
                          </p>

                          {order.refund_info && order.payment_status === 'REFUND_PENDING' && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-orange-700 bg-orange-50 px-3 py-1.5 rounded border border-orange-200">
                              <Clock className="w-4 h-4" />
                              <span className="font-bold">Refund in progress - Will be processed within 5-7 business days</span>
                            </div>
                          )}

                          {order.refund_info && order.payment_status === 'REFUNDED' && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded border border-green-200">
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-bold">Refund completed on {new Date(order.refund_info.completed_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="price-text text-xl sm:text-2xl text-black">Rs. {parseFloat(order.total_amount).toFixed(2)}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {isExpanded ? <ChevronUp className="w-6 h-6 text-black" /> : <ChevronDown className="w-6 h-6 text-black" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t-2 border-gray-200 p-4 sm:p-6 space-y-6">
                        {(order.can_cancel || order.can_refund) && (
                          <div className="flex flex-wrap gap-3">
                            {order.can_cancel && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowConfirmModal({ order, type: 'cancel' }); }}
                                disabled={actionLoading === order.id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 button-text uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel Order
                              </button>
                            )}
                            {order.can_refund && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowConfirmModal({ order, type: 'refund' }); }}
                                disabled={actionLoading === order.id}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 button-text uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Request Refund
                              </button>
                            )}
                          </div>
                        )}

                        {order.refund_info && (
                          <div className="bg-orange-50 p-4 border border-orange-200 rounded">
                            <div className="flex items-center gap-2 mb-3">
                              <RefreshCw className="w-5 h-5 text-orange-600" />
                              <h4 className="section-title text-base text-orange-900 uppercase">Refund Information</h4>
                            </div>
                            <div className="space-y-2 text-sm">
                              {order.refund_info.requested_at && (
                                <p className="text-gray-700">
                                  <span className="font-bold text-black uppercase">Requested:</span> {new Date(order.refund_info.requested_at).toLocaleString()}
                                </p>
                              )}
                              {order.refund_info.reason && (
                                <p className="text-gray-700">
                                  <span className="font-bold text-black uppercase">Reason:</span> {order.refund_info.reason}
                                </p>
                              )}
                              {order.payment_status === 'REFUND_PENDING' && (
                                <p className="text-orange-700 font-bold mt-2">⏳ Refund will be processed within 5-7 business days</p>
                              )}
                              {order.refund_info.completed_at && (
                                <p className="text-green-700 font-bold mt-2">
                                  ✓ Refund completed on {new Date(order.refund_info.completed_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="bg-gray-50 p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                            <h4 className="section-title text-sm sm:text-base text-black uppercase">Payment Details</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                              <p className="text-xs text-gray-600 mb-1 uppercase font-bold">Payment Status</p>
                              {getPaymentStatusBadge(order.payment_status)}
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1 uppercase font-bold">Payment Method</p>
                              <p className="text-xs sm:text-sm font-bold text-black uppercase">{order.payment_method || 'N/A'}</p>
                            </div>
                            {order.razorpay_payment_id && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1 uppercase font-bold">Transaction ID</p>
                                <p className="text-xs sm:text-sm font-mono text-black truncate">{order.razorpay_payment_id}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="section-title text-sm sm:text-base text-black mb-4 uppercase">Order Items ({order.items?.length || 0})</h4>
                          <div className="space-y-3">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex gap-3 sm:gap-4 bg-gray-50 p-3 border border-gray-200">
                                <div className="w-16 h-20 sm:w-20 sm:h-24 bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                                  <OrderItemImage item={item} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="product-name text-sm sm:text-base text-black line-clamp-2 uppercase">{item.product_name || 'Unknown Product'}</h5>
                                  <div className="flex flex-wrap gap-2 mt-1 text-xs sm:text-sm text-gray-600 uppercase">
                                    <span className="font-bold">Qty: {item.quantity}</span>
                                    {item.selected_color && <span>• Color: {item.selected_color}</span>}
                                    {item.selected_size && <span>• Size: {item.selected_size}</span>}
                                  </div>
                                  <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">Rs. {parseFloat(item.product_price).toFixed(2)} each</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="price-text text-base sm:text-lg text-black">Rs. {(parseFloat(item.product_price) * item.quantity).toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 border border-gray-200">
                          <h4 className="section-title text-sm sm:text-base text-black mb-3 uppercase">Shipping Address</h4>
                          <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                            <p className="font-bold text-black">{order.shipping_name}</p>
                            <p>{order.shipping_address}</p>
                            <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}</p>
                            <p>{order.shipping_country}</p>
                            <p className="mt-2"><span className="font-bold text-black">Phone:</span> {order.shipping_phone}</p>
                            <p><span className="font-bold text-black">Email:</span> {order.shipping_email}</p>
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

      {showConfirmModal && <ConfirmModal order={showConfirmModal.order} type={showConfirmModal.type} />}
      <Footer />
    </>
  );
}