import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createAttendance } from '../../store/Teacher-Slicer/Attendance-Slicer';
import { useDispatch } from 'react-redux';
import { useIPAddress } from '../../hooks/useIPAddress';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { FiMapPin, FiNavigation } from 'react-icons/fi';

// Helper function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance * 1000; // Convert to meters
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
  const [distanceFromTeacher, setDistanceFromTeacher] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');

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
      setLocationStatus('Getting your location...');

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

          // Check distance if teacher location is available
          if (qrData?.teacherLocation) {
            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              qrData.teacherLocation.latitude,
              qrData.teacherLocation.longitude
            );
            setDistanceFromTeacher(distance);

            const requiredRadius = qrData.locationRadius || 50; // Default to 50 meters
            if (distance <= requiredRadius) {
              setLocationStatus(`You're within ${requiredRadius}m radius (${distance.toFixed(1)}m)`);
            } else {
              setLocationStatus(`You're outside ${requiredRadius}m radius (${distance.toFixed(1)}m)`);
            }
          } else {
            setLocationStatus('Location captured successfully');
          }

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
          setLocationStatus(errorMessage);
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

  // Verify if student is within required radius
  const verifyLocation = (studentLoc, teacherLoc, radius = 50) => { // ✅ Default to 50 meters
    if (!studentLoc || !teacherLoc) {
      return false;
    }

    const distance = calculateDistance(
      studentLoc.latitude,
      studentLoc.longitude,
      teacherLoc.latitude,
      teacherLoc.longitude
    );

    console.log(`Distance from teacher: ${distance.toFixed(2)} meters, Radius: ${radius} meters`);
    return distance <= radius;
  };

  // Get student location when component mounts or QR data changes
  useEffect(() => {
    if (qrData?.teacherLocation) {
      getStudentLocation();
    }
  }, [qrData]);

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
          type: 'attendance',
          locationRadius: 50 // Default radius
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

    // Get fresh location before submission
    let studentLoc;
    try {
      studentLoc = await getStudentLocation();
    } catch (error) {
      toast.error('Failed to get your location. Please enable location services.');
      return;
    }

    // Verify location before submission (only if teacher location is available)
    if (qrData.teacherLocation) {
      const requiredRadius = qrData.locationRadius || 50; // ✅ Use 50 meters radius
      const isWithinRadius = verifyLocation(studentLoc, qrData.teacherLocation, requiredRadius);

      if (!isWithinRadius) {
        toast.error(`You are not within ${requiredRadius} meters radius from the teacher. Current distance: ${distanceFromTeacher?.toFixed(1) || 'Unknown'}m`);
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
        studentLocation: studentLoc,
        teacherLocation: qrData.teacherLocation,
        locationVerified: true,
        distance: distanceFromTeacher,
        requiredRadius: qrData.locationRadius || 50
      };

      dispatch(createAttendance(AttendanceData))
        .then((res) => {
          if (res.payload.success) {
            toast.success(`Attendance submitted successfully at ${currentTime}! Distance: ${distanceFromTeacher?.toFixed(1) || 'Unknown'}m`);
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

  // Function to refresh location
  const refreshLocation = async () => {
    try {
      await getStudentLocation();
      toast.info('Location refreshed');
    } catch (error) {
      toast.error('Failed to refresh location');
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
                    {qrData.teacherLocation && (
                      <p><span className="font-medium">Required Radius:</span> {qrData.locationRadius || 50} meters</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          {(qrData?.teacherLocation || studentLocation) && (
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                  <FiMapPin className="mr-2 text-blue-600" />
                  Location Information
                </h3>
                <button
                  onClick={refreshLocation}
                  disabled={isGettingLocation}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50"
                >
                  <FiNavigation className="mr-1" />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Student Coordinates */}
                <div className="bg-white p-3 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-1 flex items-center">
                    <FiMapPin className="mr-1 text-green-600" />
                    Your Coordinates
                  </h4>
                  {studentLocation ? (
                    <>
                      <div className="text-gray-900 font-mono">
                        <div>Lat: {studentLocation.latitude.toFixed(6)}</div>
                        <div>Lng: {studentLocation.longitude.toFixed(6)}</div>
                      </div>
                      <div className="mt-1 text-gray-500 text-[11px]">
                        Accuracy: ±{studentLocation.accuracy?.toFixed(1) || 'Unknown'}m
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">Fetching your location...</p>
                  )}
                </div>

                {/* Teacher Coordinates */}
                <div className="bg-white p-3 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-1 flex items-center">
                    <FiMapPin className="mr-1 text-red-600" />
                    Teacher's Coordinates
                  </h4>
                  {qrData?.teacherLocation ? (
                    <div className="text-gray-900 font-mono">
                      <div>Lat: {qrData.teacherLocation.latitude.toFixed(6)}</div>
                      <div>Lng: {qrData.teacherLocation.longitude.toFixed(6)}</div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Not available</p>
                  )}
                </div>
              </div>

              {/* Distance Information */}
              {distanceFromTeacher !== null && qrData?.teacherLocation && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Distance from Teacher:</span>
                      <span className={`ml-2 text-sm font-bold ${distanceFromTeacher <= (qrData.locationRadius || 50) ? 'text-green-600' : 'text-red-600'}`}>
                        {distanceFromTeacher.toFixed(1)} meters
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${distanceFromTeacher <= (qrData.locationRadius || 50) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {distanceFromTeacher <= (qrData.locationRadius || 50) ? 'Within Radius ✓' : 'Outside Radius ✗'}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Required: Within {(qrData.locationRadius || 50)} meters radius
                  </p>
                </div>
              )}

              {/* Location Status */}
              {locationStatus && (
                <div className={`mt-3 p-2 rounded text-xs ${isGettingLocation ? 'bg-yellow-100 text-yellow-800' : distanceFromTeacher <= (qrData.locationRadius || 50) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isGettingLocation ? (
                    <div className="flex items-center">
                      <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      {locationStatus}
                    </div>
                  ) : locationStatus}
                </div>
              )}
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
                disabled={isSubmitting || !qrData || (qrData.teacherLocation && distanceFromTeacher > (qrData.locationRadius || 50))}
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
              <li>• You must be within 50 meters radius from the teacher</li>
              <li>• Location services must be enabled</li>
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