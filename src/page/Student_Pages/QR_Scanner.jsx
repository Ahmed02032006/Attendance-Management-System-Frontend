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
  const [isAllowedDevice, setIsAllowedDevice] = useState(true); // Start as true, then check
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanInterval = useRef(null);

  // Add this function before the useEffect
  // Add this function before the useEffect
  const isGenuineChromeStrict = async () => {
    try {
      // Test 1: User Agent
      const userAgent = navigator.userAgent;
      const hasChrome = /Chrome/i.test(userAgent) || /CriOS/i.test(userAgent);

      if (!hasChrome) return false;

      // Test 2: Vendor (relaxed for iOS)
      // iOS Chrome uses different vendor, so we check for CriOS in user agent
      const isIOSChrome = /CriOS/i.test(userAgent);
      if (!isIOSChrome && (!navigator.vendor || !navigator.vendor.includes('Google'))) {
        return false;
      }

      // Test 3: Brave check
      if (navigator.brave) {
        try {
          const isBrave = await navigator.brave.isBrave();
          if (isBrave) return false;
        } catch (e) {
          // Brave method doesn't exist, continue
        }
      }

      // Test 4: Check for other browser patterns (single comprehensive regex)
      const otherBrowsers = /Edg|Edge|OPR|Opera|Samsung|UCBrowser|Vivaldi|Yandex|YaBrowser|DuckDuckGo|Phoenix|Miui|XiaoMi|Vivo|Huawei|QQ|Baidu|360|Sogou|Maxthon|Sleipnir|Puffin|Dolphin|Coast|bluefire|Bolt|Iron|Epic|Pale Moon|Basilisk|Waterfox/i;
      if (otherBrowsers.test(userAgent)) return false;

      // Test 5: Mobile check
      const isMobile = /Android|iPhone|iPad|iPod/.test(userAgent);
      if (!isMobile) return false;

      // Test 6: For Android, verify Chrome object (skip for iOS)
      if (/Android/.test(userAgent)) {
        if (!window.chrome) return false;
      }

      // All tests passed
      return true;
    } catch (error) {
      console.error('Chrome validation error:', error);
      return false;
    }
  };

  // Then use it in your useEffect:
  useEffect(() => {
    const checkBrowserRestrictions = async () => {
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (isDevelopment) {
        setIsAllowedDevice(true);
        return;
      }

      const isAllowed = await isGenuineChromeStrict();
      setIsAllowedDevice(isAllowed);

      if (!isAllowed) {
        console.log('Access denied: Not genuine Chrome mobile');
      }
    };

    checkBrowserRestrictions();
  }, []);

  // Enhanced QR data parsing with expiry check
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
        subject: urlParams.get('subject') || 'Unknown Subject', // This is the subject ID
        subjectName: urlParams.get('subjectName') || urlParams.get('subject') || 'Unknown Subject', // Try to get subjectName
        departmentOffering: urlParams.get('departmentOffering') || 'Unknown Subject',
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
          departmentOffering: parsedData.departmentOffering || parsedData.subject || 'Unknown Subject',
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
          departmentOffering: urlParams.get('departmentOffering') || urlParams.get('subject') || 'Unknown Subject',
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
      departmentOffering: 'Scanned Subject',
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
    // Check device restrictions before starting camera
    if (!isAllowedDevice) {
      return;
    }

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
    return () => {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Browser restriction error screen
  if (!isAllowedDevice) {
    const userAgent = navigator.userAgent;
    let detectedBrowser = 'Unknown Browser';

    // Comprehensive browser detection for error message
    if (navigator.brave) detectedBrowser = 'Brave Browser';
    else if (/Edg|Edge/i.test(userAgent)) detectedBrowser = 'Microsoft Edge';
    else if (/OPR|Opera/i.test(userAgent)) detectedBrowser = 'Opera Browser';
    else if (/SamsungBrowser/i.test(userAgent)) detectedBrowser = 'Samsung Internet';
    else if (/UCBrowser/i.test(userAgent)) detectedBrowser = 'UC Browser';
    else if (/Vivaldi/i.test(userAgent)) detectedBrowser = 'Vivaldi';
    else if (/YaBrowser/i.test(userAgent)) detectedBrowser = 'Yandex Browser';
    else if (/DuckDuckGo/i.test(userAgent)) detectedBrowser = 'DuckDuckGo Browser';
    else if (/Phoenix/i.test(userAgent)) detectedBrowser = 'Phoenix Browser';
    else if (/MiuiBrowser|XiaoMi/i.test(userAgent)) detectedBrowser = 'Mi Browser';
    else if (/VivoBrowser/i.test(userAgent)) detectedBrowser = 'Vivo Browser';
    else if (/HuaweiBrowser/i.test(userAgent)) detectedBrowser = 'Huawei Browser';
    else if (/QQBrowser/i.test(userAgent)) detectedBrowser = 'QQ Browser';
    else if (/BIDUBrowser|baiduboxapp/i.test(userAgent)) detectedBrowser = 'Baidu Browser';
    else if (/360SE|360EE/i.test(userAgent)) detectedBrowser = '360 Browser';
    else if (/MetaSr|SogouMobileBrowser/i.test(userAgent)) detectedBrowser = 'Sogou Browser';
    else if (/Firefox|FxiOS/i.test(userAgent)) detectedBrowser = 'Mozilla Firefox';
    else if (/Safari/i.test(userAgent) && !/Chrome|CriOS/i.test(userAgent)) detectedBrowser = 'Safari';
    else if (/Chrome/i.test(userAgent)) detectedBrowser = 'Chromium-based Browser';

    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">Browser Not Supported</h2>
          <br />

          <div className="space-y-4 mb-6 text-left">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-1.76v.5a3.5 3.5 0 01-3.5 3.5h-.5V8h1.76V6.69h5.31a3 3 0 013 3v5.31H8V15h10.5a1.5 1.5 0 001.5-1.5v-6a4.81 4.81 0 01-4.41 4.81z" />
                    <path d="M3.5 11.5a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Google Chrome Required</h4>
                <p className="text-sm text-gray-600">
                  This QR scanner works best with Google Chrome browser for optimal performance and compatibility.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">How to Access</h4>
                <p className="text-sm text-gray-600">
                  1. Download Google Chrome from your app store<br />
                  2. Open Chrome and navigate to this website<br />
                  3. Allow camera permissions when prompted
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Why Chrome?</h4>
                <p className="text-sm text-gray-600">
                  • Better camera API support<br />
                  • More reliable QR scanning<br />
                  • Consistent performance across devices
                </p>
              </div>
            </div>
          </div>

          {/* <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.open('https://www.google.com/chrome/', '_blank')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-1.76v.5a3.5 3.5 0 01-3.5 3.5h-.5V8h1.76V6.69h5.31a3 3 0 013 3v5.31H8V15h10.5a1.5 1.5 0 001.5-1.5v-6a4.81 4.81 0 01-4.41 4.81z" />
                <path d="M3.5 11.5a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Download Chrome
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Home
            </button>
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Attendance Scanner
            </h2>
            {/* <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Chrome Browser
            </span> */}
          </div>

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
                className={`mt-4 inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isScanning
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
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Browser:</strong> Google Chrome browser required</li>
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
