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
} from 'react-icons/fi'
import {
  getSubjectsWithAttendance,
  deleteAttendance,
  clearAttendance,
  createAttendance
} from '../../store/Teacher-Slicer/Attendance-Slicer.js'
import { getRegisteredStudents } from '../../store/Teacher-Slicer/Subject-Slicer.js'

const TeacherAttendance_Page = () => {
  const dispatch = useDispatch()
  const {
    subjectsWithAttendance,
    isLoading
  } = useSelector((state) => state.teacherAttendance)

  const { registeredStudents, studentsLoading } = useSelector((state) => state.teacherSubject)

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttendanceDropdown, setShowAttendanceDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceForm, setAttendanceForm] = useState({
    subject: '',
    uniqueCode: ''
  });

  // New state to track available dates for navigation
  const [availablePrevDates, setAvailablePrevDates] = useState([]);
  const [availableNextDates, setAvailableNextDates] = useState([]);

  const [manualAttendanceForm, setManualAttendanceForm] = useState({
    studentName: '',
    rollNo: '',
    discipline: '',
    subjectId: '',
    date: '',
    time: '',
    ipAddress: ''
  });

  const [rollNoSearchTerm, setRollNoSearchTerm] = useState('');
  const [showRollNoDropdown, setShowRollNoDropdown] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(6);

  // QR Auto-refresh states
  const [qrExpiryTime, setQrExpiryTime] = useState(null);
  const [qrRefreshInterval, setQrRefreshInterval] = useState(null);
  const [currentQrCode, setCurrentQrCode] = useState('');

  // QR Zoom state
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  // Sorting states for main table
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Sorting states for previous attendance modal
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
  }, [dispatch])

  // Set initial selected subject when data is loaded
  useEffect(() => {
    if (subjectsWithAttendance.length > 0 && !selectedSubject) {
      setShowSubjectModal(true);
    }
  }, [subjectsWithAttendance, selectedSubject])

  // Update available dates when subject, schedule, or current date changes
  useEffect(() => {
    if (selectedSubject && selectedSchedule) {
      updateAvailableDates();
    }
  }, [selectedSubject, selectedSchedule, subjectsWithAttendance]);

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

  // Get all attendance dates for the selected schedule
  const getAllScheduleAttendanceDates = () => {
    if (!selectedSubject || !selectedSchedule) return [];

    const subject = subjectsWithAttendance.find(s => s.id === selectedSubject);
    if (!subject || !subject.attendance) return [];

    const dates = [];

    Object.entries(subject.attendance).forEach(([date, schedules]) => {
      if (schedules[selectedSchedule._id]) {
        // Check if there's any attendance record for this schedule
        const scheduleData = schedules[selectedSchedule._id];
        if (scheduleData.students && scheduleData.students.length > 0) {
          dates.push(new Date(date));
        }
      }
    });

    return dates;
  };

  // Update available previous and next dates for navigation
  const updateAvailableDates = () => {
    const allDates = getAllScheduleAttendanceDates();
    
    // Sort dates in ascending order
    const sortedDates = allDates.sort((a, b) => a - b);
    
    const currentDateTime = currentDate.setHours(0, 0, 0, 0);
    
    // Find previous dates (dates before current date)
    const prevDates = sortedDates.filter(date => 
      date.setHours(0, 0, 0, 0) < currentDateTime
    );
    
    // Find next dates (dates after current date)
    const nextDates = sortedDates.filter(date => 
      date.setHours(0, 0, 0, 0) > currentDateTime && 
      date <= getTodayDate() // Exclude future dates
    );
    
    setAvailablePrevDates(prevDates);
    setAvailableNextDates(nextDates);
  };

  // Navigate to previous available date
  const navigateToPrevDate = () => {
    if (availablePrevDates.length === 0) return;
    
    // Get the closest previous date
    const currentDateTime = currentDate.setHours(0, 0, 0, 0);
    const prevDate = availablePrevDates.reduce((prev, current) => {
      const prevTime = prev.setHours(0, 0, 0, 0);
      const currentTime = current.setHours(0, 0, 0, 0);
      return (currentTime < currentDateTime && currentTime > prevTime) ? current : prev;
    }, availablePrevDates[0]);
    
    setCurrentDate(prevDate);
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  // Navigate to next available date
  const navigateToNextDate = () => {
    if (availableNextDates.length === 0) return;
    
    // Get the closest next date
    const currentDateTime = currentDate.setHours(0, 0, 0, 0);
    const nextDate = availableNextDates.reduce((prev, current) => {
      const prevTime = prev.setHours(0, 0, 0, 0);
      const currentTime = current.setHours(0, 0, 0, 0);
      return (currentTime > currentDateTime && currentTime < prevTime) ? current : prev;
    }, availableNextDates[availableNextDates.length - 1]);
    
    setCurrentDate(nextDate);
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  // Check if there's attendance data for a specific date and schedule
  const hasAttendanceForDate = (date) => {
    if (!selectedSubject || !selectedSchedule) return false;
    
    const subject = subjectsWithAttendance.find(s => s.id === selectedSubject);
    if (!subject || !subject.attendance) return false;
    
    const dateStr = formatDate(date);
    const scheduleData = subject.attendance[dateStr]?.[selectedSchedule._id];
    
    return scheduleData && scheduleData.students && scheduleData.students.length > 0;
  };

  // Get current attendance records from Redux state
  const getCurrentAttendanceRecords = () => {
    if (!selectedSubject || !selectedSchedule) return [];

    const subject = subjectsWithAttendance.find(s => s.id === selectedSubject);
    if (!subject || !subject.attendance) return [];

    const scheduleKey = selectedSchedule._id;
    const dateRecords = subject.attendance[currentDateString] || {};
    const scheduleRecords = dateRecords[scheduleKey] || { students: [] };

    return scheduleRecords.students || [];
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

  // Sorting function for main table
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
        case 'discipline':
          aValue = a.discipline?.toLowerCase() || '';
          bValue = b.discipline?.toLowerCase() || '';
          break;
        case 'status':
          const statusPriority = {
            'Present': 1,
            'Not Registered': 2,
            'Absent': 3
          };
          aValue = statusPriority[a.status || (a.time ? 'Present' : 'Absent')] || 4;
          bValue = statusPriority[b.status || (b.time ? 'Present' : 'Absent')] || 4;
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

  // Sorting function for modal table
  const sortModalRecords = (records) => {
    if (!modalSortConfig.key) return records;

    return [...records].sort((a, b) => {
      let aValue, bValue;

      switch (modalSortConfig.key) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'day':
          aValue = new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' });
          bValue = new Date(b.date).toLocaleDateString('en-US', { weekday: 'short' });
          break;
        case 'time':
          aValue = timeToSortableValue(a.time);
          bValue = timeToSortableValue(b.time);
          break;
        case 'title':
          aValue = a.subject?.toLowerCase() || '';
          bValue = b.subject?.toLowerCase() || '';
          break;
        case 'discipline':
          aValue = a.subject?.toLowerCase() || '';
          bValue = b.subject?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return modalSortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return modalSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Handle sort request for modal
  const handleModalSort = (key) => {
    setModalSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sort icon for modal
  const getModalSortIcon = (key) => {
    if (modalSortConfig.key !== key) {
      return <FiArrowUp className="w-3 h-3 opacity-30" />;
    }
    return modalSortConfig.direction === 'asc' ?
      <FiArrowUp className="w-3 h-3" /> :
      <FiArrowDown className="w-3 h-3" />;
  };

  // Filter students based on search term
  const filteredStudents = sortStudents(
    currentAttendanceRecords.filter(student =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.discipline.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Export to Excel function
  const exportToExcel = () => {
    if (filteredStudents.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const headers = ['Student Name', 'Roll No', 'Discipline', 'Date', 'Time', 'Subject'];
      const csvContent = [
        headers.join(','),
        ...filteredStudents.map(student =>
          [
            `"${student.studentName}"`,
            `"${student.rollNo}"`,
            `"${student.discipline}"`,
            `"${formatShortDate(currentDate)}"`,
            `"${student.time}"`,
            `"${student.title || student.subject || 'N/A'}"`
          ].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const subjectName = subjectsWithAttendance.find(s => s.id === selectedSubject)?.title || 'attendance';
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

  // Updated handleSubjectSelect to also reset schedule and update available dates
  const handleSubjectSelect = (subjectId, schedule = null) => {
    setSelectedSubject(subjectId);
    setSelectedSchedule(schedule);
    setShowSubjectModal(false);
    setAttendanceForm(prev => ({ ...prev, subject: subjectId }));
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
    
    // Reset to today's date
    setCurrentDate(new Date());
    
    // Update available dates will be called by the useEffect
  };

  // Function to generate random code
  const generateRandomCode = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setAttendanceForm(prev => ({ ...prev, uniqueCode: randomNum.toString() }));
  };

  // Function to generate QR
  const handleQRGeneration = (isInitial = false) => {
    if (!attendanceForm.subject || !attendanceForm.uniqueCode) {
      toast.error('Please fill all fields');
      return;
    }

    if (!selectedSchedule) {
      toast.error('Please select a class schedule first');
      return;
    }

    const selectedSubject = subjectsWithAttendance.find(s => s.id === attendanceForm.subject);
    const subjectName = selectedSubject?.title;
    const subjectCode = selectedSubject?.code;

    const currentTime = new Date();
    const expiryTime = new Date(currentTime.getTime() + 80000);

    const originalCode = attendanceForm.uniqueCode;
    const baseUrl = `${window.location.origin}/student-attendance`;
    const url = new URL(baseUrl);
    url.searchParams.append('code', originalCode);
    url.searchParams.append('subject', attendanceForm.subject);
    url.searchParams.append('scheduleId', selectedSchedule._id);
    url.searchParams.append('subjectName', subjectName || 'Unknown Subject');
    url.searchParams.append('subjectCode', subjectCode || 'N/A');
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

  // Handle Manual Attendance
  const handleManualAttendance = async () => {
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
      ipAddress: generateRandomIP()
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

  const handleSubmitManualAttendance = () => {
    if (!manualAttendanceForm.studentName || !manualAttendanceForm.rollNo || !manualAttendanceForm.discipline) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedSchedule) {
      toast.error('Please select a class schedule first');
      return;
    }

    const subject = subjectsWithAttendance.find(s => s.id === selectedSubject);

    const attendanceRecord = {
      studentName: manualAttendanceForm.studentName,
      rollNo: manualAttendanceForm.rollNo,
      discipline: manualAttendanceForm.discipline,
      time: manualAttendanceForm.time,
      subjectId: selectedSubject,
      scheduleId: selectedSchedule._id,
      subjectName: subject?.title || 'Unknown Subject',
      date: manualAttendanceForm.date,
      ipAddress: manualAttendanceForm.ipAddress,
      title: subject?.title || 'Unknown Subject'
    };

    console.log('Manual attendance payload:', attendanceRecord);

    dispatch(createAttendance(attendanceRecord))
      .then((res) => {
        console.log('Attendance response:', res);

        if (res.payload && res.payload.success === true) {
          toast.success('Manual attendance marked successfully!');

          dispatch(getSubjectsWithAttendance(userId)).unwrap()
            .then(() => {
              console.log('Attendance data refreshed');
              updateAvailableDates(); // Update available dates after successful attendance
            })
            .catch((refreshError) => {
              console.error('Error refreshing attendance:', refreshError);
            });

          setManualAttendanceForm({
            studentName: '',
            rollNo: '',
            discipline: '',
            subjectId: '',
            date: '',
            time: '',
            ipAddress: ''
          });
        } else {
          const errorMessage = res.payload?.message || 'Failed to mark attendance';
          toast.error(errorMessage);
          console.error('Attendance error:', res.payload);
        }
      })
      .catch((error) => {
        console.error('Attendance submission error:', error);

        if (error.response && error.response.data) {
          toast.error(error.response.data.message || 'Failed to mark attendance');
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error('Failed to mark attendance');
        }
      })
      .finally(() => {
        setShowManualModal(false);
        setRollNoSearchTerm('');

        setManualAttendanceForm({
          studentName: '',
          rollNo: '',
          discipline: '',
          subjectId: '',
          date: '',
          time: '',
          ipAddress: ''
        });
      });
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
      updateAvailableDates(); // Update available dates after deletion
    }
    setShowDeleteModal(false);
    setAttendanceToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAttendanceToDelete(null);
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

  // Helper functions for student attendance data
  const getStudentPreviousAttendance = (student) => {
    if (!student || !selectedSubject) return [];

    const subject = subjectsWithAttendance.find(s => s.id === selectedSubject);
    if (!subject || !subject.attendance) return [];

    const allAttendance = [];

    Object.entries(subject.attendance).forEach(([date, schedules]) => {
      Object.entries(schedules).forEach(([scheduleId, scheduleData]) => {
        const studentRecord = scheduleData.students.find(record =>
          record.rollNo === student.rollNo
        );

        if (studentRecord && studentRecord.id) {
          const schedule = subject.classSchedule.find(s => s._id === scheduleId);
          allAttendance.push({
            ...studentRecord,
            date: date,
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            schedule: schedule ? `${schedule.day} ${schedule.startTime}-${schedule.endTime}` : 'Unknown Schedule',
            scheduleId: scheduleId
          });
        }
      });
    });

    return sortModalRecords(allAttendance);
  };

  const handleRefresh = async () => {
    try {
      await dispatch(getSubjectsWithAttendance(userId)).unwrap();
      updateAvailableDates(); // Update available dates after refresh
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  // Format schedule for display
  const formatScheduleDisplay = (schedule) => {
    if (!schedule) return '';
    return `${schedule.day}, ${schedule.startTime} - ${schedule.endTime}`;
  };

  // Check if there's attendance data for the selected schedule
  const hasAttendanceForSelectedSchedule = () => {
    return hasAttendanceForDate(currentDate);
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
        {/* Selected Subject and Schedule Info - Centered */}
        {selectedSubject && (
          <div className="flex flex-col items-center mb-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-white rounded-lg border border-gray-200 px-6 py-4">
              <button
                onClick={navigateToPrevDate}
                disabled={availablePrevDates.length === 0}
                className={`p-3 rounded-full transition-colors ${
                  availablePrevDates.length > 0
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                }`}
                title={availablePrevDates.length === 0 ? 'No previous attendance data available' : 'Previous attendance date'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {selectedSchedule && (
                  <p className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 mt-2 rounded-md border border-blue-400">
                    {formatScheduleDisplay(selectedSchedule)}
                  </p>
                )}
                {!hasAttendanceForSelectedSchedule() && (
                  <p className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1 mt-2 rounded-md border border-yellow-400">
                    No attendance data for this date
                  </p>
                )}
              </div>

              <button
                onClick={navigateToNextDate}
                disabled={availableNextDates.length === 0}
                className={`p-3 rounded-full transition-colors ${
                  availableNextDates.length > 0
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                }`}
                title={availableNextDates.length === 0 ? 'No next attendance data available' : 'Next attendance date'}
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
            {/* Search and Action Buttons */}
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
                  disabled={isLoading || !isViewingToday}
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

                {/* Create Attendance Dropdown */}
                <div className="relative attendance-dropdown">
                  <button
                    disabled={!isViewingToday}
                    onClick={() => setShowAttendanceDropdown(!showAttendanceDropdown)}
                    className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <FiClock className="w-3 h-3" />
                          <span>Schedule</span>
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
                        <tr key={student.id || student.rollNo} className="hover:bg-gray-50 transition-colors">
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
                            <span className="text-sm text-gray-600">{student.status === 'Present' ? student.discipline : '--'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {selectedSchedule ? formatScheduleDisplay(selectedSchedule) : 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${student.status === 'Present'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-gray-50 text-gray-400'
                              }`}>
                              {student.status === 'Present' ? student.time : '--'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${student.status === 'Present'
                              ? 'bg-green-100 text-green-700'
                              : student.status === 'Not Registered'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                              {student.status || (student.time ? 'Present' : 'Absent')}
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
                        <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500">
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
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subject Selection Modal */}
      {showSubjectModal && subjectsWithAttendance.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Select Course</h3>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {subjectsWithAttendance.map((subject) => (
                  <div key={subject.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{subject.title}</span>
                        <span className="text-xs text-gray-500">{subject.totalRegisteredStudents} students</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{subject.code}</p>
                    </div>

                    {subject.classSchedule && subject.classSchedule.length > 0 ? (
                      <div className="p-3">
                        <select
                          onChange={(e) => {
                            const selectedIndex = e.target.value;
                            if (selectedIndex) {
                              const schedule = subject.classSchedule[selectedIndex];
                              handleSubjectSelect(subject.id, schedule);
                            }
                          }}
                          defaultValue=""
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="" disabled>Select schedule</option>
                          {subject.classSchedule.map((schedule, index) => (
                            <option key={schedule._id || index} value={index}>
                              {schedule.day} • {schedule.startTime} - {schedule.endTime}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-gray-500 italic">
                        No schedule available
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowSubjectModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-200 rounded transition-colors"
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
              <p className="text-xs text-gray-500 mt-1">Select a student from the list or type roll number</p>
            </div>
            <div className="p-6 space-y-4">
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
                    ipAddress: ''
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
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  manualAttendanceForm.studentName && manualAttendanceForm.rollNo && manualAttendanceForm.discipline
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
                        <p className="font-medium text-gray-700">Current Course</p>
                        <p className="text-gray-900">{selectedStudent.title}</p>
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
                                <th
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleModalSort('date')}
                                >
                                  <div className="flex items-center space-x-1">
                                    <FiCalendar className="w-3 h-3" />
                                    <span>Date</span>
                                    {getModalSortIcon('date')}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleModalSort('day')}
                                >
                                  <div className="flex items-center space-x-1">
                                    <span>Day</span>
                                    {getModalSortIcon('day')}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleModalSort('time')}
                                >
                                  <div className="flex items-center space-x-1 justify-center">
                                    <FiClock className="w-3 h-3" />
                                    <span>Time</span>
                                    {getModalSortIcon('time')}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleModalSort('title')}
                                >
                                  <div className="flex items-center space-x-1 justify-center">
                                    <FiBookOpen className="w-3 h-3" />
                                    <span>Course</span>
                                    {getModalSortIcon('title')}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleModalSort('discipline')}
                                >
                                  <div className="flex items-center space-x-1 justify-center">
                                    <FiBookOpen className="w-3 h-3" />
                                    <span>Discipline</span>
                                    {getModalSortIcon('discipline')}
                                  </div>
                                </th>
                                <th
                                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  <div className="flex items-center space-x-1 justify-center">
                                    <span>Status</span>
                                  </div>
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
                                    {record.title}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
                                    {record.discipline || 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      record.time ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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