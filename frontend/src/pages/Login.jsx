// Login.jsx - Updated with CategoryProducts theme
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, Mail, Loader2, LogIn } from 'lucide-react';
import api from '../services/api'; // ✅ Changed to lowercase 'api'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleLoginButton'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with'
          }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [location]);

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      setError('');
      
      const data = await api.googleLogin(response.credential);
      
      console.log('✅ Google login successful');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (err) {
      setError(err.message || 'An error occurred during Google login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      // ✅ Use api.login() - it returns data directly, not { data: ... }
      const data = await api.login({
        email: formData.email,
        password: formData.password
      });

      console.log('✅ User logged in:', data.user);
      
      // ✅ Tokens are already saved by api.login(), just redirect
      setTimeout(() => {
        window.location.href = location.state?.from || '/';
      }, 100);
      
    } catch (err) {
      console.error('❌ Login error:', err);
      
      // ✅ Handle errors properly (no err.response since we're using fetch)
      if (err.message.includes('Invalid')) {
        setError('Invalid email or password');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .page-title {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        
        .button-text {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 800;
          letter-spacing: 0.02em;
        }
        
        .label-text {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
      `}</style>

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black mb-6">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="page-title text-3xl sm:text-4xl lg:text-5xl text-black mb-2 uppercase">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-sm sm:text-base uppercase tracking-wide">
            Sign in to continue shopping
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 p-4">
            <p className="text-green-800 font-bold text-center text-sm uppercase">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 p-4">
            <p className="text-red-800 font-bold text-center text-sm uppercase">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white border-2 border-gray-300 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition font-medium text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition font-medium text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="button-text w-full bg-black text-white py-3 sm:py-4 rounded-md text-sm sm:text-base hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-4 bg-white text-gray-500 font-bold uppercase">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <div className="mt-6">
              <div id="googleLoginButton" className="flex justify-center"></div>
            </div>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="mt-6 sm:mt-8 text-center text-gray-600 text-sm sm:text-base">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-black hover:underline uppercase">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;