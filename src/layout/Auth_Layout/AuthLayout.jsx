import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage: `url('https://cdn.pixabay.com/photo/2022/05/24/04/38/study-7217599_1280.jpg')`,
      }}
    >
      <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-sm border-gray-400 border-[0.5px] p-1 rounded-xl shadow-lg">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
