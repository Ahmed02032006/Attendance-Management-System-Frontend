import React, { useState } from 'react';
import { QrCode, BarChart, Clock, Sparkles, Target, Zap, HeartHandshake } from 'lucide-react';

const About = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const features = [
    {
      icon: QrCode,
      title: 'QR Code Technology',
      description: 'Quick and easy attendance marking with secure QR codes for your classes'
    },
    {
      icon: BarChart,
      title: 'Analytics Dashboard',
      description: 'Visual insights to help you track attendance patterns and trends'
    },
    {
      icon: Zap,
      title: 'Fast & Efficient',
      description: 'Built for speed, making attendance tracking quick and hassle-free'
    }
  ];

  return (
    <section id="about" className="relative py-6 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Background Animation - Matching Home Section */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute w-[350px] h-[350px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000 right-0 bottom-0"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section - Matching Home Style */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simplifying
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ml-2">
              Attendance Management
            </span>
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            We're building a modern attendance management system to help universities streamline their daily operations.
          </p>
        </div>

        {/* Main Content - Two Column Layout Matching Home */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Side - Content */}
          <div>
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Made for Educators,
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent text-2xl mt-2">
                  Built for Simplicity
                </span>
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Attmark is designed to make attendance tracking easier for teachers and administrators.
                No complex setup, no unnecessary features - just the tools you need to manage attendance effectively.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Dashboard Preview matching home section */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
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
            {/* Decorative elements matching home section */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-2xl -z-10 animate-float"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-cyan-100 rounded-2xl -z-10 animate-float animation-delay-2000"></div>
          </div>
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

export default About;