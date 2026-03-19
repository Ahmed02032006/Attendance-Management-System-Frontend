import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  FileText, 
  Download, 
  RefreshCw, 
  MessageCircle, 
  HeadphonesIcon,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Users,
  BarChart3,
  QrCode,
  Clock,
  Shield,
  Mail,
  ChevronRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';

const MainPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <div className="relative"><Camera className="w-8 h-8 text-blue-600" /><QrCode className="w-4 h-4 text-blue-600 absolute -bottom-1 -right-1" /></div>,
      title: "Flexible Attendance",
      description: "Switch between manual entry and QR scanning seamlessly"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: "Smart Reports",
      description: "Generate detailed attendance reports with one click"
    },
    {
      icon: <Download className="w-8 h-8 text-blue-600" />,
      title: "Export Data",
      description: "Export to Excel, PDF, or CSV formats instantly"
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-blue-600" />,
      title: "Auto Recovery",
      description: "Never lose data with automatic cloud backup"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
      title: "Smart Guide",
      description: "Step-by-step guidance for new teachers"
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8 text-blue-600" />,
      title: "24/7 Support",
      description: "Round-the-clock assistance when you need it"
    }
  ];

  const steps = [
    {
      title: "Create Account",
      description: "Sign up with email or Google in seconds"
    },
    {
      title: "Add Your Class",
      description: "Import students or add them manually"
    },
    {
      title: "Start Tracking",
      description: "Take attendance manually or with QR codes"
    }
  ];

  const faqs = [
    {
      q: "How do I switch between manual and QR attendance?",
      a: "Simply tap the mode switch button on your dashboard. You can change modes anytime, even mid-session."
    },
    {
      q: "Can I export data to my school's system?",
      a: "Yes! Export to Excel, CSV, or PDF formats. Compatible with most school management systems."
    },
    {
      q: "Is my data backed up automatically?",
      a: "Absolutely. All attendance records are backed up in real-time to our secure cloud."
    },
    {
      q: "How long does it take to set up?",
      a: "Most teachers are up and running in under 2 minutes. No technical knowledge required."
    }
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div 
          className="absolute w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        ></div>
        <div 
          className="absolute w-[400px] h-[400px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"
          style={{
            right: `${100 - mousePosition.x}%`,
            bottom: `${100 - mousePosition.y}%`,
            transform: 'translate(50%, 50%)'
          }}
        ></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-md border-b border-gray-200 fixed w-full z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-600">
                Attmark
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition text-sm">Features</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition text-sm">About</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition text-sm">How it Works</a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition text-sm">FAQ</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition text-sm">Contact</a>
              <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-2">
              <a href="#features" className="block py-2 text-gray-600">Features</a>
              <a href="#about" className="block py-2 text-gray-600">About</a>
              <a href="#how-it-works" className="block py-2 text-gray-600">How it Works</a>
              <a href="#faq" className="block py-2 text-gray-600">FAQ</a>
              <a href="#contact" className="block py-2 text-gray-600">Contact</a>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center bg-blue-50 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">Introducing Attmark</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Attendance tracking
                <br />
                <span className="text-blue-600">made simple</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Manual entry or QR codes • Generate reports • Export data • 24/7 support
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <button className="group bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center">
                  Start free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-blue-600 hover:text-blue-600 transition">
                  Watch demo
                </button>
              </div>
            </div>

            {/* Right Content */}
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Teacher using tablet"
                className="rounded-lg shadow-xl w-full h-auto relative z-10"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/600x400?text=Attmark+Attendance";
                }}
              />
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-100 rounded-lg -z-10"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-50 rounded-lg -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 bg-white/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Simple features, powerful results
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage attendance effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition hover:shadow-lg backdrop-blur-sm">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            About Attmark
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Attmark was built by teachers who wanted a better way to track attendance. 
            We're on a mission to simplify classroom management with intuitive tools 
            that save time and reduce paperwork.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">🎯</div>
              <div className="text-sm text-gray-600">Simple & Intuitive</div>
            </div>
            <div className="p-6 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">⚡</div>
              <div className="text-sm text-gray-600">Fast Setup</div>
            </div>
            <div className="p-6 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">🛡️</div>
              <div className="text-sm text-gray-600">Secure & Reliable</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-20 bg-white/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Get started in 3 simple steps
            </h2>
            <p className="text-gray-600">
              No complicated setup, no learning curve
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Frequently asked questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about Attmark
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/80 transition"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <span className="text-xl text-gray-400">{activeFaq === index ? '−' : '+'}</span>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4 text-sm text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-20 bg-white/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Get in touch
            </h2>
            <p className="text-gray-600">
              We'd love to hear from you
            </p>
          </div>

          {/* Simple Contact Form */}
          <form className="bg-white p-8 rounded-lg border border-gray-200 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white/80"
              />
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white/80"
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-600 bg-white/80"
            />
            <textarea
              rows="4"
              placeholder="Your message"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-600 bg-white/80"
            ></textarea>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to simplify attendance?
          </h2>
          <p className="text-gray-600 mb-8">
            Join Attmark today and start saving time
          </p>
          <button className="group bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center">
            Get started now
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Attmark</span>
              </div>
              <p className="text-gray-400 text-sm">
                Simple attendance tracking for teachers
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#about" className="hover:text-white transition">About</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
                <li><a href="#help" className="hover:text-white transition">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#privacy" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#terms" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Attmark. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
        @keyframes particle {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translate(calc(100vw * var(--direction-x, 1)), calc(100vh * var(--direction-y, 1))) scale(0); opacity: 0; }
        }
        .animate-particle {
          animation: particle linear infinite;
          --direction-x: ${Math.random() > 0.5 ? 1 : -1};
          --direction-y: ${Math.random() > 0.5 ? 1 : -1};
        }
      `}</style>
    </div>
  );
};

export default MainPage;