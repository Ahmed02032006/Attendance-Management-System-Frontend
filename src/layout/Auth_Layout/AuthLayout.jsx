import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex h-screen w-full font-display overflow-hidden">
      {/* Left Panel - Form */}
      <aside
        className="w-full lg:w-[38%] xl:w-[32%] h-full z-20 flex flex-col overflow-y-auto"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(0,71,171,0.08)',
        }}
      >
        {/* Logo */}
        <div className="px-8 lg:px-12 pt-10 pb-0 mb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: '#0047AB',
                boxShadow: '0 8px 24px rgba(0,71,171,0.22)',
              }}
            >
              <span className="material-symbols-outlined text-white text-2xl">verified_user</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#0047AB' }}>
                ATTENDANCE
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Faculty Portal
              </p>
            </div>
          </div>
        </div>

        {/* Form outlet */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-12 py-6">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="px-8 lg:px-12 pb-8 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>© 2024 EDU-SYSTEM</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-blue-700 transition-colors">IT Helpdesk</a>
              <a href="#" className="hover:text-blue-700 transition-colors">Guidelines</a>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Panel - Dashboard Preview */}
      <main
        className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{ background: '#F8FAFC' }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Blobs */}
        <div
          className="absolute top-0 right-0 w-1/2 h-1/2 rounded-full"
          style={{ background: 'rgba(0,71,171,0.05)', filter: 'blur(120px)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-1/3 h-1/3 rounded-full"
          style={{ background: 'rgba(59,130,246,0.05)', filter: 'blur(100px)' }}
        />

        <div className="relative w-full max-w-5xl px-12 py-8 z-10">
          {/* Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4"
                style={{ background: 'rgba(0,71,171,0.08)', color: '#0047AB' }}
              >
                <span className="material-icons text-sm">calendar_today</span>
                Live Dashboard Preview
              </div>
              <h3 className="text-4xl font-bold text-slate-900">Today's Sessions</h3>
              <p className="text-slate-500 mt-2 text-lg">Monitoring real-time student check-ins across campus.</p>
            </div>
            <div className="text-right mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Current Time</p>
              <p className="text-xl font-bold text-slate-800">10:24 AM</p>
            </div>
          </div>

          {/* Session Cards Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Card 1 */}
            <div
              className="p-6 rounded-2xl flex flex-col gap-4 border-l-[6px]"
              style={{
                borderLeftColor: '#0047AB',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderLeft: '6px solid #0047AB',
                boxShadow: '0 8px 32px 0 rgba(31,38,135,0.07)',
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
                    style={{ color: '#0047AB', background: 'rgba(0,71,171,0.05)' }}
                  >
                    Lec-402
                  </span>
                  <h4 className="text-xl font-bold text-slate-800 mt-3">Advanced Algorithms</h4>
                  <div className="flex items-center gap-2 mt-1 text-slate-500">
                    <span className="material-icons text-sm">location_on</span>
                    <span className="text-sm font-medium">Lecture Hall B, Floor 2</span>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                  Active Now
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Student Arrival</span>
                  <span className="text-sm font-bold" style={{ color: '#0047AB' }}>82 / 120</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,71,171,0.05)' }}>
                  <div className="h-full rounded-full" style={{ width: '68%', background: '#0047AB' }} />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-400 flex items-center justify-center text-[10px] text-white font-bold">+79</div>
                </div>
                <span className="text-xs font-medium text-slate-400">Arrived recently</span>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="p-6 rounded-2xl flex flex-col gap-4 opacity-80"
              style={{
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderLeft: '6px solid #CBD5E1',
                boxShadow: '0 8px 32px 0 rgba(31,38,135,0.07)',
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
                    Sem-12
                  </span>
                  <h4 className="text-xl font-bold text-slate-800 mt-3">Quantum Computing</h4>
                  <div className="flex items-center gap-2 mt-1 text-slate-500">
                    <span className="material-icons text-sm">location_on</span>
                    <span className="text-sm font-medium">Research Block - Room 10</span>
                  </div>
                </div>
                <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase">1:00 PM</div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Waitlist / Pre-check</span>
                  <span className="text-sm font-bold text-slate-400">0 / 45</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,71,171,0.05)' }}>
                  <div className="h-full bg-slate-200 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div
              className="p-6 rounded-2xl flex flex-col gap-4"
              style={{
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderLeft: '6px solid #0047AB',
                boxShadow: '0 8px 32px 0 rgba(31,38,135,0.07)',
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded" style={{ color: '#0047AB', background: 'rgba(0,71,171,0.05)' }}>
                    Lab-09
                  </span>
                  <h4 className="text-xl font-bold text-slate-800 mt-3">Network Security</h4>
                  <div className="flex items-center gap-2 mt-1 text-slate-500">
                    <span className="material-icons text-sm">location_on</span>
                    <span className="text-sm font-medium">Cyber Lab 2, West Wing</span>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Live</div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Student Arrival</span>
                  <span className="text-sm font-bold" style={{ color: '#0047AB' }}>28 / 30</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,71,171,0.05)' }}>
                  <div className="h-full rounded-full" style={{ width: '93%', background: '#0047AB' }} />
                </div>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className="p-5 rounded-2xl flex flex-col justify-center items-center text-center"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.07)',
                }}
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3" style={{ color: '#0047AB' }}>
                  <span className="material-icons text-xl">group</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">92%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg. Attendance</p>
              </div>
              <div
                className="p-5 rounded-2xl flex flex-col justify-center items-center text-center"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.07)',
                }}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <span className="material-icons text-xl">speed</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">4s</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avg. Check-in Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom badge */}
        <div
          className="absolute bottom-10 right-10 flex items-center gap-3 px-5 py-2.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(203,213,225,0.5)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <span className="material-icons text-sm" style={{ color: '#0047AB' }}>lan</span>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Network Node: Central-01</span>
        </div>
      </main>

      {/* Google Material Symbols */}
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