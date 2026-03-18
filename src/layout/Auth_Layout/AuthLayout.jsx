import React from 'react';
import { Outlet } from 'react-router-dom';
import LiveDashboardPreview from '../../components/LiveDashboardPreview';

const AuthLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row h-screen w-full font-display overflow-hidden">
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
              <span className="material-symbols-outlined text-white" style={{ fontSize: '16px sm:20px' }}>verified_user</span>
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
              <a href="#" className="hover:text-[#155dfc] transition-colors">IT Helpdesk</a>
              <a href="#" className="hover:text-[#155dfc] transition-colors">Guidelines</a>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Panel - Dashboard Preview - Hidden on mobile/tablet */}
      <LiveDashboardPreview />

      {/* Fonts & Icons */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        .font-display { font-family: 'Lexend', sans-serif; }
        .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; display: inline-block; line-height: 1; text-transform: none; letter-spacing: normal; word-wrap: normal; white-space: nowrap; direction: ltr; }
        
        /* Responsive styles for material icons */
        @media (max-width: 640px) {
          .material-symbols-outlined {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;