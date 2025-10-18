// src/pages/Profile.jsx - Enhanced with theme and features
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Phone, MapPin, Edit2, Save, X, 
  LogOut, Package, Heart, ShoppingBag, Lock,
  Calendar, CheckCircle, AlertCircle
} from "lucide-react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  });
  const [stats, setStats] = useState({
    orders: 0,
    cart: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.getProfile();
      const userData = response.user || response;
      setUser(userData);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [cartData, ordersData] = await Promise.all([
        api.getCart().catch(() => ({ total_items: 0 })),
        api.getOrders().catch(() => [])
      ]);
      
      
      setStats({
        orders: Array.isArray(ordersData) ? ordersData.length : 0,
        cart: cartData.total_items || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.updateProfile(formData);
      const userData = response.user || response;
      setUser(userData);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return;
    
    try {
      await api.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage anyway
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">Failed to load profile</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Go to Login
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your profile and view your activity</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats Cards */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {user.first_name || user.last_name 
                      ? `${user.first_name} ${user.last_name}`.trim()
                      : 'User'
                    }
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {user.is_google_user && (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Google Account
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-700" />
                    <span className="font-medium text-gray-900">Orders</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.orders}</span>
                </button>

                <button
                  onClick={() => navigate('/cart')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                    <span className="font-medium text-gray-900">Cart Items</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.cart}</span>
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <User className="w-4 h-4" />
                        First Name
                      </label>
                      <p className="text-lg font-semibold text-gray-900 pl-6">
                        {user.first_name || 'Not provided'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <User className="w-4 h-4" />
                        Last Name
                      </label>
                      <p className="text-lg font-semibold text-gray-900 pl-6">
                        {user.last_name || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <p className="text-lg font-semibold text-gray-900 pl-6">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <p className="text-lg font-semibold text-gray-900 pl-6">
                      {user.phone || 'Not provided'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                      <MapPin className="w-4 h-4" />
                      Address
                    </label>
                    <p className="text-lg font-semibold text-gray-900 pl-6">
                      {user.address || 'Not provided'}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-2 focus:ring-black focus:ring-opacity-20 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-2 focus:ring-black focus:ring-opacity-20 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-2 focus:ring-black focus:ring-opacity-20 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-2 focus:ring-black focus:ring-opacity-20 outline-none transition resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}