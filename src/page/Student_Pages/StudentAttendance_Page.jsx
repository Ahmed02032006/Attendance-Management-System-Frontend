import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createAttendance } from '../../store/Teacher-Slicer/Attendance-Slicer';
import { useDispatch } from 'react-redux';
import { useIPAddress } from '../../hooks/useIPAddress';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
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
  const [locationError, setLocationError] = useState('');
  const [locationAttempted, setLocationAttempted] = useState(false);

  const locationHook = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ipAddress = useIPAddress();

  const formatTime = (date = new Date()) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get student's current location - Auto-trigger when QR data is available
  const getStudentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      setIsGettingLocation(true);
      setLocationError('');
      setLocationAttempted(true);

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
              errorMessage = 'Location access denied. Please enable location services in your browser settings and refresh the page.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your connection and try again.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'Failed to get your location. Please try again.';
              break;
          }
          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  };

  // Auto-request location when QR data is loaded and requires location
  useEffect(() => {
    if (qrData && qrData.teacherLocation && !studentLocation && !locationAttempted) {
      console.log('Auto-requesting location for attendance...');
      getStudentLocation().catch(error => {
        console.log('Auto-location request failed:', error.message);
      });
    }
  }, [qrData, studentLocation, locationAttempted]);

  const verifyLocation = (teacherLoc, studentLoc, allowedRadius = 200) => {
    if (!teacherLoc || !studentLoc) {
      return false;
    }

    const distance = calculateDistance(
      teacherLoc.latitude,
      teacherLoc.longitude,
      studentLoc.latitude,
      studentLoc.longitude
    );

    console.log(`Distance from teacher: ${distance.toFixed(2)} meters`);
    
    return distance <= allowedRadius;
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
    if (locationHook.state?.qrData) {
      try {
        const parsedData = JSON.parse(locationHook.state.qrData);
        setQrData(parsedData);
        setFormData(prev => ({
          ...prev,
          uniqueCode: parsedData.code,
          ipAddress
        }));
        
        // Reset location state when new QR data is loaded
        setLocationAttempted(false);
        setStudentLocation(null);
        setLocationError('');
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
        
        // Reset location state when new QR data is loaded
        setLocationAttempted(false);
        setStudentLocation(null);
        setLocationError('');
      } else {
        toast.error('No attendance code found');
        navigate('/');
      }
    }
  }, [locationHook, navigate, ipAddress]);

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

  // Manual location retry function
  const handleRetryLocation = async () => {
    try {
      await getStudentLocation();
      toast.success('Location retrieved successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getUniqueDeviceFingerprint = async () => {
    const components = [];

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 300;
      canvas.height = 100;

      const randomSeed = Math.random() * 10000;
      ctx.textBaseline = 'alphabetic';
      ctx.font = '14px "Arial", "Helvetica", sans-serif';

      ctx.fillText(`Device:${navigator.hardwareConcurrency}📱${screen.colorDepth}`, 10, 20);
      ctx.fillText(`Screen:${screen.width}x${screen.height}@${window.devicePixelRatio}`, 10, 40);
      ctx.fillText(`Time:${Date.now()}`, 10, 60);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.7)`);
      gradient.addColorStop(1, `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(150, 10, 80, 30);

      const canvasData = canvas.toDataURL();

      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      let webglData = '';
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webglData = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) +
            gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        }
      }

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

      const combined = [
        canvasData,
        webglData,
        audioFingerprint,
        JSON.stringify(deviceProps),
        Date.now().toString(),
        Math.random().toString(36).substring(2),
        performance.now().toString()
      ].join('|');

      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 7) - hash) + char;
        hash = hash & 0x7FFFFFFF;
      }

      const timestamp = Date.now().toString(36);
      const randomComponent = Math.random().toString(36).substring(2, 8);

      return `${hash.toString(36)}${timestamp}${randomComponent}`.substring(0, 32);

    } catch (error) {
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

    if (!formData.studentName.trim() || !formData.rollNo.trim() || !formData.uniqueCode.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    if (!qrData) {
      toast.error('Invalid attendance session');
      return;
    }

    // If location is required but not available, try to get it again
    if (qrData.teacherLocation && !studentLocation) {
      try {
        await getStudentLocation();
        // Continue with submission after getting location
      } catch (error) {
        toast.error('Location access required for attendance');
        return;
      }
    }

    // Verify location if teacher location is available in QR data
    if (qrData.teacherLocation && studentLocation) {
      const isWithinRadius = verifyLocation(
        qrData.teacherLocation,
        studentLocation,
        qrData.locationRadius || 200
      );

      if (!isWithinRadius) {
        toast.error('You are not within the allowed attendance area. Please move closer to the teacher.');
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
        studentLocation: studentLocation,
        teacherLocation: qrData.teacherLocation,
        distance: qrData.teacherLocation && studentLocation ? 
          calculateDistance(
            qrData.teacherLocation.latitude,
            qrData.teacherLocation.longitude,
            studentLocation.latitude,
            studentLocation.longitude
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
          toast.error('Failed to submit attendance. Please try again.');
        });

    } catch (error) {
      toast.error('Failed to submit attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if submit button should be enabled
  const isSubmitEnabled = () => {
    if (!qrData) return false;
    
    const fieldsFilled = formData.studentName.trim() && formData.rollNo.trim() && formData.uniqueCode.trim();
    
    // If location is required, check if we have it
    if (qrData.teacherLocation) {
      return fieldsFilled && studentLocation && !isGettingLocation;
    }
    
    // If no location required, just check fields
    return fieldsFilled;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-2xl mx-auto p-2">
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-sky-50 rounded-t-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Mark Your Attendance</h2>
                {qrData && (
                  <div className="mt-0.5 text-xs text-gray-600 space-y-1">
                    <p><span className="font-medium">Subject Name:</span> <span className='border-b border-gray-400'>{qrData.subjectName}</span></p>
                    {qrData.teacherLocation && (
                      <p className="text-green-600 font-medium">
                        ✓ Location-based attendance enabled
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Status */}
          {qrData?.teacherLocation && (
            <div className="px-6 pt-4">
              <div className={`p-3 rounded-lg border ${
                studentLocation 
                  ? 'bg-green-50 border-green-200' 
                  : locationError
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isGettingLocation ? (
                      <>
                        <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-sm text-gray-700">Getting your location...</span>
                      </>
                    ) : studentLocation ? (
                      <>
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-green-700">Location ready for verification</span>
                      </>
                    ) : locationError ? (
                      <>
                        <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <span className="text-sm text-red-700 block">{locationError}</span>
                          <button 
                            onClick={handleRetryLocation}
                            className="text-xs text-sky-600 hover:text-sky-800 mt-1 font-medium"
                          >
                            Retry Location Access
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm text-yellow-700">Requesting location access...</span>
                      </>
                    )}
                  </div>
                  
                  {locationError && (
                    <button 
                      onClick={handleRetryLocation}
                      className="text-xs bg-sky-600 text-white px-3 py-1 rounded hover:bg-sky-700 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
                
                {studentLocation && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p>Accuracy: ±{studentLocation.accuracy?.toFixed(1) || 'Unknown'} meters</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attendance Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={!isSubmitEnabled() || isSubmitting}
                className="flex-1 bg-sky-600 text-white py-3 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {qrData?.teacherLocation ? 'Verifying Location...' : 'Submitting...'}
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
              {qrData?.teacherLocation && (
                <>
                  <li>• <strong>Location access will be automatically requested</strong></li>
                  <li>• You must allow location access when prompted by your browser</li>
                  <li>• You must be within 200 meters of the teacher</li>
                </>
              )}
              <li>• Double-check your details before submitting</li>
              <li>• Your attendance time will be recorded automatically</li>
            </ul>
            
            {qrData?.teacherLocation && locationError && (
              <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                <p className="text-xs text-orange-700">
                  <strong>Location Help:</strong> If location access is blocked, check your browser permissions:
                </p>
                <ul className="text-xs text-orange-600 mt-1 ml-4 list-disc">
                  <li>Look for the location icon (📍) in your browser's address bar</li>
                  <li>Click it and select "Allow" for location access</li>
                  <li>Refresh the page after allowing permissions</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance_Page;