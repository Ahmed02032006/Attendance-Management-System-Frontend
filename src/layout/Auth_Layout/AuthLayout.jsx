import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex h-screen w-full font-display overflow-hidden">
      {/* Left Panel - Form */}
      <aside
        className="w-full lg:w-[38%] xl:w-[34%] h-full z-20 flex flex-col overflow-y-auto"
        style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(21,93,252,0.08)',
        }}
      >
        {/* Logo */}
        <div className="px-8 lg:px-10 pt-6 pb-0 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#155dfc', boxShadow: '0 6px 18px rgba(21,93,252,0.22)' }}
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>verified_user</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-wider leading-tight" style={{ color: '#155dfc' }}>
                ATTMARK
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">fOR UNIVERSITY</p>
            </div>
          </div>
        </div>

        {/* Form outlet */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-10 py-4 min-h-0">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="px-8 lg:px-10 pb-5 pt-3 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>© 2026 EDU-SYSTEM</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#155dfc] transition-colors">IT Helpdesk</a>
              <a href="#" className="hover:text-[#155dfc] transition-colors">Guidelines</a>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Panel - Dashboard Preview */}
      <main
        className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{ background: '#F8FAFC' }}
      >
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 rounded-full" style={{ background: 'rgba(21,93,252,0.05)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 rounded-full" style={{ background: 'rgba(21,93,252,0.05)', filter: 'blur(100px)' }} />

        <div className="relative w-full max-w-4xl px-8 py-4 z-10">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
                style={{ background: 'rgba(21,93,252,0.08)', color: '#155dfc' }}>
                <span className="material-icons" style={{ fontSize: '12px' }}>calendar_today</span>
                Live Dashboard Preview
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Today's Sessions</h3>
              <p className="text-slate-500 mt-1 text-sm">Monitoring real-time student check-ins across campus.</p>
            </div>
            <div className="text-right mb-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Current Time</p>
              <p className="text-base font-bold text-slate-800">10:24 AM</p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="p-4 rounded-2xl flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderLeft: '5px solid #155dfc', boxShadow: '0 6px 24px 0 rgba(31,38,135,0.07)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ color: '#155dfc', background: 'rgba(21,93,252,0.05)' }}>Lec-402</span>
                  <h4 className="text-base font-bold text-slate-800 mt-2">Advanced Algorithms</h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                    <span className="material-icons" style={{ fontSize: '13px' }}>location_on</span>
                    <span className="text-xs font-medium">Lecture Hall B, Floor 2</span>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0">Active Now</div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Student Arrival</span>
                  <span className="text-xs font-bold" style={{ color: '#155dfc' }}>82 / 120</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(21,93,252,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: '68%', background: '#155dfc' }} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-300" />
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-400 flex items-center justify-center text-[9px] text-white font-bold">+79</div>
                </div>
                <span className="text-[10px] font-medium text-slate-400">Arrived recently</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-2xl flex flex-col gap-3 opacity-80" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderLeft: '5px solid #CBD5E1', boxShadow: '0 6px 24px 0 rgba(31,38,135,0.07)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">Sem-12</span>
                  <h4 className="text-base font-bold text-slate-800 mt-2">Quantum Computing</h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                    <span className="material-icons" style={{ fontSize: '13px' }}>location_on</span>
                    <span className="text-xs font-medium">Research Block - Room 10</span>
                  </div>
                </div>
                <div className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0">1:00 PM</div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Waitlist / Pre-check</span>
                  <span className="text-xs font-bold text-slate-400">0 / 45</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(21,93,252,0.06)' }}>
                  <div className="h-full bg-slate-200 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-4 rounded-2xl flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderLeft: '5px solid #155dfc', boxShadow: '0 6px 24px 0 rgba(31,38,135,0.07)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ color: '#155dfc', background: 'rgba(21,93,252,0.05)' }}>Lab-09</span>
                  <h4 className="text-base font-bold text-slate-800 mt-2">Network Security</h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                    <span className="material-icons" style={{ fontSize: '13px' }}>location_on</span>
                    <span className="text-xs font-medium">Cyber Lab 2, West Wing</span>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0">Live</div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Student Arrival</span>
                  <span className="text-xs font-bold" style={{ color: '#155dfc' }}>28 / 30</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(21,93,252,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: '93%', background: '#155dfc' }} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl flex flex-col justify-center items-center text-center" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 6px 24px 0 rgba(31,38,135,0.07)' }}>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-2" style={{ color: '#155dfc' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>group</span>
                </div>
                <p className="text-xl font-bold text-slate-800">92%</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Avg. Attendance</p>
              </div>
              <div className="p-4 rounded-2xl flex flex-col justify-center items-center text-center" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 6px 24px 0 rgba(31,38,135,0.07)' }}>
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <span className="material-icons" style={{ fontSize: '18px' }}>speed</span>
                </div>
                <p className="text-xl font-bold text-slate-800">4s</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Avg. Check-in Time</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fonts & Icons */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        .font-display { font-family: 'Lexend', sans-serif; }
        .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; display: inline-block; line-height: 1; text-transform: none; letter-spacing: normal; word-wrap: normal; white-space: nowrap; direction: ltr; }
      `}</style>
    </div>
  );
};

export default AuthLayout;