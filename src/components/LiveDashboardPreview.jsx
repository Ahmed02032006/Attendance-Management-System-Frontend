import React from 'react';

const LiveDashboardPreview = () => {
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
      <div className="relative w-full max-w-4xl px-8 py-4 z-10">
        {/* Header Section */}
        <DashboardHeader />
        
        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          <SessionCard 
            type="lecture"
            code="Lec-402"
            title="Advanced Algorithms"
            location="Lecture Hall B, Floor 2"
            status="active"
            current={82}
            total={120}
            recentCount={79}
          />
          
          <SessionCard 
            type="seminar"
            code="Sem-12"
            title="Quantum Computing"
            location="Research Block - Room 10"
            status="upcoming"
            current={0}
            total={45}
            time="1:00 PM"
          />
          
          <SessionCard 
            type="lab"
            code="Lab-09"
            title="Network Security"
            location="Cyber Lab 2, West Wing"
            status="live"
            current={28}
            total={30}
          />
          
          {/* Stats Cards */}
          <StatsGrid />
        </div>
      </div>
    </main>
  );
};

// Dashboard Header Component
const DashboardHeader = () => {
  const currentTime = new Date().toLocaleTimeString('en-US', { 
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
          <span className="material-icons" style={{ fontSize: '12px' }}>calendar_today</span>
          Live Dashboard Preview
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Today's Sessions</h3>
        <p className="text-slate-500 mt-1 text-sm">
          Monitoring real-time student check-ins across campus.
        </p>
      </div>
      <div className="text-right mb-1">
        <p className="text-[9px] font-bold text-slate-400 uppercase">Current Time</p>
        <p className="text-base font-bold text-slate-800">{currentTime}</p>
      </div>
    </div>
  );
};

// Session Card Component
const SessionCard = ({ type, code, title, location, status, current, total, recentCount, time }) => {
  const getStatusStyles = () => {
    switch(status) {
      case 'active':
      case 'live':
        return {
          badge: 'bg-emerald-50 text-emerald-600',
          borderColor: '#155dfc',
          text: status === 'live' ? 'Live' : 'Active Now'
        };
      case 'upcoming':
        return {
          badge: 'bg-slate-100 text-slate-500',
          borderColor: '#CBD5E1',
          text: time || 'Upcoming'
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-500',
          borderColor: '#CBD5E1',
          text: status
        };
    }
  };

  const statusStyles = getStatusStyles();
  const percentage = Math.round((current / total) * 100);

  return (
    <div 
      className="p-4 rounded-2xl flex flex-col gap-3"
      style={{ 
        background: 'rgba(255,255,255,0.75)', 
        backdropFilter: 'blur(12px)', 
        border: '1px solid rgba(255,255,255,0.5)', 
        borderLeft: `5px solid ${statusStyles.borderColor}`, 
        boxShadow: '0 6px 24px 0 rgba(31,38,135,0.07)',
        opacity: status === 'upcoming' ? 0.8 : 1
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <span 
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ 
              color: status === 'upcoming' ? '#64748B' : '#155dfc', 
              background: status === 'upcoming' ? '#F1F5F9' : 'rgba(21,93,252,0.05)' 
            }}
          >
            {code}
          </span>
          <h4 className="text-base font-bold text-slate-800 mt-2">{title}</h4>
          <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
            <span className="material-icons" style={{ fontSize: '13px' }}>location_on</span>
            <span className="text-xs font-medium">{location}</span>
          </div>
        </div>
        <div className={`${statusStyles.badge} px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0`}>
          {statusStyles.text}
        </div>
      </div>

      {/* Progress Bar - Only show for active/live sessions */}
      {status !== 'upcoming' && (
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Student Arrival</span>
            <span className="text-xs font-bold" style={{ color: '#155dfc' }}>
              {current} / {total}
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(21,93,252,0.06)' }}>
            <div 
              className="h-full rounded-full" 
              style={{ width: `${percentage}%`, background: '#155dfc' }} 
            />
          </div>
        </div>
      )}

      {/* Recent arrivals - Only show for active sessions */}
      {status === 'active' && recentCount && (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1.5">
            <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
            <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-300" />
            <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-400 flex items-center justify-center text-[9px] text-white font-bold">
              +{recentCount}
            </div>
          </div>
          <span className="text-[10px] font-medium text-slate-400">Arrived recently</span>
        </div>
      )}
    </div>
  );
};

// Stats Grid Component
const StatsGrid = () => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard 
        icon="group"
        value="92%"
        label="Avg. Attendance"
        color="#155dfc"
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
  );
};

// Stat Card Component
const StatCard = ({ icon, value, label, color, bgColor }) => {
  return (
    <div 
      className="p-4 rounded-2xl flex flex-col justify-center items-center text-center"
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
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  );
};

export default LiveDashboardPreview;