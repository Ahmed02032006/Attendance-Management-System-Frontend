import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createAttendance } from '../../store/Teacher-Slicer/Attendance-Slicer';
import { useDispatch } from 'react-redux';
import { useIPAddress } from '../../hooks/useIPAddress';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Helper function to calculate distance between two coordinates using Haversine formula
// More accurate distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

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
  const [studentLocation, setStudentLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const locationHook = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ipAddress = useIPAddress();

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

  // Get student's current location
  const getStudentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setIsGettingLocation(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          setStudentLocation(location);
          setIsGettingLocation(false);
          resolve(location);
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services to mark attendance.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your connection.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'Failed to get location. Please try again.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });
  };

  useEffect(() => {
    if (locationHook.state?.qrData) {
      try {
        const parsedData = JSON.parse(locationHook.state.qrData);
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
      const urlParams = new URLSearchParams(locationHook.search);
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

    if (!formData.studentName.trim() || !formData.rollNo.trim() || !formData.uniqueCode.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    if (!qrData) {
      toast.error('Invalid attendance session');
      return;
    }

    // Verify location before submission (only if teacher location is available)
    if (qrData.teacherLocation) {
      try {
        setIsSubmitting(true);
        setIsGettingLocation(true);

        // Get fresh student location
        const studentLoc = await getStudentLocation();

        // Add debugging logs
        console.log('Teacher Location:', qrData.teacherLocation);
        console.log('Student Location:', studentLoc);

        const radius = qrData.locationRadius || 1; // Use radius from QR or default to 1 meter
        const isWithinRadius = verifyLocation(studentLoc, qrData.teacherLocation, radius);

        console.log(`Allowed Radius: ${radius} meters`);
        console.log(`Is within radius: ${isWithinRadius}`);

        if (!isWithinRadius) {
          toast.error(`You must be within ${radius} meter of the teacher to mark attendance.`);
          setIsSubmitting(false);
          setIsGettingLocation(false);
          return;
        }
      } catch (error) {
        console.error('Location error:', error);
        toast.error(error.message || 'Failed to verify location. Please enable location services.');
        setIsSubmitting(false);
        setIsGettingLocation(false);
        return;
      }
    }

    const deviceFingerprint = await getUniqueDeviceFingerprint();

    try {
      const currentTime = formatTime();

      const AttendanceData = {
        ...formData,
        subjectName: qrData.subjectName,
        subjectId: qrData.subject,
        time: currentTime,
        date: qrData.attendanceDate,
        ipAddress: deviceFingerprint,
        studentLocation: studentLocation,
        teacherLocation: qrData.teacherLocation,
        locationVerified: true,
        distance: qrData.teacherLocation ? calculateDistance(
          studentLocation.latitude,
          studentLocation.longitude,
          qrData.teacherLocation.latitude,
          qrData.teacherLocation.longitude
        ) : null
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
      setIsGettingLocation(false);
    }
  };

  // Add location accuracy validation
  const verifyLocation = (studentLoc, teacherLoc, radius = 1) => {
    if (!studentLoc || !teacherLoc) {
      console.log('Missing location data');
      return false;
    }

    // Check if location accuracy is too poor
    if (studentLoc.accuracy > 50) { // If accuracy worse than 50 meters
      console.warn(`Poor location accuracy: ${studentLoc.accuracy} meters`);
      toast.warning(`Your location accuracy is poor (${studentLoc.accuracy.toFixed(1)}m). Try moving to an open area.`);
    }

    const distance = calculateDistance(
      studentLoc.latitude,
      studentLoc.longitude,
      teacherLoc.latitude,
      teacherLoc.longitude
    );

    console.log(`Distance from teacher: ${distance.toFixed(2)} meters (Allowed: ${radius}m)`);
    console.log(`Student: ${studentLoc.latitude}, ${studentLoc.longitude}`);
    console.log(`Teacher: ${teacherLoc.latitude}, ${teacherLoc.longitude}`);

    return distance <= radius;
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
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance_Page;