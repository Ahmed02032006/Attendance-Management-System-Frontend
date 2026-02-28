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
  const [focusedField, setFocusedField] = useState(null);
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
          toast.success("Welcome back");
          setTimeout(() => {
            navigate('/teacher/dashboard');
          }, 1000);
        } else {
          toast.error("Invalid credentials");
        }
      })
      .catch(() => {
        toast.error("Connection failed");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-medium text-gray-800">sign in</h2>
        <p className="text-gray-400 text-sm mt-1">welcome back</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLoginSubmit} className="space-y-6">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">EMAIL</label>
          <input
            type="email"
            name="userEmail"
            value={formData.userEmail}
            onChange={handleLoginChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:border-indigo-500 focus:ring-0 text-gray-800 text-sm transition-colors placeholder:text-gray-300"
            placeholder="your@email.com"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">PASSWORD</label>
          <input
            type="password"
            name="userPassword"
            value={formData.userPassword}
            onChange={handleLoginChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:border-indigo-500 focus:ring-0 text-gray-800 text-sm transition-colors placeholder:text-gray-300"
            placeholder="••••••••"
            required
          />
        </div>

        {/* Options */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-gray-500">remember</span>
          </label>
          <Link to="/auth/forgot-password" className="text-indigo-600 hover:text-indigo-700 text-sm">
            forgot?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-sm tracking-wide"
        >
          {isLoading ? 'signing in...' : 'sign in'}
        </button>
      </form>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          new here?{' '}
          <Link to="/auth/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
            create account
          </Link>
        </p>
      </div>

      {/* Demo Note */}
      <div className="pt-4 text-center">
        <p className="text-xs text-gray-300">demo: teacher@demo.com / teacher123</p>
      </div>
    </div>
  );
};

export default LoginPage;