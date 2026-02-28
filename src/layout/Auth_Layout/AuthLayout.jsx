import React from 'react';
import { Outlet } from 'react-router-dom';
import { FiBookOpen } from 'react-icons/fi';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex">
      {/* Left Side - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 text-white mb-12">
            <FiBookOpen className="h-8 w-8" />
            <span className="text-2xl font-semibold">AttendEase</span>
          </div>
          
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-4">Attendance Management System</h1>
            <p className="text-blue-100 text-lg">Streamline your attendance tracking with our simple and efficient platform.</p>
          </div>
        </div>

        <div className="text-blue-100 text-sm">
          <p>© 2024 AttendEase. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
              <FiBookOpen className="h-5 w-5" />
              <span className="font-semibold">AttendEase</span>
            </div>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;