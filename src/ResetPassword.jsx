import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './config/api';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
        setError('Invalid or expired link');
      }
    };
    verifyToken();
  }, [token]);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return { minLength, hasLetters, hasNumbers, isValid: minLength && hasLetters && hasNumbers };
  };

  const passwordCheck = validatePassword(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordCheck.isValid) {
      setError('Password must be at least 8 characters with letters and numbers');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/reset-password/${token}`, 
        { newPassword },
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json'
          }
        }
      );
      setSuccess('Password changed successfully!');
      setTimeout(() => navigate('/login'), 2600);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5E9] via-[#F0EDE0] to-[#E8E5D8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#834d1a] border-t-transparent"></div>
      </div>
    );
  }

  // Invalid token
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5E9] via-[#F0EDE0] to-[#E8E5D8] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/signin')}
            className="bg-[#834d1a] text-white px-6 py-2 rounded-lg hover:bg-[#6d3e15] transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5E9] via-[#F0EDE0] to-[#E8E5D8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#834d1a] to-[#6d3e15] rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-gray-500">Enter your new password</p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {error && !success && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter new password"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#834d1a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password strength indicators */}
              {newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {passwordCheck.minLength ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                    <span className={passwordCheck.minLength ? 'text-green-600' : 'text-gray-500'}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordCheck.hasLetters ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                    <span className={passwordCheck.hasLetters ? 'text-green-600' : 'text-gray-500'}>Contains letters</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordCheck.hasNumbers ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                    <span className={passwordCheck.hasNumbers ? 'text-green-600' : 'text-gray-500'}>Contains numbers</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="Confirm new password"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#834d1a]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-600">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !passwordCheck.isValid || newPassword !== confirmPassword}
              className="w-full bg-gradient-to-r from-[#834d1a] to-[#6d3e15] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}