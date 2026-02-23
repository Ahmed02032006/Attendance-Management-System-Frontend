import React, { useState } from 'react';
import { Code, Copy, Check, Globe, Shield, Zap, Smartphone, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import HeaderComponent from '../../components/HeaderComponent';

const AdminIntegration_Page = () => {
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const baseUrl = "https://attendance-management-system-fronte-two.vercel.app";

  const iframeCode = `<!-- Attendly Integration -->
<iframe 
  src="${baseUrl}/auth/login?embed=true" 
  width="100%" 
  height="600px" 
  frameborder="0" 
  style="border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"
  allow="camera; microphone"
></iframe>`;

  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website with Attendly</title>
    <style>
        .attendly-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="attendly-container">
        <h1>Welcome to My Website</h1>
        <p>Here's our attendance management system:</p>
        
        <!-- Attendly Integration -->
        <iframe 
            src="${baseUrl}/auth/login?embed=true" 
            width="100%" 
            height="600px" 
            frameborder="0" 
            style="border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"
            allow="camera; microphone"
        ></iframe>
    </div>
</body>
</html>`;

  const handleCopyIframe = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopiedIframe(true);
    toast.success('Iframe code copied to clipboard!');
    setTimeout(() => setCopiedIframe(false), 3000);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopiedScript(true);
    toast.success('Complete HTML example copied!');
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const features = [
    {
      icon: Globe,
      title: 'Universal Integration',
      description: 'Embed on any website using simple iframe - works with HTML, CSS, JavaScript, WordPress, Wix, and more'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Users can log in securely through the embedded iframe'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Live attendance tracking works seamlessly in iframe'
    },
    {
      icon: Smartphone,
      title: 'Fully Responsive',
      description: 'Automatically adapts to any screen size and device'
    }
  ];

  const steps = [
    {
      title: 'Copy the iframe code',
      description: 'Use the simple iframe code below and paste it into your website HTML'
    },
    {
      title: 'Adjust dimensions',
      description: 'Modify the width and height values to match your website layout'
    },
    {
      title: 'Add to your website',
      description: 'Paste the code anywhere in your HTML where you want the attendance system to appear'
    },
    {
      title: 'Test the integration',
      description: 'Visit your website and test the login functionality'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <HeaderComponent
        heading={"Website Integration"}
        subHeading={"Add Attendly to Your Site"}
        role="admin"
      />

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <feature.icon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Integration Steps */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Quick Integration Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full mb-3 font-bold">
                {index + 1}
              </div>
              <h3 className="font-medium text-slate-800 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Iframe Integration Code */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="border-b border-slate-200 bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <Code className="w-5 h-5 mr-2 text-blue-600" />
            Simple Iframe Integration
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Copy this code and paste it anywhere in your HTML where you want the attendance system to appear
          </p>
        </div>

        <div className="p-6">
          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{iframeCode}</code>
            </pre>
            <button
              onClick={handleCopyIframe}
              className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors flex items-center gap-2"
            >
              {copiedIframe ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Iframe Parameters
              </h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li><strong>src:</strong> {baseUrl}/auth/login?embed=true</li>
                <li><strong>width:</strong> Set to 100% for responsive design</li>
                <li><strong>height:</strong> Adjust based on your needs (600px default)</li>
                <li><strong>allow:</strong> Permissions for camera/microphone if needed</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Customization Options
              </h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li>Add ?theme=dark to URL for dark mode</li>
                <li>Add ?hideHeader=true to hide navigation</li>
                <li>Style the iframe with CSS border and shadow</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Complete HTML Example */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="border-b border-slate-200 bg-linear-to-r from-purple-50 to-pink-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-purple-600" />
            Complete HTML Example
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            A complete HTML template you can use as a starting point
          </p>
        </div>

        <div className="p-6">
          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96">
              <code>{htmlCode}</code>
            </pre>
            <button
              onClick={handleCopyHtml}
              className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors flex items-center gap-2"
            >
              {copiedScript ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-xs">Copy HTML</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Platform-Specific Guides */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Platform-Specific Integration</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
            <h3 className="font-medium text-slate-800 mb-2">WordPress</h3>
            <p className="text-sm text-slate-600 mb-3">Add to any page using HTML block or widget</p>
            <div className="text-xs bg-slate-100 p-2 rounded">
              Use the "Custom HTML" block in Gutenberg or add to text widget
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
            <h3 className="font-medium text-slate-800 mb-2">Wix</h3>
            <p className="text-sm text-slate-600 mb-3">Add using Embed Code element</p>
            <div className="text-xs bg-slate-100 p-2 rounded">
              Add → Embed → Embed Code → Paste HTML
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
            <h3 className="font-medium text-slate-800 mb-2">Shopify</h3>
            <p className="text-sm text-slate-600 mb-3">Add to any page using custom HTML section</p>
            <div className="text-xs bg-slate-100 p-2 rounded">
              Customize theme → Add section → Custom HTML
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Guide */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Preview Your Integration</h2>
        <p className="text-slate-600 mb-4">
          After adding the iframe code to your website, your users will see the login page.
          Once logged in, they'll have full access to the attendance management system.
        </p>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="ml-4 text-xs text-slate-500">Preview - How it looks embedded</span>
          </div>
          <div className="p-4 bg-white">
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
              <div className="text-center text-blue-600 mb-3">
                <Globe className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">Your Website Content</p>
              </div>

              {/* Iframe Preview */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-slate-600">Attendly Attendance System</span>
                  </div>
                  <span className="text-xs text-slate-400">iframe</span>
                </div>
                <div className="h-32 bg-linear-to-r from-blue-50 to-indigo-50 rounded flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Login page will appear here</p>
                    <p className="text-xs text-slate-400 mt-1">After login, full dashboard loads</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-blue-600 mt-3">
                <p className="text-sm">↓ More Your Website Content ↓</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            <strong className="font-medium">Note:</strong> Make sure your website uses HTTPS for secure iframe embedding.
            Test on a staging site first before adding to production.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminIntegration_Page;
