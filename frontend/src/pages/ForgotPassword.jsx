// ForgotPassword.jsx - New Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const data = await api.forgotPassword(email);
      setMessage(data.message || 'Password reset link sent to your email');
      setEmailSent(true);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="page-title text-3xl sm:text-4xl lg:text-5xl text-black mb-2 uppercase">
              Forgot Password?
            </h1>
            <p className="text-gray-600 text-sm sm:text-base uppercase tracking-wide">
              {emailSent 
                ? 'Check your email for reset link' 
                : 'Enter your email to reset password'}
            </p>
          </div>

          {/* Success / Error */}
          {message && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 p-4">
              <p className="text-green-800 font-bold text-center text-sm">{message}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 p-4">
              <p className="text-red-800 font-bold text-center text-sm uppercase">{error}</p>
            </div>
          )}

          {/* Form */}
          {!emailSent ? (
            <div className="bg-white border-2 border-gray-300 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your.email@example.com"
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition font-medium text-sm sm:text-base"
                    />
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:text-black transition uppercase"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-300 p-6 sm:p-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-700 text-sm sm:text-base">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Please check your email and click the link to reset your password. 
                  The link will expire in 24 hours.
                </p>
                
                {/* Resend & Back buttons */}
                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setMessage('');
                    }}
                    className="button-text w-full bg-gray-100 text-black py-3 rounded-md text-sm hover:bg-gray-200 transition uppercase"
                  >
                    Send to Different Email
                  </button>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:text-black transition uppercase"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;