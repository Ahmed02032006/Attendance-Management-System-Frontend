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

  // Enhanced QR data parsing with expiry check
  const parseQRData = (qrDataString) => {
    if (!qrDataString) {
      throw new Error('Empty QR code data');
    }

    // Try to parse as JSON first
    try {
      const parsedData = JSON.parse(qrDataString);

      // Validate QR code expiry
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
      // Check for expired QR codes in URL format
      if (qrDataString.includes('expiry=')) {
        try {
          const urlParams = new URLSearchParams(qrDataString.includes('?')
            ? qrDataString.split('?')[1]
            : qrDataString
          );
          
          const expiryTimestamp = urlParams.get('expiry');
          if (expiryTimestamp) {
            const expiryTime = new Date(expiryTimestamp);
            const currentTime = new Date();
            
            if (currentTime > expiryTime) {
              throw new Error('QR code has expired. Please scan a fresh QR code.');
            }
          }
        } catch (urlError) {
          console.log('Error checking expiry:', urlError);
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
    }
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
        
        // Show scan success message
        toast.success('✓ QR Code scanned successfully!');
        
        // Small delay for better UX
        setTimeout(() => {
          navigateToAttendancePage(parsedData);
        }, 1000);

      } catch (parseError) {
        console.error('Error parsing QR data:', parseError);
        
        // Show specific error messages
        if (parseError.message.includes('expired')) {
          toast.error('❌ QR code has expired! Please ask for a fresh QR code.');
        } else {
          toast.error('Invalid QR code format');
        }
        
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
            <li>• <strong>Camera Scan:</strong> Allow camera access and point at QR code</li>
            <li>• <strong>Tips:</strong> Ensure good lighting and clear focus</li>
            <li>• <strong>Best Results:</strong> Use rear camera in well-lit area</li>
            {/* <li>• <strong>Note:</strong> QR codes expire after 40 seconds</li> */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner_Page;