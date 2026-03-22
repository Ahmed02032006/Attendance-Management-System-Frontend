import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, Mail, Phone, MapPin, MessageSquare, Clock } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', university: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 22 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', university: '', message: '' });
    }, 3000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const infoCards = [
    {
      icon: Mail,
      label: 'Email Us',
      value: 'hello@attmark.com',
      sub: 'We reply within 24 hours',
      color: 'bg-blue-50 border-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Clock,
      label: 'Support Hours',
      value: 'Mon – Fri, 9am–6pm',
      sub: 'PKT (UTC+5)',
      color: 'bg-cyan-50 border-cyan-100',
      iconColor: 'text-cyan-600',
    },
    {
      icon: MapPin,
      label: 'Based In',
      value: 'Karachi, Pakistan',
      sub: 'Serving universities nationwide',
      color: 'bg-purple-50 border-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        background: 'linear-gradient(140deg, #eef2ff 0%, #e0f2fe 60%, #f0f9ff 100%)',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm mb-5">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Get in Touch</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Let's Talk About{' '}
            <span className="text-blue-600">Your Needs</span>
          </h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Have questions about implementing Attmark at your university? We're here to help.
          </p>
        </motion.div>

        {/* Info cards row - Premium Version */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
  {infoCards.map(({ icon: Icon, label, value, sub, color, iconColor }, i) => (
    <motion.div
      key={i}
      {...fadeUp(0.08 * (i + 1))}
      className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl p-[1px]">
        <div className="absolute inset-[1px] bg-white rounded-2xl"></div>
      </div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Icon with gradient background and shine effect */}
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <Icon className={`w-7 h-7 ${iconColor} group-hover:scale-110 transition-transform duration-300`} />
          </div>
          
          {/* Optional mini badge */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-300 group-hover:text-blue-500 transition-colors duration-300">
              {i === 0 ? '🏆' : i === 1 ? '📊' : '⚡'}
            </div>
          </div>
        </div>
        
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {value}
            {sub.includes('%') && <span className="text-lg text-blue-600 ml-1">%</span>}
            {sub.includes('students') && <span className="text-lg text-gray-400 ml-1">+</span>}
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">{sub}</p>
        </div>
        
        {/* Progress bar effect (optional) */}
        <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500 group-hover:w-full w-0`}
            style={{ width: i === 0 ? '85%' : i === 1 ? '92%' : '78%' }}
          ></div>
        </div>
      </div>
    </motion.div>
  ))}
</div>

        {/* Contact form card */}
        <motion.div
          {...fadeUp(0.3)}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10"
          style={{ borderColor: '#ebebeb' }}
        >
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Send className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Message Sent!</h3>
              <p className="text-gray-500 text-sm max-w-xs">Thank you for reaching out. We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@university.edu"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              {/* University — full width */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">University / Institution</label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="University of Karachi"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Message — full width */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Tell us about your requirements..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Submit */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  We respect your privacy. No spam, ever.
                </p>
              </div>
            </form>
          )}
        </motion.div>

      </div>
    </section>
  );
};

export default Contact;