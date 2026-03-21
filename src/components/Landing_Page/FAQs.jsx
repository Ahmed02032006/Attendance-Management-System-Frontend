import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How does QR code attendance work?',
      answer: 'Teachers generate a unique QR code for each class session. Students scan the code using their devices, and attendance is automatically recorded in real-time. Each QR code refreshes every 30 seconds to prevent sharing or misuse.'
    },
    {
      question: 'Is the platform free to use?',
      answer: 'We offer a free trial for universities to test the platform. For continued use, we have affordable pricing plans based on the number of students and features required. Contact us for detailed pricing information.'
    },
    {
      question: 'Can I export attendance reports?',
      answer: 'Yes! You can export attendance reports in multiple formats including PDF, Excel, and CSV. Reports can be filtered by date, class, student, or attendance status.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take data security seriously. All data is encrypted, and we follow industry best practices to ensure your information remains private and secure.'
    },
    {
      question: 'Can students mark attendance manually?',
      answer: 'Yes, teachers have the option to manually mark attendance for students who may have technical issues or forget their devices. This ensures no student misses out.'
    },
    {
      question: 'What support do you offer?',
      answer: 'We provide email support, documentation, and onboarding assistance. For universities, we offer dedicated support to help with implementation and training.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute w-[350px] h-[350px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000 right-0 bottom-0"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm mb-6">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Got Questions?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ml-2">
              Questions
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our platform.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-200 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
              >
                <span className="text-base font-semibold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`px-6 overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                }`}
              >
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <MessageCircle className="w-4 h-4" />
            <span>Still have questions?</span>
            <a href="#contact" className="text-blue-600 font-semibold hover:underline ml-1">
              Contact our support team
            </a>
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

export default FAQs;