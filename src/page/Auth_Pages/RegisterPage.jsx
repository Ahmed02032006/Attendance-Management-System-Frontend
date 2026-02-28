import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.userPassword !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    if (formData.userPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    dispatch(registerUser(formData))
      .then((res) => {
        if (res.payload?.status === "Success") {
          toast.success("Account created successfully!");
          setTimeout(() => {
            navigate("/auth/login");
          }, 1500);
        } else if (res.payload?.status === "Error") {
          toast.error(res.payload.message || "Registration failed");
        }
      })
      .catch(() => {
        toast.error("An unexpected error occurred");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const passwordsMatch = formData.confirmPassword && formData.userPassword === formData.confirmPassword;
  const showPasswordError = formData.confirmPassword && formData.userPassword !== formData.confirmPassword;

  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">Create Account</h2>
      <p className="text-center text-gray-500 text-sm mb-8">Fill in your details to get started</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="name"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              id="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="password"
              id="password"
              name="userPassword"
              value={formData.userPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${
                showPasswordError ? 'border-red-300' : passwordsMatch ? 'border-green-300' : 'border-gray-300'
              }`}
              required
            />
          </div>
          {showPasswordError && (
            <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
          )}
          {passwordsMatch && (
            <p className="mt-1 text-xs text-green-500">Passwords match</p>
          )}
        </div>

        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
            I agree to the{' '}
            <Link to="/auth/terms" className="text-blue-600 hover:text-blue-500">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/auth/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
};

export default RegisterPage;
