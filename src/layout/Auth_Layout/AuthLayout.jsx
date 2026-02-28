import React from 'react';
import { Outlet } from 'react-router-dom';
import { FiCheckCircle, FiUsers, FiClock, FiTrendingUp } from 'react-icons/fi';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-white flex">
      {/* Left Side - Modern Pattern Design */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0f172a]">
        {/* Geometric Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full filter blur-3xl"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full p-12">
          {/* Logo Area */}
          <div>
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/20">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AttendFlow</span>
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Track Attendance
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Effortlessly
              </span>
            </h1>
            
            <p className="text-gray-300 text-lg max-w-md">
              Streamline your attendance management with real-time tracking, instant reports, and smart analytics.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 max-w-md mt-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <FiUsers className="h-6 w-6 text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-xs text-gray-400">Active Users</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <FiClock className="h-6 w-6 text-indigo-400 mb-2" />
                <div className="text-2xl font-bold text-white">10k+</div>
                <div className="text-xs text-gray-400">Daily Entries</div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 max-w-md">
            <p className="text-gray-300 text-sm italic">
              "This system has completely transformed how we manage attendance. It's intuitive, fast, and the reports are incredibly detailed."
            </p>
            <div className="flex items-center mt-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-semibold">
                AS
              </div>
              <div className="ml-3">
                <p className="text-white text-sm font-medium">Dr. Sarah Khan</p>
                <p className="text-gray-400 text-xs">Dean, University of Technology</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl">
              <FiCheckCircle className="h-5 w-5" />
              <span className="font-semibold">AttendFlow</span>
            </div>
          </div>

          {/* Auth Card with Unique Shape */}
          <div className="relative">
            {/* Decorative Elements */}
            <div className="absolute -top-3 -right-3 w-20 h-20 bg-blue-500 rounded-full opacity-20"></div>
            <div className="absolute -bottom-3 -left-3 w-32 h-32 bg-indigo-500 rounded-full opacity-20"></div>
            
            {/* Main Card */}
            <div className="relative bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <Outlet />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>Protected by industry-standard encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;