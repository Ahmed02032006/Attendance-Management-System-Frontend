import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createAttendance } from '../../store/Teacher-Slicer/Attendance-Slicer';
import { getSubjectDetails, clearSubjectDetails } from '../../store/Teacher-Slicer/Subject-Slicer';
import { useDispatch, useSelector } from 'react-redux';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';

const StudentAttendance_Page = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNo: '',
    uniqueCode: '',
  });
  const [discipline, setDiscipline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [isAllowedDevice, setIsAllowedDevice] = useState(true);
  const [isFetchingStudent, setIsFetchingStudent] = useState(false);
  const [studentFetchTimeout, setStudentFetchTimeout] = useState(null);
  const [rollNoValid, setRollNoValid] = useState(false);
  const [isLoadingSubject, setIsLoadingSubject] = useState(true);

  const locationHook = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { subjectDetails, isLoading: subjectLoading } = useSelector(
    (state) => state.teacherSubject
  );

  // Add your isGenuineChromeStrict function here (same as before)
  const isGenuineChromeStrict = async () => {
    try {
      const userAgent = navigator.userAgent;
      const hasChrome = /Chrome/i.test(userAgent) || /CriOS/i.test(userAgent);

      if (!hasChrome) return false;

      const isIOSChrome = /CriOS/i.test(userAgent);
      if (!isIOSChrome && (!navigator.vendor || !navigator.vendor.includes('Google'))) {
        return false;
      }

      if (navigator.brave) {
        try {
          const isBrave = await navigator.brave.isBrave();
          if (isBrave) return false;
        } catch (e) {}
      }

      const otherBrowsers = /Edg|Edge|OPR|Opera|Samsung|UCBrowser|Vivaldi|Yandex|YaBrowser|DuckDuckGo|Phoenix|Miui|XiaoMi|Vivo|Huawei|QQ|Baidu|360|Sogou|Maxthon|Sleipnir|Puffin|Dolphin|Coast|bluefire|Bolt|Iron|Epic|Pale Moon|Basilisk|Waterfox/i;
      if (otherBrowsers.test(userAgent)) return false;

      const isMobile = /Android|iPhone|iPad|iPod/.test(userAgent);
      if (!isMobile) return false;

      if (/Android/.test(userAgent)) {
        if (!window.chrome) return false;
      }

      return true;
    } catch (error) {
      console.error('Chrome validation error:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkBrowserRestrictions = async () => {
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (isDevelopment) {
        setIsAllowedDevice(true);
        return;
      }

      const isAllowed = await isGenuineChromeStrict();
      setIsAllowedDevice(isAllowed);
    };

    checkBrowserRestrictions();
  }, []);

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

  // Parse QR data and fetch subject details
  useEffect(() => {
    const parseAndFetchSubject = async () => {
      setIsLoadingSubject(true);

      try {
        let subjectId = null;
        let code = null;
        let scheduleId = null;
        let expiry = null;
        let timestamp = null;

        // Check if we have data from navigation state (scanned via QRScanner_Page)
        if (locationHook.state?.qrData) {
          try {
            const parsedData = JSON.parse(locationHook.state.qrData);
            
            // Extract data from parsed object
            subjectId = parsedData.subjectId; // Changed from 'subject' to 'subjectId'
            code = parsedData.code;
            scheduleId = parsedData.scheduleId;
            expiry = parsedData.expiryTimestamp ? new Date(parsedData.expiryTimestamp).getTime() : null;
            timestamp = parsedData.timestamp ? new Date(parsedData.timestamp).getTime() : null;
          } catch (error) {
            console.error('Error parsing state QR data:', error);
          }
        } 
        // Check URL parameters (when opened directly in browser)
        else {
          const urlParams = new URLSearchParams(locationHook.search);
          subjectId = urlParams.get('subjectId'); // Changed from 'subject' to 'subjectId'
          code = urlParams.get('code');
          scheduleId = urlParams.get('scheduleId');
          expiry = urlParams.get('expiry');
          timestamp = urlParams.get('timestamp');
        }

        // Validate required parameters
        if (!subjectId || !code) {
          toast.error('Invalid QR code: Missing required information');
          navigate('/scan-attendance');
          return;
        }

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

        // Fetch subject details from backend
        const result = await dispatch(getSubjectDetails(subjectId)).unwrap();

        if (result) {
          const qrDataFromUrl = {
            code: code,
            subjectId: subjectId,
            scheduleId: scheduleId,
            subjectName: result.title,
            subjectCode: result.code,
            departmentOffering: result.departmentOffering,
            creditHours: result.creditHours,
            session: result.session,
            semester: result.semester,
            classSchedule: result.classSchedule,
            type: 'attendance',
            expiryTimestamp: expiry ? new Date(parseInt(expiry)).toISOString() : null,
            timestamp: timestamp ? new Date(parseInt(timestamp)).toISOString() : new Date().toISOString()
          };

          setQrData(qrDataFromUrl);
          setFormData(prev => ({
            ...prev,
            uniqueCode: code,
          }));
        }

      } catch (error) {
        console.error('Error fetching subject details:', error);
        toast.error('Failed to load course details. Please try again.');
        navigate('/scan-attendance');
      } finally {
        setIsLoadingSubject(false);
      }
    };

    if (isAllowedDevice) {
      parseAndFetchSubject();
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearSubjectDetails());
    };
  }, [locationHook, navigate, dispatch, isAllowedDevice]);

  // Function to fetch student discipline by roll number
  const fetchStudentDiscipline = async (rollNo) => {
    if (!rollNo || rollNo.length < 3 || !qrData?.subjectId) return;

    setIsFetchingStudent(true);
    setRollNoValid(false);
    setDiscipline('');

    try {
      const url = `https://attendance-management-system-backen.vercel.app/api/v1/teacher/attendance/registered-student/${qrData.subjectId}/${rollNo}`;
      const params = new URLSearchParams();
      if (qrData.scheduleId) {
        params.append('scheduleId', qrData.scheduleId);
      }

      const response = await axios.get(url + (params.toString() ? `?${params.toString()}` : ''));

      if (response.data.success) {
        const studentData = response.data.data;
        setDiscipline(studentData.discipline || '');
        setRollNoValid(true);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setDiscipline('');
        setRollNoValid(false);
      } else {
        console.error('Error fetching student:', error);
        setDiscipline('');
        setRollNoValid(false);
      }
    } finally {
      setIsFetchingStudent(false);
    }
  };

  const handleRollNoChange = (e) => {
    const { value } = e.target;
    const processedValue = value.toUpperCase();

    setFormData(prev => ({
      ...prev,
      rollNo: processedValue
    }));

    setDiscipline('');
    setRollNoValid(false);

    if (studentFetchTimeout) {
      clearTimeout(studentFetchTimeout);
    }

    if (processedValue.length >= 3 && qrData?.subjectId) {
      const timeout = setTimeout(() => {
        fetchStudentDiscipline(processedValue);
      }, 800);

      setStudentFetchTimeout(timeout);
    }
  };

  const capitalizeText = (text) => {
    return text.toUpperCase();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue;

    if (name === 'studentName' || name === 'rollNo') {
      processedValue = capitalizeText(value);
    } else {
      processedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

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

    if (!discipline) {
      toast.error('Invalid roll number for this course');
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

    const deviceFingerprint = await getUniqueDeviceFingerprint();

    setIsSubmitting(true);

    try {
      const currentTimeFormatted = formatTime();

      const AttendanceData = {
        studentName: formData.studentName,
        rollNo: formData.rollNo,
        discipline: discipline,
        uniqueCode: formData.uniqueCode,
        subjectName: qrData.subjectName,
        subjectCode: qrData.subjectCode,
        subjectId: qrData.subjectId,
        scheduleId: qrData.scheduleId,
        time: currentTimeFormatted,
        date: new Date().toISOString().split('T')[0],
        ipAddress: deviceFingerprint,
      };

      console.log('Submitting attendance:', AttendanceData);

      const result = await dispatch(createAttendance(AttendanceData)).unwrap();

      if (result && result.success) {
        toast.success(`Attendance submitted successfully at ${currentTimeFormatted}!`);

        setFormData({
          studentName: '',
          rollNo: '',
          uniqueCode: ''
        });
        setDiscipline('');
        setRollNoValid(false);

        setTimeout(() => {
          navigate("/scan-attendance");
        }, 1500);
      } else {
        toast.error(result?.message || 'Failed to submit attendance');
      }
    } catch (error) {
      console.error('Attendance submission error:', error);

      if (error?.message) {
        toast.error(error.message);
      } else if (typeof error === 'string') {
        toast.error(error);
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit attendance. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (studentFetchTimeout) {
        clearTimeout(studentFetchTimeout);
      }
    };
  }, [studentFetchTimeout]);

  // Loading state while fetching subject details
  if (isLoadingSubject || subjectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Course Details...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we verify the QR code</p>
        </div>
      </div>
    );
  }

  // Browser restriction error screen (same as before)
  if (!isAllowedDevice) {
    // ... (keep your existing browser restriction JSX)
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        {/* ... your existing browser restriction JSX ... */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-2xl mx-auto p-2">
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
          {/* Header with Subject Details */}
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Mark Your Attendance</h2>
              {qrData && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Course:</span> {qrData.subjectName}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Code:</span> {qrData.subjectCode}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Department:</span> {qrData.departmentOffering}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Semester:</span> {qrData.semester} • Session: {qrData.session}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Roll Number */}
            <div>
              <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 mb-2">
                Roll Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="rollNo"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleRollNoChange}
                  placeholder="Enter your roll number"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase pr-10 ${
                    rollNoValid
                      ? 'border-green-500 bg-green-50'
                      : formData.rollNo.length >= 3 && !isFetchingStudent && !rollNoValid && discipline === ''
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                  }`}
                  required
                  autoComplete="off"
                  style={{ textTransform: 'uppercase' }}
                />
                {isFetchingStudent && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {!isFetchingStudent && rollNoValid && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              {formData.rollNo.length >= 3 && !isFetchingStudent && !rollNoValid && discipline === '' && (
                <p className="mt-1 text-xs text-red-500">
                  Invalid roll number for this course
                </p>
              )}
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase"
                required
                autoComplete="off"
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
                disabled={isSubmitting || !qrData || !discipline}
                className={`flex-1 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium ${
                  !discipline ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
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
              <li>• Enter your roll number - it will be validated for this course</li>
              <li>• Fill in your full name correctly</li>
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