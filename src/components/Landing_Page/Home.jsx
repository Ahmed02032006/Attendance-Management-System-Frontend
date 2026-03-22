// components/Landing_Page/Home.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';

const Home = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section id="hero" className="relative pt-24 pb-14 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - Heading and Trust Indicators */}
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
                Track Attendance
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  The Smart Way
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-sm text-gray-600 max-w-lg leading-relaxed mb-8">
                A complete attendance management solution for universities.
                Track via QR codes or manual entry, generate reports, and export data instantly.
              </p>
            </motion.div>

            {/* Trust Indicators - Positioned at center left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col items-start space-y-3"
            >
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full text-sm text-gray-600 border border-gray-300 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full text-sm text-gray-600 border border-gray-300 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                <GraduationCap className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-medium">Built for teachers</span>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Dashboard Preview Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-2xl -z-10 animate-float"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-sky-100 rounded-2xl -z-10 animate-float animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-30 -z-10"></div>

            {/* Main Image Container with Loading Skeleton */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-sky-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>

              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                {/* Loading Skeleton */}
                {!imageLoaded && (
                  <div className="w-full aspect-video bg-gray-200 animate-pulse flex items-center justify-center">
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
          </motion.div>
        </div>
      </div>

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
    </section>
  );
};

export default Home;