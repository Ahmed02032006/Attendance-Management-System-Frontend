import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  GraduationCap,
  Sparkles
} from 'lucide-react';

const MainPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        ></div>
        <div
          className="absolute w-[400px] h-[400px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"
          style={{
            right: `${100 - mousePosition.x}%`,
            bottom: `${100 - mousePosition.y}%`,
            transform: 'translate(50%, 50%)'
          }}
        ></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo with same blurry background as navigation */}
            <div className="flex items-center group bg-white/10 backdrop-blur-sm rounded-2xl px-3 py-1.5 border border-white/20 shadow-sm">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
              </div>
              <div className="ml-2 overflow-hidden">
                <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent block leading-tight">
                  Attmark
                </span>
                <span className="text-[8px] font-medium text-gray-500 block -mt-0.5">
                  For Universities
                </span>
              </div>
            </div>

            {/* Desktop Navigation - Centered with Hero, About, Features, FAQs, Contact */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-2xl px-2 py-1.5 border border-white/20 shadow-sm">
                <a href="#hero" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-xl hover:bg-white/80 transition-all relative group">
                  Hero
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                </a>
                <a href="#about" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-xl hover:bg-white/80 transition-all relative group">
                  About
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                </a>
                <a href="#features" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-xl hover:bg-white/80 transition-all relative group">
                  Features
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                </a>
                <a href="#faqs" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-xl hover:bg-white/80 transition-all relative group">
                  FAQs
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                </a>
                <a href="#contact" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-xl hover:bg-white/80 transition-all relative group">
                  Contact
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                </a>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="hidden md:block">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform text-xs font-medium">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden relative w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
              {isMenuOpen ?
                <X className="w-5 h-5 text-white" /> :
                <Menu className="w-5 h-5 text-white" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xl transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
          }`}>
          <div className="px-4 py-4 space-y-3">
            <div className="space-y-1">
              <a href="#hero" className="block px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">Hero</a>
              <a href="#about" className="block px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">About</a>
              <a href="#features" className="block px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">Features</a>
              <a href="#faqs" className="block px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">FAQs</a>
              <a href="#contact" className="block px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">Contact</a>
            </div>
            <div className="pt-3 space-y-2">
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all font-medium text-sm">
                Get Started
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all text-sm">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with ID for navigation */}
      <section id="hero" className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center mb-8">
            {/* Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
              Track Attendance
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                The Smart Way
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
              A complete attendance management solution for universities.
              Track via QR codes or manual entry, generate reports, and export data instantly.
            </p>
          </div>

          {/* Dashboard Preview Image with Loading State */}
          <div className="relative max-w-5xl mx-auto mt-8">
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-2xl -z-10 animate-float"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-cyan-100 rounded-2xl -z-10 animate-float animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-30 -z-10"></div>

            {/* Main Image Container with Loading Skeleton */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>

              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                {/* Loading Skeleton */}
                {!imageLoaded && (
                  <div className="w-full aspect-[16/9] bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400">Loading dashboard preview...</div>
                  </div>
                )}
                
                {/* Actual Image */}
                <img
                  src="/Pages-Picture/Attmark-Dashboard_Page.png"
                  alt="Attmark Dashboard Preview"
                  className={`w-full h-auto object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/1200x600?text=Attmark+Dashboard+Preview";
                    setImageLoaded(true);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col items-center mt-4 space-y-4">
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full text-xs text-gray-600 border border-gray-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full text-xs text-gray-600 border border-gray-300">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                <span>Built for teachers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -10px) scale(1.05); }
          50% { transform: translate(20px, 5px) scale(1.1); }
          75% { transform: translate(-10px, 15px) scale(1.05); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default MainPage;