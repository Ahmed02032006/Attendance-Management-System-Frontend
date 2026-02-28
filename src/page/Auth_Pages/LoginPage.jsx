import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser } from '../../store/Auth-Slicer/Auth-Slicer';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: '',
  });
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
          toast.success("Welcome back! Login successful");
          setFormData({
            userEmail: '',
            userPassword: ''
          });
          setTimeout(() => {
            navigate('/teacher/dashboard');
          }, 1500);
        } else if (res.payload?.status === "Error") {
          toast.error(res.payload.message || "Invalid credentials");
        }
      })
      .catch(() => {
        toast.error("An unexpected error occurred.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">Welcome Back</h2>
      <p className="text-center text-gray-500 text-sm mb-8">Please sign in to your account</p>

      <form onSubmit={handleLoginSubmit} className="space-y-5">
        <div>
          <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              id="loginEmail"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleLoginChange}
              placeholder="you@example.com"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link to="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-700">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="password"
              id="loginPassword"
              name="userPassword"
              value={formData.userPassword}
              onChange={handleLoginChange}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register
          </Link>
        </p>
      </div>

      {/* Demo Credentials - Simple Box */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs font-medium text-gray-700 mb-1">Demo Access:</p>
        <p className="text-xs text-gray-500">Email: teacher@example.com</p>
        <p className="text-xs text-gray-500">Password: teacher123</p>
      </div>
    </>
  );
};

export default LoginPage;