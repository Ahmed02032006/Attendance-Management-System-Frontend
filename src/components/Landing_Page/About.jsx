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

          {/* Right Side - Dashboard Image */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-xs text-gray-500 ml-2">attmark-dashboard</span>
                </div>
                <div className="space-y-3">
                  <div className="h-8 bg-white rounded-lg border border-gray-200 flex items-center px-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <div className="h-2 w-32 bg-gray-200 rounded"></div>
                  </div>
                  {/* Image Container */}
                  <div className="relative">
                    {!imageLoaded && (
                      <div className="w-full aspect-video bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
                        <div className="text-gray-400 text-sm">Loading dashboard preview...</div>
                      </div>
                    )}
                    <img
                      src="/Pages-Picture/Attmark-Dashboard_Page.png"
                      alt="Attmark Dashboard Preview"
                      className={`w-full h-auto object-cover rounded-lg transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/800x450?text=Attmark+Dashboard+Preview";
                        setImageLoaded(true);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 text-center">
                <p className="text-gray-600 text-sm">
                  Simple dashboard interface for quick attendance tracking
                </p>
              </div>
            </div>
            {/* Decorative elements matching home section */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-2xl -z-10 animate-float"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-sky-100 rounded-2xl -z-10 animate-float animation-delay-2000"></div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default About;