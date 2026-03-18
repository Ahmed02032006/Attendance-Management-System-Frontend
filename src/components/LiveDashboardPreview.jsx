import React, { useState, useEffect } from 'react';

const LiveDashboardPreview = () => {
  const [sessions, setSessions] = useState([]);

  // Blue color code used throughout the component
  const BLUE_COLOR = '#155dfc';

  // Generate 12 dummy subjects with random attendance data
  const generateDummySessions = () => {
    const dummySubjects = [
      { code: "CS-402", title: "Advanced Algorithms" },
      { code: "CS-305", title: "Database Management Systems" },
      { code: "EE-201", title: "Digital Logic Design" },
      { code: "CS-401", title: "Computer Networks" },
      { code: "MT-302", title: "Linear Algebra" },
      { code: "CS-310", title: "Web Development" },
      { code: "CS-450", title: "Artificial Intelligence" },
      { code: "EE-310", title: "Microprocessors" },
      { code: "MT-201", title: "Calculus II" },
      { code: "PHY-301", title: "Quantum Physics" },
      { code: "CS-320", title: "Operating Systems" },
      { code: "SE-401", title: "Software Engineering" }
    ];

    return dummySubjects.map(subject => ({
      ...subject,
      location: "Spring-2026",
      present: Math.floor(Math.random() * (65 - 45 + 1) + 45), // Random between 45-65
      total: Math.floor(Math.random() * (75 - 60 + 1) + 60) // Random between 60-75
    }));
  };

  // Initialize sessions
  useEffect(() => {
    setSessions(generateDummySessions());
  }, []);

  // Update attendance every 5 minutes (300000 ms)
  useEffect(() => {
    const attendanceInterval = setInterval(() => {
      setSessions(prevSessions =>
        prevSessions.map(session => ({
          ...session,
          present: Math.floor(Math.random() * (65 - 45 + 1) + 45), // Random between 45-65
          total: Math.floor(Math.random() * (75 - 60 + 1) + 60) // Random between 60-75
        }))
      );
    }, 300000); // 5 minutes

    return () => clearInterval(attendanceInterval);
  }, []);

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
        background: `rgba(21,93,252,0.05)`,
        filter: 'blur(120px)'
      }} />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 rounded-full" style={{
        background: `rgba(21,93,252,0.05)`,
        filter: 'blur(100px)'
      }} />

      {/* Main Content */}
      <div className="relative w-full max-w-6xl px-8 py-4 z-10 overflow-y-auto max-h-screen">
        {/* Header Section */}
        <DashboardHeader blueColor={BLUE_COLOR} />

        {/* Cards Grid - 4 cards per row for 12 subjects */}
        <div className="grid grid-cols-4 gap-4">
          {sessions.map((session, index) => (
            <SessionCard
              key={index}
              code={session.code}
              title={session.title}
              location={session.location}
              present={session.present}
              total={session.total}
              blueColor={BLUE_COLOR}
            />
          ))}
        </div>

        {/* Stats Cards - Full width at bottom */}
        <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
          <StatCard
            icon="group"
            value="92%"
            label="Avg. Attendance"
            color={BLUE_COLOR}
            bgColor="bg-blue-50"
          />
          <StatCard
            icon="speed"
            value="4s"
            label="Avg. Check-in Time"
            color="#059669"
            bgColor="bg-emerald-50"
          />
        </div>
      </div>
    </main>
  );
};

// Dashboard Header Component
const DashboardHeader = ({ blueColor }) => {
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

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
          style={{ background: `rgba(21,93,252,0.08)`, color: blueColor }}
        >
          <span className="material-icons" style={{ fontSize: '12px' }}>dashboard</span>
          Live Dashboard Preview
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Today's Sessions</h3>
        <p className="text-slate-500 mt-1 text-sm">
          Spring 2026 • {formattedDate} • 12 Active Sessions
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
const SessionCard = ({ code, title, location, present, total, blueColor }) => {
  const percentage = Math.round((present / total) * 100);

  return (
    <div
      className="p-3 rounded-xl flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200"
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.5)',
        borderLeft: `5px solid ${blueColor}`,
        boxShadow: '0 6px 24px 0 rgba(31,38,135,0.07)',
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              color: blueColor,
              background: `rgba(21,93,252,0.05)`
            }}
          >
            {code}
          </span>
          <h4 className="text-xs font-bold text-slate-800 mt-1.5 line-clamp-1">{title}</h4>
          <div className="flex items-center gap-1 mt-1 text-slate-500">
            <span className="material-icons" style={{ fontSize: '10px' }}>event</span>
            <span className="text-[8px] font-medium">{location}</span>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase shrink-0">
          Live
        </div>
      </div>

      {/* Attendance Section */}
      <div className="mt-1">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[8px] font-bold text-slate-500 uppercase">Attendance</span>
          <span className="text-[10px] font-bold" style={{ color: blueColor }}>
            {present} / {total}
          </span>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: `rgba(21,93,252,0.06)` }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, background: blueColor }}
          />
        </div>
      </div>
    </div>
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