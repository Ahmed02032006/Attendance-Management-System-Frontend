import React from 'react';
import { Outlet } from 'react-router-dom';
import LiveDashboardPreview from '../../components/LiveDashboardPreview';
import { FaShieldAlt } from 'react-icons/fa';

const AuthLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
      {/* Left Panel - Form */}
      <aside
        className="w-full lg:w-[38%] xl:w-[34%] h-auto lg:h-full z-20 flex flex-col overflow-y-auto"
        style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(21,93,252,0.08)',
        }}
      >
        {/* Logo - Adjusted padding for mobile */}
        <div className="px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-0 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: '#155dfc', boxShadow: '0 6px 18px rgba(21,93,252,0.22)' }}
            >
              <FaShieldAlt className="text-white text-base sm:text-xl" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-wider leading-tight" style={{ color: '#155dfc' }}>
                ATTMARK
              </h1>
              <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">FOR UNIVERSITY</p>
            </div>
          </div>
        </div>

        {/* Form outlet - Adjusted padding for mobile */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-10 py-4 sm:py-6 min-h-0">
          <Outlet />
        </div>

        {/* Footer - Adjusted padding for mobile */}
        <div className="px-4 sm:px-6 lg:px-10 pb-4 sm:pb-5 pt-3 border-t border-slate-100 shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-[9px] sm:text-[10px] text-slate-400 font-medium">
            <span>© 2026 ATTMARK</span>
            <div className="flex gap-3 sm:gap-4">
              <a
                href="#"
                className="hover:text-[#155dfc] transition-colors">How to Use</a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=m.ahmedofficial677@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#155dfc] transition-colors">Teachnical Support</a>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Panel - Dashboard Preview - Hidden on mobile/tablet */}
      <LiveDashboardPreview />

    </div>
  );
};

export default AuthLayout;