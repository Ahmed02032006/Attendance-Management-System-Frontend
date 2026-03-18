import React, { useState, useEffect } from 'react';

const LiveDashboardPreview = () => {
  const [stats, setStats] = useState({
    avgAttendance: 92,
    avgCheckInTime: 4
  });

  // Simulate changing stats every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        avgAttendance: Math.floor(Math.random() * (96 - 88 + 1) + 88), // Random between 88-96%
        avgCheckInTime: (Math.random() * (6 - 3) + 3).toFixed(1) // Random between 3-6 seconds
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Generate random attendance data for each card
  const getRandomAttendance = () => {
    const present = Math.floor(Math.random() * (65 - 45 + 1) + 45); // Random between 45-65
    const total = Math.floor(Math.random() * (75 - 55 + 1) + 55); // Random between 55-75
    return { present, total };
  };

  // Dummy data for sessions
  const sessions = [
    {
      code: "CS-402",
      title: "Advanced Algorithms",
      location: "Spring-2026",
      attendance: getRandomAttendance()
    },
    {
      code: "CS-305",
      title: "Database Management Systems",
      location: "Spring-2026",
      attendance: getRandomAttendance()
    },
    {
      code: "EE-201",
      title: "Digital Logic Design",
      location: "Spring-2026",
      attendance: getRandomAttendance()
    },
    {
      code: "CS-401",
      title: "Computer Networks",
      location: "Spring-2026",
      attendance: getRandomAttendance()
    },
    {
      code: "MT-302",
      title: "Linear Algebra",
      location: "Spring-2026",
      attendance: getRandomAttendance()
    },
    {
      code: "CS-310",
      title: "Web Development",
      location: "Spring-2026",
      attendance: getRandomAttendance()
    }
  ];

  return (
    <main
      className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
      style={{ background: '#F8FAFC' }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-40" style={{ 
        backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', 
        backgroundSize: '28px 28px' 
      }} />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 rounded-full" style={{ 
        background: 'rgba(21,93,252,0.05)', 
        filter: 'blur(120px)' 
      }} />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 rounded-full" style={{ 
        background: 'rgba(21,93,252,0.05)', 
        filter: 'blur(100px)' 
      }} />

      {/* Main Content */}
      <div className="relative w-full max-w-5xl px-8 py-4 z-10">
        {/* Header Section */}
        <DashboardHeader />
        
        {/* Cards Grid - 3x2 layout */}
        <div className="grid grid-cols-3 gap-4">
          {sessions.map((session, index) => (
            <SessionCard 
              key={index}
              code={session.code}
              title={session.title}
              location={session.location}
              present={session.attendance.present}
              total={session.attendance.total}
            />
          ))}
        </div>

        {/* Stats Cards - Full width at bottom */}
        <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
          <StatsGrid 
            avgAttendance={stats.avgAttendance}
            avgCheckInTime={stats.avgCheckInTime}
          />
        </div>
      </div>
    </main>
  );
};

// Dashboard Header Component
const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
          style={{ background: 'rgba(21,93,252,0.08)', color: '#155dfc' }}
        >
          <span className="material-icons" style={{ fontSize: '12px' }}>dashboard</span>
          Live Dashboard Preview
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Today's Sessions</h3>
        <p className="text-slate-500 mt-1 text-sm">
          Spring 2026 • Real-time attendance monitoring
        </p>
      </div>
      <div className="text-right mb-1">
        <p className="text-[9px] font-bold text-slate-400 uppercase">Current Time</p>
        <p className="text-base font-bold text-slate-800">{formattedTime}</p>
      </div>
    </div>
  );
};

// Session Card Component
const SessionCard = ({ code, title, location, present, total }) => {
  const percentage = Math.round((present / total) * 100);

  return (
    <div 
      className="p-4 rounded-2xl flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200"
      style={{ 
        background: 'rgba(255,255,255,0.75)', 
        backdropFilter: 'blur(12px)', 
        border: '1px solid rgba(255,255,255,0.5)', 
        borderLeft: '5px solid #155dfc', 
        boxShadow: '0 6px 24px 0 rgba(31,38,135,0.07)',
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <span 
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ 
              color: '#155dfc', 
              background: 'rgba(21,93,252,0.05)' 
            }}
          >
            {code}
          </span>
          <h4 className="text-sm font-bold text-slate-800 mt-2 line-clamp-1">{title}</h4>
          <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
            <span className="material-icons" style={{ fontSize: '12px' }}>event</span>
            <span className="text-[10px] font-medium">{location}</span>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase shrink-0">
          Live
        </div>
      </div>

      {/* Attendance Section */}
      <div>
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-[9px] font-bold text-slate-500 uppercase">Mark Attendance</span>
          <span className="text-xs font-bold" style={{ color: '#155dfc' }}>
            {present} / {total}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(21,93,252,0.06)' }}>
          <div 
            className="h-full rounded-full transition-all duration-500" 
            style={{ width: `${percentage}%`, background: '#155dfc' }} 
          />
        </div>
        <p className="text-[8px] text-slate-400 mt-1.5 text-right">
          {percentage}% attendance rate
        </p>
      </div>
    </div>
  );
};

// Stats Grid Component
const StatsGrid = ({ avgAttendance, avgCheckInTime }) => {
  return (
    <>
      <StatCard 
        icon="group"
        value={`${avgAttendance}%`}
        label="Avg. Attendance"
        color="#155dfc"
        bgColor="bg-blue-50"
      />
      <StatCard 
        icon="speed"
        value={`${avgCheckInTime}s`}
        label="Avg. Check-in Time"
        color="#059669"
        bgColor="bg-emerald-50"
      />
    </>
  );
};

// Stat Card Component
const StatCard = ({ icon, value, label, color, bgColor }) => {
  return (
    <div 
      className="p-3 rounded-xl flex flex-col justify-center items-center text-center transition-all duration-300"
      style={{ 
        background: 'rgba(255,255,255,0.75)', 
        backdropFilter: 'blur(12px)', 
        border: '1px solid rgba(255,255,255,0.5)', 
        boxShadow: '0 6px 24px 0 rgba(31,38,135,0.07)' 
      }}
    >
      <div className={`w-7 h-7 rounded-full ${bgColor} flex items-center justify-center mb-1.5`} style={{ color }}>
        <span className="material-icons" style={{ fontSize: '16px' }}>{icon}</span>
      </div>
      <p className="text-base font-bold text-slate-800">{value}</p>
      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  );
};

export default LiveDashboardPreview;