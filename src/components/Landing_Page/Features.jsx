// import React from 'react';
// import { 
//   QrCode, 
//   FileText, 
//   BarChart, 
//   Users, 
//   Clock, 
//   Shield, 
//   Zap, 
//   Download,
//   Smartphone,
//   Bell
// } from 'lucide-react';

// const Features = () => {
//   const features = [
//     {
//       icon: QrCode,
//       title: 'QR Code Attendance',
//       description: 'Students can mark attendance instantly by scanning QR codes. Codes refresh every 30 seconds for security.',
//       color: 'from-blue-500 to-blue-600'
//     },
//     {
//       icon: FileText,
//       title: 'Manual Entry',
//       description: 'Option to manually mark attendance for students who forget their devices or have technical issues.',
//       color: 'from-cyan-500 to-cyan-600'
//     },
//     {
//       icon: BarChart,
//       title: 'Analytics Dashboard',
//       description: 'Visual insights with charts and graphs to track attendance patterns and identify trends.',
//       color: 'from-indigo-500 to-indigo-600'
//     },
//     {
//       icon: Users,
//       title: 'Student Management',
//       description: 'Easily manage student records, class lists, and enrollment data in one place.',
//       color: 'from-purple-500 to-purple-600'
//     },
//     {
//       icon: Download,
//       title: 'Export Reports',
//       description: 'Generate and export attendance reports in PDF or Excel format for record keeping.',
//       color: 'from-green-500 to-green-600'
//     },
//     {
//       icon: Clock,
//       title: 'Real-time Tracking',
//       description: 'Monitor attendance in real-time with live updates and instant notifications.',
//       color: 'from-orange-500 to-orange-600'
//     },
//     {
//       icon: Smartphone,
//       title: 'Mobile Friendly',
//       description: 'Access the platform from any device - desktop, tablet, or smartphone.',
//       color: 'from-pink-500 to-pink-600'
//     },
//     {
//       icon: Bell,
//       title: 'Automated Alerts',
//       description: 'Get notified about low attendance, absences, and important updates.',
//       color: 'from-red-500 to-red-600'
//     }
//   ];

//   return (
//     <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
//       {/* Background Animation - Matching Home Section */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
//         <div className="absolute w-[350px] h-[350px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000 right-0 bottom-0"></div>
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
//       </div>

//       <div className="max-w-7xl mx-auto relative z-10">
//         {/* Header Section */}
//         <div className="text-center mb-16">
//           <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm mb-6">
//             <Zap className="w-4 h-4 text-blue-600" />
//             <span className="text-sm font-semibold text-gray-700">Powerful Features</span>
//           </div>
//           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//             Everything You Need
//             <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ml-2">
//               in One Place
//             </span>
//           </h2>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Discover the tools that make attendance management simple, efficient, and hassle-free.
//           </p>
//         </div>

//         {/* Features Grid */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {features.map((feature, index) => {
//             const Icon = feature.icon;
//             return (
//               <div
//                 key={index}
//                 className="group relative bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-blue-200 transition-all duration-300 hover:shadow-xl"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-cyan-50/0 group-hover:from-blue-50/50 group-hover:to-cyan-50/50 rounded-2xl transition-all duration-300"></div>
//                 <div className="relative">
//                   <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
//                     <Icon className="w-6 h-6 text-white" />
//                   </div>
//                   <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
//                   <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes float {
//           0%, 100% { transform: translate(0, 0) scale(1); }
//           25% { transform: translate(10px, -10px) scale(1.05); }
//           50% { transform: translate(20px, 5px) scale(1.1); }
//           75% { transform: translate(-10px, 15px) scale(1.05); }
//         }
//         .animate-float {
//           animation: float 20s ease-in-out infinite;
//         }
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
//       `}</style>
//     </section>
//   );
// };

// export default Features;

import React from 'react'

const Features = () => {
  return (
    <div>Features</div>
  )
}

export default Features