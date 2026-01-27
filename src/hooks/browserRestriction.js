import React from 'react';
import { isMobile, isChrome, browserVersion } from 'react-device-detect';

const BrowserRestriction = ({ children }) => {
  // Check if user is on Mobile Chrome
  const isMobileChrome = isMobile && isChrome;
  
  // You can also check Chrome version if needed
  // const isValidChromeVersion = parseInt(browserVersion) >= 50; // Example: Chrome 50+

  if (!isMobileChrome) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200 p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          
          <p className="text-gray-600 mb-4">
            This page is optimized for <span className="font-semibold text-blue-600">Google Chrome on mobile devices</span> only.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
            <h3 className="font-medium text-yellow-800 mb-2">To access this page:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Use a mobile device (smartphone or tablet)</li>
              <li>• Open Google Chrome browser</li>
              <li>• Ensure Chrome is updated to latest version</li>
              <li>• Allow camera permissions if prompted</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.google.com/chrome/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12S18.627 0 12 0c-4.01 0-7.62 1.97-9.869 5.47zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728z"/>
              </svg>
              Download Chrome
            </a>
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Page
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Detected: {isMobile ? 'Mobile' : 'Desktop'} • {isChrome ? 'Chrome' : 'Other Browser'}
              {isChrome && ` • Version: ${browserVersion}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default BrowserRestriction;