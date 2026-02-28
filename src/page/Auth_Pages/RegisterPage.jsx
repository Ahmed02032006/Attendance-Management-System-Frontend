import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../store/Auth-Slicer/Auth-Slicer';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPassword: '',
    confirmPassword: '',
    userRole: 'Teacher',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validatePassword = () => {
    if (formData.userPassword.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.userPassword !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    dispatch(registerUser(formData))
      .then((res) => {
        if (res.payload?.status === "Success") {
          toast.success(
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>Account created successfully!</span>
            </div>
          );
          setTimeout(() => {
            navigate("/auth/login");
          }, 2000);
          setFormData({
            userName: '',
            userEmail: '',
            userPassword: '',
            confirmPassword: '',
          });
        } else if (res.payload?.status === "Error") {
          toast.error(res.payload.message || "Registration failed");
        }
      })
      .catch((err) => {
        toast.error("An unexpected error occurred");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const passwordError = validatePassword();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Create Account
        </h2>
        <p className="text-gray-500 mt-2 text-sm">Join AttendEase to start managing attendance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              id="name"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="email"
              id="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="userPassword"
              value={formData.userPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white ${
                formData.userPassword && passwordError ? 'border-red-300' : 'border-gray-200'
              }`}
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
          {formData.userPassword && passwordError && (
            <p className="mt-1 text-xs text-red-500">{passwordError}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white ${
                formData.confirmPassword && formData.userPassword !== formData.confirmPassword
                  ? 'border-red-300'
                  : formData.confirmPassword && formData.userPassword === formData.confirmPassword
                  ? 'border-green-300'
                  : 'border-gray-200'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <span className="text-xs text-gray-500 hover:text-gray-700">
                {showConfirmPassword ? 'Hide' : 'Show'}
              </span>
            </button>
          </div>
          {formData.confirmPassword && formData.userPassword === formData.confirmPassword && (
            <p className="mt-1 text-xs text-green-500 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Passwords match
            </p>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start space-x-3">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the{' '}
            <Link to="/auth/terms" className="text-blue-600 hover:text-blue-700 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/auth/privacy" className="text-blue-600 hover:text-blue-700 hover:underline">
              Privacy Policy
            </Link>
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
              Creating account...
            </div>
          ) : (
            <>
              Create Account
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center">
            Sign in
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </p>
      </div>

      {/* Role Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          By registering, you'll get access to teacher dashboard and attendance management features
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;