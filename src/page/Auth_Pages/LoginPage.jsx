import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser } from '../../store/Auth-Slicer/Auth-Slicer';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: '',
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData))
      .then((res) => {
        if (res.payload?.status === "Success") {
          toast.success("Login successful");
          setTimeout(() => {
          }, 2000);
          setFormData({
            userEmail: '',
            userPassword: ''
          });
        } else if (res.payload?.status === "Error") {
          toast.error(res.payload.message || "Login failed");
        } else if (!res.payload) {
          toast.error("Login failed");
        }
      })
      .catch((err) => {
        toast.error("An unexpected error occurred.");
      });
  };

  return (
    <div className="py-8 px-6 sm:px-10 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-sky-700 mb-2">Welcome Back <span className='animate-wave'>👋</span></h2>
      <p className="text-center text-gray-500 mb-8 text-sm">Login to continue to your dashboard</p>
      <form onSubmit={handleLoginSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="loginEmail"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleLoginChange}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 "
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              type="password"
              id="loginPassword"
              name="userPassword"
              value={formData.userPassword}
              onChange={handleLoginChange}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 "
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
            />
            <span className="text-gray-700">Remember me</span>
          </label>
          {/* <Link to="/auth/forgotPassword" className="text-sky-600 hover:underline">
            Forgot password?
          </Link> */}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          Sign in
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/auth/register" className="font-medium text-sky-600 hover:text-sky-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
