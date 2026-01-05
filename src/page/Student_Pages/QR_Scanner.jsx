import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsQR from 'jsqr';

const QRScanner_Page = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChromeBrowser, setIsChromeBrowser] = useState(false);
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanInterval = useRef(null);

  // Strict Chrome detection only
  const checkChromeBrowser = () => {
    const userAgent = navigator.userAgent;
    
    // Strict Chrome detection - only allow Google Chrome
    // Check for Chrome (not Chromium-based browsers)
    const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    
    // Even stricter: Check for Chrome mobile or desktop
    const isChromeMobile = /Chrome/.test(userAgent) && /Mobile/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    const isChromeDesktop = /Chrome/.test(userAgent) && !/Mobile/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    
    // Check for Chrome iOS
    const isCriOS = /CriOS/.test(userAgent);
    
    // Final check: Must be Chrome (mobile, desktop, or iOS) AND from Google Inc.
    const chromeDetected = (isChrome || isCriOS) && /Google Inc/.test(navigator.vendor);
    
    console.log('Browser Detection:', {
      userAgent: userAgent,
      vendor: navigator.vendor,
      isChrome: isChrome,
      isChromeMobile: isChromeMobile,
      isChromeDesktop: isChromeDesktop,
      isCriOS: isCriOS,
      chromeDetected: chromeDetected,
      isChromeStrict: /Chrome/.test(userAgent) && !/Edge/.test(userAgent) && !/Edg/.test(userAgent) && !/OPR/.test(userAgent) && !/Brave/.test(userAgent) && !/YaBrowser/.test(userAgent) && !/SamsungBrowser/.test(userAgent) && /Google Inc/.test(navigator.vendor)
    });
    
    // Strict Chrome only detection (blocks Brave, Edge, Opera, Samsung, etc.)
    const strictChromeOnly = /Chrome/.test(userAgent) && 
                            !/Edge/.test(userAgent) && 
                            !/Edg/.test(userAgent) && 
                            !/OPR/.test(userAgent) && 
                            !/Opera/.test(userAgent) &&
                            !/Brave/.test(userAgent) && 
                            !/YaBrowser/.test(userAgent) && 
                            !/SamsungBrowser/.test(userAgent) &&
                            !/Vivaldi/.test(userAgent) &&
                            !/Chromium/.test(userAgent) &&
                            /Google Inc/.test(navigator.vendor);
    
    setIsChromeBrowser(strictChromeOnly || isCriOS);
    return strictChromeOnly || isCriOS;
  };

  // Enhanced QR data parsing with immediate expiry check
  const parseQRData = (qrDataString) => {
    if (!qrDataString) {
      throw new Error('Empty QR code data');
    }

    console.log('QR Data for parsing:', qrDataString);

    // Try to parse as URL first (new simplified format)
    try {
      const url = new URL(qrDataString);
      const urlParams = new URLSearchParams(url.search);

      // Already checked expiry in scanQRCode, but double-check here
      const expiryTimestamp = urlParams.get('expiry');
      if (expiryTimestamp) {
        const expiryTime = new Date(parseInt(expiryTimestamp));
        const currentTime = new Date();

        if (currentTime > expiryTime) {
          throw new Error('QR code has expired. Please scan a fresh QR code.');
        }
      }

      const code = urlParams.get('code');
      if (!code) {
        throw new Error('Invalid QR code: No attendance code found');
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

      // Validate QR code expiry (double-check)
      if (parsedData.expiryTimestamp) {
        const expiryTime = new Date(parsedData.expiryTimestamp);
        const currentTime = new Date();

        if (currentTime > expiryTime) {
          throw new Error('QR code has expired. Please scan a fresh QR code.');
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

    // Check for expired QR codes in URL format (alternative)
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
            throw new Error('QR code has expired. Please scan a fresh QR code.');
          }
        }
      } catch (urlError) {
        console.log('Error checking alternative URL expiry:', urlError);
      }
    }

    // Check if it's URL encoded data (alternative format)
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

    // Plain text fallback
    return {
      type: 'attendance',
      code: qrDataString,
      subject: 'Scanned Subject',
      subjectName: 'Scanned Subject',
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

  // Start camera for live scanning with better error handling
  const startCameraScan = async () => {
    try {
      setIsScanning(true);
      setHasCameraPermission(true);
      setScanResult(null);

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      setCameraStream(stream);
      videoRef.current.srcObject = stream;

      // Wait for video to be ready
      videoRef.current.onloadedmetadata = () => {
        // Start scanning interval
        scanInterval.current = setInterval(scanQRCode, 300);
      };

    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);

      if (error.name === 'NotAllowedError') {
        toast.error('Camera access denied. Please allow camera permissions.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found on this device.');
      } else {
        toast.error('Cannot access camera. Please check permissions.');
      }

      setIsScanning(false);
    }
  };

  // Stop camera scanning
  const stopCameraScan = () => {
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
      });
      setCameraStream(null);
    }

    setIsScanning(false);
  };

  // Enhanced QR code scanning from video stream with immediate expiry check
  const scanQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA || video.videoWidth === 0) {
      return;
    }

    const context = canvas.getContext('2d');

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame on canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Scan for QR code
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode && !isProcessing) {
      console.log('Live QR Code detected:', qrCode.data);
      setScanResult(qrCode.data);
      setIsProcessing(true);

      // STOP CAMERA IMMEDIATELY when QR is detected
      stopCameraScan();

      try {
        // FIRST: Check if it's a URL with expiry parameter
        let isExpired = false;
        let expiryMessage = '';

        // Check for URL format first (new simplified format)
        if (qrCode.data.includes('expiry=')) {
          try {
            const url = new URL(qrCode.data);
            const urlParams = new URLSearchParams(url.search);
            const expiryTimestamp = urlParams.get('expiry');

            if (expiryTimestamp) {
              const expiryTime = new Date(parseInt(expiryTimestamp));
              const currentTime = new Date();

              if (currentTime > expiryTime) {
                isExpired = true;
                expiryMessage = 'QR code has expired. Please ask for a fresh QR code.';
              }
            }
          } catch (urlError) {
            console.log('Error checking URL expiry:', urlError);
          }
        }

        // Check for JSON format (old format)
        if (!isExpired && qrCode.data.trim().startsWith('{') && qrCode.data.trim().endsWith('}')) {
          try {
            const parsedJson = JSON.parse(qrCode.data);
            if (parsedJson.expiryTimestamp) {
              const expiryTime = new Date(parsedJson.expiryTimestamp);
              const currentTime = new Date();

              if (currentTime > expiryTime) {
                isExpired = true;
                expiryMessage = 'QR code has expired. Please ask for a fresh QR code.';
              }
            }
          } catch (jsonError) {
            console.log('Error checking JSON expiry:', jsonError);
          }
        }

        // IF QR IS EXPIRED - Show popup and restart camera
        if (isExpired) {
          toast.error(`${expiryMessage}`, {
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });

          // Clear scan result
          setScanResult(null);
          setIsProcessing(false);

          // Restart scanning after delay
          setTimeout(() => {
            startCameraScan();
          }, 3000);

          return; // Stop further processing
        }

        // IF QR IS NOT EXPIRED - Process normally
        const parsedData = parseQRData(qrCode.data);

        // Show scan success message
        toast.success('QR Code scanned successfully!', {
          autoClose: 1500,
        });

        // Small delay for better UX
        setTimeout(() => {
          navigateToAttendancePage(parsedData);
        }, 1000);

      } catch (parseError) {
        console.error('Error parsing QR data:', parseError);

        // Show specific error messages
        let errorMessage = 'Invalid QR code format';
        if (parseError.message.includes('expired')) {
          errorMessage = 'QR code has expired! Please ask for a fresh QR code.';
        }

        toast.error(errorMessage, {
          autoClose: 3000,
        });

        setIsProcessing(false);
        // Restart scanning if parsing fails
        setTimeout(() => {
          startCameraScan();
        }, 2000);
      }
    }
  };

  // Toggle camera scanning
  const toggleCameraScan = () => {
    if (isScanning) {
      stopCameraScan();
    } else {
      startCameraScan();
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    // Check Chrome browser on component mount
    const isChrome = checkChromeBrowser();
    if (!isChrome) {
      toast.error('This page only works on Google Chrome browser', {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      });
    }

    return () => {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // If browser is not Chrome, show information box instead of scanner
  if (!isChromeBrowser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200 p-8">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Browser Not Supported</h2>
            <p className="text-gray-600 mb-6">
              This attendance scanner only works on <strong>Google Chrome browser</strong>.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">
                <strong>Detected Browser:</strong> {navigator.userAgent.split(')')[0].split('(')[1] || 'Unknown Browser'}
              </p>
              <p className="text-xs text-red-600 mt-1">
                This browser is not Google Chrome. Please use Google Chrome to access this page.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">How to Access:</h3>
            <ol className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                Download and install <strong>Google Chrome</strong> from your app store
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                Open this page in <strong>Google Chrome</strong>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                Allow camera permissions when prompted
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                Scan your attendance QR code
              </li>
            </ol>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={() => {
                // Different download links based on platform
                const userAgent = navigator.userAgent.toLowerCase();
                if (/android/.test(userAgent)) {
                  window.open('https://play.google.com/store/apps/details?id=com.android.chrome', '_blank');
                } else if (/iphone|ipad|ipod/.test(userAgent)) {
                  window.open('https://apps.apple.com/app/apple-store/id535886823', '_blank');
                } else {
                  window.open('https://www.google.com/chrome/', '_blank');
                }
              }}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0112 6.545h10.691A12 12 0 0012 0zM1.931 5.47A11.943 11.943 0 000 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-1.54-.29-3.011-.818-4.364h-9.182v5.455h5.183c-.317 1.559-1.17 2.921-2.348 3.893l3.953 6.848a11.93 11.93 0 01-7.488 2.648 11.943 11.943 0 01-10.573-6.287L7.698 14.58A5.476 5.476 0 016.545 12a5.476 5.476 0 011.153-3.38L1.931 5.47z"/>
              </svg>
              Download Google Chrome
            </button>

            <button
              onClick={() => {
                // Try to detect if Chrome is already installed and open this URL in Chrome
                window.location.href = 'googlechrome://' + window.location.href.replace(/^https?:\/\//, '');
                setTimeout(() => {
                  // Fallback to regular URL if Chrome app not available
                  window.location.href = window.location.href;
                }, 1000);
              }}
              className="w-full inline-flex items-center justify-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in Chrome (if installed)
            </button>

            <p className="text-xs text-gray-400 mt-4">
              Note: Safari, Firefox, Brave, Edge, Opera, and other browsers are not supported.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Original scanner UI for Chrome browser
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-2 rounded-full">
              <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0112 6.545h10.691A12 12 0 0012 0zM1.931 5.47A11.943 11.943 0 000 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-1.54-.29-3.011-.818-4.364h-9.182v5.455h5.183c-.317 1.559-1.17 2.921-2.348 3.893l3.953 6.848a11.93 11.93 0 01-7.488 2.648 11.943 11.943 0 01-10.573-6.287L7.698 14.58A5.476 5.476 0 016.545 12a5.476 5.476 0 011.153-3.38L1.931 5.47z"/>
              </svg>
            </div>
            <span className="ml-2 text-sm text-green-600 font-medium">Google Chrome Detected ✓</span>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Attendance Scanner
          </h2>

          {/* Scan Result Preview */}
          {scanResult && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-800">QR Code Scanned Successfully</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Redirecting to attendance page...</p>
            </div>
          )}

          {/* Live Camera Scanner */}
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
              {!isScanning ? (
                // Camera off state
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Camera scanner is off</p>
                  <p className="text-xs text-gray-500 mt-1">Click below to start scanning</p>

                  {!hasCameraPermission && (
                    <p className="text-xs text-red-500 mt-2">
                      Camera access denied. Please check browser permissions.
                    </p>
                  )}
                </>
              ) : (
                // Camera on state
                <>
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-48 object-cover rounded-lg bg-black"
                    />
                    {/* Scanning overlay with crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-green-400 rounded-lg relative">
                        <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-400 opacity-50"></div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-green-400 opacity-50"></div>
                      </div>
                    </div>

                    {/* Scanning animation */}
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                      <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span>Scanning...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-green-600">Scanning for QR codes...</p>
                  <p className="text-xs text-gray-500">Point camera at QR code</p>
                </>
              )}

              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Toggle Button */}
              <button
                onClick={toggleCameraScan}
                disabled={!hasCameraPermission && !isScanning}
                className={`mt-4 inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${isScanning
                  ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                  : !hasCameraPermission
                    ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
              >
                {isScanning ? (
                  <>
                    <svg className="h-5 w-5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Stop Scanning
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Start Camera Scan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-sky-50 border border-sky-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-sky-800 mb-2">How to use:</h3>
          <ul className="text-sm text-sky-700 space-y-1">
            <li>• <strong>Browser:</strong> Google Chrome only</li>
            <li>• <strong>Camera Scan:</strong> Allow camera access and point at QR code</li>
            <li>• <strong>Tips:</strong> Ensure good lighting and clear focus</li>
            <li>• <strong>Best Results:</strong> Use rear camera in well-lit area</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner_Page;