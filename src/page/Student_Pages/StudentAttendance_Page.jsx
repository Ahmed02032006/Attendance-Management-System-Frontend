import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createAttendance } from '../../store/Teacher-Slicer/Attendance-Slicer';
import { useDispatch } from 'react-redux';
import { useIPAddress } from '../../hooks/useIPAddress';

const StudentAttendance_Page = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNo: '',
    uniqueCode: '',
    ipAddress: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [isAllowedDevice, setIsAllowedDevice] = useState(true);
  const [deviceType, setDeviceType] = useState('');
  const ipAddress = useIPAddress();

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Device and browser detection
  const detectDeviceAndBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Device detection
    let device = '';
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent);
    
    if (isMobile) {
      device = 'mobile';
    } else if (isTablet) {
      device = 'tablet';
    } else {
      device = 'desktop';
    }

    // Browser detection
    const isChrome = /chrome|chromium|crios/i.test(userAgent);
    const isFirefox = /firefox|fxios/i.test(userAgent);
    const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent);
    const isEdge = /edg/i.test(userAgent);

    setDeviceType(device);

    // Define your restrictions here - MOBILE ONLY
    const allowedConfigurations = [
      // Mobile devices - Chrome only
      { device: 'mobile', browser: 'chrome', allowed: true },
      
      // Tablets - Chrome and Safari (DISABLED)
      { device: 'tablet', browser: 'chrome', allowed: false },
      { device: 'tablet', browser: 'safari', allowed: false },
      
      // Desktop/Laptop - Chrome, Firefox, Edge, Safari (DISABLED)
      { device: 'desktop', browser: 'chrome', allowed: false },
      { device: 'desktop', browser: 'firefox', allowed: false },
      { device: 'desktop', browser: 'edge', allowed: false },
      { device: 'desktop', browser: 'safari', allowed: false }
    ];

    // Determine current browser
    let currentBrowser = '';
    if (isChrome) currentBrowser = 'chrome';
    else if (isFirefox) currentBrowser = 'firefox';
    else if (isSafari) currentBrowser = 'safari';
    else if (isEdge) currentBrowser = 'edge';
    else currentBrowser = 'other';

    // Check if current configuration is allowed
    const isAllowed = allowedConfigurations.some(config => 
      config.device === device && config.browser === currentBrowser && config.allowed
    );

    setIsAllowedDevice(isAllowed);

    // Return detection results for debugging
    return {
      device,
      browser: currentBrowser,
      isAllowed,
      userAgent: navigator.userAgent
    };
  };

  // Function to format time as "11:05 AM"
  const formatTime = (date = new Date()) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    // Check device and browser compatibility on component mount
    const detectionResult = detectDeviceAndBrowser();
    
    if (!detectionResult.isAllowed) {
      toast.error(`This page is only accessible on mobile devices with Google Chrome.`);
    }

    const updateTime = () => {
      setCurrentTime(formatTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.state?.qrData) {
      try {
        const parsedData = JSON.parse(location.state.qrData);
        setQrData(parsedData);
        setFormData(prev => ({
          ...prev,
          uniqueCode: parsedData.code,
          ipAddress
        }));
      } catch (error) {
        toast.error('Invalid QR code data');
        navigate('/');
      }
    } else {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      const subject = urlParams.get('subject');
      const subjectName = urlParams.get('subjectName');

      if (code) {
        setQrData({
          code,
          subject: subject || 'Unknown Subject',
          subjectName: subjectName || 'Unknown Subject Name',
          type: 'attendance'
        });
        setFormData(prev => ({
          ...prev,
          uniqueCode: code,
        }));
      } else {
        toast.error('No attendance code found');
        navigate('/');
      }
    }
  }, [location, navigate, ipAddress]);

  // Function to capitalize input text
  const capitalizeText = (text) => {
    return text.toUpperCase();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Capitalize studentName and rollNo fields
    const processedValue = (name === 'studentName' || name === 'rollNo') 
      ? capitalizeText(value)
      : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const getUniqueDeviceFingerprint = async () => {
    const components = [];

    try {
      // 1. Enhanced Canvas Fingerprinting with more variations
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 300;
      canvas.height = 100;

      // More complex drawing with random elements
      const randomSeed = Math.random() * 10000;
      ctx.textBaseline = 'alphabetic';
      ctx.font = '14px "Arial", "Helvetica", sans-serif';

      // Add more device-specific properties
      ctx.fillText(`Device:${navigator.hardwareConcurrency}📱${screen.colorDepth}`, 10, 20);
      ctx.fillText(`Screen:${screen.width}x${screen.height}@${window.devicePixelRatio}`, 10, 40);
      ctx.fillText(`Time:${Date.now()}`, 10, 60);

      // Add some random shapes and gradients
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.7)`);
      gradient.addColorStop(1, `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(150, 10, 80, 30);

      const canvasData = canvas.toDataURL();

      // 2. WebGL Fingerprinting (more reliable)
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      let webglData = '';
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webglData = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) +
            gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        }
      }

      // 3. Audio Context Fingerprinting
      let audioFingerprint = '';
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const analyser = audioContext.createAnalyser();
        oscillator.connect(analyser);
        analyser.connect(audioContext.destination);
        oscillator.start();

        const data = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(data);
        audioFingerprint = data.join(',');

        oscillator.stop();
        audioContext.close();
      } catch (audioError) {
        audioFingerprint = 'audio_not_supported';
      }

      // 4. More Device Properties
      const deviceProps = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages?.join(','),
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory || 'unknown',
        screen: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        touchSupport: navigator.maxTouchPoints > 0
      };

      // 5. Combine all components with more entropy
      const combined = [
        canvasData,
        webglData,
        audioFingerprint,
        JSON.stringify(deviceProps),
        Date.now().toString(),
        Math.random().toString(36).substring(2),
        performance.now().toString()
      ].join('|');

      // 6. Better hashing function
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 7) - hash) + char;
        hash = hash & 0x7FFFFFFF; // Ensure positive 32-bit integer
      }

      // 7. Add timestamp and random component
      const timestamp = Date.now().toString(36);
      const randomComponent = Math.random().toString(36).substring(2, 8);

      return `${hash.toString(36)}${timestamp}${randomComponent}`.substring(0, 32);

    } catch (error) {
      // Fallback fingerprint
      const fallback = [
        navigator.userAgent,
        navigator.hardwareConcurrency,
        screen.width,
        screen.height,
        Date.now(),
        Math.random()
      ].join('|');

      let hash = 0;
      for (let i = 0; i < fallback.length; i++) {
        const char = fallback.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & 0x7FFFFFFF;
      }

      return `fallback_${hash.toString(36)}${Date.now().toString(36)}`.substring(0, 32);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAllowedDevice) {
      toast.error('This page is only accessible on mobile devices with Google Chrome.');
      return;
    }

    if (!formData.studentName.trim() || !formData.rollNo.trim() || !formData.uniqueCode.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    if (!qrData) {
      toast.error('Invalid attendance session');
      return;
    }

    const deviceFingerprint = await getUniqueDeviceFingerprint();

    setIsSubmitting(true);

    try {
      const currentTime = formatTime();

      const AttendanceData = {
        ...formData,
        subjectName: qrData.subjectName,
        subjectId: qrData.subject,
        time: currentTime,
        date: qrData.attendanceDate,
        ipAddress: deviceFingerprint,
        deviceType: deviceType, // Add device type to attendance data
        userAgent: navigator.userAgent // Add user agent for reference
      };

      dispatch(createAttendance(AttendanceData))
        .then((res) => {
          if (res.payload.success) {
            toast.success(`Attendance submitted successfully at ${currentTime}!`);
            setFormData({
              studentName: '',
              rollNo: '',
              uniqueCode: ''
            });
            navigate("/scan-attendance");
          } else {
            toast.error(res.payload.message)
          }
        })
        .catch((error) => {
          toast.error('Failed to submit attendance. Please try again.');
        });

    } catch (error) {
      toast.error('Failed to submit attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Device restriction message component
  const DeviceRestrictionMessage = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-6 max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Mobile Device Required</h3>
          <p className="text-sm text-gray-600 mb-4">
            This attendance system is designed specifically for mobile devices to ensure security and prevent misuse.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h4 className="font-medium text-gray-700 mb-2">To access this page:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use a mobile phone (Android or iPhone)</li>
              <li>• Open Google Chrome browser</li>
              <li>• Scan the QR code with your mobile device</li>
            </ul>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700">
              <strong>Detected:</strong> {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} Device
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors font-medium text-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );

  // Return restricted view if device is not allowed
  if (!isAllowedDevice) {
    return <DeviceRestrictionMessage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-2xl mx-auto p-2">
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
          {/* Header with Current Time */}
          <div className="px-6 py-4 border-b border-gray-200 bg-sky-50 rounded-t-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Mark Your Attendance</h2>
                {qrData && (
                  <div className="mt-0.5 text-xs text-gray-600 space-y-1">
                    <p><span className="font-medium">Subject Name:</span> <span className='border-b border-gray-400'>{qrData.subjectName}</span></p>
                  </div>
                )}
              </div>
              <div className="mt-2 sm:mt-0">
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                  ✓ Mobile Device Detected
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Student Name */}
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors uppercase"
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            {/* Roll Number */}
            <div>
              <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 mb-2">
                Roll Number *
              </label>
              <input
                type="text"
                id="rollNo"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleInputChange}
                placeholder="Enter your roll number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors uppercase"
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            {/* Unique Code (Read-only) */}
            <div>
              <label htmlFor="uniqueCode" className="block text-sm font-medium text-gray-700 mb-2">
                Attendance Code
              </label>
              <input
                type="text"
                id="uniqueCode"
                name="uniqueCode"
                value={formData.uniqueCode}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md focus:outline-none cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">This code is automatically filled from the QR code</p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !qrData}
                className="flex-1 bg-sky-600 text-white py-3 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  `Submit Attendance`
                )}
              </button>
            </div>
          </form>

          {/* Instructions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h3>
            <ul className="text-[12px] text-gray-600 space-y-1">
              <li>• Fill in your full name and roll number accurately</li>
              <li>• Double-check your details before submitting</li>
              <li>• Your attendance time will be recorded automatically</li>
              <li>• Click "Submit Attendance" to mark your presence</li>
              <li>• <strong>Mobile-only:</strong> This page is optimized for mobile devices</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentAttendance_Page;