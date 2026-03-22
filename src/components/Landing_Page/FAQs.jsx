import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

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
    <section id="faqs" className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden" ref={ref}>
      {/* Background Animation - Lighter */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute w-[350px] h-[350px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000 right-0 bottom-0"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm mb-4">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Frequently Asked
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ml-2">
              Questions
            </span>
          </h2>
          <p className="text-gray-600">Find answers to common questions about our platform</p>
        </motion.div>

        {/* FAQs Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden hover:border-blue-200 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`px-5 overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 pb-4' : 'max-h-0'
                }`}
              >
                <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            Still have questions?{' '}
            <a href="#contact" className="text-blue-600 font-semibold hover:underline">
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQs;