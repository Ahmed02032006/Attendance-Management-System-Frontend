import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Branding/Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <img 
          src="https://cdn.pixabay.com/photo/2022/05/24/04/38/study-7217599_1280.jpg" 
          alt="Study Background" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4">Attendance Management System</h1>
            <p className="text-lg text-blue-100 mb-8">Streamline your attendance tracking with our modern solution</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-4">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-blue-100">Active Users</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-4">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm text-blue-100">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
