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
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanInterval = useRef(null);

  // Enhanced QR data parsing with compact format support
  const parseQRData = (qrDataString) => {
    if (!qrDataString) {
      throw new Error('Empty QR code data');
    }

    console.log('QR Data for parsing:', qrDataString);

    // ========== NEW: Handle compact Base64 URL format ==========
    if (qrDataString.includes('/attendance-scan/')) {
      try {
        // Extract Base64 data from URL
        const base64Data = qrDataString.split('/attendance-scan/')[1];
        const decodedString = atob(base64Data);
        const parsedData = JSON.parse(decodedString);
        
        console.log('Parsed compact QR data:', parsedData);

        // Check expiry (immediate check)
        if (parsedData.e) {
          const expiryTime = new Date(parseInt(parsedData.e));
          const currentTime = new Date();

          if (currentTime > expiryTime) {
            throw new Error('QR code has expired. Please scan a fresh QR code.');
          }
        }

        return {
          type: 'attendance',
          code: parsedData.c, // code
          originalCode: parsedData.c,
          subject: parsedData.s, // subject ID
          subjectName: parsedData.n || 'Unknown Subject', // subject name
          attendanceTime: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          attendanceDate: new Date().toISOString().split('T')[0],
          timestamp: parsedData.t ? new Date(parseInt(parsedData.t)).toISOString() : new Date().toISOString(),
          expiryTimestamp: parsedData.e ? new Date(parseInt(parsedData.e)).toISOString() : null,
        };
      } catch (error) {
        console.log('Error parsing compact format:', error);
        // Continue to other formats if this fails
      }
    }

    // ========== Original parsing logic (for backward compatibility) ==========
    
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
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      setCameraStream(stream);
      videoRef.current.srcObject = stream;

      // Wait for video to be ready
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(e => console.error('Video play error:', e));
        
        // Start scanning interval with optimized timing
        scanInterval.current = setInterval(scanQRCode, 250); // Faster scanning for better UX
      };

      videoRef.current.onerror = (error) => {
        console.error('Video error:', error);
        toast.error('Camera error. Please try again.');
        stopCameraScan();
      };

    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);

      if (error.name === 'NotAllowedError') {
        toast.error('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found on this device.');
      } else if (error.name === 'NotReadableError') {
        toast.error('Camera is already in use by another application.');
      } else if (error.name === 'OverconstrainedError') {
        toast.error('Camera constraints could not be satisfied. Trying default settings...');
        // Try with default constraints
        setTimeout(() => startCameraScanWithDefault(), 1000);
      } else {
        toast.error('Cannot access camera. Please check permissions and try again.');
      }

      setIsScanning(false);
    }
  };

  // Fallback to default camera constraints
  const startCameraScanWithDefault = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      videoRef.current.srcObject = stream;
      
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        scanInterval.current = setInterval(scanQRCode, 250);
      };
    } catch (error) {
      toast.error('Failed to access camera with default settings.');
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

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  // Enhanced QR code scanning with immediate expiry check for all formats
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
        // FIRST: Check expiry for all formats
        let isExpired = false;
        let expiryMessage = '';

        // Check for compact Base64 format
        if (qrCode.data.includes('/attendance-scan/')) {
          try {
            const base64Data = qrCode.data.split('/attendance-scan/')[1];
            const decodedString = atob(base64Data);
            const parsedData = JSON.parse(decodedString);
            
            if (parsedData.e) {
              const expiryTime = new Date(parseInt(parsedData.e));
              const currentTime = new Date();

              if (currentTime > expiryTime) {
                isExpired = true;
                expiryMessage = 'QR code has expired. Please ask for a fresh QR code.';
              }
            }
          } catch (error) {
            console.log('Error checking compact format expiry:', error);
          }
        }
        // Check for URL format
        else if (qrCode.data.includes('expiry=')) {
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
        // Check for JSON format
        else if (qrCode.data.trim().startsWith('{') && qrCode.data.trim().endsWith('}')) {
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
            position: "top-center",
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
          }, 2000);

          return; // Stop further processing
        }

        // IF QR IS NOT EXPIRED - Process normally
        const parsedData = parseQRData(qrCode.data);

        // Show scan success message
        toast.success('QR Code scanned successfully!', {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: true,
        });

        // Small delay for better UX
        setTimeout(() => {
          navigateToAttendancePage(parsedData);
        }, 800);

      } catch (parseError) {
        console.error('Error parsing QR data:', parseError);

        // Show specific error messages
        let errorMessage = 'Invalid QR code format';
        if (parseError.message.includes('expired')) {
          errorMessage = 'QR code has expired! Please ask for a fresh QR code.';
        } else if (parseError.message.includes('Invalid QR code')) {
          errorMessage = 'Invalid attendance QR code. Please scan a valid attendance QR.';
        }

        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 3000,
        });

        setIsProcessing(false);
        // Restart scanning if parsing fails
        setTimeout(() => {
          startCameraScan();
        }, 1500);
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

  // Handle manual QR code entry (optional feature)
  const handleManualEntry = () => {
    const qrCode = prompt('Enter QR code data manually:');
    if (qrCode && !isProcessing) {
      setScanResult(qrCode);
      setIsProcessing(true);
      
      try {
        const parsedData = parseQRData(qrCode);
        navigateToAttendancePage(parsedData);
      } catch (error) {
        toast.error('Invalid QR code data');
        setIsProcessing(false);
        setScanResult(null);
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

  // Initialize scanner on component mount if permissions are granted
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const permissions = await navigator.permissions.query({ name: 'camera' });
        setHasCameraPermission(permissions.state !== 'denied');
      } catch (error) {
        console.log('Permission API not supported');
      }
    };
    
    checkCameraPermission();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-md p-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Attendance Scanner
          </h2>
          
          <p className="text-sm text-gray-600 text-center mb-6">
            Scan your teacher's QR code to mark attendance
          </p>

          {/* Scan Result Preview */}
          {scanResult && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-pulse">
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
                  <div className="py-6">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-3 text-sm text-gray-600">Camera scanner is ready</p>
                    <p className="text-xs text-gray-500 mt-1">Click below to start scanning</p>

                    {!hasCameraPermission && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-600">
                          Camera access denied. Please allow camera permissions in your browser settings.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Camera on state
                <>
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover"
                    />
                    {/* Scanning overlay with crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-56 h-56 border-2 border-green-400 rounded-lg relative">
                        <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-400 opacity-50"></div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-green-400 opacity-50"></div>
                        
                        {/* Corner markers for better scanning guidance */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-400 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-400 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-400 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-400 rounded-br-lg"></div>
                      </div>
                    </div>

                    {/* Scanning animation */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                      <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span>Scanning QR code...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-green-600 font-medium">✓ Camera active - Point at QR code</p>
                  <p className="text-xs text-gray-500">Ensure QR code is within the frame</p>
                </>
              )}

              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Toggle Button */}
              <div className="mt-6 flex flex-col space-y-3">
                <button
                  onClick={toggleCameraScan}
                  disabled={!hasCameraPermission && !isScanning}
                  className={`inline-flex items-center justify-center px-5 py-3 border rounded-lg shadow-sm text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 ${isScanning
                    ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500'
                    : !hasCameraPermission
                      ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'border-transparent text-white bg-sky-600 hover:bg-sky-700'
                    }`}
                >
                  {isScanning ? (
                    <>
                      <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                      Stop Scanning
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Start Camera Scan
                    </>
                  )}
                </button>

                {/* Optional: Manual Entry Button */}
                <button
                  onClick={handleManualEntry}
                  className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg shadow-sm text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Enter Code Manually
                </button>
              </div>
            </div>
          </div>

          {/* Scan Statistics (Optional) */}
          {isScanning && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-blue-700">Scanning Status</span>
                <span className="text-xs text-blue-600">Active</span>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                • Camera resolution: 720p
                • Scan rate: 4 FPS
                • QR detection: Active
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-lg p-4 md:p-5">
          <h3 className="text-sm font-semibold text-sky-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to scan QR codes effectively:
          </h3>
          <ul className="text-sm text-sky-700 space-y-2">
            <li className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 bg-sky-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-semibold text-sky-600">1</span>
              </div>
              <span><strong>Camera Scan:</strong> Allow camera access and hold steady</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 bg-sky-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-semibold text-sky-600">2</span>
              </div>
              <span><strong>Positioning:</strong> Keep QR code within the green frame</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 bg-sky-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-semibold text-sky-600">3</span>
              </div>
              <span><strong>Lighting:</strong> Ensure good lighting and avoid glare</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 bg-sky-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-semibold text-sky-600">4</span>
              </div>
              <span><strong>Distance:</strong> Hold device 15-30 cm from QR code</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 bg-sky-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-semibold text-sky-600">5</span>
              </div>
              <span><strong>Note:</strong> QR codes expire after 40 seconds for security</span>
            </li>
          </ul>
          
          {/* Troubleshooting Tips */}
          <div className="mt-4 pt-3 border-t border-sky-200">
            <h4 className="text-xs font-semibold text-sky-800 mb-2">Having trouble scanning?</h4>
            <div className="text-xs text-sky-600 space-y-1">
              <p>• Try cleaning your camera lens</p>
              <p>• Ensure QR code is not blurry or damaged</p>
              <p>• Use rear camera in well-lit area</p>
              <p>• Restart scanner if detection is slow</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact your teacher or system administrator.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            v2.0 • Optimized QR Scanner
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner_Page;