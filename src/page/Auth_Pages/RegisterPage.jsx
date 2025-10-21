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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if password and confirm password match
    if (formData.userPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return; // Stop the form submission
    }

    dispatch(registerUser(formData))
      .then((res) => {
        if (res.payload?.status === "Success") {
          toast.success('Registration successful! You can now login.');
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
          toast.error(res.payload.message || "Registration failed.");
        }
      })
      .catch((err) => {
        toast.error("An unexpected error occurred.");
      });
  };

  return (
    <div className="py-8 px-6 sm:px-10 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-sky-700 mb-2">Create Your Account</h2>
      <p className="text-center text-gray-500 mb-8 text-sm">Join us and start managing your dashboard</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="name"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 "
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 "
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              type="password"
              id="password"
              name="userPassword"
              value={formData.userPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 "
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2.5 border ${formData.confirmPassword && formData.userPassword !== formData.confirmPassword
                  ? 'border-red-500'
                  : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500`}
            />
          </div>
          {formData.confirmPassword && formData.userPassword !== formData.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start text-sm">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
          />
          <label htmlFor="terms" className="ml-3 text-gray-700">
            I agree to the{' '}
            <Link to={"/auth/termsAndConditions"} className="text-sky-600 hover:underline">
              terms and conditions
            </Link>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          Register
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-sky-600 hover:text-sky-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
