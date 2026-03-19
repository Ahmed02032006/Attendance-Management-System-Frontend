import React, { useState } from 'react';
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
  Clock,
  Shield
} from 'lucide-react';

const MainPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: <div className="relative"><Camera className="w-8 h-8 text-white" /><QrCode className="w-4 h-4 text-white absolute -bottom-1 -right-1" /></div>,
      title: "Flexible Attendance",
      description: "Switch between manual entry and QR scanning seamlessly",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      title: "Advanced Analytics",
      description: "Visual reports and insights at your fingertips",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Download className="w-8 h-8 text-white" />,
      title: "Instant Export",
      description: "Export to Excel, PDF, or CSV with one click",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-white" />,
      title: "Auto Backup",
      description: "Never lose data with automatic cloud backup",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-white" />,
      title: "Smart Assistant",
      description: "AI-powered guide for instant help",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8 text-white" />,
      title: "Priority Support",
      description: "24/7 access to our support team",
      color: "from-teal-500 to-green-500"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Teachers", icon: <Users className="w-6 h-6" /> },
    { number: "1M+", label: "Daily Attendances", icon: <CheckCircle className="w-6 h-6" /> },
    { number: "99.9%", label: "Uptime", icon: <Shield className="w-6 h-6" /> },
    { number: "< 2min", label: "Setup Time", icon: <Clock className="w-6 h-6" /> }
  ];

  const steps = [
    {
      icon: <div className="text-3xl">✨</div>,
      title: "One-Click Signup",
      description: "Use your Google account - no forms to fill"
    },
    {
      icon: <div className="text-3xl">📚</div>,
      title: "Import Your Class",
      description: "Upload from Excel or create in minutes"
    },
    {
      icon: <div className="text-3xl">✅</div>,
      title: "Start Tracking",
      description: "Begin taking attendance immediately"
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
      q: "How does the AI chatbot help?",
      a: "Our smart assistant guides you through features, answers questions, and helps troubleshoot instantly."
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Floating gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-md border-b border-gray-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AttendFlow
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">How it Works</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 transition">FAQ</a>
              <a href="#support" className="text-gray-600 hover:text-gray-900 transition">Support</a>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition transform hover:-translate-y-0.5">
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
              <a href="#support" className="block py-2 text-gray-600">Support</a>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Modern Asymmetric Design */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center bg-purple-100 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-600">Trusted by 50,000+ teachers</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Attendance
                </span>
                <br />
                <span className="text-gray-900">made magical</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The modern way to track attendance. Whether you prefer manual entry or QR codes, 
                we've made it effortless. No complicated setups, no learning curve.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <button className="group bg-gray-900 text-white px-8 py-4 rounded-full hover:bg-gray-800 transition text-lg font-semibold flex items-center">
                  Start free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-gray-400 transition text-lg font-semibold">
                  See how it works
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center md:text-left">
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-500 flex items-center justify-center md:justify-start">
                      {stat.icon}
                      <span className="ml-1">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Hero Image with Creative Layout */}
            <div className="relative lg:block">
              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Teacher using tablet in classroom"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/600x400?text=Attendance+Management";
                  }}
                />
                
                {/* Floating Elements */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 animate-float">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Today's Attendance</p>
                      <p className="text-2xl font-bold text-green-600">28/30</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 animate-float animation-delay-2000">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">QR Scans</p>
                      <p className="text-2xl font-bold text-purple-600">156</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Card Grid with Gradients */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need, nothing you don't
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make attendance tracking effortless, 
              whether you're tech-savvy or just getting started.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}></div>
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <Shield className="w-4 h-4 mr-2" />
              Free forever for teachers • No hidden costs • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Minimal Steps */}
      <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Three clicks. That's it.
            </h2>
            <p className="text-xl text-gray-600">
              Get started in less time than it takes to call roll
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                
                {/* Connector Line (except last) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-purple-200 to-pink-200">
                    <div className="absolute right-0 -top-1.5 w-3 h-3 bg-purple-400 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Got questions? We've got answers.
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about AttendFlow
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <span className="text-2xl text-gray-400">{activeFaq === index ? '−' : '+'}</span>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-green-100 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium text-green-600">100% free forever</span>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Start tracking attendance
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              the modern way
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of teachers who have simplified their attendance tracking. 
            No credit card required, no hidden fees.
          </p>
          <button className="group bg-gray-900 text-white px-10 py-5 rounded-full hover:bg-gray-800 transition text-lg font-semibold inline-flex items-center">
            Create free account
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </section>

      {/* Chatbot Widget */}
      <div className="fixed bottom-6 right-6 group cursor-pointer z-50">
        <div className="absolute -top-16 right-0 bg-white rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <p className="text-sm text-gray-600">Hi! Need help? 👋</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
          <MessageCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-xl font-bold">AttendFlow</span>
              </div>
              <p className="text-gray-400 text-sm">
                Making attendance tracking effortless for teachers everywhere.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How it Works</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#help" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#chat" className="hover:text-white transition">Live Chat</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#privacy" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#terms" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 AttendFlow. Built for teachers, by teachers.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MainPage;