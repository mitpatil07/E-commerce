// frontend/src/pages/Orders.jsx - Enhanced with payment information
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
      console.error('Error:', err);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const styles = {
      PAID: 'bg-green-100 text-green-800 border-green-300',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      FAILED: 'bg-red-100 text-red-800 border-red-300',
      REFUNDED: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[paymentStatus] || styles.PENDING}`}>
        {paymentStatus}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition font-bold"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {order.order_number}
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-5 h-5 text-gray-700" />
                    <h4 className="font-bold text-gray-900">Payment Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                      <p className="text-sm font-semibold text-gray-900">{order.payment_method}</p>
                    </div>
                    
                    {order.razorpay_payment_id && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Transaction ID</p>
                        <p className="text-sm font-mono text-gray-900 truncate">
                          {order.razorpay_payment_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.product?.image || '/placeholder.png'}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900 line-clamp-1">
                            {item.product_name}
                          </h5>
                          <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                            <span>Qty: {item.quantity}</span>
                            {item.selected_color && (
                              <span>• Color: {item.selected_color}</span>
                            )}
                            {item.selected_size && (
                              <span>• Size: {item.selected_size}</span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            ₹{parseFloat(item.product_price).toFixed(2)} each
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ₹{(parseFloat(item.product_price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="border-t border-gray-200 mt-6 pt-4">
                  <h4 className="font-bold text-gray-900 mb-3">Shipping Address</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-semibold">{order.shipping_name}</p>
                    <p>{order.shipping_address}</p>
                    <p>
                      {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}
                    </p>
                    <p>{order.shipping_country}</p>
                    <p className="mt-2">
                      <span className="font-semibold">Phone:</span> {order.shipping_phone}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span> {order.shipping_email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}