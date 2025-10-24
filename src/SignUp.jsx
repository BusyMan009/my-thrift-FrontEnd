import axios from 'axios';
import { useState } from 'react'
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from './contexts/UserContext';
import API_BASE_URL from './config/api';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, CheckCircle2, XCircle, Send, FileText, Check } from 'lucide-react';

export default function SignIn({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsLanguage, setTermsLanguage] = useState('ar'); // 'ar' or 'en'
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { login } = useUser();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [forgotEmail, setForgotEmail] = useState('');

  const handelInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccessMessage('');
  }

  // Password validation
  const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return {
      minLength,
      hasLetters,
      hasNumbers,
      isValid: minLength && hasLetters && hasNumbers
    };
  };

  const passwordCheck = validatePassword(formData.password);

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!forgotEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(forgotEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/forgot-password`,
        { email: forgotEmail },
        { headers: { 'ngrok-skip-browser-warning': 'true' } }
      );

      setSuccessMessage('Password reset link has been sent to your email!');
      setForgotEmail('');
      
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('Forgot password error:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (isLoading) return;

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill all required fields');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (isSignUp) {
      if (!formData.name) {
        setError('Name is required');
        return;
      }

      if (!passwordCheck.isValid) {
        setError('Password must be at least 6 characters with letters and numbers');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // التحقق من الموافقة على الشروط
      if (!agreedToTerms) {
        setError('يجب الموافقة على الشروط والأحكام للمتابعة');
        return;
      }
    }

    setIsLoading(true);
    try {
      const urlauth = isSignUp ? "register" : "login";
      const payload = isSignUp 
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            location: 'Riyadh'
          }
        : {
            email: formData.email,
            password: formData.password
          };

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/${urlauth}`,
        payload,
        { headers: { 'ngrok-skip-browser-warning': 'true' } }
      );

      const userData = {
        id: response.data.user?.id || response.data.id,
        name: response.data.user?.name || response.data.name || formData.name,
        email: response.data.user?.email || response.data.email || formData.email,
        username: response.data.user?.username || response.data.username,
        avatar: response.data.user?.profileImage || response.data.user?.avatar || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
      };

      login(response.data.token, userData);

      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect") || "/";
      
      console.log('Login successful, redirecting to:', redirect);
      
      if (onClose) onClose();
      
      setTimeout(() => {
        window.location.href = redirect;
      }, 100);

    } catch (error) {
      console.error('Error:', error.response?.data);
      
      if (error.response?.status === 400) {
        if (error.response.data.error.includes('already exists')) {
          setError('This email is already registered. Please sign in instead.');
        } else {
          setError(error.response.data.error || 'Invalid input');
        }
      } else if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('Connection error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // محتوى الشروط والأحكام
  const termsContent = {
    ar: {
      title: "الشروط والأحكام",
      sections: [
        {
          title: "١. الموافقة على الشروط",
          content: "باستخدامك لهذا الموقع، فإنك توافق على الالتزام بهذه الشروط والأحكام وجميع القوانين واللوائح المعمول بها."
        },
        {
          title: "٢. استخدام الخدمة",
          content: "أنت توافق على استخدام الخدمة للأغراض المشروعة فقط وبطريقة لا تنتهك حقوق الآخرين أو تقيد استخدامهم للخدمة."
        },
        {
          title: "٣. حماية البيانات",
          content: "نحن ملتزمون بحماية بياناتك الشخصية. سيتم استخدام معلوماتك فقط للأغراض المحددة في سياسة الخصوصية الخاصة بنا."
        },
        {
          title: "٤. المسؤولية",
          content: "الموقع غير مسؤول عن أي أضرار مباشرة أو غير مباشرة قد تنتج عن استخدام الخدمة."
        },
        {
          title: "٥. الملكية الفكرية",
          content: "جميع المحتويات والعلامات التجارية على هذا الموقع هي ملك للشركة ومحمية بموجب قوانين حقوق النشر."
        },
        {
          title: "٦. التعديلات",
          content: "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرارك في استخدام الخدمة يعني موافقتك على التعديلات."
        },
        {
          title: "٧. إنهاء الخدمة",
          content: "يحق لنا إنهاء أو تعليق حسابك فورًا في حالة انتهاك هذه الشروط."
        },
        {
          title: "٨. القانون المطبق",
          content: "تخضع هذه الشروط لقوانين المملكة العربية السعودية ويتم تفسيرها وفقًا لها."
        }
      ]
    },
    en: {
      title: "Terms and Conditions",
      sections: [
        {
          title: "1. Acceptance of Terms",
          content: "By using this website, you agree to comply with these terms and conditions and all applicable laws and regulations."
        },
        {
          title: "2. Use of Service",
          content: "You agree to use the service for lawful purposes only and in a manner that does not infringe the rights of others or restrict their use of the service."
        },
        {
          title: "3. Data Protection",
          content: "We are committed to protecting your personal data. Your information will only be used for the purposes specified in our privacy policy."
        },
        {
          title: "4. Liability",
          content: "The website is not responsible for any direct or indirect damages that may result from using the service."
        },
        {
          title: "5. Intellectual Property",
          content: "All content and trademarks on this website are owned by the company and protected under copyright laws."
        },
        {
          title: "6. Modifications",
          content: "We reserve the right to modify these terms at any time. Your continued use of the service signifies your acceptance of the modifications."
        },
        {
          title: "7. Termination",
          content: "We may terminate or suspend your account immediately if you violate these terms."
        },
        {
          title: "8. Governing Law",
          content: "These terms are governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia."
        }
      ]
    }
  };

  const currentTerms = termsContent[termsLanguage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5E9] via-[#F0EDE0] to-[#E8E5D8] flex items-center justify-center px-4 py-12 relative">
      
      {/* Close button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-lg group"
        >
          <X className="w-5 h-5 text-gray-600 group-hover:text-[#834d1a]" />
        </button>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#834d1a]" />
                <h3 className="text-2xl font-bold text-gray-900">{currentTerms.title}</h3>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Language Toggle */}
            <div className="px-6 pt-4 flex gap-2">
              <button
                onClick={() => setTermsLanguage('ar')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  termsLanguage === 'ar'
                    ? 'bg-[#834d1a] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setTermsLanguage('en')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  termsLanguage === 'en'
                    ? 'bg-[#834d1a] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                English
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" dir={termsLanguage === 'ar' ? 'rtl' : 'ltr'}>
              {currentTerms.sections.map((section, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="text-lg font-bold text-[#834d1a]">{section.title}</h4>
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full bg-gradient-to-r from-[#834d1a] to-[#6d3e15] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                {termsLanguage === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl flex flex-col items-center shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#834d1a] border-t-transparent mb-4"></div>
              <p className="text-gray-700 text-lg font-semibold">
                {isForgotPassword ? 'Sending reset link...' : isSignUp ? 'Creating account...' : 'Signing in...'}
              </p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm border border-gray-100">
          
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#834d1a] to-[#6d3e15] rounded-full flex items-center justify-center shadow-lg">
              {isForgotPassword ? (
                <Lock className="w-8 h-8 text-white" />
              ) : (
                <UserIcon className="w-8 h-8 text-white" />
              )}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-500">
              {isForgotPassword 
                ? 'Enter your email to receive a reset link' 
                : isSignUp 
                  ? 'Sign up to get started' 
                  : 'Sign in to continue'}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setError('');
                      setSuccessMessage('');
                    }}
                    disabled={isLoading}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#834d1a] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#834d1a] to-[#6d3e15] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setSuccessMessage('');
                  setForgotEmail('');
                }}
                disabled={isLoading}
                className="w-full py-3 text-[#834d1a] hover:text-[#6d3e15] font-semibold transition-colors disabled:opacity-50"
              >
                ← Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name field - only for sign up */}
              {isSignUp && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handelInputChange}
                      disabled={isLoading}
                      placeholder="Enter your name"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#834d1a] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handelInputChange}
                    disabled={isLoading}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#834d1a] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handelInputChange}
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#834d1a] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password strength indicator - only for sign up */}
                {isSignUp && formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      {passwordCheck.minLength ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={passwordCheck.minLength ? 'text-green-600' : 'text-gray-500'}>
                        At least 6 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {passwordCheck.hasLetters ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={passwordCheck.hasLetters ? 'text-green-600' : 'text-gray-500'}>
                        Contains letters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {passwordCheck.hasNumbers ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={passwordCheck.hasNumbers ? 'text-green-600' : 'text-gray-500'}>
                        Contains numbers
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password - only for sign up */}
              {isSignUp && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handelInputChange}
                      disabled={isLoading}
                      placeholder="Confirm your password"
                      className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#834d1a] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      {formData.password === formData.confirmPassword ? (
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
              )}

              {/* Terms and Conditions - only for sign up */}
              {isSignUp && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAgreedToTerms(!agreedToTerms)}
                      className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        agreedToTerms
                          ? 'bg-[#834d1a] border-[#834d1a]'
                          : 'bg-white border-gray-300 hover:border-[#834d1a]'
                      }`}
                    >
                      {agreedToTerms && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1 text-sm" dir="rtl">
                      <p className="text-gray-700">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-[#834d1a] hover:text-[#6d3e15] font-bold underline"
                        >
                          Terms and Conditions
                        </button>
                        {' '}and Privacy Policy
                      </p>
                    </div>
                  </div>
                  

                </div>
              )}

              {/* Forgot Password */}
              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-sm text-[#834d1a] hover:text-[#6d3e15] font-semibold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || (isSignUp && !agreedToTerms)}
                className="w-full bg-gradient-to-r from-[#834d1a] to-[#6d3e15] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Divider & Toggle */}
          {!isForgotPassword && (
            <>
              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </span>
                </div>
              </div>

              {/* Toggle Sign In/Sign Up */}
              <button 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccessMessage('');
                  setAgreedToTerms(false);
                  setFormData({
                    name: "",
                    email: '',
                    password: '',
                    confirmPassword: ''
                  });
                }}
                disabled={isLoading}
                className="w-full py-3 border-2 border-[#834d1a] text-[#834d1a] rounded-xl font-semibold hover:bg-[#834d1a] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSignUp ? 'Sign In Instead' : 'Create New Account'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}