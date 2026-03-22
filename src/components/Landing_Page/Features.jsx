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
  Lock,
  Globe,
  Key,
  TrendingUp,
  Calendar,
  CheckCircle
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
    { icon: Lock, label: 'SSO Login', color: 'from-blue-500 to-blue-600' },
    { icon: Shield, label: 'Secure HTTPS', color: 'from-indigo-500 to-indigo-600' },
    { icon: Key, label: 'Encrypted Passwords', color: 'from-purple-500 to-purple-600' },
    { icon: Globe, label: 'Google OAuth', color: 'from-cyan-500 to-cyan-600' },
  ];

  return (
    <section
      id="features"
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
      style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/30 via-transparent to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div {...fadeUp(0)} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            Packed With{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Sleek Features
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Everything you need to manage attendance — beautifully designed, intelligently built, and optimized for speed.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="space-y-6">
          {/* Row 1 - QR & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code Attendance Card */}
            <motion.div
              {...fadeUp(0.05)}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-8"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">QR Code Attendance</h3>
                <p className="text-gray-500 text-base mb-6">
                  Students scan to check-in instantly. Codes refresh every 30 seconds for maximum security and prevent sharing.
                </p>
                
                {/* QR Visual Mockup */}
                <div className="mt-6 flex items-end gap-3">
                  {[
                    { label: 'Public Check-in', bg: 'bg-gradient-to-br from-blue-600 to-blue-500' },
                    { label: 'Unique QR Pass', bg: 'bg-gradient-to-br from-indigo-600 to-indigo-500' },
                    { label: 'Universal Code', bg: 'bg-gradient-to-br from-cyan-600 to-cyan-500' },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-xl bg-gray-50 border border-gray-100 p-4 flex flex-col items-center gap-3 transition-all group-hover:transform"
                      style={{ transform: `translateY(${i === 1 ? '-8px' : '0'})` }}
                    >
                      <div className="w-16 h-16 rounded-xl bg-white shadow-sm grid grid-cols-3 gap-1 p-2">
                        {[...Array(9)].map((_, j) => (
                          <div
                            key={j}
                            className={`rounded-sm ${[0, 2, 4, 6, 8].includes(j) ? 'bg-gray-800' : 'bg-gray-300'}`}
                          />
                        ))}
                      </div>
                      <div className={`w-full text-center text-xs font-semibold text-white py-2 rounded-lg ${card.bg}`}>
                        {card.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Analytics & Reports Card */}
            <motion.div
              {...fadeUp(0.1)}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-8"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                  <BarChart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Analytics & Reports</h3>
                <p className="text-gray-500 text-base mb-6">
                  Powerful insights with detailed reports. Filter by date, class, student, or attendance status.
                </p>
                
                {/* Chart Mockup */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Weekly Attendance Trend</p>
                      <p className="text-2xl font-bold text-gray-900">87.3%</p>
                    </div>
                    <Download className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors" />
                  </div>
                  <div className="flex items-end gap-2 h-32">
                    {[72, 85, 68, 92, 88, 79, 84].map((value, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full rounded-lg transition-all duration-300 group-hover:scale-105"
                          style={{
                            height: `${value}%`,
                            background: `linear-gradient(to top, ${value > 80 ? '#10b981' : '#3b82f6'}, ${value > 80 ? '#34d399' : '#60a5fa'})`,
                            opacity: 0.9
                          }}
                        />
                        <span className="text-[10px] text-gray-400 font-medium">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Row 2 - Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Management */}
            <motion.div
              {...fadeUp(0.15)}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Student Management</h3>
              <p className="text-gray-500 text-sm mb-4">
                Manage student records, class lists, and enrollment data in one centralized dashboard.
              </p>
              <div className="space-y-2 mt-auto">
                {[
                  { name: 'Ahmed Khan', status: 'Present', statusColor: 'green' },
                  { name: 'Sara Ali', status: 'Absent', statusColor: 'red' },
                  { name: 'Bilal Raza', status: 'Present', statusColor: 'green' },
                ].map((student, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                        {student.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{student.name}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      student.status === 'Present' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Real-time Tracking */}
            <motion.div
              {...fadeUp(0.2)}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Tracking</h3>
              <p className="text-gray-500 text-sm mb-4">
                Monitor attendance live with instant updates the moment a student checks in.
              </p>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-semibold text-gray-700">Live Session Active</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">34</p>
                    <p className="text-xs text-gray-500">Present</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-500">4</p>
                    <p className="text-xs text-gray-500">Absent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-500">2</p>
                    <p className="text-xs text-gray-500">Late</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Automated Alerts */}
            <motion.div
              {...fadeUp(0.25)}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mb-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Alerts</h3>
              <p className="text-gray-500 text-sm mb-4">
                Get notified about low attendance, absences, and important updates automatically.
              </p>
              <div className="space-y-2">
                {[
                  { text: 'Sara Ali is absent today', time: '9:02 AM', type: 'warning' },
                  { text: 'Attendance below 75% alert', time: '9:15 AM', type: 'alert' },
                ].map((alert, i) => (
                  <div key={i} className={`flex items-start gap-2 rounded-xl px-3 py-2 ${
                    alert.type === 'warning' ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'
                  }`}>
                    <Bell className="w-3 h-3 mt-0.5 text-gray-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-700 leading-relaxed">{alert.text}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Row 3 - Mobile & Manual Entry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mobile Friendly */}
            <motion.div
              {...fadeUp(0.3)}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-8"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Mobile Friendly</h3>
              <p className="text-gray-500 text-base mb-6">
                Access the platform seamlessly from any device — desktop, tablet, or smartphone.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {['📱 Mobile', '💻 Desktop', '📟 Tablet'].map((device, i) => (
                  <div
                    key={i}
                    className={`text-center py-3 rounded-xl text-sm font-semibold transition-all ${
                      i === 0
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 border border-gray-100 hover:border-blue-200'
                    }`}
                  >
                    {device}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Manual Entry */}
            <motion.div
              {...fadeUp(0.35)}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-8"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Manual Entry</h3>
              <p className="text-gray-500 text-base mb-6">
                Manually mark attendance for students without devices or those experiencing technical issues.
              </p>
              <div className="space-y-2">
                {[
                  { name: 'Usman Tariq', status: 'Present' },
                  { name: 'Nadia Hussain', status: 'Absent' },
                ].map((student, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">{student.name}</span>
                    <div className="flex gap-2">
                      {['P', 'A', 'L'].map((mark) => (
                        <button
                          key={mark}
                          className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                            (mark === 'P' && student.status === 'Present') ||
                            (mark === 'A' && student.status === 'Absent')
                              ? mark === 'P'
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          }`}
                        >
                          {mark}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Security Banner */}
        <motion.div
          {...fadeUp(0.4)}
          className="mt-12 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm p-10 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-5 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Enterprise-Grade Security</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Backed by Industry-Standard Security
            </h3>
            <p className="text-gray-500 max-w-2xl mx-auto mb-8">
              Your data is never sold. All systems are hosted in secure, encrypted infrastructure with enterprise-grade protection.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {securityBadges.map(({ icon: Icon, label, color }, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:border-transparent hover:shadow-md transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, white, white)`,
                  }}
                >
                  <div className={`w-6 h-6 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;