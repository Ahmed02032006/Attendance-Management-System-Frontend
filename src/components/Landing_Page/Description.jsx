import React from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, XCircle, Download, Users } from 'lucide-react';

const Description = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  });

  const fadeLeft = (delay = 0) => ({
    initial: { opacity: 0, x: -30 },
    animate: isInView ? { opacity: 1, x: 0 } : {},
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  });

  const fadeRight = (delay = 0) => ({
    initial: { opacity: 0, x: 30 },
    animate: isInView ? { opacity: 1, x: 0 } : {},
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  });

  const reportFeatures = [
    {
      title: 'Know Who\'s There (and Who\'s Not)',
      body: (
        <>See <strong>who's showing up</strong> and who's missing — across every class and session, in real-time.</>
      ),
    },
    {
      title: 'Prove the Impact of Your Classes',
      body: (
        <>Share <strong>clear attendance data</strong> with department heads or parents to demonstrate program effectiveness.</>
      ),
    },
    {
      title: 'Spend Less Time Counting Heads',
      body: (
        <>Forget multiple spreadsheets or handwritten lists. <strong>Free up time</strong> to focus on teaching, planning, and students.</>
      ),
    },
    {
      title: 'Plan Better Schedules and Activities',
      body: (
        <>Make <strong>better decisions</strong> about staffing and resources based on real attendance trends.</>
      ),
    },
  ];

  const columns = [
    {
      title: 'Paper Sign-ins',
      highlighted: false,
      items: [
        { ok: true, text: 'Simple for small classes.' },
        { ok: false, text: 'Hard to manage and analyze data.' },
        { ok: false, text: 'Requires physical presence, security risks.' },
        { ok: false, text: 'Error prone.' },
        { ok: false, text: 'No integration or scalability.' },
      ],
    },
    {
      title: 'Digital Tools (Sheets, Forms)',
      highlighted: false,
      items: [
        { ok: true, text: 'Accessible from any device.' },
        { ok: false, text: 'Hard to manage multiple sheets across teams.' },
        { ok: false, text: 'Needs add-ons for full functionality.' },
        { ok: false, text: 'Limited customization and scalability.' },
        { ok: true, text: 'Free with a Google account.' },
      ],
    },
    {
      title: 'Attmark',
      highlighted: true,
      items: [
        { ok: true, text: 'Real-time tracking with reports, time, location, and photos.' },
        { ok: true, text: 'Designed for small to large classes and teams.' },
        { ok: true, text: 'Multiple ways to check-in: QR codes, kiosks, manual entry.' },
        { ok: true, text: 'Fully customizable to your university\'s needs.' },
        { ok: true, text: 'Integrates with APIs and exports to Excel or PDF.' },
      ],
    },
  ];

  // ── Dashboard mockup rows
  const mockupRows = [
    { name: 'Ahmed Khan', pct: '92%', color: 'text-green-600' },
    { name: 'Sara Ali', pct: '68%', color: 'text-red-500' },
    { name: 'Bilal Raza', pct: '85%', color: 'text-green-600' },
    { name: 'Nadia Hussain', pct: '74%', color: 'text-yellow-600' },
    { name: 'Usman Tariq', pct: '91%', color: 'text-green-600' },
    { name: 'Fatima Sheikh', pct: '55%', color: 'text-red-500' },
  ];

  return (
    <section
      id="description"
      ref={ref}
      className="relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >

      {/* ══════════════════════════════════════════
          PART 1 — Reports section (Image 1)
      ══════════════════════════════════════════ */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
              <span className="text-blue-600">Pull Attendance Reports</span>{' '}and<br />
              Know Actual Numbers
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
              Instantly see who's attending, easily share reports with your team,
              and spend less time organizing attendance paperwork.
            </p>
          </motion.div>

          {/* Two-column: mockup left, features right */}
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Left — stacked dashboard cards mockup */}
            <motion.div {...fadeLeft(0.1)} className="relative flex justify-center">
              <div className="relative w-full max-w-md">

                {/* Back card — Individual Profile */}
                <div
                  className="absolute top-0 right-0 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 z-10"
                  style={{ transform: 'rotate(4deg) translate(16px, -12px)' }}
                >
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-2">Individual Profile</p>
                  <div className="space-y-1">
                    {['Week 1', 'Week 2', 'Week 3'].map((w, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-[8px] text-gray-400 w-10 flex-shrink-0">{w}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${[80, 60, 90][i]}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[8px] text-blue-500 font-semibold mt-2">↗ Attendance Report</p>
                </div>

                {/* Middle card — Analytics Breakdown */}
                <div
                  className="absolute top-6 left-0 w-52 bg-white rounded-2xl shadow-md border border-gray-100 p-3 z-20"
                  style={{ transform: 'rotate(-3deg)' }}
                >
                  <p className="text-[9px] font-bold text-gray-700 mb-2">Analytics Breakdown</p>
                  <div className="space-y-1">
                    {mockupRows.slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-[8px]">
                        <span className="text-gray-600 truncate w-24">{r.name}</span>
                        <span className={`font-bold ${r.color}`}>{r.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main card — full attendance table */}
                <div className="relative z-30 mt-16 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  {/* Header bar */}
                  <div className="bg-gray-800 px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white">Attendance Analytics — Dashboard</span>
                    <div className="flex gap-1.5">
                      {['All', 'List', 'By Date'].map((t, i) => (
                        <span key={i} className={`text-[8px] px-2 py-0.5 rounded font-medium ${i === 0 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Table head */}
                  <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-100 px-4 py-2">
                    {['Student', 'Classes', 'Present', 'Rate'].map(h => (
                      <span key={h} className="text-[9px] font-bold text-gray-500 uppercase">{h}</span>
                    ))}
                  </div>

                  {/* Table rows */}
                  <div className="divide-y divide-gray-50">
                    {mockupRows.map((r, i) => (
                      <div key={i} className="grid grid-cols-4 px-4 py-2 hover:bg-gray-50 transition-colors">
                        <span className="text-[10px] text-gray-700 font-medium truncate">{r.name}</span>
                        <span className="text-[10px] text-gray-500">24</span>
                        <span className="text-[10px] text-gray-500">{Math.round(parseInt(r.pct) * 0.24)}</span>
                        <span className={`text-[10px] font-bold ${r.color}`}>{r.pct}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-1.5 px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <Download className="w-3 h-3 text-blue-500" />
                    <span className="text-[9px] text-gray-500">Download Profile, List, and Full Report</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right — feature list */}
            <motion.div {...fadeRight(0.15)} className="space-y-8">
              {reportFeatures.map((f, i) => (
                <motion.div key={i} {...fadeUp(0.15 + i * 0.08)}>
                  <h3 className="text-blue-600 font-bold text-lg mb-1.5">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div {...fadeUp(0.5)} className="mt-20 text-center">
            <p className="text-gray-700 font-semibold text-base mb-5">
              Know Exactly Who's Where in Real-Time
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-10 py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-200"
            >
              Get Started Free
            </a>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex -space-x-2">
                {['#3b82f6', '#06b6d4', '#8b5cf6'].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold" style={{ background: c }}>
                    {['AK', 'SR', 'BR'][i]}
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">Trusted by 50,000+ students</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Description;
