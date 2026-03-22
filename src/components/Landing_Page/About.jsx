import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { QrCode, BarChart, Zap, CheckCircle, XCircle, Users, Clock, Smartphone, MessageCircle, HelpCircle, Bot } from 'lucide-react';

const About = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const ref = React.useRef(null);
  const compRef = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const isCompInView = useInView(compRef, { once: true, amount: 0.1 });

  const fadeUp = (delay = 0, inView = isInView) => ({
    initial: { opacity: 0, y: 24 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  });

  const checkItems = [
    'Save staff time on manual roll calls',
    'Find student records instantly',
    'Send QR passes students scan in seconds',
    'Keep attendance data private & encrypted',
    'Make it yours with your university branding',
  ];

  const comparisonColumns = [
    {
      title: 'Paper Sign-ins',
      highlight: false,
      items: [
        { text: 'Simple and straightforward for small events or classes.', positive: true },
        { text: 'Hard to manage and analyze data.', positive: false },
        { text: 'Requires physical presence and has security risks.', positive: false },
        { text: 'Error prone.', positive: false },
        { text: 'No integration or scalability.', positive: false },
      ],
    },
    {
      title: 'Digital Tools (Sheets, Forms)',
      highlight: false,
      items: [
        { text: 'Accessible from any device.', positive: true },
        { text: 'Hard to manage multiple sheets among teams.', positive: false },
        { text: 'Needs add-ons and 3rd party tools for full functionality.', positive: false },
        { text: 'Limited customization and scalability for advanced needs.', positive: false },
        { text: 'Free to use with a Google account.', positive: true },
      ],
    },
    {
      title: 'Attmark Attendance App',
      highlight: true,
      items: [
        { text: 'Real-time attendance tracking with reports (time, location, visitor app, surveys, photos).', positive: true },
        { text: 'Designed for small to large classes and teams.', positive: true },
        { text: 'Multiple ways to check-in. Signatures, surveys, photos, kiosk, check-in codes, and location.', positive: true },
        { text: 'Integrates with other apps with Zapier and REST APIs.', positive: true },
      ],
    },
  ];

  return (
    <>
      {/* ── COMPARISON SECTION ── */}
      <section
        ref={compRef}
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          background: '#ffffff',
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
      >
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <motion.div {...fadeUp(0, isCompInView)} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Escape The Paper Mess
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              Messy handwritings, scanning copies, or transferring into Excel?
            </p>
          </motion.div>

          {/* Comparison Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {comparisonColumns.map((col, ci) => (
              <motion.div
                key={ci}
                {...fadeUp(0.08 * ci, isCompInView)}
                className={`rounded-2xl p-6 flex flex-col ${
                  col.highlight
                    ? 'border-2 border-blue-600 shadow-lg shadow-blue-100 bg-white'
                    : 'border border-gray-200 bg-white'
                }`}
              >
                <h3
                  className={`text-base font-bold mb-5 ${
                    col.highlight ? 'text-blue-700' : 'text-gray-800'
                  }`}
                >
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.items.map((item, ii) => (
                    <li key={ii} className="flex items-start gap-2">
                      {item.positive ? (
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm text-gray-600 leading-snug">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / FEATURES SECTION ── */}
      <section
        id="about"
        ref={ref}
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          background: 'linear-gradient(140deg, #eef2ff 0%, #e0f2fe 60%, #f0f9ff 100%)',
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
      >
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-200 rounded-full opacity-25 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100 rounded-full opacity-25 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">

          {/* Header */}
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <p className="text-blue-600 font-bold text-lg mb-1">No More Manual Work.</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Just Automated Attendance Tracking
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              If you can upload an Excel sheet, you can automate check-ins with Attmark.
            </p>
          </motion.div>

          {/* ROW 1: 2-col */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">

            {/* QR Code card */}
            <motion.div {...fadeUp(0.05)}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col"
              style={{ borderColor: '#ebebeb' }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-1 leading-snug">
                Easy{' '}
                <span className="text-blue-600">QR Code Check-in</span>{' '}
                Without Form Link Hassle
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Print QR codes for events, meetings, or daily student check-ins in seconds — without complex online forms or external tools.
              </p>

              {/* QR visual */}
              <div className="flex-1 flex items-center justify-center py-4">
                <div className="relative flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                      <QrCode className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Teacher</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-2">
                    <div className="h-0.5 w-12 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full" />
                    <span className="text-[9px] text-gray-400">Scan instantly</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100">
                      <Smartphone className="w-8 h-8 text-green-600" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Student</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Analytics Dashboard card */}
            <motion.div {...fadeUp(0.1)}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col"
              style={{ borderColor: '#ebebeb' }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-1 leading-snug">
                Elevate Your Front-Desk with{' '}
                <span className="text-blue-600">Analytics Dashboard</span>
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Powerful visual insights that break down attendance by demographics, dates, and status — all in one place.
              </p>

              <ul className="space-y-2 mt-auto">
                {checkItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* ROW 2: 3-col */}
          <div className="grid md:grid-cols-3 gap-5 mb-5">

            {/* Personalized Passes */}
            <motion.div {...fadeUp(0.15)}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col"
              style={{ borderColor: '#ebebeb' }}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 border border-blue-100">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1 leading-snug">
                Personalized{' '}
                <span className="text-blue-600">QR Passes</span>
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Create a personalized check-in experience. Export passes students can save to their phones.
              </p>

              <div className="mt-5 space-y-2">
                {['Ahmed Khan — CS101', 'Sara Ali — Math202'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                      <div className="w-3 h-3 grid grid-cols-2 gap-px">
                        {[...Array(4)].map((_, j) => (
                          <div key={j} className={`rounded-sm ${j % 2 === 0 ? 'bg-blue-700' : 'bg-blue-300'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-600 font-medium">{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Chatbot Assistant - New Card */}
            <motion.div {...fadeUp(0.2)}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col hover:shadow-lg transition-all duration-300"
              style={{ borderColor: '#ebebeb' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-5 shadow-md">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1 leading-snug">
                AI Assistant{' '}
                <span className="text-blue-600">Guide & Support</span>
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                24/7 AI-powered chatbot that helps teachers navigate the platform, answer questions, and provide instant guidance.
              </p>

              {/* Chatbot Preview */}
              <div className="mt-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-3 border border-blue-100">
                <div className="flex items-start gap-2 mb-3">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-xl p-2 shadow-sm">
                      <p className="text-[10px] text-gray-600">How do I create a QR code for my class?</p>
                    </div>
                    <div className="mt-1.5 bg-blue-100 rounded-xl p-2 ml-4">
                      <p className="text-[10px] text-blue-800">Go to Dashboard → Classes → Generate QR Code. It's that simple! 🚀</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-100">
                  <HelpCircle className="w-3 h-3 text-blue-500" />
                  <span className="text-[9px] text-gray-500">Ask me anything about Attmark</span>
                  <span className="text-[9px] text-green-500 ml-auto">● Online</span>
                </div>
              </div>
            </motion.div>

            {/* Faster check-in for students */}
            <motion.div {...fadeUp(0.25)}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col"
              style={{ borderColor: '#ebebeb' }}
            >
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-5 border border-orange-100">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1 leading-snug">
                10x Faster Check-In{' '}
                <span className="text-blue-600">for Students</span>
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Attmark remembers the student and their last check-in, making every subsequent session even faster.
              </p>

              <div className="mt-5 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-gray-500">Check-in Speed</span>
                  <span className="text-[10px] font-bold text-green-600">10x faster</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-green-400 h-2 rounded-full" style={{ width: '90%' }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-gray-400">Manual</span>
                  <span className="text-[9px] text-gray-400">QR Scan</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* BOTTOM BANNER - Smaller Button */}
          <motion.div {...fadeUp(0.3)}
            className="rounded-3xl bg-white border p-6 text-center"
            style={{ borderColor: '#ebebeb' }}
          >
            <p className="text-gray-600 text-sm md:text-base">
              Create Your Perfect, Effortless Check-in Process with{' '}
              <span className="font-bold text-gray-900">Surveys, Photos, Signatures</span>
              {' '}or{' '}
              <span className="font-bold text-blue-600">Check-in Codes</span>
              , Today.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-200"
            >
              Get Started Free →
            </a>
          </motion.div>

        </div>
      </section>
    </>
  );
};

export default About;