import React from 'react';
import { 
  QrCode, 
  FileText, 
  BarChart, 
  Users, 
  Clock, 
  Zap, 
  Download,
  Smartphone
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: QrCode,
      title: 'QR Code Attendance',
      description: 'Students mark attendance by scanning QR codes that refresh every 30 seconds',
      color: 'from-blue-500 to-blue-600',
      delay: '0s'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant attendance marking with real-time updates and notifications',
      color: 'from-cyan-500 to-cyan-600',
      delay: '0.1s'
    },
    {
      icon: BarChart,
      title: 'Smart Analytics',
      description: 'Visual insights and charts to track attendance patterns and trends',
      color: 'from-indigo-500 to-indigo-600',
      delay: '0.2s'
    },
    {
      icon: Users,
      title: 'Student Management',
      description: 'Easily manage student records, class lists, and enrollment data',
      color: 'from-purple-500 to-purple-600',
      delay: '0.3s'
    },
    {
      icon: Download,
      title: 'Export Reports',
      description: 'Generate reports in PDF, Excel, or CSV format for record keeping',
      color: 'from-green-500 to-green-600',
      delay: '0.4s'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Monitor attendance live with instant updates and alerts',
      color: 'from-orange-500 to-orange-600',
      delay: '0.5s'
    }
  ];

  return (
    <section id="features" className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute w-[350px] h-[350px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000 right-0 bottom-0"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm mb-4">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Why Choose Attmark</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Everything You Need
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ml-2">
              in One Platform
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make attendance management effortless
          </p>
        </div>

        {/* Features Grid - Unique Card Design */}
        <div className="relative">
          {/* Center Glow Effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative"
                  style={{ animation: `fadeInUp 0.6s ease-out ${feature.delay} both` }}
                >
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  
                  {/* Card Content */}
                  <div className="relative bg-white rounded-2xl p-6 border border-gray-200 group-hover:border-transparent transition-all duration-300 hover:shadow-xl">
                    {/* Icon with Animated Background */}
                    <div className="relative mb-5">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                      <div className={`relative w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    
                    {/* Learn More Link */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-blue-600 font-medium inline-flex items-center gap-1">
                        Learn more
                        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 text-sm font-medium">
            Explore All Features
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -10px) scale(1.05); }
          50% { transform: translate(20px, 5px) scale(1.1); }
          75% { transform: translate(-10px, 15px) scale(1.05); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

export default Features;