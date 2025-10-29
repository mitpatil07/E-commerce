// Register.jsx - Updated with CategoryProducts theme
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, UserPlus } from 'lucide-react';
import API from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignup
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleSignUpButton'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signup_with'
          }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleSignup = async (response) => {
    try {
      setLoading(true);
      setError('');
      
      const res = await API.post('accounts/google-login/', {
        token: response.credential
      });

      if (res.data.tokens) {
        localStorage.setItem('access_token', res.data.tokens.access);
        localStorage.setItem('refresh_token', res.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        console.log('✅ Google signup successful, redirecting...');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        setError(res.data.message || 'Google signup failed');
      }
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err.response?.data?.message || 'An error occurred during Google signup');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Attempting registration...');
      
      const response = await API.post('accounts/register/', {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name
      });

      console.log('✅ Registration response:', response.data);
      console.log('✅ User registered:', response.data.user);

      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('✅ Registration successful, redirecting...');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        navigate('/login', { 
          state: { message: 'Account created successfully! Please login.' } 
        });
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      
      if (err.response?.data?.message) {
        if (typeof err.response.data.message === 'object') {
          const errors = err.response.data.message;
          const errorMessages = Object.entries(errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
          setError(errorMessages);
        } else {
          setError(err.response.data.message);
        }
      } else if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError('An error occurred. Please try again.');
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
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="page-title text-3xl sm:text-4xl lg:text-5xl text-black mb-2 uppercase">
            Create Account
          </h1>
          <p className="text-gray-600 text-sm sm:text-base uppercase tracking-wide">
            Join us and start shopping today
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 p-4">
            <p className="text-red-800 font-bold text-center text-sm uppercase whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* Register Form */}
        <div className="bg-white border-2 border-gray-300 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="first_name" className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition font-medium text-sm sm:text-base"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition font-medium text-sm sm:text-base"
                  placeholder="Doe"
                />
              </div>
            </div>

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
                  placeholder="you@example.com"
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
                  minLength={8}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition font-medium text-sm sm:text-base"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition font-medium text-sm sm:text-base"
                  placeholder="Confirm your password"
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
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
                <span className="px-4 bg-white text-gray-500 font-bold uppercase">Or sign up with</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <div className="mt-6">
              <div id="googleSignUpButton" className="flex justify-center"></div>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <p className="mt-6 sm:mt-8 text-center text-gray-600 text-sm sm:text-base">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-black hover:underline uppercase">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;