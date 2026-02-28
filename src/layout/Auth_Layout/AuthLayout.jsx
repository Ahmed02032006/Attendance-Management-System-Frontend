import React from 'react';
import { Outlet } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiUsers } from 'react-icons/fi';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content Container */}
      <div className="flex w-full min-h-screen relative z-10">
        {/* Left Side - Brand Section (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white">
          <div className="max-w-md">
            {/* Animated Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="relative">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20">
                  <FiClock className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  AttendEase
                </h1>
                <p className="text-blue-200 text-sm">Smart Attendance Management</p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4 bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 transform hover:scale-105 transition-transform duration-300">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FiCheckCircle className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Real-time Tracking</h3>
                  <p className="text-blue-200 text-sm">Mark attendance instantly with QR codes and get live updates</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 transform hover:scale-105 transition-transform duration-300">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FiUsers className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Easy Management</h3>
                  <p className="text-blue-200 text-sm">Manage students, courses, and attendance records effortlessly</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-8 p-4 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
              <p className="text-sm text-blue-200 italic">
                "AttendEase has transformed how we manage attendance. It's simple, fast, and reliable."
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  JD
                </div>
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-blue-300">Professor, University of Technology</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo (Visible only on mobile) */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full border border-white/20">
                <FiClock className="h-5 w-5 text-white" />
                <span className="text-white font-semibold">AttendEase</span>
              </div>
            </div>

            {/* Auth Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Card Header Decoration */}
              <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              
              <div className="p-6 sm:p-8">
                <Outlet />
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-6 text-center text-white/80 text-xs">
              <p>© 2024 AttendEase. All rights reserved.</p>
              <div className="flex justify-center space-x-4 mt-2">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
