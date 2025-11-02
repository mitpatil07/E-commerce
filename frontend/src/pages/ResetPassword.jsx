// ResetPassword.jsx - New Page
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Footer from '../components/Footer';

const ResetPassword = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    validateToken();
  }, [uidb64, token]);

  const validateToken = async () => {
    try {
      await api.validateResetToken(uidb64, token);
      setTokenValid(true);
    } catch (err) {
      setError('Invalid or expired reset link. Please request a new one.');
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.resetPassword(uidb64, token, formData.newPassword);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successfully. Please login with your new password.' }
        });
      }, 3000);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
          <p className="text-gray-600 uppercase font-bold">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <>
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-black mb-4 uppercase">Invalid Link</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              to="/forgot-password"
              className="inline-block bg-black text-white px-8 py-3 rounded-md font-bold hover:bg-gray-900 transition uppercase"
            >
              Request New Link
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          .page-title { font-family: 'Inter'; font-weight: 900; letter-spacing: -0.04em; }
          .button-text { font-family: 'Inter'; font-weight: 800; letter-spacing: 0.02em; }
          .label-text { font-family: 'Inter'; font-weight: 700; letter-spacing: -0.01em; }
        `}</style>

        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black mb-6">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="page-title text-3xl sm:text-4xl lg:text-5xl text-black mb-2 uppercase">
              Reset Password
            </h1>
            <p className="text-gray-600 text-sm sm:text-base uppercase tracking-wide">
              Enter your new password below
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 p-4">
              <p className="text-red-800 font-bold text-center text-sm uppercase">{error}</p>
            </div>
          )}

          {/* Success */}
          {success ? (
            <div className="bg-white border-2 border-gray-300 p-6 sm:p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-black mb-4 uppercase">
                  Password Reset Successful!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your password has been reset successfully. Redirecting to login...
                </p>
                <Loader2 className="w-8 h-8 animate-spin text-black mx-auto" />
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-300 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      minLength={8}
                      className="w-full pl-10 sm:pl-12 pr-10 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition font-medium text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-black transition"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="label-text block text-xs sm:text-sm text-black mb-2 uppercase">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 sm:pl-12 pr-10 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition font-medium text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-black transition"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="button-text w-full bg-black text-white py-3 sm:py-4 rounded-md text-sm sm:text-base hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;