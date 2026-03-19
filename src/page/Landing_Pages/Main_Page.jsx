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
  Sparkles,
  Zap,
  Target,
  Award,
  ChevronRight,
  Star,
  Clock,
  Shield
} from 'lucide-react';

const MainPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Camera className="w-8 h-8 text-white" />,
      title: "Dual Mode Magic",
      description: "Flip between manual & QR attendance instantly",
      gradient: "from-blue-400 to-cyan-400",
      delay: "0s"
    },
    {
      icon: <FileText className="w-8 h-8 text-white" />,
      title: "Instant Reports",
      description: "Generate beautiful reports in seconds",
      gradient: "from-blue-500 to-purple-500",
      delay: "0.1s"
    },
    {
      icon: <Download className="w-8 h-8 text-white" />,
      title: "One-Click Export",
      description: "Export to any format you need",
      gradient: "from-cyan-400 to-teal-400",
      delay: "0.2s"
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-white" />,
      title: "Smart Recovery",
      description: "Auto-backup means zero data loss",
      gradient: "from-indigo-400 to-blue-400",
      delay: "0.3s"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-white" />,
      title: "AI Assistant",
      description: "Your personal guide, always ready to help",
      gradient: "from-purple-400 to-pink-400",
      delay: "0.4s"
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8 text-white" />,
      title: "Lightning Support",
      description: "24/7 support that actually responds",
      gradient: "from-blue-400 to-indigo-400",
      delay: "0.5s"
    }
  ];

  const steps = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Sign up",
      description: "Takes 30 seconds, really"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Add your class",
      description: "Import or create in minutes"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Done!",
      description: "Start taking attendance"
    }
  ];

  const faqs = [
    {
      q: "Is it really free?",
      a: "100% free for teachers. No hidden costs, no credit card needed. We believe attendance tracking should be accessible to everyone."
    },
    {
      q: "How fast can I start?",
      a: "Under 2 minutes. Seriously, time it. Sign up, add your class, and you're ready to take attendance."
    },
    {
      q: "What if I need help?",
      a: "Our AI assistant guides you step-by-step. Plus, our support team is available 24/7 if you need human help."
    },
    {
      q: "Can I switch between manual and QR?",
      a: "Absolutely! Toggle between modes anytime. Use QR for speed, manual for flexibility."
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
            left: '10%', 
            top: '20%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        ></div>
        <div 
          className="absolute w-[600px] h-[600px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"
          style={{ 
            right: '5%', 
            bottom: '10%',
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`
          }}
        ></div>
        <div 
          className="absolute w-[400px] h-[400px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000"
          style={{ 
            left: '30%', 
            bottom: '30%',
            transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * -0.015}px)`
          }}
        ></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          opacity: 0.4
        }}></div>
        
        {/* Moving Lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent animate-slide"></div>
          <div className="absolute top-40 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent animate-slide animation-delay-1000"></div>
          <div className="absolute top-60 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent animate-slide animation-delay-2000"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-md border-b border-gray-200/50 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Attmark
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition font-medium">How it Works</a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition font-medium">FAQ</a>
              <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-xl hover:shadow-lg transition transform hover:-translate-y-0.5 font-medium">
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
              <a href="#how-it-works" className="block py-2 text-gray-600">How it Works</a>
              <a href="#faq" className="block py-2 text-gray-600">FAQ</a>
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-xl">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Energetic */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full px-4 py-2 mb-6 border border-blue-100">
                <Sparkles className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Attendance, reimagined
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Attendance
                </span>
                <br />
                <span className="text-gray-900">that doesn't feel</span>
                <br />
                <span className="text-gray-900">like a chore</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Manual entry? QR codes? We've got both. Generate reports, export data, 
                and get 24/7 support. All without the headache.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <button className="group bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition text-lg font-semibold flex items-center shadow-lg">
                  Start free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                </button>
                <button className="bg-white text-gray-700 px-8 py-4 rounded-xl hover:text-blue-600 transition text-lg font-semibold border border-gray-200 hover:border-blue-200 shadow-sm">
                  Watch 60s demo
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full border-2 border-white"></div>
                  ))}
                </div>
                <span>Join early access →</span>
              </div>
            </div>

            {/* Right Content - Dynamic Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Teacher using tablet"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/600x400?text=Attmark";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 animate-bounce-slow">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">QR ready</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 animate-bounce-slow animation-delay-1000">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-cyan-500" />
                  <span className="text-sm font-medium">30s setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Energetic Cards */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Packed with <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">powerful</span> features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need, nothing you don't
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fadeInUp"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                
                {/* Decorative Element */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Energetic Timeline */}
      <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start in <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">30 seconds</span>
            </h2>
            <p className="text-xl text-gray-600">
              Yes, it's really that fast
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-16 h-0.5 bg-gradient-to-r from-blue-200 to-cyan-200 -translate-y-1/2">
                    <div className="absolute right-0 top-1/2 w-2 h-2 bg-blue-400 rounded-full -translate-y-1/2"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Energetic Accordion */}
      <section id="faq" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Got questions? <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">We've got answers</span>
            </h2>
            <p className="text-xl text-gray-600">
              The stuff people usually ask
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <button
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span className="font-bold text-gray-900">{faq.q}</span>
                  <span className={`w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white flex items-center justify-center text-xl transition-transform ${activeFaq === index ? 'rotate-180' : ''}`}>
                    {activeFaq === index ? '−' : '+'}
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-5 text-gray-600 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Energetic */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 animate-pulse"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to transform attendance?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join the teachers who've made attendance their favorite part of the day
              </p>
              <button className="group bg-white text-blue-600 px-10 py-4 rounded-xl hover:shadow-2xl transition text-lg font-bold inline-flex items-center">
                Get Attmark free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
              </button>
              <p className="text-white/80 text-sm mt-4">
                No credit card • No hidden fees • Forever free
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Attmark
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Making attendance fun since 2024
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-300">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How it Works</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-300">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#guide" className="hover:text-white transition">Teacher's Guide</a></li>
                <li><a href="#blog" className="hover:text-white transition">Blog</a></li>
                <li><a href="#updates" className="hover:text-white transition">Updates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-300">Connect</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#twitter" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#linkedin" className="hover:text-white transition">LinkedIn</a></li>
                <li><a href="#instagram" className="hover:text-white transition">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Attmark. Built for teachers, by teachers.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-slide {
          animation: slide 8s linear infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default MainPage;