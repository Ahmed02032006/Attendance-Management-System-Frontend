import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { 
    once: true, // This ensures animation only happens once when section comes into view
    amount: 0.1,
    triggerOnce: true // Additional safety to ensure it only triggers once
  });

  const faqs = [
    {
      question: 'What is Attmark?',
      answer: 'Attmark is a modern attendance management platform that simplifies tracking for universities. With QR code check-ins, real-time reports, and analytics, it helps you manage attendance efficiently and securely.'
    },
    {
      question: 'What check-in options are available?',
      answer: 'Attmark supports QR code scanning, manual entry by teachers, and kiosk-based check-ins. Each method ensures accurate, real-time attendance recording.'
    },
    {
      question: 'How does QR code attendance work?',
      answer: 'Teachers generate a unique QR code for each session. Students scan it with their devices and attendance is instantly recorded. Codes refresh every 30 seconds to prevent sharing or misuse.'
    },
    {
      question: 'Can Attmark integrate with existing systems?',
      answer: 'Yes. Attmark supports integration with LMS platforms, CRMs, Google Sheets, and custom APIs, making it easy to plug into your existing workflows.'
    },
    {
      question: 'Is the platform free to use?',
      answer: 'We offer a free trial so universities can explore the platform. Paid plans are available based on the number of students and features required. Contact us for pricing details.'
    },
    {
      question: 'How can Attmark help with reporting?',
      answer: 'Attmark provides detailed analytics and exportable reports in PDF or Excel format. Filter by date, class, student, or status to get exactly the data you need.'
    },
    {
      question: 'Can students mark attendance manually?',
      answer: 'Teachers can manually mark attendance for students with technical issues or forgotten devices, ensuring no student is missed from the record.'
    },
    {
      question: 'What devices does Attmark support?',
      answer: 'Attmark is fully responsive and works on desktops, tablets, and smartphones. Students and teachers can access it from any modern browser without installing anything.'
    },
    {
      question: 'How quickly can I set up Attmark?',
      answer: 'Setup takes minutes. Import your student list, create classes, and start tracking attendance the same day. Our onboarding team is available to help you get started.'
    },
    {
      question: 'Is my data secure with Attmark?',
      answer: 'Absolutely. We use HTTPS encryption, SSO login, encrypted passwords, and Google OAuth to keep your data safe. We never sell your data to third parties.'
    },
  ];

  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  // Animation variants for better performance
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }
    })
  };

  const leftFaqs = faqs.filter((_, i) => i % 2 === 0);
  const rightFaqs = faqs.filter((_, i) => i % 2 !== 0);

  const FAQItem = ({ faq, index, delay }) => {
    const isOpen = openIndex === index;
    return (
      <motion.div
        custom={delay}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={fadeUpVariants}
        className={`rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
          isOpen
            ? 'border-blue-200 bg-white shadow-md shadow-blue-50'
            : 'border-gray-150 bg-white hover:border-blue-100 hover:shadow-sm'
        }`}
        style={{ borderColor: isOpen ? '#bfdbfe' : '#ebebeb' }}
      >
        <button
          onClick={() => toggleFAQ(index)}
          className="w-full px-5 py-4 flex items-start justify-between text-left gap-4"
        >
          <span className="text-sm font-semibold leading-snug text-gray-800">{faq.question}</span>
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
            isOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </div>
        </button>
        <div className={`px-5 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48 pb-5' : 'max-h-0'}`}>
          <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <section
      id="faqs"
      ref={sectionRef}
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        background: 'linear-gradient(140deg, #eef2ff 0%, #e0f2fe 60%, #f0f9ff 100%)',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Soft blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full opacity-25 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-200 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUpVariants}
          custom={0}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Everything you need to know about Attmark. Can't find the answer? Just reach out.
          </p>
        </motion.div>

        {/* 2-Column grid — matches reference layout */}
        <div className="grid md:grid-cols-2 gap-3 items-start">
          <div className="space-y-3">
            {leftFaqs.map((faq, i) => (
              <FAQItem 
                key={i * 2} 
                faq={faq} 
                index={i * 2} 
                delay={0.04 * i}
              />
            ))}
          </div>
          <div className="space-y-3">
            {rightFaqs.map((faq, i) => (
              <FAQItem 
                key={i * 2 + 1} 
                faq={faq} 
                index={i * 2 + 1} 
                delay={0.04 * i + 0.02}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUpVariants}
          custom={0.55}
          className="mt-10 text-center"
        >
          <p className="text-sm text-gray-500">
            Still have questions?{' '}
            <a href="#contact" className="text-blue-600 font-semibold hover:underline underline-offset-2">
              Contact our support team →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQs;