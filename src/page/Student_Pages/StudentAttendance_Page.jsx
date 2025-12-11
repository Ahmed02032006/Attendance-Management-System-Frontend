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
  const [qrExpired, setQrExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const locationHook = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  // Check QR expiry
  useEffect(() => {
    if (qrData && qrData.expiryTime) {
      const checkExpiry = () => {
        const now = new Date();
        const expiry = new Date(qrData.expiryTime);
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          setQrExpired(true);
          toast.error('This QR code has expired! Please ask your teacher for a new one.');
        } else {
          setQrExpired(false);
        }
      };

      checkExpiry();
      const interval = setInterval(checkExpiry, 1000);
      return () => clearInterval(interval);
    }
  }, [qrData]);

  useEffect(() => {
    if (locationHook.state?.qrData) {
      try {
        const parsedData = JSON.parse(locationHook.state.qrData);
        
        // Check if QR is expired
        if (parsedData.expiryTime) {
          const now = new Date();
          const expiry = new Date(parsedData.expiryTime);
          
          if (expiry < now) {
            toast.error('This QR code has expired! Please ask your teacher for a new one.');
            setQrExpired(true);
          } else {
            setQrExpired(false);
            setQrData(parsedData);
            setFormData(prev => ({
              ...prev,
              uniqueCode: parsedData.code,
            }));
          }
        } else {
          // Old QR format without expiry
          toast.warning('This is an old QR code. Please scan a new one.');
          setQrExpired(true);
        }
      } catch (error) {
        toast.error('Invalid QR code data');
        navigate('/');
      }
    } else {
      const urlParams = new URLSearchParams(locationHook.search);
      const code = urlParams.get('code');
      const subject = urlParams.get('subject');
      const subjectName = urlParams.get('subjectName');

      if (code) {
        // Direct URL access - QR likely expired
        toast.warning('This QR code link may have expired. Please scan a fresh QR code.');
        setQrExpired(true);
        
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
  }, [locationHook, navigate]);

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

    // Check if QR is expired
    if (qrExpired) {
      toast.error('Cannot submit: QR code has expired!');
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

    // Double check expiry on submit
    if (qrData.expiryTime) {
      const now = new Date();
      const expiry = new Date(qrData.expiryTime);
      if (expiry < now) {
        toast.error('QR code expired just now! Please scan a new one.');
        setQrExpired(true);
        return;
      }
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
        qrId: qrData.qrId || 'unknown', // Include QR ID for tracking
        qrTimestamp: qrData.timestamp || new Date().toISOString()
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
                    
                    {/* QR Expiry Status */}
                    {qrData.expiryTime && (
                      <div className={`mt-2 px-3 py-1.5 rounded-md ${qrExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {qrExpired ? 'QR Expired' : 'QR Active'}
                          </span>
                          {!qrExpired && timeRemaining !== null && (
                            <span className="font-bold">
                              {timeRemaining}s
                            </span>
                          )}
                        </div>
                        {!qrExpired && (
                          <p className="text-xs mt-1">
                            Expires in {timeRemaining} seconds
                          </p>
                        )}
                        {qrExpired && (
                          <p className="text-xs mt-1">
                            Please scan a fresh QR code from your teacher
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QR Expired Warning */}
          {qrExpired && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-red-800">QR Code Expired</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                This QR code is no longer valid. Please ask your teacher to generate a new one.
              </p>
            </div>
          )}

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
                disabled={qrExpired}
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
                disabled={qrExpired}
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
                disabled={isSubmitting || !qrData || qrExpired}
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
              <li>• QR codes expire after 20 seconds for security</li>
              <li>• Make sure you're scanning a fresh QR code</li>
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