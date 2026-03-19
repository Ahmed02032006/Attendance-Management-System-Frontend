import React from 'react';
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
  X
} from 'lucide-react';

const MainPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const features = [
    {
      icon: <Camera className="w-8 h-8 text-blue-600" />,
      title: "Dual Attendance Modes",
      description: "Choose manual entry or QR-based scanning - both quick and easy"
    },
    {
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      title: "Smart Reporting",
      description: "Generate comprehensive attendance reports with one click"
    },
    {
      icon: <Download className="w-8 h-8 text-blue-600" />,
      title: "Easy Data Export",
      description: "Export data to Excel, PDF, or CSV formats instantly"
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-blue-600" />,
      title: "Easy Data Recovery",
      description: "Never lose attendance data with automatic backup & recovery"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
      title: "AI Chatbot Guide",
      description: "Smart assistant guides you through every feature step-by-step"
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8 text-blue-600" />,
      title: "24/7 Priority Support",
      description: "Round-the-clock assistance whenever you need it"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Create Account",
      description: "Enter email & password - takes less than 2 minutes"
    },
    {
      number: "2",
      title: "Set Up Class",
      description: "Add your subjects, classes, and students"
    },
    {
      number: "3",
      title: "Start Taking Attendance",
      description: "Begin tracking attendance manually or with QR codes"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "High School Teacher",
      quote: "AttendEase has saved me hours of manual work. The QR code feature is a game-changer!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "College Professor",
      quote: "The reporting and export features make it so easy to track attendance trends.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Elementary Teacher",
      quote: "So intuitive to use! The chatbot guide helped me get started in minutes.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">AttendEase</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
              <a href="#support" className="text-gray-700 hover:text-blue-600">Support</a>
              <a href="#login" className="text-gray-700 hover:text-blue-600">Login</a>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Sign Up Free
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-2">
              <a href="#features" className="block py-2 text-gray-700">Features</a>
              <a href="#pricing" className="block py-2 text-gray-700">Pricing</a>
              <a href="#support" className="block py-2 text-gray-700">Support</a>
              <a href="#login" className="block py-2 text-gray-700">Login</a>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg">
                Sign Up Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Smart Attendance Management for Modern Teachers
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Track attendance manually or with QR codes • Generate detailed reports • 24/7 support
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold">
                  Create Free Account
                </button>
                <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition text-lg font-semibold">
                  Watch Demo
                </button>
              </div>
              <div className="mt-6 flex items-center text-sm text-gray-500">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                No credit card required • 14-day free trial
              </div>
            </div>
            <div className="relative">
              <img 
                src="/api/placeholder/600/400" 
                alt="Teacher using attendance app"
                className="rounded-lg shadow-xl"
              />
              {/* Floating QR Code Indicator */}
              <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-lg shadow-lg">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Everything You Need to Manage Attendance
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Powerful features designed specifically for teachers, making attendance tracking effortless
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Get Started in Under 2 Minutes
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Simple 3-step process to start taking attendance
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-6 -right-4 w-6 h-6 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Loved by Teachers Everywhere
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Join 10,000+ happy teachers who have simplified their attendance tracking
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-blue-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Simplify Your Attendance Tracking?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of teachers who have already made the switch
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition text-lg font-semibold">
            Create Your Free Account Now
          </button>
          <p className="text-blue-100 mt-4 text-sm">
            No credit card required • Free 14-day trial
          </p>
        </div>
      </section>

      {/* Chatbot Widget */}
      <div className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer">
        <MessageCircle className="w-6 h-6" />
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">AttendEase</h3>
              <p className="text-gray-400">Smart attendance tracking for modern educators</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#demo" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#help" className="hover:text-white">Help Center</a></li>
                <li><a href="#contact" className="hover:text-white">Contact Us</a></li>
                <li><a href="#chat" className="hover:text-white">Live Chat</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@attendease.com</li>
                <li>1-800-ATTEND-EASE</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AttendEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;