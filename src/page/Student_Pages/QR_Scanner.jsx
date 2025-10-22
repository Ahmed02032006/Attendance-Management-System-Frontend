import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsQR from 'jsqr';

const QRScanner_Page = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const scanInterval = useRef(null);

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

  // Enhanced QR code scanning with better image processing
  const scanImageForQR = (imageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to image size
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    
    // Draw image on canvas
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    
    // Get image data with better quality
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Try multiple scan approaches
    let qrCode = jsQR(imageData.data, imageData.width, imageData.height);
    
    // If no QR found, try with different thresholds
    if (!qrCode) {
      // Convert to grayscale and adjust contrast
      const grayscaleData = enhanceImageContrast(imageData);
      qrCode = jsQR(grayscaleData, imageData.width, imageData.height);
    }
    
    return qrCode;
  };

  // Image enhancement for better QR detection
  const enhanceImageContrast = (imageData) => {
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data.length);
    
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      // Enhance contrast
      const enhanced = gray < 128 ? Math.max(0, gray - 50) : Math.min(255, gray + 50);
      
      newData[i] = enhanced;
      newData[i + 1] = enhanced;
      newData[i + 2] = enhanced;
      newData[i + 3] = data[i + 3];
    }
    
    return newData;
  };

  // Handle QR code scanning from image upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const qrCode = scanImageForQR(img);

        if (qrCode) {
          console.log('QR Code detected:', qrCode.data);
          
          try {
            const parsedData = parseQRData(qrCode.data);
            toast.success('QR Code scanned successfully!');
            navigateToAttendancePage(parsedData);
          } catch (parseError) {
            console.error('Error parsing QR data:', parseError);
            toast.error('Invalid QR code format');
          }
        } else {
          toast.error('No QR code found in the image. Please try another image.');
        }
      } catch (error) {
        console.error('Error scanning QR code:', error);
        toast.error('Error scanning QR code');
      } finally {
        URL.revokeObjectURL(url);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    img.onerror = () => {
      toast.error('Error loading image');
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  // Start camera for live scanning with better error handling
  const startCameraScan = async () => {
    try {
      setIsScanning(true);
      setHasCameraPermission(true);
      
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
        scanInterval.current = setInterval(scanQRCode, 300); // Increased frequency
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
                className={`mt-4 inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                  isScanning
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

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Upload QR Image */}
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Upload QR Code Image</p>
              <p className="text-xs text-gray-500">JPG, PNG, GIF supported</p>

              <label className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 cursor-pointer">
                <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Choose Image
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-sky-50 border border-sky-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-sky-800 mb-2">How to use:</h3>
          <ul className="text-sm text-sky-700 space-y-1">
            <li>• <strong>Camera Scan:</strong> Allow camera access and point at QR code</li>
            <li>• <strong>Image Upload:</strong> Upload a clear image of the QR code</li>
            <li>• <strong>Tips:</strong> Ensure good lighting and clear focus</li>
          </ul>
        </div>

        {/* Troubleshooting */}
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-orange-800 mb-2">Troubleshooting:</h3>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• If scanning fails, try uploading an image instead</li>
            <li>• Ensure QR code is clear and not blurry</li>
            <li>• Check camera permissions in browser settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner_Page;