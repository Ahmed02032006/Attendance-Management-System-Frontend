import React from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  FileText, 
  BarChart, 
  Users, 
  Clock, 
  Shield, 
  Zap, 
  Download,
  Smartphone,
  Bell,
  Award,
  Globe
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: QrCode,
      title: 'QR Code Attendance',
      description: 'Students can mark attendance instantly by scanning QR codes. Codes refresh every 30 seconds for security.',
      color: 'from-blue-500 to-blue-600',
      gradient: 'from-blue-50 to-blue-100'
    },
    {
      icon: FileText,
      title: 'Manual Entry',
      description: 'Option to manually mark attendance for students who forget their devices or have technical issues.',
      color: 'from-cyan-500 to-cyan-600',
      gradient: 'from-cyan-50 to-cyan-100'
    },
    {
      icon: BarChart,
      title: 'Analytics Dashboard',
      description: 'Visual insights with charts and graphs to track attendance patterns and identify trends.',
      color: 'from-indigo-500 to-indigo-600',
      gradient: 'from-indigo-50 to-indigo-100'
    },
    {
      icon: Users,
      title: 'Student Management',
      description: 'Easily manage student records, class lists, and enrollment data in one place.',
      color: 'from-purple-500 to-purple-600',
      gradient: 'from-purple-50 to-purple-100'
    },
    {
      icon: Download,
      title: 'Export Reports',
      description: 'Generate and export attendance reports in PDF or Excel format for record keeping.',
      color: 'from-green-500 to-green-600',
      gradient: 'from-green-50 to-green-100'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Monitor attendance in real-time with live updates and instant notifications.',
      color: 'from-orange-500 to-orange-600',
      gradient: 'from-orange-50 to-orange-100'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute w-[350px] h-[350px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float animation-delay-2000 right-0 bottom-0"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-full shadow-lg mb-6">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ml-2">
              in One Place
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the tools that make attendance management simple, efficient, and hassle-free.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  {/* Icon Container */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  
                  {/* Decorative Line */}
                  <div className={`absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r ${feature.color} group-hover:w-full transition-all duration-300 rounded-b-2xl`}></div>
                  
                  {/* Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Feature Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-700">+ More features coming soon</span>
            <Globe className="w-5 h-5 text-cyan-600" />
          </div>
        </motion.div>
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

export default Features;