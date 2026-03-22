import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import Home from '../../components/Landing_Page/Home';
import About from '../../components/Landing_Page/About';
import Features from '../../components/Landing_Page/Features';
import FAQs from '../../components/Landing_Page/FAQs';
import Contact from '../../components/Landing_Page/Contact';
import Footer from '../../components/Landing_Page/Footer';
import Description from '../../components/Landing_Page/Description';

const MainPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState('home');

  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Intersection Observer to detect which section is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            setActiveSection(sectionId);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the section is visible
    );

    // Observe all sections
    const sections = ['hero', 'about', 'features', 'faqs', 'contact'];
    sections.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) observer.observe(section);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 relative overflow-x-hidden">
      {/* Animated Background - Lighter Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        ></div>
        <div
          className="absolute w-[400px] h-[400px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000"
          style={{
            right: `${100 - mousePosition.x}%`,
            bottom: `${100 - mousePosition.y}%`,
            transform: 'translate(50%, 50%)'
          }}
        ></div>
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

            {/* Desktop Navigation - Centered with Home, About, Features, FAQs, Contact */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-2xl px-2 py-1.5 border border-white/20 shadow-sm">
                <button
                  onClick={() => scrollToSection('hero')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all relative group ${activeSection === 'hero'
                      ? 'text-blue-600 bg-white/80'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-white/80'
                    }`}
                >
                  Home
                  {activeSection === 'hero' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-blue-600"></span>
                  )}
                  {activeSection !== 'hero' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                  )}
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all relative group ${activeSection === 'about'
                      ? 'text-blue-600 bg-white/80'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-white/80'
                    }`}
                >
                  About
                  {activeSection === 'about' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-blue-600"></span>
                  )}
                  {activeSection !== 'about' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                  )}
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all relative group ${activeSection === 'features'
                      ? 'text-blue-600 bg-white/80'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-white/80'
                    }`}
                >
                  Features
                  {activeSection === 'features' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-blue-600"></span>
                  )}
                  {activeSection !== 'features' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                  )}
                </button>
                <button
                  onClick={() => scrollToSection('faqs')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all relative group ${activeSection === 'faqs'
                      ? 'text-blue-600 bg-white/80'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-white/80'
                    }`}
                >
                  FAQs
                  {activeSection === 'faqs' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-blue-600"></span>
                  )}
                  {activeSection !== 'faqs' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                  )}
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all relative group ${activeSection === 'contact'
                      ? 'text-blue-600 bg-white/80'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-white/80'
                    }`}
                >
                  Contact
                  {activeSection === 'contact' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-blue-600"></span>
                  )}
                  {activeSection !== 'contact' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="hidden md:block">
              <button
                onClick={() => navigate("/auth/register")}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform text-xs font-medium">
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
              <button
                onClick={() => scrollToSection('hero')}
                className={`block w-full text-left px-4 py-3 rounded-xl transition-all ${activeSection === 'hero'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className={`block w-full text-left px-4 py-3 rounded-xl transition-all ${activeSection === 'about'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className={`block w-full text-left px-4 py-3 rounded-xl transition-all ${activeSection === 'features'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('faqs')}
                className={`block w-full text-left px-4 py-3 rounded-xl transition-all ${activeSection === 'faqs'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                FAQs
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className={`block w-full text-left px-4 py-3 rounded-xl transition-all ${activeSection === 'contact'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                Contact
              </button>
            </div>
            <div className="pt-3 space-y-2">
              <button
                onClick={() => {
                  navigate("/auth/register");
                  setIsMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all font-medium text-sm">
                Get Started
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all text-sm">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* All Section Components */}
      <Home />
      <div id="about">
        <About />
      </div>
      <div id="description">
        <Description />
      </div>
      <div id="features">
        <Features />
      </div>
      <div id="faqs">
        <FAQs />
      </div>
      <div id="contact">
        <Contact />
      </div>

      {/* Footer */}
      <Footer />

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
