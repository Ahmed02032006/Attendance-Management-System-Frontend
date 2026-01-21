import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const QRScanner_Page = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanInterval = useRef(null);

  // Enhanced QR data parsing with expiry check
  const parseQRData = (qrDataString) => {
    if (!qrDataString) {
      throw new Error('Empty attendance code');
    }

    console.log('Attendance Code for parsing:', qrDataString);

    // Try to parse as URL first (simplified format)
    try {
      const url = new URL(qrDataString);
      const urlParams = new URLSearchParams(url.search);

      // Check expiry
      const expiryTimestamp = urlParams.get('expiry');
      if (expiryTimestamp) {
        const expiryTime = new Date(parseInt(expiryTimestamp));
        const currentTime = new Date();

        if (currentTime > expiryTime) {
          throw new Error('Attendance code has expired. Please enter a fresh code.');
        }
      }

      const code = urlParams.get('code');
      if (!code) {
        throw new Error('Invalid attendance code: No code found');
      }

      const parsedData = {
        type: 'attendance',
        code: code,
        originalCode: code,
        subject: urlParams.get('subject') || 'Unknown Subject',
        subjectName: urlParams.get('subjectName') || 'Unknown Subject',
        attendanceTime: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        attendanceDate: new Date().toISOString().split('T')[0],
        timestamp: urlParams.get('timestamp') ? new Date(parseInt(urlParams.get('timestamp'))).toISOString() : new Date().toISOString(),
        expiryTimestamp: expiryTimestamp ? new Date(parseInt(expiryTimestamp)).toISOString() : null,
      };

      return parsedData;
    } catch (error) {
      console.log('Not a URL format, trying JSON:', error);
    }

    // Try to parse as JSON (for backward compatibility)
    try {
      const parsedData = JSON.parse(qrDataString);

      // Validate expiry
      if (parsedData.expiryTimestamp) {
        const expiryTime = new Date(parsedData.expiryTimestamp);
        const currentTime = new Date();

        if (currentTime > expiryTime) {
          throw new Error('Attendance code has expired. Please enter a fresh code.');
        }
      }

      // Validate required fields for attendance
      if (parsedData.type === 'attendance') {
        const validatedData = {
          type: 'attendance',
          code: parsedData.code || parsedData.id || qrDataString,
          originalCode: parsedData.originalCode || parsedData.code,
          subject: parsedData.subject || 'Unknown Subject',
          subjectName: parsedData.subjectName || parsedData.subject || 'Unknown Subject',
          attendanceTime: parsedData.attendanceTime || parsedData.time || new Date().toLocaleTimeString(),
          attendanceDate: parsedData.attendanceDate || parsedData.date || new Date().toISOString().split('T')[0],
          timestamp: parsedData.timestamp || new Date().toISOString(),
          expiryTimestamp: parsedData.expiryTimestamp,
        };

        return validatedData;
      }

      // If it's JSON but not attendance type, return as is
      return parsedData;
    } catch (error) {
      console.log('Not JSON format, trying other formats:', error);
    }

    // Check for expired codes in URL format
    if (qrDataString.includes('expiry=')) {
      try {
        const urlParams = new URLSearchParams(qrDataString.includes('?')
          ? qrDataString.split('?')[1]
          : qrDataString
        );

        const expiryTimestamp = urlParams.get('expiry');
        if (expiryTimestamp) {
          const expiryTime = new Date(parseInt(expiryTimestamp));
          const currentTime = new Date();

          if (currentTime > expiryTime) {
            throw new Error('Attendance code has expired. Please enter a fresh code.');
          }
        }
      } catch (urlError) {
        console.log('Error checking alternative URL expiry:', urlError);
      }
    }

    // Check if it's URL encoded data
    if (qrDataString.includes('=') && (qrDataString.includes('?') || qrDataString.includes('&'))) {
      try {
        const urlParams = new URLSearchParams(qrDataString.includes('?')
          ? qrDataString.split('?')[1]
          : qrDataString
        );

        return {
          type: 'attendance',
          code: urlParams.get('code') || urlParams.get('id') || qrDataString,
          subject: urlParams.get('subject') || 'Unknown Subject',
          subjectName: urlParams.get('subjectName') || urlParams.get('subject') || 'Unknown Subject',
          attendanceTime: urlParams.get('attendanceTime') || urlParams.get('time') || new Date().toLocaleTimeString(),
          attendanceDate: urlParams.get('attendanceDate') || urlParams.get('date') || new Date().toISOString().split('T')[0],
          timestamp: new Date().toISOString(),
        };
      } catch (urlError) {
        console.log('Not a URL format, using plain text');
      }
    }

    // Plain text fallback - treat as simple attendance code
    return {
      type: 'attendance',
      code: qrDataString,
      subject: 'Class Session',
      subjectName: 'Class Session',
      attendanceTime: new Date().toLocaleTimeString(),
      attendanceDate: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    };
  };

  const navigateToAttendancePage = (qrData) => {
    navigate('/student-attendance', {
      state: {
        qrData: JSON.stringify(qrData)
      }
    });
  };

  // Generate dotted code pattern
  const generateDottedCode = () => {
    const rows = 5;
    const cols = 8;
    let pattern = '';
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        // Randomly place dots (80% chance)
        pattern += Math.random() < 0.8 ? '•' : ' ';
      }
      pattern += '\n';
    }
    
    return pattern;
  };

  // Check dotted code pattern
  const checkDottedCodePattern = (pattern) => {
    // Simple validation - check if it has dots in a grid pattern
    const lines = pattern.split('\n').filter(line => line.trim());
    if (lines.length < 3 || lines.length > 10) return false;
    
    const firstLineLength = lines[0].length;
    for (const line of lines) {
      if (line.length !== firstLineLength) return false;
      if (!line.includes('•')) return false;
    }
    
    return true;
  };

  // Handle manual code submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    
    if (!manualCode.trim()) {
      toast.error('Please enter the attendance code');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Clean the code - remove spaces and special characters except dots
      const cleanedCode = manualCode.trim();
      
      // Check if it's a dotted pattern or regular code
      let parsedData;
      
      if (cleanedCode.includes('•')) {
        // It's a dotted code
        if (!checkDottedCodePattern(cleanedCode)) {
          throw new Error('Invalid dotted pattern. Please check the code.');
        }
        
        // For dotted codes, we need to extract the actual code
        // In a real system, you'd decode the pattern here
        // For now, we'll simulate extraction
        const extractedCode = extractCodeFromPattern(cleanedCode);
        
        parsedData = {
          type: 'attendance',
          code: extractedCode,
          originalCode: extractedCode,
          subject: 'Class Session',
          subjectName: 'Class Session',
          attendanceTime: new Date().toLocaleTimeString(),
          attendanceDate: new Date().toISOString().split('T')[0],
          timestamp: new Date().toISOString(),
        };
      } else {
        // It's a regular code or URL
        parsedData = parseQRData(cleanedCode);
        
        // Check expiry
        if (parsedData.expiryTimestamp) {
          const expiryTime = new Date(parsedData.expiryTimestamp);
          const currentTime = new Date();
          
          if (currentTime > expiryTime) {
            throw new Error('Attendance code has expired. Please enter a fresh code.');
          }
        }
      }
      
      toast.success('Code validated successfully!');
      
      setTimeout(() => {
        navigateToAttendancePage(parsedData);
      }, 1000);
      
    } catch (error) {
      console.error('Error processing code:', error);
      toast.error(error.message || 'Invalid attendance code');
      setIsProcessing(false);
    }
  };

  // Extract code from dotted pattern (simplified version)
  const extractCodeFromPattern = (pattern) => {
    // In a real implementation, this would decode the pattern
    // For now, we'll generate a code based on dot positions
    const lines = pattern.split('\n').filter(line => line.trim());
    let binaryString = '';
    
    for (const line of lines) {
      for (const char of line) {
        binaryString += char === '•' ? '1' : '0';
      }
    }
    
    // Convert binary to hex (simplified)
    const hexCode = parseInt(binaryString, 2).toString(16).substring(0, 8);
    return `CODE_${hexCode.toUpperCase()}`;
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Attendance Scanner
          </h2>

          {/* Manual Code Input */}
          <div className="mb-6">
            <form onSubmit={handleManualSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="manualCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Attendance Code *
                  </label>
                  <textarea
                    id="manualCode"
                    name="manualCode"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Paste the dotted pattern or enter code here"
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors font-mono text-lg"
                    rows="4"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the dotted pattern (e.g., ••• •• •••) or paste the full code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !manualCode.trim()}
                  className="w-full bg-sky-600 text-white py-3 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Validating...
                    </span>
                  ) : (
                    'Validate & Continue'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Dotted Pattern Example */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Example Dotted Pattern:</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-center whitespace-pre">
              {generateDottedCode()}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              The teacher will display a similar pattern. Copy and paste it above.
            </p>
          </div>

          {/* Scan Result Preview */}
          {scanResult && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-800">Code validated successfully!</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Redirecting to attendance page...</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-sky-50 border border-sky-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-sky-800 mb-2">How to use:</h3>
          <ul className="text-sm text-sky-700 space-y-1">
            <li>• <strong>Manual Entry:</strong> Enter the dotted pattern shown by teacher</li>
            <li>• <strong>Copy & Paste:</strong> Copy the exact pattern with dots and spaces</li>
            <li>• <strong>Tips:</strong> Ensure you copy all dots and spaces accurately</li>
            <li>• <strong>Note:</strong> Each pattern is unique and expires after 80 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner_Page;