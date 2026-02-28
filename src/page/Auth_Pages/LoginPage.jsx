import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser } from '../../store/Auth-Slicer/Auth-Slicer';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    dispatch(loginUser(formData))
      .then((res) => {
        if (res.payload?.status === "Success") {
          toast.success(
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              <span>Welcome back! Login successful</span>
            </div>
          );
          setFormData({
            userEmail: '',
            userPassword: ''
          });
          setTimeout(() => {
            navigate('/teacher/dashboard');
          }, 1500);
        } else if (res.payload?.status === "Error") {
          toast.error(res.payload.message || "Invalid credentials");
        } else if (!res.payload) {
          toast.error("Connection error. Please try again.");
        }
      })
      .catch((err) => {
        toast.error("An unexpected error occurred.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="text-gray-500 mt-2 text-sm">Sign in to continue to your dashboard</p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="email"
              id="loginEmail"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleLoginChange}
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link to="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="loginPassword"
              name="userPassword"
              value={formData.userPassword}
              onChange={handleLoginChange}
              placeholder="Enter your password"
              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <span className="text-xs text-gray-500 hover:text-gray-700">
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center group"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Signing in...
            </div>
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Demo Credentials */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">Demo credentials</span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 border border-blue-100">
          <p className="font-medium mb-1">Try it out:</p>
          <p>Email: teacher@example.com</p>
          <p>Password: teacher123</p>
        </div>
      </form>

      {/* Register Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center">
            Create account
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;