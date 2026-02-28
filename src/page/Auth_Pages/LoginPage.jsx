import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
          toast.success("✓ Login successful");
          setTimeout(() => {
            navigate('/teacher/dashboard');
          }, 1000);
        } else if (res.payload?.status === "Error") {
          toast.error(res.payload.message || "Invalid credentials");
        }
      })
      .catch(() => {
        toast.error("Connection error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-light text-gray-800">Welcome back</h2>
        <p className="text-gray-400 text-sm mt-1">Enter your credentials to continue</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLoginSubmit} className="space-y-5">
        {/* Email Field - Modern Style */}
        <div className="relative">
          <input
            type="email"
            id="loginEmail"
            name="userEmail"
            value={formData.userEmail}
            onChange={handleLoginChange}
            placeholder=" "
            className="peer w-full px-3 py-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition-colors bg-transparent text-gray-800 text-sm"
            required
          />
          <label 
            htmlFor="loginEmail" 
            className="absolute left-3 -top-2.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500"
          >
            Email Address
          </label>
        </div>

        {/* Password Field - Modern Style */}
        <div className="relative">
          <input
            type="password"
            id="loginPassword"
            name="userPassword"
            value={formData.userPassword}
            onChange={handleLoginChange}
            placeholder=" "
            className="peer w-full px-3 py-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition-colors bg-transparent text-gray-800 text-sm"
            required
          />
          <label 
            htmlFor="loginPassword" 
            className="absolute left-3 -top-2.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500"
          >
            Password
          </label>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-4 h-4 border border-gray-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100">✓</div>
            </div>
            <span className="text-gray-600 group-hover:text-gray-800">Keep me logged in</span>
          </label>
          
          <Link to="/auth/forgot-password" className="text-blue-500 hover:text-blue-600 transition-colors">
            Forgot?
          </Link>
        </div>

        {/* Submit Button - Unique Style */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative group overflow-hidden py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center justify-center">
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </form>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">
          New to AttendFlow?{' '}
          <Link to="/auth/register" className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center group">
            Create account
            <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform ml-1">→</span>
          </Link>
        </p>
      </div>

      {/* Quick Access */}
      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center mb-2">Quick demo access</p>
        <div className="bg-gray-50 rounded-lg p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">teacher@demo.com</span>
            <span className="text-gray-400">••••••••</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;