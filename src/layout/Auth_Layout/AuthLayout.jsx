import React from 'react';
import { Outlet } from 'react-router-dom';
import { FiCalendar, FiCheckSquare, FiBarChart2 } from 'react-icons/fi';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex">
      {/* Left Side - Minimalist Pattern */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white">
        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full p-16">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FiCalendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-medium text-gray-800">Presence</span>
            </div>
          </div>

          {/* Center Quote */}
          <div className="space-y-8">
            <div className="text-5xl font-light text-gray-800 leading-tight">
              attendance
              <span className="block text-indigo-600">reimagined</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <FiCheckSquare className="h-5 w-5 text-indigo-500" />
                <span>QR code scanning</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FiBarChart2 className="h-5 w-5 text-indigo-500" />
                <span>real-time analytics</span>
              </div>
            </div>
          </div>

          {/* Author */}
          <div className="text-sm text-gray-400">
            <p>© 2024 Presence</p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-12">
            <div className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FiCalendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-medium text-gray-800">Presence</span>
            </div>
          </div>

          {/* Auth Container */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;