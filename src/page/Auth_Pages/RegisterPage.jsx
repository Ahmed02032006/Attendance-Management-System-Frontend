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
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

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

    if (!agreed) {
      toast.error("please agree to terms");
      return;
    }

    if (formData.userPassword !== formData.confirmPassword) {
      toast.error("passwords don't match");
      return;
    }

    if (formData.userPassword.length < 6) {
      toast.error("password too short");
      return;
    }

    setIsLoading(true);

    dispatch(registerUser(formData))
      .then((res) => {
        if (res.payload?.status === "Success") {
          toast.success("account created");
          setTimeout(() => {
            navigate("/auth/login");
          }, 1500);
        } else {
          toast.error(res.payload?.message || "registration failed");
        }
      })
      .catch(() => {
        toast.error("something went wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const passwordsMatch = formData.confirmPassword && formData.userPassword === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword && formData.userPassword !== formData.confirmPassword;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-medium text-gray-800">create account</h2>
        <p className="text-gray-400 text-sm mt-1">join our community</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:border-indigo-500 focus:ring-0 text-gray-800 text-sm transition-colors"
            placeholder="your name"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">EMAIL</label>
          <input
            type="email"
            name="userEmail"
            value={formData.userEmail}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:border-indigo-500 focus:ring-0 text-gray-800 text-sm transition-colors"
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
            onChange={handleInputChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:border-indigo-500 focus:ring-0 text-gray-800 text-sm transition-colors"
            placeholder="min 6 characters"
            required
          />
        </div>

        {/* Confirm Password with Indicator */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CONFIRM</label>
          <div className="relative">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-0 py-2 bg-transparent border-0 border-b-2 ${
                passwordsMismatch ? 'border-red-300' : passwordsMatch ? 'border-green-300' : 'border-gray-200'
              } focus:border-indigo-500 focus:ring-0 text-gray-800 text-sm transition-colors pr-8`}
              placeholder="re-enter password"
              required
            />
            {passwordsMatch && (
              <span className="absolute right-0 top-2 text-green-500 text-sm">✓</span>
            )}
            {passwordsMismatch && (
              <span className="absolute right-0 top-2 text-red-400 text-sm">✗</span>
            )}
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-500">
            i agree to the{' '}
            <Link to="/auth/terms" className="text-indigo-600 hover:text-indigo-700">
              terms
            </Link>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-sm tracking-wide"
        >
          {isLoading ? 'creating...' : 'create account'}
        </button>
      </form>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          already have an account?{' '}
          <Link to="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;