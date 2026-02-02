import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'react-toastify'
import { FiSearch, FiChevronLeft, FiChevronRight, FiArrowUp, FiArrowDown, FiTrash2, FiMaximize2, FiMinimize2 } from 'react-icons/fi'
import { getSubjectsWithAttendance, deleteAttendance, clearAttendance } from '../../store/Teacher-Slicer/Attendance-Slicer.js'

const TeacherAttendance_Page = () => {
  const dispatch = useDispatch()
  const { subjectsWithAttendance, isLoading } = useSelector((state) => state.teacherAttendance)

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
    direction: 'asc' // 'asc' or 'desc'
  });

  const { user } = useSelector((state) => state.auth)
  const userId = user?.id

  // ========== FILTER ACTIVE SUBJECTS ONLY ==========
  // Filter out inactive subjects
  const activeSubjects = subjectsWithAttendance.filter(subject => 
    subject.status === 'Active' || subject.isActive === true || 
    // If your backend uses a different field name, adjust accordingly
    // For example: subject.active === true
    (!subject.hasOwnProperty('status') && !subject.hasOwnProperty('isActive'))
  );

  // Fetch subjects with attendance on component mount
  useEffect(() => {
    dispatch(getSubjectsWithAttendance(userId)).unwrap();

    // Cleanup on unmount
    return () => {
      dispatch(clearAttendance())
    }
  }, [dispatch])

  // Set initial selected subject when data is loaded - UPDATED
  useEffect(() => {
    if (activeSubjects.length > 0 && !selectedSubject) {
      setSelectedSubject(activeSubjects[0].id)
    } else if (activeSubjects.length === 0 && selectedSubject) {
      // If currently selected subject becomes inactive, clear selection
      const currentSubject = subjectsWithAttendance.find(s => s.id === selectedSubject);
      if (currentSubject && (currentSubject.status === 'Inactive' || currentSubject.isActive === false)) {
        setSelectedSubject('');
        toast.info('The selected subject has been marked as inactive');
      }
    }
  }, [activeSubjects, selectedSubject, subjectsWithAttendance])

  // Check if selected subject is still active
  useEffect(() => {
    if (selectedSubject) {
      const currentSubject = activeSubjects.find(s => s.id === selectedSubject);
      if (!currentSubject) {
        // Selected subject is no longer in active subjects
        setSelectedSubject('');
        setShowSubjectModal(true);
        toast.warning('The selected subject is now inactive. Please select another subject.');
      }
    }
  }, [selectedSubject, activeSubjects]);

  // QR Auto-refresh useEffect
  useEffect(() => {
    if (showQRModal) {
      // Generate first QR immediately
      handleQRGeneration();

      // Set interval to refresh QR every 1 minute 60 seconds
      const interval = setInterval(() => {
        handleQRGeneration();
      }, 80000);

      setQrRefreshInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      // Clear interval when modal closes
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

  // Get current attendance records from Redux state - UPDATED
  const getCurrentAttendanceRecords = () => {
    if (!selectedSubject) return [];

    const subject = activeSubjects.find(s => s.id === selectedSubject);
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
      return <FiArrowUp className="inline-block ml-1 w-3 h-3 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? <FiArrowUp className="inline-block ml-1 w-3 h-3" /> : <FiArrowDown className="inline-block ml-1 w-3 h-3" />;
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
        ...filteredStudents.map(student => [
          `"${student.studentName}"`,
          `"${student.rollNo}"`,
          `"${student.time}"`,
          `"${student.subject}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const subjectName = activeSubjects.find(s => s.id === selectedSubject)?.name || 'attendance';
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
    setAttendanceForm(prev => ({
      ...prev,
      subject: subjectId
    }));
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  // New function to generate QR with timestamp
  // Silent refresh version
  const handleQRGeneration = (isInitial = false) => {
    if (!attendanceForm.subject || !attendanceForm.uniqueCode) {
      toast.error('Please fill all fields');
      return;
    }

    const subjectName = activeSubjects.find(s => s.id === attendanceForm.subject)?.name;
    const currentTime = new Date();
    const expiryTime = new Date(currentTime.getTime() + 80000); // 1 minute 60 seconds from now

    // Generate a dynamic code with timestamp
    const dynamicCode = `${attendanceForm.uniqueCode}_${currentTime.getTime()}`;

    // Extract the original code (before underscore) for the URL
    const originalCode = attendanceForm.uniqueCode;

    // Create a simplified URL with query parameters instead of JSON
    // This makes the QR code much less dense and easier to scan
    const baseUrl = `${window.location.origin}/student-attendance`;

    // Create URL with only essential parameters
    const url = new URL(baseUrl);
    url.searchParams.append('code', originalCode); // Use original code, not the timestamped one
    url.searchParams.append('subject', attendanceForm.subject);
    url.searchParams.append('subjectName', subjectName || 'Unknown Subject');
    url.searchParams.append('timestamp', currentTime.getTime()); // For uniqueness
    url.searchParams.append('expiry', expiryTime.getTime()); // For expiry check

    // Use the URL string as QR data - much simpler than JSON
    const qrData = url.toString();

    // Store the full data separately for internal use if needed
    const fullQrData = {
      url: qrData,
      originalCode: originalCode,
      subject: attendanceForm.subject,
      subjectName: subjectName,
      timestamp: currentTime.getTime(),
      expiry: expiryTime.getTime()
    };

    setCurrentQrCode(qrData);
    setQrExpiryTime(expiryTime);

    if (isInitial) {
      toast.success('QR code generated successfully!', { autoClose: 2000 });
    }

    console.log('QR Data length:', qrData.length, 'characters'); // Debug log
  };

  const handleGenerateQR = async () => {
    if (!attendanceForm.subject || !attendanceForm.uniqueCode) {
      toast.error('Please fill all fields');
      return;
    }

    setShowCreateModal(false);
    setShowQRModal(true);

    // Show success message when modal opens
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

  // Helper functions for student attendance data - UPDATED
  const getStudentPreviousAttendance = (student) => {
    if (!student || !selectedSubject) return [];

    const subject = activeSubjects.find(s => s.id === selectedSubject);
    if (!subject || !subject.attendance) return [];

    const allAttendance = [];
    Object.entries(subject.attendance).forEach(([date, records]) => {
      const studentRecord = records.find(record =>
        record.rollNo === student.rollNo &&
        record.studentName === student.studentName
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
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Attendance Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Date Navigation - Centered */}
        {selectedSubject && (
          <div className="flex items-center justify-center mb-8 gap-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FiChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {formatDisplayDate(currentDate)}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {activeSubjects.find(s => s.id === selectedSubject)?.name}
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
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Attendance Table Section */}
        {selectedSubject && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Search and Date Picker */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex-1 min-w-[200px] relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Date Picker Input */}
              <input
                type="date"
                value={currentDateString}
                max={formatDate(getTodayDate())}
                onChange={handleDateChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />

              {/* Export to Excel Button */}
              <button
                onClick={exportToExcel}
                disabled={filteredStudents.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export Excel
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => handleRefresh()}
                disabled={isLoading}
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                title="Refresh attendance data"
              >
                <span>Refresh</span>
              </button>

              {/* Create New Attendance Button - Moved here */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-sky-800 hover:bg-sky-900 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
              >
                <span>Create Attendance</span>
              </button>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('studentName')}
                    >
                      <div className="flex items-center">
                        Student Name {getSortIcon('studentName')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('rollNo')}
                    >
                      <div className="flex items-center">
                        Roll No. {getSortIcon('rollNo')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('time')}
                    >
                      <div className="flex items-center">
                        Time {getSortIcon('time')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentStudents.length > 0 ? (
                    currentStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleStudentClick(student)}
                            className="text-sm font-medium text-gray-600 hover:text-sky-600 transition-colors cursor-pointer text-left"
                          >
                            {student.studentName}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.rollNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteClick(student.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                            title="Delete attendance record"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? "No matching students found" : "No attendance records found for " + formatDisplayDate(currentDate)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredStudents.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstStudent + 1} to{' '}
                  {Math.min(indexOfLastStudent, filteredStudents.length)} of{' '}
                  {filteredStudents.length} students
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                  >
                    Previous
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
                    className="px-3 py-1.5 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Subject Selected State */}
        {!selectedSubject && !showSubjectModal && activeSubjects.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Subject Selected</h3>
              <p className="text-gray-600 mb-6">
                Please select a subject to view attendance records
              </p>
              <button
                onClick={() => setShowSubjectModal(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Select Subject
              </button>
            </div>
          </div>
        )}

        {/* No Data State - UPDATED */}
        {activeSubjects.length === 0 && !isLoading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Active Subjects Found</h3>
              <p className="text-gray-600 mb-6">
                You don't have any active subjects with attendance data. Please activate a subject or contact your administrator.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subject Selection Modal - UPDATED */}
      {showSubjectModal && activeSubjects.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Select Subject</h3>
              <p className="text-gray-600 mb-6">Choose a subject to view attendance records</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-sky-500 transition-colors cursor-pointer"
                    onClick={() => handleSubjectSelect(subject.id)}
                  >
                    <h4 className="font-semibold text-gray-800 text-lg">
                      {subject.name}
                    </h4>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-6 text-center">
                Select a subject to continue to the attendance dashboard
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Attendance Modal - UPDATED */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Create New Attendance</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Subject
                  </label>
                  <select
                    name="subject"
                    value={attendanceForm.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Select Subject</option>
                    {activeSubjects.map((subject) => (
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateQR}
                  disabled={!attendanceForm.subject || !attendanceForm.uniqueCode || isLoading}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Generate QR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal - UPDATED WITH ZOOM FEATURE */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-lg transition-all duration-300 ${isQrZoomed ? 'max-w-4xl' : 'max-w-md'} w-full`}>
            <div className="p-6">
              {/* Live */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Attendance QR Code</h3>

                {/* Zoom Toggle Button */}
                <button
                  onClick={toggleQrZoom}
                  className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                  title={isQrZoomed ? "Minimize QR" : "Maximize QR"}
                >
                  {isQrZoomed ? (
                    <FiMinimize2 className="w-5 h-5 text-gray-700" />
                  ) : (
                    <FiMaximize2 className="w-5 h-5 text-gray-700" />
                  )}
                </button>
              </div>

              <div className={`flex justify-center mb-6 transition-all duration-300 ${isQrZoomed ? 'p-8' : 'p-4'}`}>
                {currentQrCode && (
                  <QRCodeSVG
                    value={currentQrCode}
                    size={isQrZoomed ? 400 : 256}
                    level="M"
                    includeMargin={true}
                  />
                )}
              </div>

              <p className="text-center text-gray-600 mb-4">
                Students can scan this QR code to mark their attendance
              </p>

              {/*
              <p className="text-xs text-center text-gray-500 mb-4">
                {isQrZoomed ? "Click minimize icon to reduce size" : "Click maximize icon to enlarge"}
              </p>
              */}

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setIsQrZoomed(false); // Reset zoom state when closing
                    if (qrRefreshInterval) {
                      clearInterval(qrRefreshInterval);
                      setQrRefreshInterval(null);
                    }
                  }}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Record?</h3>
            <p className="text-gray-600 mb-6">
              This attendance record will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {selectedStudent?.studentName} - Attendance Details
              </h3>

              <p className="text-gray-600 mb-6">
                Roll No: {selectedStudent?.rollNo}
              </p>

              {selectedStudent && (
                <div className="space-y-6">
                  {/* Student Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Student Name</p>
                      <p className="font-semibold text-gray-800">{selectedStudent.studentName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Roll Number</p>
                      <p className="font-semibold text-gray-800">{selectedStudent.rollNo}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Current Subject</p>
                      <p className="font-semibold text-gray-800">{selectedStudent.subject}</p>
                    </div>
                  </div>

                  {/* Previous Attendance Records */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Previous Attendance Records
                    </h4>

                    {getStudentPreviousAttendance(selectedStudent).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Day
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subject
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getStudentPreviousAttendance(selectedStudent).map((record, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {formatDisplayDate(new Date(record.date))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {record.time || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {record.subject}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.time ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {record.time ? 'Present' : 'Absent'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No previous attendance records found
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherAttendance_Page