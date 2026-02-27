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
    discipline: '',
    uniqueCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [isAllowedDevice, setIsAllowedDevice] = useState(true); // Start as true, then check
  const [rollNoError, setRollNoError] = useState('');

  const locationHook = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  // Function to format time as "11:05 AM"
  const formatTime = (date = new Date()) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(formatTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if we have data from navigation state (scanned via QRScanner_Page)
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

        // Determine the correct subject name based on available fields
        let subjectName = 'Unknown Subject';

        if (parsedData.subjectName) {
          subjectName = parsedData.subjectName;
        } else if (parsedData.subject && typeof parsedData.subject === 'string' && !parsedData.subject.match(/^[0-9a-fA-F]{24}$/)) {
          subjectName = parsedData.subject;
        } else if (parsedData.departmentOffering) {
          subjectName = parsedData.departmentOffering;
        }

        setQrData({
          ...parsedData,
          subjectName: subjectName,
          subjectCode: parsedData.subjectCode || parsedData.code || 'N/A',
        });

        setFormData(prev => ({
          ...prev,
          uniqueCode: parsedData.code,
        }));
      } catch (error) {
        toast.error('Invalid QR code data');
        navigate('/');
      }
    }
    // Check URL parameters (when opened directly in browser)
    else {
      const urlParams = new URLSearchParams(locationHook.search);
      const code = urlParams.get('code');
      const subject = urlParams.get('subject');
      const subjectName = urlParams.get('subjectName');
      const subjectCode = urlParams.get('subjectCode');
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

        // Create QR data object from URL parameters
        const qrDataFromUrl = {
          code: code,
          subject: subject,
          subjectName: subjectName || subject || 'Unknown Subject',
          subjectCode: subjectCode || code || 'N/A',
          type: 'attendance',
          expiryTimestamp: expiry ? new Date(parseInt(expiry)).toISOString() : null,
          timestamp: urlParams.get('timestamp') || new Date().toISOString()
        };

        setQrData(qrDataFromUrl);
        setFormData(prev => ({
          ...prev,
          uniqueCode: code,
        }));
      } else {
        toast.error('No attendance code found');
        navigate('/');
      }
    }
  }, [locationHook, navigate]);

  // Function to capitalize input text
  const capitalizeText = (text) => {
    return text.toUpperCase();
  };

  // Function to validate and format roll number
  const validateAndFormatRollNo = (value) => {
    // Remove all spaces and convert to uppercase
    let cleaned = value.replace(/\s/g, '').toUpperCase();
    
    // Check if it matches the pattern: 2 digits + FA/SP + - + 0 + 2 digits + - + 2-3 letters
    const pattern = /^(\d{2})(FA|SP)-0?(\d{1,2})-([A-Z]{2,3})$/;
    const match = cleaned.match(pattern);
    
    if (match) {
      const [_, year, semester, roll, discipline] = match;
      // Format as: YYsemester-0roll-discipline (with leading zero for roll)
      const formattedRoll = `${year}${semester}-0${roll.padStart(2, '0')}-${discipline}`;
      
      // Auto-fill discipline
      setFormData(prev => ({
        ...prev,
        discipline: discipline,
        rollNo: formattedRoll
      }));
      setRollNoError('');
    } else {
      setFormData(prev => ({
        ...prev,
        rollNo: cleaned,
        discipline: ''
      }));
      
      // Provide helpful error message
      if (cleaned.length > 0) {
        setRollNoError('Format: YYFA/SP-0XX-DISCIPLINE (e.g., 25FA-015-CE)');
      } else {
        setRollNoError('');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent autofill by setting autocomplete="off" and handling paste events
    if (name === 'studentName') {
      // Only allow letters, spaces, and dots for student name
      const processedValue = capitalizeText(value.replace(/[^A-Za-z\s.]/g, ''));
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    } else if (name === 'rollNo') {
      // Only allow alphanumeric and hyphens for roll number
      const processedValue = value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
      validateAndFormatRollNo(processedValue);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Prevent paste events to avoid autofill
  const handlePaste = (e) => {
    e.preventDefault();
    toast.warning('Please type manually to avoid formatting issues');
  };

  // Prevent browser autofill
  useEffect(() => {
    // Add autocomplete="off" to all inputs after mount
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
    });
  }, []);

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

    if (!formData.studentName.trim() || !formData.rollNo.trim() || !formData.uniqueCode.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    // Validate roll number format before submission
    const rollNoPattern = /^\d{2}(FA|SP)-0\d{2}-[A-Z]{2,3}$/;
    if (!rollNoPattern.test(formData.rollNo)) {
      toast.error('Please enter a valid roll number format: YYFA/SP-0XX-DISCIPLINE (e.g., 25FA-015-CE)');
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

      // Extract discipline from roll number (after last hyphen)
      const disciplineFromRoll = formData.rollNo.split('-').pop() || '';

      const AttendanceData = {
        ...formData,
        discipline: disciplineFromRoll, // Auto-filled from roll number
        uniqueCode: originalCode, // Send original code to backend
        subjectName: qrData.subjectName || qrData.subject || 'Unknown Subject',
        subjectCode: qrData.subjectCode || 'N/A', // Include subject code if needed
        subjectId: qrData.subject, // This is the subject ID
        time: currentTime,
        date: qrData.attendanceDate || new Date().toISOString().split('T')[0],
        ipAddress: deviceFingerprint,
      };

      dispatch(createAttendance(AttendanceData))
        .then((res) => {
          if (res.payload.success) {
            toast.success(`Attendance submitted successfully at ${currentTime}!`);
            setFormData({
              studentName: '',
              rollNo: '',
              discipline: '',
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
          <p className="text-gray-600 mb-4">
            Detected: <span className="font-semibold text-red-600">{detectedBrowser}</span>
          </p>

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
                  This attendance system requires Google Chrome browser for security and compatibility reasons.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="shrink-0 mt-1">
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
                  2. Open Chrome and scan the QR code<br />
                  3. Submit your attendance details
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
                  • Enhanced security features<br />
                  • Better form handling<br />
                  • Consistent user experience
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-2xl mx-auto p-2">
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
          {/* Header with Current Time */}
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Mark Your Attendance</h2>
                {qrData && (
                  <div className="mt-0.5 text-xs text-gray-600 space-y-1">
                    <p><span className="font-medium">Course Name:</span> <span className='border-b border-gray-400'>{qrData.subjectName || qrData.subject || 'N/A'}</span></p>
                    <p><span className="font-medium">Course Code:</span> <span className='border-b border-gray-400'>{qrData.subjectCode || qrData.code || 'N/A'}</span></p>
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
                onPaste={handlePaste}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase"
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
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
                onPaste={handlePaste}
                placeholder="e.g., 25FA-015-CE"
                className={`w-full px-3 py-2 border ${rollNoError ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase`}
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                style={{ textTransform: 'uppercase' }}
              />
              {rollNoError && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {rollNoError}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Format: 2 digits + FA/SP + - + 0 + 2 digits + - + discipline code (e.g., 25FA-015-CE)
              </p>
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
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-gray-500">This code is automatically filled from the QR code</p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !qrData}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
              <li>• <strong>Browser:</strong> Google Chrome browser required</li>
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