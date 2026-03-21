// import React, { useState } from 'react';
// import { Send, MessageSquare } from 'lucide-react';

// const Contact = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     message: ''
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Form submitted:', formData);
//     alert('Thank you for reaching out! We will get back to you soon.');
//     setFormData({ name: '', email: '', message: '' });
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   return (
//     <section id="contact" className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
//       {/* Background Animation */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
//         <div className="absolute w-[350px] h-[350px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000 right-0 bottom-0"></div>
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
//       </div>

//       <div className="max-w-3xl mx-auto relative z-10">
//         {/* Header Section */}
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm mb-4">
//             <MessageSquare className="w-4 h-4 text-blue-600" />
//             <span className="text-sm font-semibold text-gray-700">Get in Touch</span>
//           </div>
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//             Let's Talk About
//             <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ml-2">
//               Your Needs
//             </span>
//           </h2>
//           <p className="text-gray-600">
//             Have questions about implementing Attmark? We're here to help.
//           </p>
//         </div>

//         {/* Contact Form - Centered */}
//         <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
//                 Your Name
//               </label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
//                 placeholder="John Doe"
//               />
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
//                 placeholder="you@example.com"
//               />
//             </div>

//             <div>
//               <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
//                 Message
//               </label>
//               <textarea
//                 id="message"
//                 name="message"
//                 value={formData.message}
//                 onChange={handleChange}
//                 required
//                 rows="4"
//                 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
//                 placeholder="Tell us about your requirements..."
//               ></textarea>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-[1.02] font-medium flex items-center justify-center gap-2"
//             >
//               <Send className="w-4 h-4" />
//               Send Message
//             </button>
//           </form>
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

// export default Contact;

import React from 'react'

const Contact = () => {
  return (
    <div>Contact</div>
  )
}

export default Contact