import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage: `url('https://www.shutterstock.com/image-photo/rear-view-man-raising-arm-600nw-2345710689.jpg')`,
      }}
    >
      <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-md border-gray-400 border-[0.5px] p-1 rounded-xl shadow-lg">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
