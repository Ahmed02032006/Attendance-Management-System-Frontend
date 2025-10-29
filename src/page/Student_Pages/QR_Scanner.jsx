import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsQR from 'jsqr';

const QRScanner_Page = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [isSupportedDevice, setIsSupportedDevice] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanInterval = useRef(null);

  // Device detection and validation - ONLY Mobile + Chrome
  useEffect(() => {
    const checkDeviceCompatibility = () => {
      // Detect if it's a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Detect if it's Chrome browser
      const isChrome = /Chrome|CriOS/i.test(navigator.userAgent);

      // Check if browser supports required APIs
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupportedDevice(false);
        toast.error('Your browser does not support camera access');
        return false;
      }

      // Check if geolocation is supported (required for location-based attendance)
      if (!navigator.geolocation) {
        setIsSupportedDevice(false);
        toast.error('Your device does not support location services which are required for attendance');
        return false;
      }

      // STRICT CHECK: Only allow Mobile + Chrome
      if (!isMobile) {
        setIsSupportedDevice(false);
        return false;
      }

      if (!isChrome) {
        setIsSupportedDevice(false);
        return false;
      }

      setIsSupportedDevice(true);
      return true;
    };

    checkDeviceCompatibility();
  }, []);

  // Enhanced QR data parsing with location support
  const parseQRData = (qrDataString) => {
    if (!qrDataString) {
      throw new Error('Empty QR code data');
    }

    // Try to parse as JSON first
    try {
      const parsedData = JSON.parse(qrDataString);

      // Validate required fields for attendance
      if (parsedData.type === 'attendance') {
        const validatedData = {
          type: 'attendance',
          code: parsedData.code || parsedData.id || qrDataString,
          subject: parsedData.subject || 'Unknown Subject',
          subjectName: parsedData.subjectName || parsedData.subject || 'Unknown Subject',
          attendanceTime: parsedData.attendanceTime || parsedData.time || new Date().toLocaleTimeString(),
          attendanceDate: parsedData.attendanceDate || parsedData.date || new Date().toISOString().split('T')[0],
          timestamp: parsedData.timestamp || new Date().toISOString(),
          teacherLocation: parsedData.teacherLocation || null,
          locationRadius: parsedData.locationRadius || 200
        };

        // Check if location-based attendance is enabled
        if (validatedData.teacherLocation) {
          console.log('Location-based attendance detected');
          console.log('Teacher location:', validatedData.teacherLocation);
          console.log('Allowed radius:', validatedData.locationRadius + 'm');
        }

        return validatedData;
      }

      // If it's JSON but not attendance type, return as is
      return parsedData;
    } catch (error) {
      // If not JSON, treat as plain text with potential URL parameters
      console.log('QR data is not JSON, treating as plain text:', qrDataString);

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
            teacherLocation: null, // No location data in URL format
            locationRadius: 200
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
        teacherLocation: null,
        locationRadius: 200
      };
    }
  };

  const navigateToAttendancePage = (qrData) => {
    // Check if location is required and if device supports it
    if (qrData.teacherLocation) {
      // Verify geolocation support before navigating
      if (!navigator.geolocation) {
        toast.error('Location services are required but not supported on your device');
        return;
      }

      // Request location permission proactively
      navigator.geolocation.getCurrentPosition(
        () => {
          // Location permission granted, proceed to attendance page
          navigate('/student-attendance', {
            state: {
              qrData: JSON.stringify(qrData)
            }
          });
        },
        (error) => {
          let errorMessage = 'Location access is required for attendance: ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please enable location permissions in your browser settings';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out';
              break;
            default:
              errorMessage += 'Please enable location services';
              break;
          }
          toast.error(errorMessage);
          setIsScanning(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      // No location required, proceed directly
      navigate('/student-attendance', {
        state: {
          qrData: JSON.stringify(qrData)
        }
      });
    }
  };

  // Start camera for live scanning with better error handling
  const startCameraScan = async () => {
    try {
      setIsScanning(true);
      setHasCameraPermission(true);
      setScanResult(null);

      const constraints = {
        video: {
          facingMode: 'environment', // Always use rear camera for mobile
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

  // Enhanced QR code scanning from video stream
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

      stopCameraScan();

      try {
        const parsedData = parseQRData(qrCode.data);
        
        // Show scan success message with location info
        if (parsedData.teacherLocation) {
          toast.success('✓ Location-based attendance QR scanned!');
        } else {
          toast.success('✓ Attendance QR scanned successfully!');
        }
        
        // Small delay for better UX
        setTimeout(() => {
          navigateToAttendancePage(parsedData);
        }, 1000);

      } catch (parseError) {
        console.error('Error parsing QR data:', parseError);
        toast.error('Invalid QR code format');
        setIsProcessing(false);
        // Restart scanning if parsing fails
        setTimeout(startCameraScan, 2000);
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

  // Handle manual QR code input (fallback)
  const handleManualInput = () => {
    const manualCode = prompt('Enter the attendance code manually:');
    if (manualCode) {
      try {
        const parsedData = parseQRData(manualCode);
        navigateToAttendancePage(parsedData);
      } catch (error) {
        toast.error('Invalid code format');
      }
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

  // Unsupported device message
  if (!isSupportedDevice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-sm w-full">
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 mb-6">
              <svg className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Mobile Chrome Required
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              This QR scanner works best on mobile devices with Google Chrome browser for optimal scanning experience.
            </p>

            {/* Requirements */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Requirements:</h3>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Mobile device with camera</li>
                <li>• Google Chrome browser</li>
                <li>• Location services enabled</li>
                <li>• Camera permissions allowed</li>
              </ul>
            </div>

            {/* Manual Input Fallback */}
            <button
              onClick={handleManualInput}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              Enter Code Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
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

          {/* Manual Input Option */}
          <div className="text-center">
            <button
              onClick={handleManualInput}
              className="text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors"
            >
              Or enter code manually
            </button>
          </div>
        </div>

        {/* Enhanced Instructions */}
        <div className="mt-6 bg-sky-50 border border-sky-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-sky-800 mb-2">How to use:</h3>
          <ul className="text-sm text-sky-700 space-y-1">
            <li>• <strong>Camera Scan:</strong> Allow camera access and point at QR code</li>
            <li>• <strong>Location Check:</strong> Your location will be verified automatically</li>
            <li>• <strong>Requirements:</strong> Enable location services for attendance</li>
            <li>• <strong>Tips:</strong> Ensure good lighting and clear focus</li>
            <li>• <strong>Best Results:</strong> Use rear camera in well-lit area</li>
          </ul>
        </div>

        {/* Location Requirements Info */}
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-purple-800 mb-1">Location-Based Attendance</h4>
              <p className="text-xs text-purple-600">
                This system uses your device's location to verify you are physically present in the classroom. 
                Please enable location services when prompted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner_Page;