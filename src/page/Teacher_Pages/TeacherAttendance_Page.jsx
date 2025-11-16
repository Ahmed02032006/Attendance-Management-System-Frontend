import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'react-toastify'
import { FiSearch, FiChevronLeft, FiChevronRight, FiArrowUp, FiArrowDown, FiTrash2, FiMapPin } from 'react-icons/fi'
import {
  getSubjectsWithAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  clearAttendance
} from '../../store/Teacher-Slicer/Attendance-Slicer.js'

const TeacherAttendance_Page = () => {
  const dispatch = useDispatch()
  const {
    subjectsWithAttendance,
    isLoading
  } = useSelector((state) => state.teacherAttendance)

  const [selectedSubject, setSelectedSubject] = useState('');
  const [showSubjectModal, setShowSubjectModal] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceForm, setAttendanceForm] = useState({
    subject: '',
    uniqueCode: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(6);
  const [teacherLocation, setTeacherLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Sorting states
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc' // 'asc' or 'desc'
  });

  const { user } = useSelector((state) => state.auth)
  const userId = user?.id

  // Fetch subjects with attendance on component mount
  useEffect(() => {
    dispatch(getSubjectsWithAttendance(userId)).unwrap();
    // Cleanup on unmount
    return () => {
      dispatch(clearAttendance())
    }
  }, [dispatch])

  // Set initial selected subject when data is loaded
  useEffect(() => {
    if (subjectsWithAttendance.length > 0 && !selectedSubject) {
      setSelectedSubject(subjectsWithAttendance[0].id)
    }
  }, [subjectsWithAttendance, selectedSubject])

  // Get teacher's current location
  const getTeacherLocation = () => {
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
          setTeacherLocation(location);
          setIsGettingLocation(false);
          resolve(location);
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = 'Failed to get location: ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out';
              break;
            default:
              errorMessage += 'Unknown error occurred';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get today's date for max date restriction
  const getTodayDate = () => {
    return new Date();
  };

  // Check if a date is in the future
  const isFutureDate = (date) => {
    const today = getTodayDate();
    return date > today;
  };

  const currentDateString = formatDate(currentDate);

  // Get current attendance records from Redux state
  const getCurrentAttendanceRecords = () => {
    if (!selectedSubject) return [];
    const subject = subjectsWithAttendance.find(s => s.id === selectedSubject);
    return subject && subject.attendance ? subject.attendance[currentDateString] || [] : [];
  };

  const currentAttendanceRecords = getCurrentAttendanceRecords();

  // Extract numeric part from roll number for sorting
  const extractNumericFromRollNo = (rollNo) => {
    if (!rollNo) return 0;

    const parts = rollNo.split('-');
    if (parts.length >= 2) {
      const numericPart = parts[1];
      const numericValue = parseInt(numericPart, 10);
      return isNaN(numericValue) ? 0 : numericValue;
    }

    const numericMatches = rollNo.match(/\d+/g);
    if (numericMatches && numericMatches.length > 0) {
      return parseInt(numericMatches[0], 10);
    }

    return 0;
  };

  // Convert time string to sortable format
  const timeToSortableValue = (timeStr) => {
    if (!timeStr) return 0;

    try {
      let time = timeStr.trim().toUpperCase();

      if (time.includes('AM') || time.includes('PM')) {
        return new Date(`2000-01-01 ${time}`).getTime();
      } else {
        const [hours, minutes] = time.split(':').map(Number);
        return (hours * 60 + minutes) * 60000;
      }
    } catch (error) {
      return 0;
    }
  };

  // Sorting function
  const sortStudents = (students) => {
    if (!sortConfig.key) return students;

    return [...students].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'rollNo':
          aValue = extractNumericFromRollNo(a.rollNo);
          bValue = extractNumericFromRollNo(b.rollNo);
          break;
        case 'time':
          aValue = timeToSortableValue(a.time);
          bValue = timeToSortableValue(b.time);
          break;
        case 'studentName':
          aValue = a.studentName?.toLowerCase() || '';
          bValue = b.studentName?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Handle sort request
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FiArrowUp className="w-3 h-3 opacity-30" />;
    }
    return sortConfig.direction === 'asc' ?
      <FiArrowUp className="w-3 h-3" /> :
      <FiArrowDown className="w-3 h-3" />;
  };

  // Filter students based on search term
  const filteredStudents = sortStudents(
    currentAttendanceRecords.filter(student =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Export to Excel function
  const exportToExcel = () => {
    if (filteredStudents.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const headers = ['Student Name', 'Roll No', 'Time', 'Subject'];
      const csvContent = [
        headers.join(','),
        ...filteredStudents.map(student =>
          [
            `"${student.studentName}"`,
            `"${student.rollNo}"`,
            `"${student.time}"`,
            `"${student.subject}"`
          ].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const subjectName = subjectsWithAttendance.find(s => s.id === selectedSubject)?.name || 'attendance';
      const fileName = `attendance_${subjectName}_${currentDateString}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAttendanceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectSelect = (subjectId) => {
    setSelectedSubject(subjectId);
    setShowSubjectModal(false);
    setAttendanceForm(prev => ({ ...prev, subject: subjectId }));
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  const handleGenerateQR = async () => {
    if (!attendanceForm.subject || !attendanceForm.uniqueCode) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      // Get teacher's location before generating QR
      const location = await getTeacherLocation();
      // toast.success('Location captured successfully!');

      setShowCreateModal(false);
      setShowQRModal(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle delete attendance
  const handleDeleteClick = (attendanceId) => {
    setAttendanceToDelete(attendanceId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (attendanceToDelete) {
      dispatch(deleteAttendance(attendanceToDelete)).unwrap();
      toast.success(`Attendance record deleted successfully`);
    }
    setShowDeleteModal(false);
    setAttendanceToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAttendanceToDelete(null);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
      if (isFutureDate(newDate)) {
        toast.error('Cannot select future dates');
        return;
      }
    }
    setCurrentDate(newDate);
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Date picker handler
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (isFutureDate(newDate)) {
      toast.error('Cannot select future dates');
      return;
    }
    setCurrentDate(newDate);
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  // Generate QR code data with location
  const generateQRData = () => {
    const subjectName = subjectsWithAttendance.find(s => s.id === attendanceForm.subject)?.name;
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const currentDate = new Date().toISOString().split('T')[0];

    return JSON.stringify({
      type: 'attendance',
      subject: attendanceForm.subject,
      code: attendanceForm.uniqueCode,
      subjectName: subjectName,
      timestamp: new Date().toISOString(),
      attendanceTime: currentTime,
      attendanceDate: currentDate,
      teacherLocation: teacherLocation, // Include teacher's location in QR data
      locationRadius: 200, // 200 meters radius
      redirectUrl: `${window.location.origin}/student-attendance`
    });
  };

  const qrData = generateQRData();

  // Handle student name click
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  // Reset search and pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Helper functions for student attendance data
  const getStudentPreviousAttendance = (student) => {
    if (!student || !selectedSubject) return [];

    const subject = subjectsWithAttendance.find(s => s.id === selectedSubject);
    if (!subject || !subject.attendance) return [];

    const allAttendance = [];

    Object.entries(subject.attendance).forEach(([date, records]) => {
      const studentRecord = records.find(record =>
        record.rollNo === student.rollNo && record.studentName === student.studentName
      );

      if (studentRecord) {
        allAttendance.push({
          ...studentRecord,
          date: date
        });
      }
    });

    return allAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getTotalAttendanceDays = (student) => {
    const attendance = getStudentPreviousAttendance(student);
    return attendance.length;
  };

  const getPresentDays = (student) => {
    const attendance = getStudentPreviousAttendance(student);
    return attendance.filter(record => record.time).length;
  };

  const getAbsentDays = (student) => {
    const attendance = getStudentPreviousAttendance(student);
    return attendance.filter(record => !record.time).length;
  };

  const getAttendancePercentage = (student) => {
    const total = getTotalAttendanceDays(student);
    const present = getPresentDays(student);

    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  };

  const handleRefresh = async () => {
    try {
      await dispatch(getSubjectsWithAttendance(userId)).unwrap();
      toast.success('Attendance data refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Attendance Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent heading={"Teacher Attendance"} subHeading={"View and manage teacher attendance"} role='' />

      <div className="container max-w-full p-6">
        {/* Date Navigation - Centered */}
        {selectedSubject && (
          <div className="flex justify-center items-center mb-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-white rounded-lg border border-gray-200 px-6 py-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-center flex flex-col items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {formatDisplayDate(currentDate)}
                </h2>
                <p className="text-xs text-gray-600">
                  {subjectsWithAttendance.find(s => s.id === selectedSubject)?.name}
                </p>
              </div>

              <button
                onClick={() => navigateDate('next')}
                disabled={isFutureDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
                className={`p-3 rounded-full transition-colors ${isFutureDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Attendance Table Section */}
        {selectedSubject && (
          <div className="space-y-6">
            {/* Search and Date Picker */}
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search students..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Date Picker Input */}
                <input
                  type="date"
                  value={formatDate(currentDate)}
                  onChange={handleDateChange}
                  max={formatDate(getTodayDate())}
                  className="px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                />

                {/* Export to Excel Button */}
                <button
                  onClick={exportToExcel}
                  disabled={filteredStudents.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export Excel</span>
                </button>

                {/* Refresh Button */}
                <button
                  onClick={() => handleRefresh()}
                  disabled={isLoading}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  title="Refresh attendance data"
                >
                  <svg
                    className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('studentName')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Student Name</span>
                          {getSortIcon('studentName')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('rollNo')}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Roll No.</span>
                          {getSortIcon('rollNo')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('time')}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>Time</span>
                          {getSortIcon('time')}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentStudents.length > 0 ? (
                      currentStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3.5 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                onClick={() => handleStudentClick(student)}
                                className="text-sm font-medium text-gray-600 hover:text-sky-600 transition-colors cursor-pointer text-left"
                              >
                                {student.studentName}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                            {student.rollNo}
                          </td>
                          <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                            {student.time}
                          </td>
                          <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                            {student.subject}
                          </td>
                          <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleDeleteClick(student.id)}
                                className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                                title="Delete attendance record"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          {searchTerm ? "No matching students found" : "No attendance records found for " + formatDisplayDate(currentDate)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length > 0 && (
                <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
                  <div className="mb-3 sm:mb-0">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastStudent, filteredStudents.length)}</span> of{' '}
                      <span className="font-medium">{filteredStudents.length}</span> students
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                      <FiChevronLeft className="h-4 w-4 mr-1" />
                    </button>

                    {totalPages <= 6 ? (
                      Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-3.5 py-1.5 border text-sm font-medium ${currentPage === number
                            ? 'border-sky-600 bg-sky-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            } rounded-md transition-colors`}
                        >
                          {number}
                        </button>
                      ))
                    ) : (
                      <>
                        {currentPage > 3 && (
                          <button
                            onClick={() => paginate(1)}
                            className="px-3.5 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
                          >
                            1
                          </button>
                        )}
                        {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                        {[
                          currentPage - 2,
                          currentPage - 1,
                          currentPage,
                          currentPage + 1,
                          currentPage + 2
                        ]
                          .filter(num => num > 0 && num <= totalPages)
                          .map(number => (
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`px-3.5 py-1.5 border text-sm font-medium ${currentPage === number
                                ? 'border-sky-600 bg-sky-600 text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                } rounded-md transition-colors`}
                            >
                              {number}
                            </button>
                          ))}
                        {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                        {currentPage < totalPages - 2 && (
                          <button
                            onClick={() => paginate(totalPages)}
                            className="px-3.5 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
                          >
                            {totalPages}
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                      <FiChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create New Attendance Button - Bottom Right */}
        {selectedSubject && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-3 rounded-sm shadow-lg transition-all duration-200 flex items-center space-x-3 hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Create New Attendance</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        )}

        {/* No Subject Selected State */}
        {!selectedSubject && !showSubjectModal && subjectsWithAttendance.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Subject Selected</h3>
            <p className="text-gray-600 mb-4">Please select a subject to view attendance records</p>
            <button
              onClick={() => setShowSubjectModal(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Select Subject
            </button>
          </div>
        )}

        {/* No Data State */}
        {subjectsWithAttendance.length === 0 && !isLoading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Subjects Found</h3>
            <p className="text-gray-600 mb-4">You don't have any subjects with attendance data yet</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>

      {/* Subject Selection Modal */}
      {
        showSubjectModal && subjectsWithAttendance.length > 0 && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Select Subject</h3>
                <p className="text-sm text-gray-600 mt-1">Choose a subject to view attendance records</p>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  {subjectsWithAttendance.map((subject) => (
                    <div
                      key={subject.id}
                      className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-sky-500 hover:bg-sky-50 cursor-pointer transition-all duration-200 text-center"
                      onClick={() => handleSubjectSelect(subject.id)}
                    >
                      <h4 className="font-light text-sm text-gray-700">
                        {subject.name}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <p className="text-sm text-gray-600 text-center">
                  Select a subject to continue to the attendance dashboard
                </p>
              </div>
            </div>
          </div>
        )
      }

      {/* Create Attendance Modal */}
      {
        showCreateModal && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Create New Attendance</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Subject
                  </label>
                  <select
                    name="subject"
                    value={attendanceForm.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">Select Subject</option>
                    {subjectsWithAttendance.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unique Code
                  </label>
                  <input
                    type="text"
                    name="uniqueCode"
                    value={attendanceForm.uniqueCode}
                    onChange={handleInputChange}
                    placeholder="Enter unique code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Location Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <FiMapPin className="text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Location Verification
                      </p>
                      <p className="text-xs text-blue-600">
                        {teacherLocation
                          ? `Location captured: ${teacherLocation.latitude.toFixed(6)}, ${teacherLocation.longitude.toFixed(6)}`
                          : 'Your location will be captured when generating QR code'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateQR}
                  disabled={isLoading || isGettingLocation}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isGettingLocation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Getting Location...</span>
                    </>
                  ) : isLoading ? (
                    'Creating...'
                  ) : (
                    'Generate QR'
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* QR Code Modal */}
      {
        showQRModal && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Attendance QR Code</h3>
              </div>
              <div className="p-6 flex flex-col items-center">
                <div className="w-64 h-64 bg-white flex items-center justify-center rounded-lg mb-4 border-2 border-gray-200 p-2" id="qr-code-container">
                  <QRCodeSVG
                    value={qrData}
                    size={250}
                    level="L"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    id="qr-code-svg"
                    minVersion={1}
                  />
                </div>

                {teacherLocation && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3 w-full">
                  <div className="flex items-center space-x-2">
                    <FiMapPin className="text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Location Captured Successfully</p>
                      <p className="text-xs text-green-600">
                        Students must be nearby to mark attendance
                      </p>
                    </div>
                  </div>
                </div>
              )}

                <p className="text-sm text-gray-600 text-center">
                  Students can scan this QR code to mark their attendance
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-gray-200">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Record?</h3>
                <p className="text-gray-600 text-sm mb-6">
                  This attendance record will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Student Details Modal */}
      {
        showStudentModal && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedStudent?.studentName} - Attendance Details
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Roll No: {selectedStudent?.rollNo}
                </p>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {selectedStudent && (
                  <div className="space-y-6">
                    {/* Student Basic Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Student Name</p>
                          <p className="text-gray-900">{selectedStudent.studentName}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Roll Number</p>
                          <p className="text-gray-900">{selectedStudent.rollNo}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Current Subject</p>
                          <p className="text-gray-900">{selectedStudent.subject}</p>
                        </div>
                      </div>
                    </div>

                    {/* Previous Attendance Records */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Previous Attendance Records</h4>

                      {getStudentPreviousAttendance(selectedStudent).length > 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Day
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subject
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {getStudentPreviousAttendance(selectedStudent).map((record, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                      {formatDisplayDate(new Date(record.date))}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
                                      {record.time || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
                                      {record.subject}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.time ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {record.time ? 'Present' : 'Absent'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">No previous attendance records found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  )
}

export default TeacherAttendance_Page