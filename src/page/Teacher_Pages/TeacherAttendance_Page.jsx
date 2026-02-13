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
  FiCalendar,
  FiClock,
  FiDownload,
  FiRefreshCw,
  FiPlus,
  FiX,
  FiUser,
  FiBook
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

  // QR states
  const [qrExpiryTime, setQrExpiryTime] = useState(null);
  const [qrRefreshInterval, setQrRefreshInterval] = useState(null);
  const [currentQrCode, setCurrentQrCode] = useState('');
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  // Sorting states
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const { user } = useSelector((state) => state.auth)
  const userId = user?.id

  // Fetch data
  useEffect(() => {
    dispatch(getSubjectsWithAttendance(userId)).unwrap();
    return () => dispatch(clearAttendance())
  }, [dispatch])

  // Set initial subject
  useEffect(() => {
    if (subjectsWithAttendance.length > 0 && !selectedSubject) {
      setSelectedSubject(subjectsWithAttendance[0].id)
    }
  }, [subjectsWithAttendance, selectedSubject])

  // QR Auto-refresh
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

  // Format date
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getTodayDate = () => new Date();

  const isFutureDate = (date) => date > getTodayDate();

  const currentDateString = formatDate(currentDate);

  // Get attendance records
  const getCurrentAttendanceRecords = () => {
    if (!selectedSubject) return [];
    const subject = subjectsWithAttendance.find(s => s.id === selectedSubject);
    return subject && subject.attendance ? subject.attendance[currentDateString] || [] : [];
  };

  const currentAttendanceRecords = getCurrentAttendanceRecords();

  // Sorting helpers
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

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FiArrowUp className="w-3 h-3 text-gray-300" />;
    }
    return sortConfig.direction === 'asc' 
      ? <FiArrowUp className="w-3 h-3 text-blue-600" />
      : <FiArrowDown className="w-3 h-3 text-blue-600" />;
  };

  // Filter students
  const filteredStudents = sortStudents(
    currentAttendanceRecords.filter(student =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Export to CSV
  const exportToCSV = () => {
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
      
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_${subjectName}_${currentDateString}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAttendanceForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectSelect = (subjectId) => {
    setSelectedSubject(subjectId);
    setShowSubjectModal(false);
    setAttendanceForm(prev => ({ ...prev, subject: subjectId }));
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  // QR Generation
  const handleQRGeneration = () => {
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
  };

  const handleGenerateQR = () => {
    if (!attendanceForm.subject || !attendanceForm.uniqueCode) {
      toast.error('Please fill all fields');
      return;
    }
    setShowCreateModal(false);
    setShowQRModal(true);
    toast.success('QR code generated successfully!', { autoClose: 2000 });
  };

  // Delete handlers
  const handleDeleteClick = (attendanceId) => {
    setAttendanceToDelete(attendanceId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (attendanceToDelete) {
      dispatch(deleteAttendance(attendanceToDelete)).unwrap();
      toast.success('Attendance record deleted successfully');
    }
    setShowDeleteModal(false);
    setAttendanceToDelete(null);
  };

  // Date navigation
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
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Student details helpers
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
        allAttendance.push({ ...studentRecord, date });
      }
    });
    return allAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleRefresh = () => {
    dispatch(getSubjectsWithAttendance(userId)).unwrap();
  };

  // Reset search on change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Get status color (matching subjects page)
  const getStatusColor = (time) => {
    return time ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent 
        heading="Attendance Management" 
        subHeading="Track and manage student attendance" 
        role="admin" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Quick Stats - Matching subjects page */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Subjects</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{subjectsWithAttendance.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FiBook className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Students</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{currentAttendanceRecords.length}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FiUser className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {currentAttendanceRecords.length > 0 ? '100%' : '0%'}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <FiClock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {subjectsWithAttendance.reduce((acc, s) => 
                    acc + Object.values(s.attendance || {}).reduce((sum, d) => sum + d.length, 0), 0
                  )}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <FiCalendar className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Date Navigation - Centered */}
        {selectedSubject && (
          <div className="flex justify-center items-center mb-6">
            <div className="flex items-center space-x-4 bg-white rounded-lg border border-gray-200 px-4 py-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-center min-w-[200px]">
                <div className="flex items-center justify-center space-x-2">
                  <FiCalendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatDisplayDate(currentDate)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {subjectsWithAttendance.find(s => s.id === selectedSubject)?.name}
                </p>
              </div>

              <button
                onClick={() => navigateDate('next')}
                disabled={isFutureDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
                className={`p-2 rounded-md transition-colors ${
                  isFutureDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Search and Actions Bar - Matching subjects page */}
        {selectedSubject && (
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students..."
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={formatDate(currentDate)}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isFutureDate(newDate)) {
                    setCurrentDate(newDate);
                    setCurrentPage(1);
                  } else {
                    toast.error('Cannot select future dates');
                  }
                }}
                max={formatDate(getTodayDate())}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <button
                onClick={exportToCSV}
                disabled={filteredStudents.length === 0}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Export to CSV"
              >
                <FiDownload className="h-5 w-5" />
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Refresh data"
              >
                <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              >
                <FiPlus className="h-4 w-4 mr-1.5" />
                New Attendance
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {selectedSubject ? (
          <div className="space-y-4">
            {/* Attendance Table - Matching subjects page exactly */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('studentName')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Student Name</span>
                          {getSortIcon('studentName')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('rollNo')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Roll No.</span>
                          {getSortIcon('rollNo')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('time')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Time</span>
                          {getSortIcon('time')}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentStudents.length > 0 ? (
                      currentStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentModal(true);
                              }}
                              className="text-sm text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {student.studentName}
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-600 font-mono">
                              {student.rollNo}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.time)}`}>
                              <FiClock className="h-3 w-3 mr-1" />
                              {student.time}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {student.subject}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleDeleteClick(student.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete record"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                          {searchTerm ? 'No matching students found' : 'No attendance records for this date'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Matching subjects page exactly */}
              {filteredStudents.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Showing {indexOfFirstStudent + 1}-{Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="p-1.5 border border-gray-300 rounded-md text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="p-1.5 border border-gray-300 rounded-md text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FiChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* No Subject Selected - Matching subjects page style */
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiGrid className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Subject Selected</h3>
            <p className="text-sm text-gray-500 mb-4">Choose a subject to view attendance records</p>
            <button
              onClick={() => setShowSubjectModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiGrid className="h-4 w-4 mr-2" />
              Select Subject
            </button>
          </div>
        )}

        {/* No Data State - Matching subjects page style */}
        {subjectsWithAttendance.length === 0 && !isLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBook className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Found</h3>
            <p className="text-sm text-gray-500 mb-4">You don't have any subjects with attendance data yet</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        )}
      </div>

      {/* Subject Selection Modal - Matching subjects page style */}
      {showSubjectModal && subjectsWithAttendance.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Select Subject</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subjectsWithAttendance.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject.id)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Object.keys(subject.attendance || {}).length} days
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Attendance Modal - Matching subjects page style */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Create Attendance</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  name="subject"
                  value={attendanceForm.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select subject</option>
                  {subjectsWithAttendance.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Unique Code
                </label>
                <input
                  type="text"
                  name="uniqueCode"
                  value={attendanceForm.uniqueCode}
                  onChange={handleInputChange}
                  placeholder="Enter attendance code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateQR}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 font-medium"
              >
                Generate QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`bg-white rounded-lg ${isQrZoomed ? 'w-full max-w-2xl' : 'w-full max-w-sm'}`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Attendance QR Code</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsQrZoomed(!isQrZoomed)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {isQrZoomed ? <FiMinimize2 className="h-4 w-4" /> : <FiMaximize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setIsQrZoomed(false);
                    if (qrRefreshInterval) clearInterval(qrRefreshInterval);
                  }}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className={`${isQrZoomed ? 'w-96 h-96' : 'w-64 h-64'} bg-white border-2 border-gray-200 rounded-lg p-2 mb-4`}>
                {currentQrCode && (
                  <QRCodeSVG
                    value={currentQrCode}
                    size={isQrZoomed ? 380 : 240}
                    level="L"
                    includeMargin={true}
                  />
                )}
              </div>
              <p className="text-sm text-gray-600 text-center">
                Students can scan this QR code to mark attendance
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Matching subjects page style */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Delete Record</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">
                This attendance record will be permanently removed.
              </p>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal - Matching subjects page style */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div>
                <h3 className="text-base font-medium text-gray-900">{selectedStudent.studentName}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Roll No: {selectedStudent.rollNo}</p>
              </div>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Attendance History</h4>
              {getStudentPreviousAttendance(selectedStudent).length > 0 ? (
                <div className="space-y-2">
                  {getStudentPreviousAttendance(selectedStudent).map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FiCalendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {record.time ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <FiClock className="h-3 w-3 mr-1" />
                            {record.time}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Absent
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No attendance history found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherAttendance_Page