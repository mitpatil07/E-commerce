// src/pages/Profile.jsx - Updated with CategoryProducts theme
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
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg font-bold text-black" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.02em' }}>
              Loading profile...
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white">
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="inline-block p-6 bg-red-100 rounded-2xl mb-4">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>
            <p className="text-xl font-bold text-black mb-2 uppercase">Failed to load profile</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-900 transition font-bold uppercase"
            >
              Go to Login
            </button>
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

        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4 sm:py-6 max-w-screen-2xl mx-auto">
            <h1 className="page-title text-3xl sm:text-4xl lg:text-5xl text-black mb-2 uppercase">
              My Account
            </h1>
            <p className="text-gray-600 text-sm sm:text-base uppercase tracking-wide">
              Manage your profile and view your activity
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 sm:py-8 max-w-screen-2xl mx-auto">
          {/* Message Alert */}
          {message.text && (
            <div className={`mb-6 p-4 flex items-center gap-3 border-2 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-300 text-green-800' 
                : 'bg-red-50 border-red-300 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-bold text-sm uppercase">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Stats Cards */}
            <div className="lg:col-span-1 space-y-4">
              {/* Profile Summary Card */}
              <div className="bg-white border-2 border-gray-300 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-black flex items-center justify-center text-white text-2xl font-bold">
                    {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="section-title text-lg sm:text-xl text-black uppercase truncate">
                      {user.first_name || user.last_name 
                        ? `${user.first_name} ${user.last_name}`.trim()
                        : 'User'
                      }
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                    {user.is_google_user && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase border border-blue-300">
                        Google Account
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 uppercase">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white border-2 border-gray-300 p-6">
                <h3 className="section-title text-base sm:text-lg text-black mb-4 uppercase">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full flex items-center justify-between p-3 border-2 border-gray-300 hover:border-black transition"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-black" />
                      <span className="label-text text-sm text-black uppercase">Orders</span>
                    </div>
                    <span className="text-2xl font-bold text-black">{stats.orders}</span>
                  </button>

                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full flex items-center justify-between p-3 border-2 border-gray-300 hover:border-black transition"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5 text-black" />
                      <span className="label-text text-sm text-black uppercase">Cart Items</span>
                    </div>
                    <span className="text-2xl font-bold text-black">{stats.cart}</span>
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="button-text w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition text-sm uppercase"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>

            {/* Right Column - Profile Details */}
            <div className="lg:col-span-2">
              <div className="bg-white border-2 border-gray-300 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                  <h2 className="section-title text-xl sm:text-2xl text-black uppercase">
                    Profile Information
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="button-text flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition text-sm uppercase"
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
                        <label className="label-text flex items-center gap-2 text-xs sm:text-sm text-gray-600 uppercase">
                          <User className="w-4 h-4" />
                          First Name
                        </label>
                        <p className="text-base sm:text-lg font-bold text-black pl-6 uppercase">
                          {user.first_name || 'Not provided'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="label-text flex items-center gap-2 text-xs sm:text-sm text-gray-600 uppercase">
                          <User className="w-4 h-4" />
                          Last Name
                        </label>
                        <p className="text-base sm:text-lg font-bold text-black pl-6 uppercase">
                          {user.last_name || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="label-text flex items-center gap-2 text-xs sm:text-sm text-gray-600 uppercase">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <p className="text-base sm:text-lg font-bold text-black pl-6">{user.email}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="label-text flex items-center gap-2 text-xs sm:text-sm text-gray-600 uppercase">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </label>
                      <p className="text-base sm:text-lg font-bold text-black pl-6">
                        {user.phone || 'Not provided'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="label-text flex items-center gap-2 text-xs sm:text-sm text-gray-600 uppercase">
                        <MapPin className="w-4 h-4" />
                        Address
                      </label>
                      <p className="text-base sm:text-lg font-bold text-black pl-6">
                        {user.address || 'Not provided'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="label-text flex items-center gap-2 text-xs sm:text-sm text-black mb-2 uppercase">
                          <User className="w-4 h-4" />
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black outline-none transition text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="label-text flex items-center gap-2 text-xs sm:text-sm text-black mb-2 uppercase">
                          <User className="w-4 h-4" />
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          placeholder="Enter last name"
                          className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black outline-none transition text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label-text flex items-center gap-2 text-xs sm:text-sm text-black mb-2 uppercase">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1 uppercase">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="label-text flex items-center gap-2 text-xs sm:text-sm text-black mb-2 uppercase">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black outline-none transition text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="label-text flex items-center gap-2 text-xs sm:text-sm text-black mb-2 uppercase">
                        <MapPin className="w-4 h-4" />
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black outline-none transition resize-none text-sm sm:text-base"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="button-text flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-md hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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
                        className="button-text flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-black py-3 rounded-md hover:border-black transition disabled:opacity-50 text-sm uppercase"
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
      </div>

      <Footer />
    </>
  );
}