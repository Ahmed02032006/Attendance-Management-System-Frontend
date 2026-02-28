import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      toast.error("Passwords don't match");
      return;
    }

    if (formData.userPassword.length < 6) {
      toast.error("Password too short");
      return;
    }

    setIsLoading(true);

    dispatch(registerUser(formData))
      .then((res) => {
        if (res.payload?.status === "Success") {
          toast.success("✓ Account created");
          setTimeout(() => {
            navigate("/auth/login");
          }, 1500);
        } else {
          toast.error(res.payload?.message || "Registration failed");
        }
      })
      .catch(() => {
        toast.error("Something went wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const passwordsMatch = formData.confirmPassword && formData.userPassword === formData.confirmPassword;
  const showError = formData.confirmPassword && formData.userPassword !== formData.confirmPassword;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-light text-gray-800">Get started</h2>
        <p className="text-gray-400 text-sm mt-1">Create your account in seconds</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div className="relative">
          <input
            type="text"
            id="name"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            placeholder=" "
            className="peer w-full px-3 py-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition-colors bg-transparent text-gray-800 text-sm"
            required
          />
          <label 
            htmlFor="name" 
            className="absolute left-3 -top-2.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500"
          >
            Full Name
          </label>
        </div>

        {/* Email Field */}
        <div className="relative">
          <input
            type="email"
            id="email"
            name="userEmail"
            value={formData.userEmail}
            onChange={handleInputChange}
            placeholder=" "
            className="peer w-full px-3 py-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition-colors bg-transparent text-gray-800 text-sm"
            required
          />
          <label 
            htmlFor="email" 
            className="absolute left-3 -top-2.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500"
          >
            Email Address
          </label>
        </div>

        {/* Password Field */}
        <div className="relative">
          <input
            type="password"
            id="password"
            name="userPassword"
            value={formData.userPassword}
            onChange={handleInputChange}
            placeholder=" "
            className="peer w-full px-3 py-3 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition-colors bg-transparent text-gray-800 text-sm"
            required
          />
          <label 
            htmlFor="password" 
            className="absolute left-3 -top-2.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500"
          >
            Password
          </label>
        </div>

        {/* Confirm Password Field with Indicator */}
        <div className="relative">
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder=" "
            className={`peer w-full px-3 py-3 border-b-2 outline-none transition-colors bg-transparent text-gray-800 text-sm ${
              showError ? 'border-red-300' : passwordsMatch ? 'border-green-300' : 'border-gray-200'
            } focus:border-blue-500`}
            required
          />
          <label 
            htmlFor="confirmPassword" 
            className="absolute left-3 -top-2.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-500"
          >
            Confirm Password
          </label>
          {passwordsMatch && (
            <span className="absolute right-3 top-3 text-green-500 text-sm">✓</span>
          )}
          {showError && (
            <span className="absolute right-3 top-3 text-red-500 text-sm">✗</span>
          )}
        </div>

        {/* Terms Checkbox - Custom Style */}
        <label className="flex items-start space-x-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input type="checkbox" className="sr-only peer" required />
            <div className="w-4 h-4 border border-gray-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 text-xs">✓</div>
          </div>
          <span className="text-sm text-gray-500 group-hover:text-gray-700">
            I agree to the{' '}
            <Link to="/auth/terms" className="text-blue-500 hover:text-blue-600">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/auth/privacy" className="text-blue-500 hover:text-blue-600">
              Privacy
            </Link>
          </span>
        </label>

        {/* Submit Button */}
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
                Creating...
              </>
            ) : (
              'Create account'
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </form>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center group">
            Sign in
            <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform ml-1">→</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;