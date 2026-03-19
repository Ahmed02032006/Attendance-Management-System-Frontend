import React, { useState, useEffect } from 'react';
import { 
  Menu,
  X,
  ArrowRight,
  GraduationCap,
  Sparkles,
  ChevronDown,
  LogIn
} from 'lucide-react';

const MainPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
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

      {/* Unique Navbar Design */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo on left */}
            <div className="flex items-center group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
              </div>
              <div className="ml-3 overflow-hidden">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent block leading-tight">
                  Attmark
                </span>
                <span className="text-[10px] font-medium text-gray-400 block -mt-1">
                  For University
                </span>
              </div>
            </div>

            {/* Centered Navigation */}
            <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center bg-gray-50/80 backdrop-blur-sm rounded-2xl px-2 py-1.5 border border-gray-200/50 shadow-sm">
                <a href="#features" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-xl hover:bg-white/80 transition-all relative group">
                  Features
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                </a>
                <a href="#about" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-xl hover:bg-white/80 transition-all relative group">
                  About
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                </a>
                <a href="#pricing" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-xl hover:bg-white/80 transition-all relative group">
                  Pricing
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                </a>
                
                {/* Dropdown Menu for More */}
                <div className="relative group/more">
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-xl hover:bg-white/80 transition-all flex items-center">
                    More
                    <ChevronDown className="w-4 h-4 ml-1 group-hover/more:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all duration-300 transform translate-y-2 group-hover/more:translate-y-0">
                    <a href="#faq" className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 first:rounded-t-xl last:rounded-b-xl">FAQ</a>
                    <a href="#contact" className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600">Contact</a>
                    <a href="#blog" className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600">Blog</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Button on right */}
            <div className="hidden md:block">
              <button className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all border border-gray-200 text-xs font-medium">
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            </div>

            {/* Mobile Menu Button - Unique Design */}
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
        <div className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xl transition-all duration-500 ${
          isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
        }`}>
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              <a href="#features" className="block px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">Features</a>
              <a href="#about" className="block px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">About</a>
              <a href="#pricing" className="block px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">Pricing</a>
              <a href="#faq" className="block px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">FAQ</a>
              <a href="#contact" className="block px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">Contact</a>
            </div>

            {/* Mobile Action Buttons */}
            <div className="pt-3 space-y-2">
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all font-medium text-sm">
                Get Started
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all text-sm flex items-center justify-center">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
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
            <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Manual entry or QR codes • Generate detailed reports • Export data instantly • 
              24/7 support for teachers
            </p>
          </div>

          {/* Dashboard Preview Image */}
          <div className="relative max-w-5xl mx-auto mt-8">
            {/* Decorative elements around image */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-2xl -z-10 animate-float"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-cyan-100 rounded-2xl -z-10 animate-float animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-30 -z-10"></div>
            
            {/* Main Image Container */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              
              {/* Image with shadow */}
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                <img 
                  src="https://images.ctfassets.net/dfcvkz6j859j/3yyuVQqgzMOMr2AGytPI4u/85f2a29fa2b977819e36531d96c85fa2/Web-Analytics-Dashboard-Template-Example.png"
                  alt="Attmark Dashboard Preview"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/1200x600?text=Attmark+Dashboard+Preview";
                  }}
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                
                {/* Status indicator */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-blue-600 border border-blue-200 shadow-sm flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Live Preview
                </div>
              </div>
            </div>

            {/* Caption */}
            <p className="text-center text-xs text-gray-500 mt-3">
              *Actual Attmark dashboard interface
            </p>
          </div>

          {/* CTA Buttons below dashboard */}
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <button className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 text-sm font-semibold inline-flex items-center">
              Start tracking free
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white text-gray-700 px-5 py-2.5 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all transform hover:-translate-y-0.5 text-sm font-semibold border border-gray-200">
              See how it works
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <div className="flex items-center text-xs text-gray-500">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-1" />
              <span>No credit card required</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center text-xs text-gray-500">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 mr-1" />
              <span>Built for universities</span>
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