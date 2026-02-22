import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Briefcase, Clock, Shield } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser } from '../../store/Auth-Slicer/Auth-Slicer';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

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
        setFormData({
          userEmail: '',
          userPassword: ''
        });
        navigate('/dashboard');
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
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left Side - Branding/Features */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-8">
              <Briefcase className="h-8 w-8" />
              <span className="text-2xl font-bold">AttendPro</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
            <p className="text-blue-100 mb-8">
              Streamline your attendance management with our comprehensive solution.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 bg-opacity-30 p-2 rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-sm">Real-time attendance tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 bg-opacity-30 p-2 rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-sm">Secure & encrypted data</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 bg-opacity-30 p-2 rounded-lg">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="text-sm">Comprehensive reporting</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-blue-200">
            © 2024 AttendPro. All rights reserved.
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-8 bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
            <p className="text-gray-500 text-sm">Please enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  placeholder="john.doe@company.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link 
                  to="/auth/forgot-password" 
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  id="loginPassword"
                  name="userPassword"
                  value={formData.userPassword}
                  onChange={handleLoginChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            {/* Demo Credentials */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo credentials</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <p className="text-gray-600">Email: admin@attendpro.com</p>
              <p className="text-gray-600">Password: demo1234</p>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/auth/register" 
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition inline-flex items-center space-x-1"
              >
                <span>Create an account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>🔒 SSL Secured</span>
            <span>•</span>
            <span>🛡️ 2FA Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;