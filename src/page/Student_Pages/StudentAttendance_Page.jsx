import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createAttendance } from '../../store/Teacher-Slicer/Attendance-Slicer';
import { useDispatch } from 'react-redux';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const StudentAttendance_Page = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNo: '',
    uniqueCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [isAllowedDevice, setIsAllowedDevice] = useState(false);

  const locationHook = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check device and browser restrictions - NO TOASTS, NO NAVIGATION
  useEffect(() => {
    const checkDeviceRestrictions = () => {
      // Check if device is mobile
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Check if browser is Chrome/Chromium based
      const isChromeBrowser = /Chrome|CriOS/.test(navigator.userAgent) && !/Edg|OPR|Opera|SamsungBrowser/.test(navigator.userAgent);
      
      // Check if running in Chrome on Android (specific check for mobile Chrome)
      const isChromeOnAndroid = /Android.*Chrome\//.test(navigator.userAgent);
      
      // Check if it's a desktop/tab (we want to block these)
      const isDesktopOrTab = !isMobileDevice || 
        (/iPad|Tablet|SamsungTablet/.test(navigator.userAgent) && !isChromeOnAndroid);
      
      // Allow only mobile devices with Chrome browser
      const allowed = isMobileDevice && isChromeBrowser && !isDesktopOrTab;
      setIsAllowedDevice(allowed);
      
      return allowed;
    };

    // Run the check immediately
    checkDeviceRestrictions();
  }, []);

  // Function to format time as "11:05 AM"
  const formatTime = (date = new Date()) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    // Don't proceed if device is not allowed
    if (!isAllowedDevice) return;

    const updateTime = () => {
      setCurrentTime(formatTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isAllowedDevice]);

  useEffect(() => {
    // Don't proceed if device is not allowed
    if (!isAllowedDevice) return;

    if (locationHook.state?.qrData) {
      try {
        const parsedData = JSON.parse(locationHook.state.qrData);

        // Check if QR code is expired
        if (parsedData.expiryTimestamp) {
          const expiryTime = new Date(parsedData.expiryTimestamp);
          const currentTime = new Date();

          if (currentTime > expiryTime) {
            toast.error('QR code has expired. Please scan a fresh QR code.');
            navigate('/scan-attendance');
            return;
          }
        }

        setQrData(parsedData);
        setFormData(prev => ({
          ...prev,
          uniqueCode: parsedData.code,
        }));
      } catch (error) {
        toast.error('Invalid QR code data');
        navigate('/');
      }
    } else {
      const urlParams = new URLSearchParams(locationHook.search);
      const code = urlParams.get('code');
      const subject = urlParams.get('subject');
      const subjectName = urlParams.get('subjectName');
      const expiry = urlParams.get('expiry');

      if (code) {
        // Check expiry
        if (expiry) {
          const expiryTime = new Date(parseInt(expiry));
          const currentTime = new Date();

          if (currentTime > expiryTime) {
            toast.error('QR code has expired. Please scan a fresh QR code.');
            navigate('/scan-attendance');
            return;
          }
        }

        setQrData({
          code,
          subject: subject || 'Unknown Subject',
          subjectName: subjectName || 'Unknown Subject Name',
          type: 'attendance',
          expiryTimestamp: expiry ? new Date(parseInt(expiry)).toISOString() : null
        });
        setFormData(prev => ({
          ...prev,
          uniqueCode: code, // Use the original code
        }));
      } else {
        toast.error('No attendance code found');
        navigate('/');
      }
    }
  }, [locationHook, navigate, isAllowedDevice]);

  // Function to capitalize input text
  const capitalizeText = (text) => {
    return text.toUpperCase();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const processedValue = (name === 'studentName' || name === 'rollNo')
      ? capitalizeText(value)
      : value;

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Get or create persistent device fingerprint
  const getUniqueDeviceFingerprint = async () => {
    try {
      const storedFingerprint = localStorage.getItem('deviceFingerprint');

      if (storedFingerprint) {
        return storedFingerprint;
      }

      const agent = await FingerprintJS.load();
      const result = await agent.get();

      const persistentData = {
        visitorId: result.visitorId,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const dataString = JSON.stringify(persistentData);
      let hash = 0;
      for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & 0x7FFFFFFF;
      }

      const fingerprint = `device_${hash.toString(36)}`;
      localStorage.setItem('deviceFingerprint', fingerprint);

      return fingerprint;

    } catch (error) {
      console.error('Error getting device fingerprint:', error);

      const storedFingerprint = localStorage.getItem('deviceFingerprint');
      if (storedFingerprint) {
        return storedFingerprint;
      }

      const basicData = [
        navigator.userAgent,
        navigator.language,
        navigator.platform,
        screen.width,
        screen.height,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      ].join('|');

      let hash = 0;
      for (let i = 0; i < basicData.length; i++) {
        const char = basicData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & 0x7FFFFFFF;
      }

      const basicFingerprint = `basic_${hash.toString(36)}`;
      localStorage.setItem('deviceFingerprint', basicFingerprint);

      return basicFingerprint;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check device restrictions again before submission
    if (!isAllowedDevice) {
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

    // Check if QR code is expired
    if (qrData.expiryTimestamp) {
      const expiryTime = new Date(qrData.expiryTimestamp);
      const currentTime = new Date();

      if (currentTime > expiryTime) {
        toast.error('QR code has expired. Please scan a fresh QR code.');
        navigate('/scan-attendance');
        return;
      }
    }

    // Extract original code from dynamic code
    const submittedCode = qrData.originalCode || qrData.code;

    // If code contains timestamp (format: code_timestamp), extract original
    const codeParts = submittedCode.split('_');
    const originalCode = codeParts.length > 1 ? codeParts[0] : submittedCode;

    const deviceFingerprint = await getUniqueDeviceFingerprint();

    setIsSubmitting(true);

    try {
      const currentTime = formatTime();

      const AttendanceData = {
        ...formData,
        uniqueCode: originalCode, // Send original code to backend
        subjectName: qrData.subjectName,
        subjectId: qrData.subject,
        time: currentTime,
        date: qrData.attendanceDate,
        ipAddress: deviceFingerprint,
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
          console.error('Attendance submission error:', error);
        });

    } catch (error) {
      toast.error('Failed to submit attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Device restriction error screen - SHOW IMMEDIATELY IF NOT ALLOWED
  if (!isAllowedDevice) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Restricted</h2>
          
          <div className="space-y-4 mb-6 text-left">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Mobile Device Required</h4>
                <p className="text-sm text-gray-600">
                  This feature is only available on mobile phones. Tablets and computers are not supported.
                </p>
              </div>
            </div>
            
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
                  Please use Google Chrome browser to access the attendance submission feature.
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
                  1. Open Google Chrome on your mobile phone<br />
                  2. Scan the QR code from your teacher<br />
                  3. Fill in your details and submit attendance
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Home
          </button>
        </div>
      </div>
    );
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
                    <div className="flex items-center mt-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 flex items-center">
                        <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Mobile Chrome
                      </span>
                    </div>
                  </div>
                )}
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
                // Extract code before underscore for display
                value={formData.uniqueCode.split('_')[0]}
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
              <li>• <strong>Device:</strong> Mobile phone with Google Chrome browser only</li>
              <li>• Fill in your full name and roll number accurately</li>
              <li>• Make sure you're in the correct class session</li>
              <li>• Double-check your details before submitting</li>
              <li>• Your attendance time will be recorded automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance_Page;