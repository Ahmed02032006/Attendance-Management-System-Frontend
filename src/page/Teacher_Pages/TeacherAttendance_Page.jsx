import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'react-toastify'
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUp,
  FiArrowDown,
  FiTrash2,
  FiMaximize2,
  FiMinimize2,
  FiGrid,
  FiClock,
  FiUser,
  FiRefreshCw
} from 'react-icons/fi'
import {
  getSubjectsWithAttendance,
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

  // QR Auto-refresh states
  const [qrExpiryTime, setQrExpiryTime] = useState(null);
  const [qrRefreshInterval, setQrRefreshInterval] = useState(null);
  const [currentQrCode, setCurrentQrCode] = useState('');

  // QR Zoom state
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  // Sorting states
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const { user } = useSelector((state) => state.auth)
  const userId = user?.id

  // Fetch subjects with attendance on component mount
  useEffect(() => {
    dispatch(getSubjectsWithAttendance(userId)).unwrap();
    return () => dispatch(clearAttendance())
  }, [dispatch])

  // Set initial selected subject when data is loaded
  useEffect(() => {
    if (subjectsWithAttendance.length > 0 && !selectedSubject) {
      setSelectedSubject(subjectsWithAttendance[0].id)
    }
  }, [subjectsWithAttendance, selectedSubject])

  // QR Auto-refresh useEffect
  useEffect(() => {
    if (showQRModal) {
      handleQRGeneration();
      const interval = setInterval(() => handleQRGeneration(), 80000);
      setQrRefreshInterval(interval);
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (qrRefreshInterval) {
        clearInterval(qrRefreshInterval);
        setQrRefreshInterval(null);
      }
    }
  }, [showQRModal]);

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
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
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

  // Function to generate random code
  const generateRandomCode = () => {
    // Generate a 6-digit random number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setAttendanceForm(prev => ({ ...prev, uniqueCode: randomNum.toString() }));
  };

  // Function to generate QR
  const handleQRGeneration = (isInitial = false) => {
    if (!attendanceForm.subject || !attendanceForm.uniqueCode) {
      toast.error('Please fill all fields');
      return;
    }

    const subjectName = subjectsWithAttendance.find(s => s.id === attendanceForm.subject)?.name;
    const currentTime = new Date();
    const expiryTime = new Date(currentTime.getTime() + 80000);

    const originalCode = attendanceForm.uniqueCode;
    const baseUrl = `${window.location.origin}/student-attendance`;
    const url = new URL(baseUrl);
    url.searchParams.append('code', originalCode);
    url.searchParams.append('subject', attendanceForm.subject);
    url.searchParams.append('subjectName', subjectName || 'Unknown Subject');
    url.searchParams.append('timestamp', currentTime.getTime());
    url.searchParams.append('expiry', expiryTime.getTime());

    setCurrentQrCode(url.toString());
    setQrExpiryTime(expiryTime);

    if (isInitial) {
      toast.success('QR code generated successfully!', { autoClose: 2000 });
    }
  };

  const handleGenerateQR = async () => {
    if (!attendanceForm.subject || !attendanceForm.uniqueCode) {
      toast.error('Please fill all fields');
      return;
    }

    setShowCreateModal(false);
    setShowQRModal(true);
    toast.success('QR code generated successfully!', { autoClose: 2000 });
  };

  // Toggle QR zoom
  const toggleQrZoom = () => {
    setIsQrZoomed(!isQrZoomed);
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

  const handleRefresh = async () => {
    try {
      await dispatch(getSubjectsWithAttendance(userId)).unwrap();
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Attendance Data...</p>
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

                {/* Create New Attendance Button */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Attendance</span>
                </button>
              </div>
            </div>

            {/* Attendance Table - UPDATED DESIGN */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('studentName')}
                      >
                        <div className="flex items-center space-x-1">
                          <FiUser className="w-3 h-3" />
                          <span>Student Name</span>
                          {getSortIcon('studentName')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('rollNo')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Roll No.</span>
                          {getSortIcon('rollNo')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('time')}
                      >
                        <div className="flex items-center space-x-1">
                          <FiClock className="w-3 h-3" />
                          <span>Time</span>
                          {getSortIcon('time')}
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentStudents.length > 0 ? (
                      currentStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => handleStudentClick(student)}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {student.studentName}
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{student.rollNo}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                              <FiClock className="w-3 h-3 mr-1" />
                              {student.time}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Present
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleDeleteClick(student.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete record"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                          {searchTerm ? "No matching students found" : "No attendance records for this date"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredStudents.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Showing {indexOfFirstStudent + 1}-{Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="p-1.5 border border-gray-300 rounded-md text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40"
                    >
                      <FiChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="p-1.5 border border-gray-300 rounded-md text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40"
                    >
                      <FiChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center mx-auto space-x-2"
            >
              <FiGrid className="w-4 h-4" />
              <span>Select Subject</span>
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>

      {/* Subject Selection Modal - Enhanced Design */}
      {showSubjectModal && subjectsWithAttendance.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl mx-auto shadow-2xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Select Subject</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose a subject to view its attendance records
                  </p>
                </div>
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Subject Grid */}
            <div className="p-6 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {subjectsWithAttendance.map((subject) => {
                  // Calculate attendance stats for this subject
                  const totalDays = Object.keys(subject.attendance || {}).length;
                  const totalRecords = Object.values(subject.attendance || {}).reduce(
                    (sum, day) => sum + day.length, 0
                  );

                  return (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectSelect(subject.id)}
                      className="group relative p-5 rounded-xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left"
                    >
                      {/* Subject Icon/Initial */}
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                        <span className="text-white font-semibold text-lg">
                          {subject.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Subject Name */}
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
                        {subject.name}
                      </h4>

                      {/* Stats */}
                      <div className="space-y-1.5">
                        <div className="flex items-center text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{totalDays} attendance days</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>{totalRecords} total records</span>
                        </div>
                      </div>

                      {/* Hover indicator */}
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 rounded-b-xl scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    </button>
                  );
                })}
              </div>

              {/* Load More Indicator (if needed) */}
              {subjectsWithAttendance.length > 12 && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500 bg-gray-50 py-3 px-4 rounded-lg inline-block">
                    Showing all {subjectsWithAttendance.length} subjects
                  </p>
                </div>
              )}
            </div>

            {/* Footer with Quick Stats */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-gray-600">
                      <span className="font-semibold text-gray-900">{subjectsWithAttendance.length}</span> total subjects
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-gray-600">
                      Click any subject to continue
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Attendance Modal - WITH GENERATE CODE BUTTON */}
      {showCreateModal && (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="uniqueCode"
                    value={attendanceForm.uniqueCode}
                    onChange={handleInputChange}
                    placeholder="Enter unique code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium transition-colors whitespace-nowrap text-sm"
                  >
                    Generate Code
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click generate to create a random 6-digit code
                </p>
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
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Generate QR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`bg-white rounded-lg shadow-xl ${isQrZoomed ? 'w-full max-w-2xl' : 'w-full max-w-sm'}`}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className='flex items-center justify-between gap-3'>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Attendance QR Code</h3>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleQrZoom}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title={isQrZoomed ? "Minimize QR Code" : "Maximize QR Code"}
                >
                  {isQrZoomed ? (
                    <FiMinimize2 className="w-4 h-4 text-gray-700" />
                  ) : (
                    <FiMaximize2 className="w-4 h-4 text-gray-700" />
                  )}
                </button>
              </div>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div
                className={`${isQrZoomed ? 'w-96 h-96' : 'w-64 h-64'} bg-white flex items-center justify-center rounded-lg mb-4 border-2 border-gray-200 p-2 transition-all duration-300`}
                id="qr-code-container"
              >
                {currentQrCode && (
                  <QRCodeSVG
                    value={currentQrCode}
                    size={isQrZoomed ? 400 : 250}
                    level="L"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    id="qr-code-svg"
                    minVersion={1}
                  />
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Students can scan this QR code to mark their attendance
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setIsQrZoomed(false);
                  if (qrRefreshInterval) {
                    clearInterval(qrRefreshInterval);
                    setQrRefreshInterval(null);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
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
      )}

      {/* Student Details Modal */}
      {showStudentModal && (
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherAttendance_Page