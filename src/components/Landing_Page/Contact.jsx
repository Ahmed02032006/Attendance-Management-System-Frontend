import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, Mail, Phone, MapPin, MessageSquare, Clock, CheckCircle, Sparkles } from 'lucide-react';

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
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100/50',
      iconBg: 'bg-blue-500',
      borderColor: 'border-blue-100',
    },
    {
      icon: Clock,
      label: 'Support Hours',
      value: 'Mon – Fri, 9am–6pm',
      sub: 'PKT (UTC+5)',
      gradient: 'from-cyan-500 to-cyan-600',
      bgGradient: 'from-cyan-50 to-cyan-100/50',
      iconBg: 'bg-cyan-500',
      borderColor: 'border-cyan-100',
    },
    {
      icon: MapPin,
      label: 'Based In',
      value: 'Karachi, Pakistan',
      sub: 'Serving universities nationwide',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100/50',
      iconBg: 'bg-purple-500',
      borderColor: 'border-purple-100',
    },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)',
        fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full border border-gray-200 shadow-sm mb-5">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Get in Touch</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Let's Talk About{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Your Needs
            </span>
          </h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Have questions about implementing Attmark at your university? We're here to help.
          </p>
        </motion.div>

        {/* Info Cards Row - Redesigned */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {infoCards.map(({ icon: Icon, label, value, sub, gradient, bgGradient, iconBg, borderColor }, i) => (
            <motion.div
              key={i}
              {...fadeUp(0.08 * (i + 1))}
              className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${borderColor}`}
              style={{
                background: `linear-gradient(135deg, white, white)`,
                border: '1px solid',
                borderColor: '#e5e7eb'
              }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative p-6">
                {/* Icon with gradient */}
                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                {/* Content */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-lg font-bold text-gray-800 mb-1">{value}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>

                {/* Decorative Line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Form Card */}
        <motion.div
          {...fadeUp(0.3)}
          className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
        >
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 gap-5 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Message Sent Successfully!</h3>
              <p className="text-gray-500 max-w-sm">
                Thank you for reaching out. Our team will get back to you within 24 hours.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>We're excited to help you get started</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-blue-600">*</span>
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-blue-600">*</span>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@university.edu"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* University - Full Width */}
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">University / Institution</label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder="University of Karachi"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Message - Full Width */}
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-blue-600">*</span>
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us about your requirements..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <p className="text-xs text-gray-400">We respond within 24 hours</p>
                    </div>
                    <div className="w-px h-3 bg-gray-200"></div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-400">Your data is secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;