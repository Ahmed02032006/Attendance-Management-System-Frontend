import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    // You can add your API call here to send the reset link.
  };

  return (
    <div className="py-8 px-6 sm:px-10 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">Forgot your password?</h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Enter your email and we'll send you a reset link to regain access.
        </p>

        <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="forgotPasswordEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="forgotPasswordEmail"
                name="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Send Reset Link
          </button>
        </form>

      <div className="mt-6 text-center text-sm">
        <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
          Back to Sign in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
