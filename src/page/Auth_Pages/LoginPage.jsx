import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Briefcase, Clock, Users } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser } from '../../store/Auth-Slicer/Auth-Slicer';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await dispatch(loginUser(formData));
      if (res.payload?.status === "Success") {
        toast.success("Welcome back! Login successful");
        setTimeout(() => {
          navigate('/dashboard'); // Redirect to dashboard
        }, 1500);
        setFormData({
          userEmail: '',
          userPassword: ''
        });
      } else if (res.payload?.status === "Error") {
        toast.error(res.payload.message || "Invalid credentials");
      } else if (!res.payload) {
        toast.error("Login failed. Please try again.");
      }
    } catch (err) {
      toast.error("Connection error. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-6xl bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Side - Branding & Features */}
          <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 lg:p-12 text-white">
            <div className="h-full flex flex-col">
              {/* Logo and Company Name */}
              <div className="flex items-center space-x-2 mb-8">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Briefcase className="h-8 w-8" />
                </div>
                <span className="text-2xl font-bold">AttendPro</span>
              </div>

              {/* Welcome Message */}
              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                  Welcome Back!
                </h1>
                <p className="text-blue-100 text-lg">
                  Track attendance, manage employees, and streamline your workforce management all in one place.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-blue-50">Real-time attendance tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-blue-50">Employee management system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <span className="text-blue-50">Automated reports & analytics</span>
                </div>
              </div>

              {/* Testimonial/Stats */}
              <div className="mt-auto bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <p className="text-sm italic mb-3">
                  "This system has revolutionized how we track attendance. Saved us 10+ hours per week!"
                </p>
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-blue-300 border-2 border-white/50"></div>
                    ))}
                  </div>
                  <span className="ml-3 text-sm font-medium">2,500+ companies trust us</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 p-8 lg:p-12">
            <div className="max-w-md mx-auto w-full">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
                <p className="text-gray-500">
                  Please enter your credentials to access your account
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="loginEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      id="loginEmail"
                      name="userEmail"
                      value={formData.userEmail}
                      onChange={handleLoginChange}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="loginPassword" className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <Link to="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="loginPassword"
                      name="userPassword"
                      value={formData.userPassword}
                      onChange={handleLoginChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me for 30 days
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">New to AttendPro?</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors duration-200"
                >
                  Create a free account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>

              {/* Footer */}
              <p className="mt-6 text-center text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline">Terms</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;