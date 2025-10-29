import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsQR from 'jsqr';

const QRScanner_Page = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [isSupportedDevice, setIsSupportedDevice] = useState(true);
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

      // Check if it's Safari (to exclude it)
      const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);

      // Check if it's Firefox
      const isFirefox = /Firefox/i.test(navigator.userAgent);

      // Check if it's Edge
      const isEdge = /Edg/i.test(navigator.userAgent);

      // STRICT CHECK: Only allow Mobile + Chrome
      if (!isMobile) {
        setIsSupportedDevice(false);
        toast.error('This page is only available on mobile devices');
        return false;
      }

      if (!isChrome) {
        setIsSupportedDevice(false);
        toast.error('Please use Google Chrome browser for QR scanning');
        return false;
      }

      // Check if browser supports required APIs
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupportedDevice(false);
        toast.error('Your browser does not support camera access');
        return false;
      }

      setIsSupportedDevice(true);
      return true;
    };

    checkDeviceCompatibility();
  }, []);

  // Enhanced QR data parsing
  const parseQRData = (qrDataString) => {
    if (!qrDataString) {
      throw new Error('Empty QR code data');
    }

    // Try to parse as JSON first
    try {
      const parsedData = JSON.parse(qrDataString);

      // Validate required fields for attendance
      if (parsedData.type === 'attendance') {
        return {
          type: 'attendance',
          code: parsedData.code || parsedData.id || qrDataString,
          subject: parsedData.subject || 'Unknown Subject',
          subjectName: parsedData.subjectName || parsedData.subject || 'Unknown Subject',
          attendanceTime: parsedData.attendanceTime || parsedData.time || new Date().toLocaleTimeString(),
          attendanceDate: parsedData.attendanceDate || parsedData.date || new Date().toISOString().split('T')[0],
          timestamp: parsedData.timestamp || new Date().toISOString()
        };
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
            timestamp: new Date().toISOString()
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
        timestamp: new Date().toISOString()
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

    if (qrCode) {
      console.log('Live QR Code detected:', qrCode.data);
      console.log('QR Code location:', qrCode.location);

      stopCameraScan();

      try {
        const parsedData = parseQRData(qrCode.data);
        toast.success('QR Code scanned successfully!');
        navigateToAttendancePage(parsedData);
      } catch (parseError) {
        console.error('Error parsing QR data:', parseError);
        toast.error('Invalid QR code format');
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

  // Unsupported device message - Only show for non-mobile or non-Chrome browsers
  if (!isSupportedDevice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full">
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Access Required
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              For the best scanning experience, please open this page on a <span className="font-semibold text-blue-600">mobile device</span> using <span className="font-semibold text-green-600">Google Chrome</span>.
            </p>

            {/* Requirements Card */}
            <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Requirements</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <span>Mobile Device (Android or iOS)</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold">2</span>
                  </div>
                  <span>Google Chrome Browser</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-semibold">3</span>
                  </div>
                  <span>Camera Permission</span>
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-3">
              <a
                href="https://play.google.com/store/apps/details?id=com.android.chrome"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 6.753l2.385 2.384-2.385 2.385V8.567zm3.367 10.367L12 12.208l10.186 10.187A.998.998 0 0122 22.008V1.992a1 1 0 01.609.92v18.086a1 1 0 01-.609.92z" />
                </svg>
                Get Chrome for Android
              </a>
              <a
                href="https://apps.apple.com/app/chrome-web-browser/id535886823"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-medium rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Get Chrome for iPhone
              </a>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 mt-6">
              Already have Chrome? Open this page on your mobile device.
            </p>
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
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner_Page;