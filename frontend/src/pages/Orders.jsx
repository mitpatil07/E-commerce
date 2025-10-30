// frontend/src/pages/Orders.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Loader2, CheckCircle, Clock, Truck, XCircle, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setOrders(Array.isArray(data) ? data : data.results || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'PROCESSING':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const styles = {
      PAID: 'bg-green-100 text-green-800 border-2 border-green-300',
      PENDING: 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300',
      FAILED: 'bg-red-100 text-red-800 border-2 border-red-300',
      REFUNDED: 'bg-gray-100 text-gray-800 border-2 border-gray-300',
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-bold uppercase ${
          styles[paymentStatus] || styles.PENDING
        }`}
      >
        {paymentStatus}
      </span>
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
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border-2 border-gray-300 p-4 sm:p-6 hover:border-black transition"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="section-title text-lg sm:text-xl text-black uppercase">
                          {order.order_number}
                        </h3>

                        {/* 🟢 Updated Status Badge */}
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase transition-all
                              ${
                                order.status === 'PENDING'
                                  ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                                  : order.status === 'PROCESSING'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : order.status === 'SHIPPED'
                                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                                  : order.status === 'DELIVERED'
                                  ? 'bg-green-50 text-green-800 border-green-300'
                                  : order.status === 'CANCELLED'
                                  ? 'bg-red-50 text-red-800 border-red-300'
                                  : 'bg-gray-50 text-gray-800 border-gray-300'
                              }`}
                          >
                            {getStatusIcon(order.status)}
                            <span className="tracking-wide">{order.status}</span>
                          </div>

                          {order.status !== 'CANCELLED' && (
                            <div className="flex items-center gap-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  order.status === 'PENDING'
                                    ? 'bg-yellow-400'
                                    : order.status === 'PROCESSING'
                                    ? 'bg-blue-400'
                                    : order.status === 'SHIPPED'
                                    ? 'bg-purple-400'
                                    : order.status === 'DELIVERED'
                                    ? 'bg-green-400'
                                    : 'bg-gray-400'
                                } animate-pulse`}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 uppercase">
                        Placed on{' '}
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="price-text text-xl sm:text-2xl text-black">
                        Rs. {parseFloat(order.total_amount).toFixed(2)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 uppercase">
                        {order.items?.length || 0} items
                      </p>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-gray-50 p-4 mb-6 border border-gray-200">
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
                          {order.payment_method}
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
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h4 className="section-title text-sm sm:text-base text-black mb-4 uppercase">
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex gap-3 sm:gap-4">
                          <div className="w-16 h-20 sm:w-20 sm:h-24 bg-gray-100 overflow-hidden flex-shrink-0">
                            <img
                              src={item.product?.image || '/placeholder.png'}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="product-name text-sm sm:text-base text-black line-clamp-2 uppercase">
                              {item.product_name}
                            </h5>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs sm:text-sm text-gray-600 uppercase">
                              <span>Qty: {item.quantity}</span>
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
                  <div className="border-t border-gray-200 pt-4">
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
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
