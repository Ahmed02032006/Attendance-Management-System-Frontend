import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage: `url('https://attendanceradar.com/wp-content/uploads/2024/06/DALL%C2%B7E-2024-06-28-19.10.18-A-university-classroom-where-a-teacher-is-taking-attendance.-The-teacher-stands-at-the-front-of-the-class-with-a-clipboard-or-tablet-checking-off-nam-1024x585.webp')`,
      }}
    >
      <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-sm border-gray-400 border-[0.5px] p-1 rounded-xl shadow-lg">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
