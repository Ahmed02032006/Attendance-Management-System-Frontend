import React from 'react';
import { QrCode, FileText, Users, BarChart, Clock, CheckCircle, Target, Sparkles, ShieldCheck, Zap } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: QrCode,
      title: 'QR Code Technology',
      description: 'Quick and easy attendance marking with secure QR codes for your classes'
    },
    {
      icon: FileText,
      title: 'Automated Reports',
      description: 'Generate attendance reports instantly with our simple export system'
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

  const goals = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To provide universities with a simple, effective attendance management tool that saves time and reduces manual work.'
    },
    {
      icon: Sparkles,
      title: 'What We Offer',
      description: 'A straightforward platform for tracking attendance, generating reports, and managing student records efficiently.'
    }
  ];

  return (
    <section id="about" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50/30 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">About Attmark</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simplifying
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ml-2">
              Attendance Management
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're building a modern attendance management system to help universities streamline their daily operations.
          </p>
        </div>

        {/* What We Do Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Side - Content */}
          <div>
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Made for Educators,
                <span className="block text-blue-600 text-2xl mt-2">Built for Simplicity</span>
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Attmark is designed to make attendance tracking easier for teachers and administrators. 
                No complex setup, no unnecessary features - just the tools you need to manage attendance effectively.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 transition-all duration-300 group">
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

          {/* Right Side - Visual/Illustration */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Growing Platform</h4>
                <p className="text-gray-600">
                  We're continuously improving Attmark to better serve educational institutions.
                  Your feedback helps us build a better product.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Regular updates & improvements</span>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-2xl -z-10 animate-float"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-cyan-100 rounded-2xl -z-10 animate-float animation-delay-2000"></div>
          </div>
        </div>

        {/* Mission & Offerings */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {goals.map((goal, index) => {
            const Icon = goal.icon;
            return (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-blue-200 transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{goal.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{goal.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Status Section */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Currently in Development</h3>
                <p className="text-sm text-gray-600">We're actively building and improving Attmark</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-gray-700">QR Attendance</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-gray-700">Report Generation</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-gray-700">Student Management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-700">Simple, transparent, and built for educators</span>
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