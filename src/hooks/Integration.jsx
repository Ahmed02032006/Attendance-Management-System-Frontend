import React, { useState } from 'react';
import { Code, Copy, Check, Globe, Shield, Zap, Smartphone, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

const Integration = () => {
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState('iframe');

  const baseUrl = window.location.origin;
  
  const iframeCode = `<iframe 
  src="${baseUrl}/embed/dashboard" 
  width="100%" 
  height="600px" 
  frameborder="0" 
  allow="camera; microphone"
  style="border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"
></iframe>`;

  const scriptCode = `<script src="${baseUrl}/embed-sdk.js" async></script>
<div id="attendly-widget"></div>
<script>
  AttendlyWidget.init({
    container: '#attendly-widget',
    theme: 'light', // or 'dark'
    width: '100%',
    height: '600px'
  });
</script>`;

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const features = [
    {
      icon: Globe,
      title: 'Universal Integration',
      description: 'Embed on any website using simple iframe or JavaScript SDK'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'SSO support and secure token-based authentication'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Live attendance tracking and instant notifications'
    },
    {
      icon: Smartphone,
      title: 'Responsive Design',
      description: 'Automatically adapts to any screen size'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Platform Integration</h1>
        <p className="text-slate-600">
          Embed Attendly's attendance management system directly into your website or application
        </p>
      </div>

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

      {/* Integration Tabs */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedTab('iframe')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'iframe'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Iframe Integration
            </button>
            <button
              onClick={() => setSelectedTab('sdk')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'sdk'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              JavaScript SDK
            </button>
          </div>
        </div>

        <div className="p-6">
          {selectedTab === 'iframe' ? (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Simple Iframe Integration</h3>
              <p className="text-slate-600 mb-4">
                Copy and paste this code into your website's HTML where you want the attendance system to appear:
              </p>
              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{iframeCode}</code>
                </pre>
                <button
                  onClick={() => handleCopyCode(iframeCode)}
                  className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Iframe Parameters
                </h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li><strong>src:</strong> The embed URL for your dashboard</li>
                  <li><strong>width:</strong> Set to 100% for responsive design</li>
                  <li><strong>height:</strong> Adjust based on your layout needs</li>
                  <li><strong>allow:</strong> Permissions for camera/microphone if needed</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">JavaScript SDK Integration</h3>
              <p className="text-slate-600 mb-4">
                For more control and advanced features, use our JavaScript SDK:
              </p>
              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{scriptCode}</code>
                </pre>
                <button
                  onClick={() => handleCopyCode(scriptCode)}
                  className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">SDK Configuration Options</h4>
                <pre className="text-sm text-blue-700 bg-white p-3 rounded border border-blue-200">
                  {`{
  container: '#element-id',    // CSS selector for container
  theme: 'light',              // 'light' or 'dark'
  width: '100%',               // Width of widget
  height: '600px',             // Height of widget
  autoResize: true,            // Auto-adjust height
  onLoad: function() {},       // Callback when loaded
  onError: function(error) {}  // Error handling
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Authentication Guide */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Authentication Setup</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">1</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-700">Generate API Key</h4>
              <p className="text-sm text-slate-600">Create an API key from your dashboard settings for secure authentication</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">2</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-700">Add to iframe URL</h4>
              <p className="text-sm text-slate-600">Append your API key to the embed URL: <code className="bg-slate-100 px-2 py-1 rounded">?api_key=YOUR_API_KEY</code></p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-700">Configure SSO (Optional)</h4>
              <p className="text-sm text-slate-600">Enable single sign-on for seamless user authentication across platforms</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            <strong className="font-medium">Note:</strong> For security reasons, always use HTTPS in production environments. 
            Test your integration in staging first before deploying to live sites.
          </p>
        </div>
      </div>

      {/* Live Preview */}
      <div className="mt-8 bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Live Preview</h3>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="ml-4 text-xs text-slate-500">Preview Mode</span>
          </div>
          <div className="p-4 bg-white">
            <div className="bg-slate-100 rounded-lg p-8 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Your embedded attendance system will appear here</p>
                <p className="text-sm mt-2">Login required for actual content</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integration;