import React from 'react';
import { motion, useInView } from 'framer-motion';
import {
  QrCode,
  FileText,
  BarChart,
  Users,
  Clock,
  Shield,
  Zap,
  Download,
  Smartphone,
  Bell,
  CheckCircle,
  Lock,
  Globe,
  Key
} from 'lucide-react';

const Features = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  });

  const securityBadges = [
    { icon: Lock, label: 'SSO Login' },
    { icon: Shield, label: 'Secure HTTPS' },
    { icon: Key, label: 'Encrypted Passwords' },
    { icon: Globe, label: 'Google OAuth Login' },
  ];

  return (
    <section
      id="features"
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.06) 0%, transparent 50%)'
      }} />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Packed With Sleek Features
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Everything you need to manage attendance — beautifully designed and built for speed.
          </p>
        </motion.div>

        {/* ── ROW 1 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

          {/* QR Code Attendance — large card with visual mockup */}
          <motion.div {...fadeUp(0.05)}
            className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 p-8 flex flex-col justify-between min-h-[320px]"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">QR Code Attendance</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Offload the responsibility of check-ins to students — codes refresh every 30 seconds for security.
              </p>
            </div>
            {/* QR visual mockup */}
            <div className="mt-6 flex items-end gap-3">
              {[
                { label: 'Public Check-in QR', bg: 'bg-blue-600' },
                { label: 'Unique QR Pass', bg: 'bg-blue-500' },
                { label: 'Universal Check-in', bg: 'bg-blue-400' },
              ].map((card, i) => (
                <div key={i}
                  className="flex-1 rounded-2xl bg-gray-50 border border-gray-100 p-3 flex flex-col items-center gap-2 shadow-sm"
                  style={{ transform: `rotate(${(i - 1) * 3}deg) translateY(${i === 1 ? '-6px' : '0'})` }}
                >
                  {/* Mini QR placeholder */}
                  <div className="w-12 h-12 rounded-lg bg-gray-200 grid grid-cols-3 gap-0.5 p-1">
                    {[...Array(9)].map((_, j) => (
                      <div key={j} className={`rounded-sm ${[0,2,4,6,8].includes(j) ? 'bg-gray-800' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                  <div className={`w-full text-center text-[10px] font-semibold text-white py-1 rounded-lg ${card.bg}`}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Analytics / Reports — card with chart mockup */}
          <motion.div {...fadeUp(0.1)}
            className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 p-8 flex flex-col justify-between min-h-[320px]"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Reports</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Powerful reports to break down attendance by demographics, age, dates, status and more.
              </p>
            </div>
            {/* Chart mockup */}
            <div className="mt-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-700">Attendance Overview</span>
                <div className="flex gap-1">
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">Weekly</span>
                </div>
              </div>
              <div className="flex items-end gap-2 h-20">
                {[65, 80, 55, 90, 72, 88, 60].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${h}%`,
                        background: i === 3 ? 'linear-gradient(to top, #2563eb, #60a5fa)' : '#e5e7eb'
                      }}
                    />
                    <span className="text-[9px] text-gray-400">{['M','T','W','T','F','S','S'][i]}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Avg. Attendance</p>
                  <p className="text-lg font-bold text-gray-900">87.3%</p>
                </div>
                <Download className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── ROW 2 ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

          {/* Student Management */}
          <motion.div {...fadeUp(0.15)}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 p-7 flex flex-col"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Student Management</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Manage student records, class lists, and enrollment data all in one place.
            </p>
            {/* Mini student list */}
            <div className="mt-auto space-y-2">
              {['Ahmed Khan', 'Sara Ali', 'Bilal Raza'].map((name, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                    {name[0]}
                  </div>
                  <span className="text-xs text-gray-700 font-medium flex-1">{name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${i === 1 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
                    {i === 1 ? 'Absent' : 'Present'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Real-time Tracking */}
          <motion.div {...fadeUp(0.2)}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 p-7 flex flex-col"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-5 shadow-md">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time Tracking</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Monitor attendance live with instant updates the moment a student checks in.
            </p>
            {/* Live indicator */}
            <div className="mt-auto bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold text-gray-700">Live Session</span>
              </div>
              <div className="flex justify-between text-center">
                <div>
                  <p className="text-xl font-bold text-gray-900">34</p>
                  <p className="text-[10px] text-gray-400">Present</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-500">4</p>
                  <p className="text-[10px] text-gray-400">Absent</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-yellow-500">2</p>
                  <p className="text-[10px] text-gray-400">Late</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Automated Alerts */}
          <motion.div {...fadeUp(0.25)}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 p-7 flex flex-col"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-5 shadow-md">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Automated Alerts</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Get notified about low attendance, absences, and important updates automatically.
            </p>
            {/* Notification mockup */}
            <div className="mt-auto space-y-2">
              {[
                { text: 'Sara Ali is absent today', time: '9:02 AM', color: 'bg-red-50 border-red-100' },
                { text: 'Attendance below 75% alert', time: '9:15 AM', color: 'bg-yellow-50 border-yellow-100' },
              ].map((n, i) => (
                <div key={i} className={`flex items-start gap-2 rounded-xl px-3 py-2 border ${n.color}`}>
                  <Bell className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-700 leading-snug">{n.text}</p>
                    <p className="text-[10px] text-gray-400">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── ROW 3 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

          {/* Mobile Friendly */}
          <motion.div {...fadeUp(0.3)}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 p-8 flex flex-col justify-between min-h-[260px]"
          >
            <div>
              <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-5 shadow-md">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Friendly</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Access the platform seamlessly from any device — desktop, tablet, or smartphone.
              </p>
            </div>
            {/* Device bar */}
            <div className="mt-6 flex items-center gap-3">
              {['📱 Mobile', '💻 Desktop', '📟 Tablet'].map((d, i) => (
                <div key={i} className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold border ${i === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                  {d}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Manual Entry */}
          <motion.div {...fadeUp(0.35)}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 p-8 flex flex-col justify-between min-h-[260px]"
          >
            <div>
              <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-5 shadow-md">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manual Entry</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Manually mark attendance for students without devices or with technical issues.
              </p>
            </div>
            {/* Manual entry rows */}
            <div className="mt-6 space-y-2">
              {['Usman Tariq', 'Nadia Hussain'].map((name, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
                  <span className="text-xs font-medium text-gray-700">{name}</span>
                  <div className="flex gap-2">
                    <button className="text-[10px] bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-lg">P</button>
                    <button className="text-[10px] bg-red-100 text-red-500 font-semibold px-2 py-0.5 rounded-lg">A</button>
                    <button className="text-[10px] bg-yellow-100 text-yellow-600 font-semibold px-2 py-0.5 rounded-lg">L</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── SECURITY BANNER ── */}
        <motion.div {...fadeUp(0.4)}
          className="rounded-3xl bg-white border border-gray-100 shadow-sm p-10 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full mb-5">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Enterprise Security</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Backed by Industry-Standard Security
          </h3>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-8">
            We take data security seriously. Your data is never sold, and all systems are hosted in secure, encrypted infrastructure.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {securityBadges.map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200">
                <Icon className="w-4 h-4 text-blue-500" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Features;