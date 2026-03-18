import React, { useState, useEffect } from 'react';

const LiveDashboardPreview = () => {
  const [sessions, setSessions] = useState([]);
  const [displaySessions, setDisplaySessions] = useState([]);

  // Blue color code used throughout the component
  const BLUE_COLOR = '#155dfc';

  // Generate 12 dummy subjects with random attendance data (present < total)
  const generateDummySessions = () => {
    const dummySubjects = [
      { code: "CS-402", title: "Advanced Algorithms" },
      { code: "CS-305", title: "Database Management Systems" },
      { code: "EE-201", title: "Digital Logic Design" },
      { code: "CS-310", title: "Operating Systems" },
      { code: "CS-350", title: "Computer Networks" },
      { code: "EE-220", title: "Circuit Analysis" },
      { code: "MATH-201", title: "Linear Algebra" },
      { code: "CS-340", title: "Artificial Intelligence" },
      { code: "CS-330", title: "Software Engineering" },
      { code: "EE-240", title: "Microprocessors" },
      { code: "CS-320", title: "Web Development" },
      { code: "CS-360", title: "Cybersecurity Fundamentals" }
    ];

    return dummySubjects.map(subject => {
      // Generate total first (between 60-75)
      const total = Math.floor(Math.random() * (75 - 60 + 1) + 60);
      // Generate present that is always less than total (between 45 and total-1)
      const maxPresent = Math.min(65, total - 1); // Ensure present doesn't exceed total-1
      const minPresent = 45;
      const present = Math.floor(Math.random() * (maxPresent - minPresent + 1) + minPresent);
      
      return {
        ...subject,
        location: "Spring-2026",
        present,
        total
      };
    });
  };

  // Initialize sessions and first set of display sessions
  useEffect(() => {
    const allSessions = generateDummySessions();
    setSessions(allSessions);
    setDisplaySessions(allSessions.slice(0, 3));
  }, []);

  // Update displayed sessions every 1 minutes (60000 ms)
  useEffect(() => {
    if (sessions.length === 0) return;

    let currentIndex = 0;
    
    const rotationInterval = setInterval(() => {
      setDisplaySessions(prevDisplay => {
        // Calculate next set of 3 sessions
        const totalSessions = sessions.length;
        currentIndex = (currentIndex + 3) % totalSessions;
        
        // If we're near the end, wrap around to the beginning
        if (currentIndex + 3 > totalSessions) {
          const remaining = totalSessions - currentIndex;
          const wrapAround = 3 - remaining;
          return [
            ...sessions.slice(currentIndex),
            ...sessions.slice(0, wrapAround)
          ];
        }
        
        return sessions.slice(currentIndex, currentIndex + 3);
      });
    }, ); // 1 minutes

    return () => clearInterval(rotationInterval);
  }, [sessions]);

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
      <div className="relative w-full max-w-4xl px-8 py-4 z-10">
        {/* Header Section */}
        <DashboardHeader blueColor={BLUE_COLOR} />

        {/* First Row - First 2 Subject Boxes */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {displaySessions.slice(0, 2).map((session, index) => (
            <SessionCard
              key={`${session.code}-${index}`}
              code={session.code}
              title={session.title}
              location={session.location}
              present={session.present}
              total={session.total}
              blueColor={BLUE_COLOR}
            />
          ))}
        </div>

        {/* Second Row - Third Subject Box + Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Third Subject Box */}
          {displaySessions.slice(2, 3).map((session, index) => (
            <SessionCard
              key={`${session.code}-${index}`}
              code={session.code}
              title={session.title}
              location={session.location}
              present={session.present}
              total={session.total}
              blueColor={BLUE_COLOR}
            />
          ))}

          {/* Stats Cards - Side by side in one box */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon="group"
              value="92%"
              label="Avg. Attendance"
              color={BLUE_COLOR}
              bgColor="bg-blue-50"
            />
            <StatCard
              icon="speed"
              value="14.3s"
              label="Avg. Check-in Time"
              color="#059669"
              bgColor="bg-emerald-50"
            />
          </div>
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
          Spring 2026 • {formattedDate}
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
      className="p-4 rounded-xl flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200"
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
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{
              color: blueColor,
              background: `rgba(21,93,252,0.05)`
            }}
          >
            {code}
          </span>
          <h4 className="text-sm font-bold text-slate-800 mt-2 line-clamp-1">{title}</h4>
          <div className="flex items-center gap-1 mt-1 text-slate-500">
            <span className="material-icons" style={{ fontSize: '11px' }}>event</span>
            <span className="text-[9px] font-medium">{location}</span>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase shrink-0">
          Live
        </div>
      </div>

      {/* Attendance Section */}
      <div className="mt-2">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase">Mark Attendance</span>
          <span className="text-[11px] font-bold" style={{ color: blueColor }}>
            {present} / {total}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: `rgba(21,93,252,0.06)` }}>
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
      className="p-4 rounded-xl flex flex-col justify-center items-center text-center transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 6px 24px 0 rgba(31,38,135,0.07)'
      }}
    >
      <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center mb-2`} style={{ color }}>
        <span className="material-icons" style={{ fontSize: '18px' }}>{icon}</span>
      </div>
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  );
};

export default LiveDashboardPreview;