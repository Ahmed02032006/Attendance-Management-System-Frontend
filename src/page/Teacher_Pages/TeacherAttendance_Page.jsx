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
  FiFileText,
  FiCalendar,
  FiBookOpen,
  FiChevronDown,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiUsers
} from 'react-icons/fi'
import {
  getSubjectsWithAttendance,
  deleteAttendance,
  clearAttendance,
  createAttendance,
  getAttendanceBySchedule // New action to add in slicer
} from '../../store/Teacher-Slicer/Attendance-Slicer.js'
import { getRegisteredStudents } from '../../store/Teacher-Slicer/Subject-Slicer.js'

const TeacherAttendance_Page = () => {
  const dispatch = useDispatch()
  const {
    subjectsWithAttendance,
    isLoading
  } = useSelector((state) => state.teacherAttendance)

  const { registeredStudents, studentsLoading } = useSelector((state) => state.teacherSubject)

  // New state for course and schedule selection
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  
  // Modal states
  const [showSubjectModal, setShowSubjectModal] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttendanceDropdown, setShowAttendanceDropdown] = useState(false);
  
  // Data states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceForm, setAttendanceForm] = useState({
    subject: '',
    uniqueCode: ''
  });
  const [currentAttendanceData, setCurrentAttendanceData] = useState({
    students: [],
    totalPresent: 0,
    totalAbsent: 0,
    totalRegistered: 0
  });

  // Manual attendance form state
  const [manualAttendanceForm, setManualAttendanceForm] = useState({
    studentName: '',
    rollNo: '',
    discipline: '',
    subjectId: '',
    date: '',
    time: '',
    ipAddress: '',
    scheduleDay: '',
    scheduleTime: ''
  });

  // Search and pagination
  const [rollNoSearchTerm, setRollNoSearchTerm] = useState('');
  const [showRollNoDropdown, setShowRollNoDropdown] = useState(false);
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
  const [modalSortConfig, setModalSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

  const { user } = useSelector((state) => state.auth)
  const userId = user?.id

  // Fetch subjects with attendance on component mount
  useEffect(() => {
    dispatch(getSubjectsWithAttendance(userId)).unwrap();
    return () => dispatch(clearAttendance())
  }, [dispatch, userId])

  // Update available schedules when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const subject = subjectsWithAttendance.find(s => s.id === selectedSubject);
      if (subject && subject.classSchedule) {
        setAvailableSchedules(subject.classSchedule);
        // Auto-select first schedule if none selected
        if (!selectedSchedule && subject.classSchedule.length > 0) {
          setSelectedSchedule(subject.classSchedule[0]);
        }
      }
    }
  }, [selectedSubject, subjectsWithAttendance, selectedSchedule]);

  // Fetch attendance data for selected subject, date, and schedule
  useEffect(() => {
    if (selectedSubject && selectedSchedule && currentDate) {
      fetchAttendanceForSchedule();
    }
  }, [selectedSubject, selectedSchedule, currentDate]);

  // Fetch attendance for specific schedule
  const fetchAttendanceForSchedule = async () => {
    try {
      const formattedDate = formatDate(currentDate);
      const scheduleTime = `${selectedSchedule.startTime}-${selectedSchedule.endTime}`;
      
      const response = await dispatch(getAttendanceBySchedule({
        subjectId: selectedSubject,
        date: formattedDate,
        scheduleDay: selectedSchedule.day,
        scheduleTime: scheduleTime
      })).unwrap();

      if (response.success) {
        setCurrentAttendanceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendance by schedule:', error);
      toast.error('Failed to load attendance data for this schedule');
    }
  };

  // Format schedule time for display
  const formatScheduleTime = (schedule) => {
    if (!schedule) return '';
    const formatTime = (time) => {
      const [hour, minute] = time.split(':');
      const hourInt = parseInt(hour);
      const ampm = hourInt >= 12 ? 'PM' : 'AM';
      const hour12 = hourInt % 12 || 12;
      return `${hour12}:${minute} ${ampm}`;
    };
    return `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`;
  };

  // Get unmarked students (absent) for current schedule
  const getUnmarkedStudents = () => {
    if (!currentAttendanceData.students) return [];
    return currentAttendanceData.students.filter(student => student.status === 'Absent');
  };

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.attendance-dropdown')) {
        setShowAttendanceDropdown(false);
      }
      if (!event.target.closest('.rollno-dropdown')) {
        setShowRollNoDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Format date for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date for modal display (short format)
  const formatShortDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Generate random IP address
  const generateRandomIP = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 8;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

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

  // Sorting function for main table
  const sortStudents = (students) => {
    if (!sortConfig.key || !students) return students;
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
        case 'discipline':
          aValue = a.discipline?.toLowerCase() || '';
          bValue = b.discipline?.toLowerCase() || '';
          break;
        case 'status':
          const statusPriority = {
            'Present': 1,
            'Absent': 2
          };
          aValue = statusPriority[a.status] || 3;
          bValue = statusPriority[b.status] || 3;
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Handle sort request for main table
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  // Get sort icon for main table
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
    (currentAttendanceData.students || []).filter(student =>
      student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.discipline?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Export to Excel function
  const exportToExcel = () => {
    if (filteredStudents.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const headers = ['Student Name', 'Roll No', 'Discipline', 'Date', 'Time', 'Subject', 'Schedule Day', 'Schedule Time'];
      const csvContent = [
        headers.join(','),
        ...filteredStudents.map(student =>
          [
            `"${student.studentName}"`,
            `"${student.rollNo}"`,
            `"${student.discipline}"`,
            `"${formatShortDate(currentDate)}"`,
            `"${student.time || '--'}"`,
            `"${student.title || 'N/A'}"`,
            `"${selectedSchedule?.day || 'N/A'}"`,
            `"${selectedSchedule ? formatScheduleTime(selectedSchedule) : 'N/A'}"`
          ].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const subjectName = subjectsWithAttendance.find(s => s.id === selectedSubject)?.title || 'attendance';
      const scheduleInfo = selectedSchedule ? `${selectedSchedule.day}_${selectedSchedule.startTime}` : 'all';
      const fileName = `attendance_${subjectName}_${scheduleInfo}_${currentDateString}.csv`;

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

  const handleManualInputChange = (e) => {
    const { name, value } = e.target;
    setManualAttendanceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle roll number selection from dropdown
  const handleRollNoSelect = (student) => {
    setManualAttendanceForm(prev => ({
      ...prev,
      rollNo: student.registrationNo,
      studentName: student.studentName,
      discipline: student.discipline
    }));
    setRollNoSearchTerm('');
    setShowRollNoDropdown(false);
  };

  // Handle roll number search input
  const handleRollNoSearchChange = (e) => {
    const value = e.target.value;
    setRollNoSearchTerm(value);

    if (value !== manualAttendanceForm.rollNo) {
      setManualAttendanceForm(prev => ({
        ...prev,
        rollNo: value,
        studentName: '',
        discipline: ''
      }));
    }

    setShowRollNoDropdown(true);
  };

  // Filter registered students based on search term
  const filteredRegisteredStudents = () => {
    if (!registeredStudents?.registeredStudents) return [];
    return registeredStudents.registeredStudents.filter(student =>
      student.registrationNo.toLowerCase().includes(rollNoSearchTerm.toLowerCase()) ||
      student.studentName.toLowerCase().includes(rollNoSearchTerm.toLowerCase())
    );
  };

  // Handle subject and schedule selection
  const handleSubjectAndScheduleSelect = (subjectId, schedule) => {
    setSelectedSubject(subjectId);
    setSelectedSchedule(schedule);
    setShowSubjectModal(false);
    setAttendanceForm(prev => ({ ...prev, subject: subjectId }));
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
    
    // Reset attendance data
    setCurrentAttendanceData({
      students: [],
      totalPresent: 0,
      totalAbsent: 0,
      totalRegistered: 0
    });
    
    toast.success(`Selected: ${schedule.day} ${formatScheduleTime(schedule)}`);
  };

  // Handle schedule change from dropdown
  const handleScheduleChange = (schedule) => {
    setSelectedSchedule(schedule);
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  // Function to generate random code
  const generateRandomCode = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setAttendanceForm(prev => ({ ...prev, uniqueCode: randomNum.toString() }));
  };

  // Function to generate QR with schedule info
  const handleQRGeneration = (isInitial = false) => {
    if (!attendanceForm.subject || !attendanceForm.uniqueCode || !selectedSchedule) {
      toast.error('Please fill all fields and select a schedule');
      return;
    }

    const selectedSubjectData = subjectsWithAttendance.find(s => s.id === attendanceForm.subject);
    const subjectName = selectedSubjectData?.title;
    const subjectCode = selectedSubjectData?.code;

    const currentTime = new Date();
    const expiryTime = new Date(currentTime.getTime() + 80000);

    const originalCode = attendanceForm.uniqueCode;
    const baseUrl = `${window.location.origin}/student-attendance`;
    const url = new URL(baseUrl);
    url.searchParams.append('code', originalCode);
    url.searchParams.append('subject', attendanceForm.subject);
    url.searchParams.append('subjectName', subjectName || 'Unknown Subject');
    url.searchParams.append('subjectCode', subjectCode || 'N/A');
    url.searchParams.append('scheduleDay', selectedSchedule.day);
    url.searchParams.append('scheduleTime', `${selectedSchedule.startTime}-${selectedSchedule.endTime}`);
    url.searchParams.append('timestamp', currentTime.getTime());
    url.searchParams.append('expiry', expiryTime.getTime());

    setCurrentQrCode(url.toString());
    setQrExpiryTime(expiryTime);

    if (isInitial) {
      toast.success('QR code generated successfully!', { autoClose: 2000 });
    }
  };

  // Check if viewing today's date
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isViewingToday = isToday(currentDate);

  const handleGenerateQR = async () => {
    if (!attendanceForm.subject || !attendanceForm.uniqueCode) {
      toast.error('Please fill all fields');
      return;
    }

    setShowCreateModal(false);
    setShowQRModal(true);
    toast.success('QR code generated successfully!', { autoClose: 2000 });
  };

  // Handle Manual Attendance with schedule info
  const handleManualAttendance = async () => {
    if (!selectedSchedule) {
      toast.error('Please select a class schedule first');
      return;
    }

    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    setManualAttendanceForm({
      studentName: '',
      rollNo: '',
      discipline: '',
      subjectId: selectedSubject || '',
      date: formatDate(currentDate),
      time: formattedTime,
      ipAddress: generateRandomIP(),
      scheduleDay: selectedSchedule.day,
      scheduleTime: `${selectedSchedule.startTime}-${selectedSchedule.endTime}`
    });

    setRollNoSearchTerm('');

    try {
      await dispatch(getRegisteredStudents({
        subjectId: selectedSubject,
        teacherId: userId
      })).unwrap();
    } catch (error) {
      console.error('Error fetching registered students:', error);
    }

    setShowManualModal(true);
    setShowAttendanceDropdown(false);
  };

  const handleSubmitManualAttendance = async () => {
    if (!manualAttendanceForm.studentName || !manualAttendanceForm.rollNo || !manualAttendanceForm.discipline) {
      toast.error('Please fill in all required fields');
      return;
    }

    const subject = subjectsWithAttendance.find(s => s.id === selectedSubject);

    const attendanceRecord = {
      studentName: manualAttendanceForm.studentName,
      rollNo: manualAttendanceForm.rollNo,
      discipline: manualAttendanceForm.discipline,
      time: manualAttendanceForm.time,
      subjectId: selectedSubject,
      subjectName: subject?.title || 'Unknown Subject',
      date: manualAttendanceForm.date,
      ipAddress: manualAttendanceForm.ipAddress,
      title: subject?.title || 'Unknown Subject',
      scheduleDay: manualAttendanceForm.scheduleDay,
      scheduleTime: manualAttendanceForm.scheduleTime
    };

    dispatch(createAttendance(attendanceRecord))
      .then(async (res) => {
        if (res.payload.success) {
          toast.success('Manual attendance marked successfully!');
          await fetchAttendanceForSchedule(); // Refresh data
          setManualAttendanceForm({
            studentName: '',
            rollNo: '',
            discipline: '',
            subjectId: '',
            date: '',
            time: '',
            ipAddress: '',
            scheduleDay: '',
            scheduleTime: ''
          });
        } else {
          toast.error(res.payload.message)
        }
      })
      .catch((error) => {
        console.error('Attendance submission error:', error);
      });

    setShowManualModal(false);
    setRollNoSearchTerm('');
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
      dispatch(deleteAttendance(attendanceToDelete)).unwrap()
        .then(() => {
          toast.success('Attendance record deleted successfully');
          fetchAttendanceForSchedule(); // Refresh data
        });
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
    setModalSortConfig({ key: 'date', direction: 'desc' });
  };

  // Reset search and pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleRefresh = async () => {
    try {
      await dispatch(getSubjectsWithAttendance(userId)).unwrap();
      if (selectedSubject && selectedSchedule) {
        await fetchAttendanceForSchedule();
      }
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiFileText className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading Attendance Data...</p>
          <p className="mt-2 text-sm text-gray-500">Compiling student attendance details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent heading={"Teacher Attendance"} subHeading={"View and manage teacher attendance"} role='' />

      <div className="container max-w-full p-6">
        {/* Date Navigation and Schedule Selection - Only show if subject selected */}
        {selectedSubject && selectedSchedule && (
          <div className="flex flex-col items-center mb-8">
            {/* Date Navigation */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-white rounded-lg border border-gray-200 px-6 py-4 mb-4">
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
                  {subjectsWithAttendance.find(s => s.id === selectedSubject)?.title}
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

            {/* Schedule Selection Dropdown */}
            <div className="w-full max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Select Class Schedule
              </label>
              <select
                value={selectedSchedule ? JSON.stringify(selectedSchedule) : ''}
                onChange={(e) => {
                  const schedule = JSON.parse(e.target.value);
                  handleScheduleChange(schedule);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {availableSchedules.map((schedule, index) => (
                  <option key={index} value={JSON.stringify(schedule)}>
                    {schedule.day} | {formatScheduleTime(schedule)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Attendance Summary Cards */}
        {selectedSubject && selectedSchedule && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Registered</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {currentAttendanceData.totalRegistered || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FiUsers className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Present</p>
                  <p className="text-2xl font-semibold text-green-600 mt-1">
                    {currentAttendanceData.totalPresent || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Absent</p>
                  <p className="text-2xl font-semibold text-red-600 mt-1">
                    {currentAttendanceData.totalAbsent || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <FiXCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Table Section */}
        {selectedSubject && selectedSchedule && (
          <div className="space-y-6">
            {/* Search and Actions */}
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

              <div className="flex items-center gap-3 flex-wrap">
                {/* Unmarked Students Count */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
                  <span className="text-xs font-medium text-yellow-700">
                    Unmarked: {getUnmarkedStudents().length}
                  </span>
                </div>

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
                  onClick={handleRefresh}
                  disabled={isLoading || !isViewingToday}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  title="Refresh attendance data"
                >
                  <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                {/* Create Attendance Dropdown */}
                <div className="relative attendance-dropdown">
                  <button
                    disabled={!isViewingToday}
                    onClick={() => setShowAttendanceDropdown(!showAttendanceDropdown)}
                    className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <span>Create Attendance</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${showAttendanceDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showAttendanceDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <button
                        onClick={() => {
                          setShowCreateModal(true);
                          setShowAttendanceDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">QR Based Attendance</p>
                            <p className="text-xs text-gray-500">Generate QR code for students</p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={handleManualAttendance}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Manual Attendance</p>
                            <p className="text-xs text-gray-500">Enter attendance manually</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Table */}
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
                        onClick={() => handleSort('discipline')}
                      >
                        <div className="flex items-center space-x-1">
                          <FiBookOpen className="w-3 h-3" />
                          <span>Discipline</span>
                          {getSortIcon('discipline')}
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
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentStudents.length > 0 ? (
                      currentStudents.map((student) => (
                        <tr key={student.rollNo} className="hover:bg-gray-50 transition-colors">
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
                            <span className="text-sm text-gray-600">{student.discipline}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${student.status === 'Present'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-gray-50 text-gray-400'
                              }`}>
                              {student.time || '--'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${student.status === 'Present'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                              }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            {student.status === 'Present' && (
                              <button
                                onClick={() => handleDeleteClick(student.id)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete record"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">
                          {searchTerm ? "No matching students found" : "No attendance records for this schedule"}
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
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Course Selected</h3>
            <p className="text-gray-600 mb-4">Please select a course to view attendance records</p>
            <button
              onClick={() => setShowSubjectModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center mx-auto space-x-2"
            >
              <FiGrid className="w-4 h-4" />
              <span>Select Course</span>
            </button>
          </div>
        )}

        {/* No Data State */}
        {subjectsWithAttendance.length === 0 && !isLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                  <svg
                    className="h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Courses Found
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm">
                You don't have any courses with attendance data yet. Create your first course to get started.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.location.href = '/teacher/subject'}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Create New Course
                </button>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subject and Schedule Selection Modal */}
      {showSubjectModal && subjectsWithAttendance.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Course & Schedule</h3>
              <p className="text-sm text-gray-500 mt-1">Choose a course and class schedule to continue</p>
            </div>

            {/* Subject List */}
            <div className="p-6 max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                {subjectsWithAttendance.map((subject) => (
                  <div key={subject.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Subject Header */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {subject.title?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{subject.title}</h4>
                            <p className="text-xs text-gray-500">{subject.code} • {subject.departmentOffering}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                          {subject.classSchedule?.length || 0} schedules
                        </span>
                      </div>
                    </div>

                    {/* Schedules List */}
                    <div className="p-4 bg-white">
                      <p className="text-xs font-medium text-gray-500 mb-3">Available Class Schedules:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {subject.classSchedule?.map((schedule, index) => (
                          <button
                            key={index}
                            onClick={() => handleSubjectAndScheduleSelect(subject.id, schedule)}
                            className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                                <FiClock className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{schedule.day}</p>
                                <p className="text-xs text-gray-500">
                                  {formatScheduleTime(schedule)}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
              <button
                onClick={() => setShowSubjectModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Attendance Modal - QR Based */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Create QR Based Attendance</h3>
              {selectedSchedule && (
                <p className="text-xs text-gray-500 mt-1">
                  Schedule: {selectedSchedule.day} {formatScheduleTime(selectedSchedule)}
                </p>
              )}
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
                      {subject.title}
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

      {/* Manual Attendance Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Manual Attendance</h3>
              {selectedSchedule && (
                <p className="text-xs text-gray-500 mt-1">
                  Schedule: {selectedSchedule.day} {formatScheduleTime(selectedSchedule)}
                </p>
              )}
            </div>
            <div className="p-6 space-y-4">
              {/* Roll Number Field with Dropdown */}
              <div className="relative rollno-dropdown">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roll No *
                </label>
                <input
                  type="text"
                  name="rollNo"
                  value={manualAttendanceForm.rollNo}
                  onChange={handleRollNoSearchChange}
                  onFocus={() => setShowRollNoDropdown(true)}
                  placeholder="Type or select roll number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="off"
                />

                {/* Dropdown for registered students */}
                {showRollNoDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {studentsLoading ? (
                      <div className="p-3 text-center text-sm text-gray-500">
                        Loading students...
                      </div>
                    ) : filteredRegisteredStudents().length > 0 ? (
                      filteredRegisteredStudents().map((student) => (
                        <div
                          key={student._id}
                          onClick={() => handleRollNoSelect(student)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {student.registrationNo}
                            </span>
                            <span className="text-xs text-gray-500">
                              {student.studentName} • {student.discipline}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-sm text-gray-500">
                        {rollNoSearchTerm ? 'No matching students found' : 'No registered students available'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Student Name Field - Disabled */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={manualAttendanceForm.studentName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Auto-filled from selection"
                />
              </div>

              {/* Discipline Field - Disabled */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discipline *
                </label>
                <input
                  type="text"
                  name="discipline"
                  value={manualAttendanceForm.discipline}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Auto-filled from selection"
                />
              </div>

              {/* Schedule Info - Display only */}
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-xs font-medium text-blue-700">Class Schedule</p>
                <p className="text-sm text-blue-800">
                  {selectedSchedule?.day} | {formatScheduleTime(selectedSchedule)}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowManualModal(false);
                  setManualAttendanceForm({
                    studentName: '',
                    rollNo: '',
                    discipline: '',
                    subjectId: '',
                    date: '',
                    time: '',
                    ipAddress: '',
                    scheduleDay: '',
                    scheduleTime: ''
                  });
                  setRollNoSearchTerm('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitManualAttendance}
                disabled={!manualAttendanceForm.studentName || !manualAttendanceForm.rollNo || !manualAttendanceForm.discipline}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${manualAttendanceForm.studentName && manualAttendanceForm.rollNo && manualAttendanceForm.discipline
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Submit Attendance
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
              {/* Schedule Info */}
              {selectedSchedule && (
                <div className="mb-4 text-center bg-blue-50 p-3 rounded-lg w-full">
                  <p className="text-xs font-medium text-blue-700">Class Schedule</p>
                  <p className="text-sm text-blue-800">
                    {selectedSchedule.day} | {formatScheduleTime(selectedSchedule)}
                  </p>
                </div>
              )}

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
                <p className="text-xs text-gray-400 mt-2">
                  Valid for 80 seconds only
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
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedStudent.studentName} - Attendance Details
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Roll No: {selectedStudent.rollNo}
              </p>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Student Name</p>
                      <p className="text-gray-900">{selectedStudent.studentName}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Roll Number</p>
                      <p className="text-gray-900">{selectedStudent.rollNo}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Discipline</p>
                      <p className="text-gray-900">{selectedStudent.discipline}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Current Course</p>
                      <p className="text-gray-900">{selectedStudent.title}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Previous Attendance Records</h4>
                  <p className="text-sm text-gray-500">View detailed attendance history</p>
                </div>
              </div>
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
