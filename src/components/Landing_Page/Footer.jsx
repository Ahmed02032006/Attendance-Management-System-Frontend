import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github, QrCode, BarChart, Users, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featuresList = [
    { name: 'QR Code Attendance', icon: QrCode, section: 'features' },
    { name: 'Analytics Dashboard', icon: BarChart, section: 'features' },
    { name: 'Student Management', icon: Users, section: 'features' },
    { name: 'Export Reports', icon: Download, section: 'features' }
  ];

  return (
    <footer className="relative bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[300px] h-[300px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute w-[250px] h-[250px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float animation-delay-2000 right-0 bottom-0"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo & About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Attmark
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Simplifying attendance management for universities with modern technology and intuitive design.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollToSection('hero')} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('faqs')} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  FAQs
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Features</h3>
            <ul className="space-y-2">
              {featuresList.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <li key={index}>
                    <button 
                      onClick={() => scrollToSection(feature.section)} 
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                    >
                      <Icon className="w-3 h-3 group-hover:text-blue-600 transition-colors" />
                      <span>{feature.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-600 mb-3">
              Get the latest updates and news about Attmark.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © {currentYear} Attmark. All rights reserved. Built for universities and educators.
          </p>
          <div className="flex justify-center gap-6 mt-3">
            <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;