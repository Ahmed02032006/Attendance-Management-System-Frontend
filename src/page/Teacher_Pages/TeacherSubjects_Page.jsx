import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import {
  FiPlus,
  FiTrash2,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiRefreshCcw,
  FiBook,
  FiLayers,
  FiCalendar,
  FiClock,
  FiUsers,
  FiUpload,
  FiUserMinus,
  FiDownload,
  FiFileText,
  FiInfo,
  FiAlertCircle,
  FiUserPlus,
  FiSave,
  FiXCircle,
  FiCheckCircle,
  FiDownloadCloud,
  FiUploadCloud,
  FiTable,
  FiChevronDown,
  FiArrowDown
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import {
  getSubjectsByUser,
  createSubject,
  updateSubject,
  deleteSubject,
  resetSubjectAttendance,
  getRegisteredStudents,
  addRegisteredStudents,
  deleteRegisteredStudent,
  deleteAllRegisteredStudents,
  updateRegisteredStudent
} from '../../store/Teacher-Slicer/Subject-Slicer.js'

const TeacherSubjects_Page = () => {
  const dispatch = useDispatch()
  const { subjects, isLoading, registeredStudents, studentsLoading } = useSelector((state) => state.teacherSubject)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showStudentManagementModal, setShowStudentManagementModal] = useState(false)
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [subjectsPerPage] = useState(5)
  const [activeStudentTab, setActiveStudentTab] = useState('view')

  // For class schedule with time picker interface
  const [classSchedule, setClassSchedule] = useState([])
  const [currentSchedule, setCurrentSchedule] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30'
  })

  // Time options
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = ['00', '15', '30', '45'] // 15-minute intervals for more flexibility

  // For imported students data
  const [importedStudents, setImportedStudents] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // For individual student addition
  const [individualStudent, setIndividualStudent] = useState({
    registrationNo: '',
    studentName: '',
    discipline: ''
  })
  const [isAddingStudent, setIsAddingStudent] = useState(false)

  // For editing student
  const [editingStudent, setEditingStudent] = useState(null)
  const [editFormData, setEditFormData] = useState({
    registrationNo: '',
    studentName: '',
    discipline: ''
  })
  const [isEditingStudent, setIsEditingStudent] = useState(false)

  const [subjectForm, setSubjectForm] = useState({
    subjectTitle: '',
    departmentOffering: '',
    subjectCode: '',
    status: 'Active',
    semester: '',
    creditHours: '',
    session: '',
    userId: ''
  })

  const { user } = useSelector((state) => state.auth)
  const currentUserId = user?.id

  useEffect(() => {
    if (currentUserId) {
      dispatch(getSubjectsByUser(currentUserId)).unwrap();
    }
  }, [dispatch, currentUserId])

  // Filter subjects
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch =
      subject.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.departmentOffering?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.session?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.creditHours?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.semester?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = statusFilter === 'All' || subject.status === statusFilter

    return matchesSearch && matchesFilter
  })

  // Pagination
  const indexOfLastSubject = currentPage * subjectsPerPage
  const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage
  const currentSubjects = filteredSubjects.slice(indexOfFirstSubject, indexOfLastSubject)
  const totalPages = Math.ceil(filteredSubjects.length / subjectsPerPage)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSubjectForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Class schedule handlers with time picker
  const handleScheduleChange = (e) => {
    const { name, value } = e.target
    setCurrentSchedule(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const incrementHour = (field) => {
    setCurrentSchedule(prev => {
      const currentHour = parseInt(prev[field])
      const newHour = currentHour === 23 ? 0 : currentHour + 1
      return {
        ...prev,
        [field]: newHour.toString().padStart(2, '0')
      }
    })
  }

  const decrementHour = (field) => {
    setCurrentSchedule(prev => {
      const currentHour = parseInt(prev[field])
      const newHour = currentHour === 0 ? 23 : currentHour - 1
      return {
        ...prev,
        [field]: newHour.toString().padStart(2, '0')
      }
    })
  }

  const incrementMinute = (field) => {
    setCurrentSchedule(prev => {
      const currentMinute = parseInt(prev[field])
      const currentIndex = minutes.indexOf(currentMinute.toString().padStart(2, '0'))
      const nextIndex = (currentIndex + 1) % minutes.length
      return {
        ...prev,
        [field]: minutes[nextIndex]
      }
    })
  }

  const decrementMinute = (field) => {
    setCurrentSchedule(prev => {
      const currentMinute = parseInt(prev[field])
      const currentIndex = minutes.indexOf(currentMinute.toString().padStart(2, '0'))
      const prevIndex = (currentIndex - 1 + minutes.length) % minutes.length
      return {
        ...prev,
        [field]: minutes[prevIndex]
      }
    })
  }

  // Function to check if schedule already exists for the same day and time
  const isScheduleDuplicate = (day, startTime, endTime) => {
    return classSchedule.some(schedule =>
      schedule.day === day &&
      schedule.startTime === startTime &&
      schedule.endTime === endTime
    );
  };

  // Function to check if time overlaps with existing schedules on the same day
  const isTimeOverlapping = (day, startTime, endTime) => {
    // Convert times to minutes for comparison
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

    return classSchedule.some(schedule => {
      if (schedule.day !== day) return false;

      const existingStart = parseInt(schedule.startTime.split(':')[0]) * 60 + parseInt(schedule.startTime.split(':')[1]);
      const existingEnd = parseInt(schedule.endTime.split(':')[0]) * 60 + parseInt(schedule.endTime.split(':')[1]);

      // Check for any overlap
      return (startMinutes < existingEnd && endMinutes > existingStart);
    });
  };

  const addSchedule = () => {
    if (!currentSchedule.startTime || !currentSchedule.endTime) {
      toast.error('Please select both start and end time')
      return false
    }

    // Validate that end time is after start time
    if (currentSchedule.startTime >= currentSchedule.endTime) {
      toast.error('End time must be after start time')
      return false
    }

    // Check for exact duplicate
    if (isScheduleDuplicate(currentSchedule.day, currentSchedule.startTime, currentSchedule.endTime)) {
      toast.error('This schedule already exists for the selected day')
      return false
    }

    // Check for time overlap
    if (isTimeOverlapping(currentSchedule.day, currentSchedule.startTime, currentSchedule.endTime)) {
      toast.error('This time overlaps with an existing schedule on the same day')
      return false
    }

    // Format times to ensure proper HH:MM format with leading zeros
    const formattedSchedule = {
      day: currentSchedule.day,
      startTime: currentSchedule.startTime,
      endTime: currentSchedule.endTime
    }

    setClassSchedule(prev => [...prev, formattedSchedule])

    // Reset to default values
    setCurrentSchedule({
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30'
    })

    toast.success('Schedule added successfully!')
    return true
  }

  const removeSchedule = (index) => {
    setClassSchedule(prev => prev.filter((_, i) => i !== index))
  }

  // Format schedule for display
  const formatSchedule = (schedules) => {
    if (!schedules || schedules.length === 0) return 'No schedule';

    // Function to convert 24-hour time to 12-hour format
    const convertTo12Hour = (time) => {
      const [hour, minute] = time.split(':');
      const hourInt = parseInt(hour);
      const ampm = hourInt >= 12 ? 'PM' : 'AM';
      const hour12 = hourInt % 12 || 12;
      return `${hour12}:${minute} ${ampm}`;
    };

    // Group by day
    const grouped = schedules.reduce((acc, curr) => {
      if (!acc[curr.day]) {
        acc[curr.day] = [];
      }
      // Convert times to 12-hour format
      const startTime12 = convertTo12Hour(curr.startTime);
      const endTime12 = convertTo12Hour(curr.endTime);
      acc[curr.day].push(`${startTime12} - ${endTime12}`);
      return acc;
    }, {});

    // Format each day's schedules with full day names
    return Object.entries(grouped).map(([day, times]) => (
      <div key={day} className="text-xs">
        <span className="font-medium">{day}:</span> {times.join(', ')}
      </div>
    ));
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault()

    if (!subjectForm.subjectTitle || !subjectForm.departmentOffering || !subjectForm.session ||
      !subjectForm.creditHours || !subjectForm.subjectCode || !subjectForm.semester) {
      toast.error('Please fill all required fields')
      return
    }

    // Check if at least one schedule is added (mandatory)
    if (classSchedule.length === 0) {
      toast.error('Please add at least one class schedule')
      return
    }

    try {
      const formData = {
        ...subjectForm,
        userId: currentUserId,
        registeredStudents: [],
        classSchedule: classSchedule
      }

      await dispatch(createSubject(formData)).unwrap()
      setShowCreateModal(false)
      resetForm()
      setClassSchedule([])
      toast.success('Course created successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to create course')
    }
  }

  const handleEditSubject = async (e) => {
    e.preventDefault()

    if (!subjectForm.subjectTitle || !subjectForm.departmentOffering || !subjectForm.session ||
      !subjectForm.creditHours || !subjectForm.subjectCode || !subjectForm.semester) {
      toast.error('Please fill all required fields')
      return
    }

    // Check if at least one schedule is added (mandatory)
    if (classSchedule.length === 0) {
      toast.error('Please add at least one class schedule')
      return
    }

    try {
      const formData = {
        ...subjectForm,
        classSchedule: classSchedule
      }

      await dispatch(updateSubject({
        id: selectedSubject.id,
        formData: formData
      })).unwrap();

      setShowEditModal(false)
      resetForm()
      setClassSchedule([])
      toast.success('Course updated successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to update course')
    }
  }

  const handleDeleteSubject = async () => {
    try {
      await dispatch(deleteSubject(selectedSubject.id)).unwrap()
      setShowDeleteModal(false)
      toast.success('Course deleted successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to delete course')
    }
  }

  const handleResetSubject = async () => {
    try {
      await dispatch(resetSubjectAttendance(selectedSubject.id)).unwrap()
      setShowResetModal(false)
      toast.success('Course attendance records cleared successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to reset course attendance')
    }
  }

  // Download dummy Excel file
  const downloadDummyExcel = () => {
    const dummyData = [
      {
        'Registration No': '25FA-001-BCS',
        'Student Name': 'John Doe',
        'Discipline': 'BCS'
      },
      {
        'Registration No': '25FA-002-BCS',
        'Student Name': 'Jane Smith',
        'Discipline': 'BCS'
      },
      {
        'Registration No': '25FA-003-BSE',
        'Student Name': 'Alice Johnson',
        'Discipline': 'BSE'
      },
      {
        'Registration No': '25FA-004-BCS',
        'Student Name': 'Bob Williams',
        'Discipline': 'BCS'
      },
      {
        'Registration No': '25FA-005-BEE',
        'Student Name': 'Charlie Brown',
        'Discipline': 'BEE'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(dummyData);
    ws['!cols'] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'student_import_template.xlsx');
    toast.success('Dummy template downloaded successfully!');
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload({ target: { files: [files[0]] } });
    }
  };

  // Handle file upload for Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.xlsx', '.xls', '.csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    const fileType = file.name.split('.').pop().toLowerCase();

    if (!['xlsx', 'xls', 'csv'].includes(fileType)) {
      toast.error('Please upload a valid Excel or CSV file');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const students = jsonData.map(row => ({
          registrationNo: row['Registration No'] || row['registrationNo'] || row['Registration'] || '',
          studentName: row['Student Name'] || row['studentName'] || row['Name'] || row['name'] || '',
          discipline: row['Discipline'] || row['discipline'] || ''
        })).filter(student => student.registrationNo && student.studentName && student.discipline);

        setImportedStudents(students);
        toast.success(
          <div>
            <div className="font-medium">{students.length} students imported successfully!</div>
            {students.length === 0 && (
              <div className="text-xs mt-1">Make sure your file has 'Registration No', 'Student Name', and 'Discipline' columns</div>
            )}
          </div>
        );
      } catch (error) {
        toast.error('Error parsing Excel file. Please check the format.');
        console.error('Error parsing Excel:', error);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Handle insert students from Excel
  const handleInsertStudents = async () => {
    if (importedStudents.length === 0) {
      toast.error('No students to insert');
      return;
    }

    try {
      await dispatch(addRegisteredStudents({
        subjectId: selectedSubject.id,
        teacherId: currentUserId,
        students: importedStudents
      })).unwrap();

      toast.success(
        <div>
          <div className="font-medium">{importedStudents.length} students added successfully!</div>
          <div className="text-xs mt-1">You can now view them in the students list</div>
        </div>
      );
      setImportedStudents([]);
      setActiveStudentTab('view');

      await dispatch(getRegisteredStudents({
        subjectId: selectedSubject.id,
        teacherId: currentUserId
      }));
    } catch (error) {
      toast.error(error?.message || 'Failed to add students');
    }
  };

  // Clear imported students
  const clearImportedStudents = () => {
    setImportedStudents([]);
    toast.info('Imported list cleared');
  };

  // Handle individual student input change
  const handleIndividualStudentChange = (e) => {
    const { name, value } = e.target;
    setIndividualStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add individual student
  const handleAddIndividualStudent = async () => {
    // Validate inputs
    if (!individualStudent.registrationNo.trim()) {
      toast.error('Please enter registration number');
      return;
    }
    if (!individualStudent.studentName.trim()) {
      toast.error('Please enter student name');
      return;
    }
    if (!individualStudent.discipline.trim()) {
      toast.error('Please enter student discipline');
      return;
    }

    // Check for duplicates in current list
    const isDuplicate = registeredStudents?.registeredStudents?.some(
      student => student.registrationNo.toLowerCase() === individualStudent.registrationNo.toLowerCase()
    );

    if (isDuplicate) {
      toast.error('Student with this registration number already exists');
      return;
    }

    setIsAddingStudent(true);

    try {
      await dispatch(addRegisteredStudents({
        subjectId: selectedSubject.id,
        teacherId: currentUserId,
        students: [{
          registrationNo: individualStudent.registrationNo.trim(),
          studentName: individualStudent.studentName.trim(),
          discipline: individualStudent.discipline.trim()
        }]
      })).unwrap();

      toast.success('Student added successfully!');

      // Clear form
      setIndividualStudent({
        registrationNo: '',
        studentName: '',
        discipline: ''
      });

      // Refresh students list
      await dispatch(getRegisteredStudents({
        subjectId: selectedSubject.id,
        teacherId: currentUserId
      }));
    } catch (error) {
      toast.error(error?.message || 'Failed to add student');
    } finally {
      setIsAddingStudent(false);
    }
  };

  // Handle edit student - start editing
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setEditFormData({
      registrationNo: student.registrationNo,
      studentName: student.studentName,
      discipline: student.discipline || ''
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditFormData({
      registrationNo: '',
      studentName: '',
      discipline: ''
    });
  };

  // Handle edit form input change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    // Validate inputs
    if (!editFormData.registrationNo.trim()) {
      toast.error('Please enter registration number');
      return;
    }
    if (!editFormData.studentName.trim()) {
      toast.error('Please enter student name');
      return;
    }
    if (!editFormData.discipline.trim()) {
      toast.error('Please enter student discipline');
      return;
    }

    // Check for duplicates (excluding current student)
    const isDuplicate = registeredStudents?.registeredStudents?.some(
      student => student._id !== editingStudent._id &&
        student.registrationNo.toLowerCase() === editFormData.registrationNo.toLowerCase()
    );

    if (isDuplicate) {
      toast.error('Student with this registration number already exists');
      return;
    }

    setIsEditingStudent(true);

    try {
      await dispatch(updateRegisteredStudent({
        subjectId: selectedSubject.id,
        studentId: editingStudent._id,
        teacherId: currentUserId,
        studentData: {
          registrationNo: editFormData.registrationNo.trim(),
          studentName: editFormData.studentName.trim(),
          discipline: editFormData.discipline.trim()
        }
      })).unwrap();

      toast.success('Student updated successfully!');

      // Clear edit state
      setEditingStudent(null);
      setEditFormData({
        registrationNo: '',
        studentName: '',
        discipline: ''
      });

      // Refresh students list
      await dispatch(getRegisteredStudents({
        subjectId: selectedSubject.id,
        teacherId: currentUserId
      }));
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error?.message || 'Failed to update student');
    } finally {
      setIsEditingStudent(false);
    }
  };

  // Handle delete registered student
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) {
      return;
    }

    try {
      await dispatch(deleteRegisteredStudent({
        subjectId: selectedSubject.id,
        studentId: studentId,
        teacherId: currentUserId
      })).unwrap();

      toast.success('Student removed successfully!');

      dispatch(getRegisteredStudents({
        subjectId: selectedSubject.id,
        teacherId: currentUserId
      }));
    } catch (error) {
      toast.error(error?.message || 'Failed to delete student');
    }
  };

  // Open delete all confirmation modal
  const openDeleteAllModal = () => {
    setShowDeleteAllModal(true);
  };

  // Handle delete all registered students
  const handleDeleteAllStudents = async () => {
    if (!selectedSubject) return;

    try {
      await dispatch(deleteAllRegisteredStudents({
        subjectId: selectedSubject.id,
        teacherId: currentUserId
      })).unwrap();

      toast.success('All students deleted successfully!');
      setShowDeleteAllModal(false);

      await dispatch(getRegisteredStudents({
        subjectId: selectedSubject.id,
        teacherId: currentUserId
      }));
    } catch (error) {
      console.error('Delete all students error:', error);
      toast.error(error?.message || 'Failed to delete students');
      setShowDeleteAllModal(false);
    }
  };

  // Handle student management
  const handleStudentManagement = async (subject) => {
    setSelectedSubject(subject);
    setActiveStudentTab('view');
    setImportedStudents([]);
    setIndividualStudent({
      registrationNo: '',
      studentName: '',
      discipline: ''
    });
    setEditingStudent(null);

    try {
      await dispatch(getRegisteredStudents({
        subjectId: subject.id,
        teacherId: currentUserId
      })).unwrap();

      setShowStudentManagementModal(true);
    } catch (error) {
      toast.error(error?.message || 'Failed to fetch registered students');
    }
  };

  const openCreateModal = () => {
    resetForm()
    setClassSchedule([])
    setCurrentSchedule({
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30'
    })
    setShowCreateModal(true)
  }

  const openEditModal = (subject) => {
    setSelectedSubject(subject)
    setSubjectForm({
      subjectTitle: subject.title,
      departmentOffering: subject.departmentOffering,
      subjectCode: subject.code,
      semester: subject.semester,
      creditHours: subject.creditHours,
      session: subject.session,
      status: subject.status,
      userId: subject.userId
    })
    setClassSchedule(subject.classSchedule || [])
    setCurrentSchedule({
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30'
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (subject) => {
    setSelectedSubject(subject)
    setShowDeleteModal(true)
  }

  const openResetModal = (subject) => {
    setSelectedSubject(subject)
    setShowResetModal(true)
  }

  const resetForm = () => {
    setSubjectForm({
      subjectTitle: '',
      departmentOffering: '',
      subjectCode: '',
      semester: '',
      session: '',
      creditHours: '',
      status: 'Active',
      userId: ''
    })
    setSelectedSubject(null)
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

  // Get status color
  const getStatusColor = (status) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiLayers className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading Courses...</p>
          <p className="mt-2 text-sm text-gray-500">Preparing courses assigned to you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent
        heading="Courses Management"
        subHeading="Create and manage your registered courses"
        role='admin'
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{subjects.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FiBook className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Courses</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {subjects.filter(s => s.status === 'Active').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FiEdit className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Semesters</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {new Set(subjects.map(s => s.semester)).size}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <FiCalendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {subjects.reduce((acc, s) => acc + (s.registeredStudentsCount || 0), 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <FiUsers className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              onClick={openCreateModal}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors flex items-center whitespace-nowrap disabled:opacity-50"
            >
              <FiPlus className="h-4 w-4 mr-1.5" />
              New Course
            </button>
          </div>
        </div>

        {/* Subjects Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discipline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Schedule
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentSubjects.length > 0 ? (
                  currentSubjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 ${subject.color || 'bg-blue-500'} rounded-md flex items-center justify-center text-white font-medium text-sm shrink-0`}>
                            {subject.title?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {subject.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subject.session} | {subject.creditHours} Cr
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {subject.departmentOffering}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-mono">
                          {subject.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">
                          {subject.semester}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 space-y-0.5">
                          {formatSchedule(subject.classSchedule)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">
                          {subject.registeredStudentsCount || 0}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subject.status)}`}>
                          {subject.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleStudentManagement(subject)}
                            className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                            title="Manage Students"
                          >
                            <FiUsers className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(subject)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Course"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openResetModal(subject)}
                            className="p-1.5 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                            title="Reset Attendance"
                          >
                            <FiRefreshCcw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(subject)}
                            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Course"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center">
                      <div className="text-gray-500">
                        <FiBook className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">No courses found</p>
                        {searchTerm && (
                          <p className="text-xs text-gray-400 mt-1">
                            Try adjusting your search
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredSubjects.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Showing {indexOfFirstSubject + 1}-{Math.min(indexOfLastSubject, filteredSubjects.length)} of {filteredSubjects.length}
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

      {/* Create Subject Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-base font-medium text-gray-900">Create New Course</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubject}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="subjectTitle"
                    value={subjectForm.subjectTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Class Schedule Section - Enhanced UI */}
                <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50/30 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiClock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-800">
                          Class Schedule <span className="text-red-500 ml-1">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">Add your course timing slots</p>
                      </div>
                    </div>
                    {classSchedule.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200 shadow-xs">
                          {classSchedule.length} {classSchedule.length === 1 ? 'slot' : 'slots'} added
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Schedule Input Card */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-xs">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      {/* Day Selection */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Day
                        </label>
                        <div className="relative">
                          <select
                            name="day"
                            value={currentSchedule.day}
                            onChange={handleScheduleChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                          >
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <FiChevronDown className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Start Time */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Start Time
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            name="startTime"
                            value={currentSchedule.startTime}
                            onChange={handleScheduleChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            step="1800"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <FiClock className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          End Time
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            name="endTime"
                            value={currentSchedule.endTime}
                            onChange={handleScheduleChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            step="1800"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <FiClock className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Add Button */}
                      <div>
                        <button
                          type="button"
                          onClick={addSchedule}
                          className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <FiPlus className="h-4 w-4" />
                          Add Slot
                        </button>
                      </div>
                    </div>

                    {/* Time Format Hint */}
                    <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        24-hour format
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        No overlapping allowed
                      </span>
                    </div>
                  </div>

                  {/* Schedule List - Enhanced Display */}
                  {classSchedule.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Added Schedules
                        </h4>
                        <span className="text-[10px] text-gray-400">Click × to remove</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {classSchedule.map((schedule, index) => {
                          // Format time to 12-hour for better display
                          const formatTime12 = (time) => {
                            const [hour, minute] = time.split(':');
                            const h = parseInt(hour);
                            const ampm = h >= 12 ? 'PM' : 'AM';
                            const h12 = h % 12 || 12;
                            return `${h12}:${minute} ${ampm}`;
                          };

                          return (
                            <div
                              key={index}
                              className="group relative bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                  {/* Day Icon */}
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-blue-700">
                                      {schedule.day.substring(0, 3)}
                                    </span>
                                  </div>

                                  {/* Time Info */}
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-medium text-gray-700">
                                        {formatTime12(schedule.startTime)}
                                      </span>
                                      <span className="text-gray-300">→</span>
                                      <span className="text-xs font-medium text-gray-700">
                                        {formatTime12(schedule.endTime)}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {schedule.day}
                                      </span>
                                      <span className="text-[10px] text-gray-400">
                                        {Math.round(
                                          (new Date(`2000-01-01T${schedule.endTime}`) -
                                            new Date(`2000-01-01T${schedule.startTime}`)) / 60000
                                        )} mins
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={() => removeSchedule(index)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-md"
                                  title="Remove schedule"
                                >
                                  <FiX className="h-4 w-4 text-gray-400 hover:text-red-500" />
                                </button>
                              </div>

                              {/* Duration Bar */}
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiClock className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">No schedules added yet</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-[250px] mx-auto">
                        Add your first class schedule using the form above
                      </p>
                      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-300">
                        <span>Monday 09:00</span>
                        <span>→</span>
                        <span>Friday 14:30</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Discipline *
                  </label>
                  <input
                    type="text"
                    name="departmentOffering"
                    value={subjectForm.departmentOffering}
                    onChange={handleInputChange}
                    placeholder="e.g., CET, SET"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    name="subjectCode"
                    value={subjectForm.subjectCode}
                    onChange={handleInputChange}
                    placeholder="e.g., MATH101"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Semester *
                  </label>
                  <input
                    type="text"
                    name="semester"
                    value={subjectForm.semester}
                    onChange={handleInputChange}
                    placeholder="e.g., 2nd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Credit Hours *
                  </label>
                  <input
                    type="text"
                    name="creditHours"
                    value={subjectForm.creditHours}
                    onChange={handleInputChange}
                    placeholder="e.g., 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Session *
                  </label>
                  <input
                    type="text"
                    name="session"
                    value={subjectForm.session}
                    onChange={handleInputChange}
                    placeholder="e.g., Fall 2026"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 font-medium"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-base font-medium text-gray-900">Edit Course</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubject}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="subjectTitle"
                    value={subjectForm.subjectTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Class Schedule Section */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <FiClock className="h-4 w-4 mr-1.5 text-gray-500" />
                      Class Schedule <span className="text-red-500 ml-1">*</span>
                    </label>
                    {classSchedule.length > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        {classSchedule.length} added
                      </span>
                    )}
                  </div>

                  {/* Input Row */}
                  <div className="flex gap-2 mb-3">
                    <select
                      name="day"
                      value={currentSchedule.day}
                      onChange={handleScheduleChange}
                      className="w-28 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="Monday">Mon</option>
                      <option value="Tuesday">Tue</option>
                      <option value="Wednesday">Wed</option>
                      <option value="Thursday">Thu</option>
                      <option value="Friday">Fri</option>
                      <option value="Saturday">Sat</option>
                      <option value="Sunday">Sun</option>
                    </select>

                    <input
                      type="time"
                      name="startTime"
                      value={currentSchedule.startTime}
                      onChange={handleScheduleChange}
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      step="1800"
                    />

                    <span className="text-gray-400 self-center">—</span>

                    <input
                      type="time"
                      name="endTime"
                      value={currentSchedule.endTime}
                      onChange={handleScheduleChange}
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      step="1800"
                    />

                    <button
                      type="button"
                      onClick={addSchedule}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center"
                      title="Add schedule"
                    >
                      <FiPlus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Schedule List */}
                  {classSchedule.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {classSchedule.map((schedule, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-sm">
                          <span>
                            <span className="font-medium w-8 inline-block">{schedule.day.substring(0, 3)}</span>
                            <span className="text-gray-600">{schedule.startTime} - {schedule.endTime}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSchedule(index)}
                            className="text-gray-400 hover:text-red-500"
                            title="Remove schedule"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {classSchedule.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No schedules added</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Discipline *
                  </label>
                  <input
                    type="text"
                    name="departmentOffering"
                    value={subjectForm.departmentOffering}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    name="subjectCode"
                    value={subjectForm.subjectCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Semester *
                  </label>
                  <input
                    type="text"
                    name="semester"
                    value={subjectForm.semester}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Credit Hours *
                  </label>
                  <input
                    type="text"
                    name="creditHours"
                    value={subjectForm.creditHours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Session *
                  </label>
                  <input
                    type="text"
                    name="session"
                    value={subjectForm.session}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={subjectForm.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 font-medium"
                >
                  Update Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Delete Course</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete{' '}
                <span className="font-bold text-gray-900">"{selectedSubject?.title}"</span>?
              </p>
              <p className="text-xs text-red-600 mt-2">
                This will delete all associated students and attendance records.
              </p>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubject}
                className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Subject Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Reset Attendance</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">
                Clear all attendance records for{' '}
                <span className="font-medium text-gray-900">"{selectedSubject?.title}"</span>?
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                This will permanently delete all attendance data but keep registered students.
              </p>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleResetSubject}
                className="px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-md hover:bg-yellow-700 font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Delete All Students</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FiAlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Are you sure you want to delete all{' '}
                <span className="font-bold text-red-600">{registeredStudents?.registeredStudents?.length || 0}</span>{' '}
                students from <span className="font-semibold">"{selectedSubject.title}"</span>?
              </p>
              <p className="text-xs text-red-500 text-center mt-3">
                This action cannot be undone!
              </p>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllStudents}
                className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 font-medium flex items-center"
              >
                <FiTrash2 className="h-3 w-3 mr-1" />
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merged Student Management Modal */}
      {showStudentManagementModal && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiUsers className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Manage Students</h3>
                    <p className="text-sm text-gray-500">
                      {selectedSubject.title} • {selectedSubject.code} • Sem {selectedSubject.semester} • {selectedSubject.session}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowStudentManagementModal(false);
                    setImportedStudents([]);
                    setIndividualStudent({ registrationNo: '', studentName: '', discipline: '' });
                    setEditingStudent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 px-6">
              <button
                onClick={() => {
                  setActiveStudentTab('view');
                  setImportedStudents([]);
                  setIndividualStudent({ registrationNo: '', studentName: '', discipline: '' });
                  setEditingStudent(null);
                }}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeStudentTab === 'view'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <FiUsers className="h-4 w-4 inline mr-2" />
                View Students ({selectedSubject.registeredStudentsCount || 0})
              </button>
              <button
                onClick={() => {
                  setActiveStudentTab('import');
                  setImportedStudents([]);
                  setEditingStudent(null);
                }}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeStudentTab === 'import'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <FiUpload className="h-4 w-4 inline mr-2" />
                Import Students
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
              {/* View Students Tab - Now with Add Individual Form */}
              {activeStudentTab === 'view' && (
                <div className="h-full flex flex-col">
                  {/* Add Individual Student Form */}
                  <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Simple header */}
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center">
                      <div className="p-1.5 bg-blue-100 rounded-md mr-2">
                        <FiUserPlus className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Quick Add Student
                      </h4>
                    </div>

                    {/* Form */}
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            name="registrationNo"
                            value={individualStudent.registrationNo}
                            onChange={handleIndividualStudentChange}
                            placeholder="Registration Number *"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isAddingStudent}
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            name="studentName"
                            value={individualStudent.studentName}
                            onChange={handleIndividualStudentChange}
                            placeholder="Student Name *"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isAddingStudent}
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            name="discipline"
                            value={individualStudent.discipline}
                            onChange={handleIndividualStudentChange}
                            placeholder="Discipline *"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isAddingStudent}
                          />
                        </div>
                        <div>
                          <button
                            onClick={handleAddIndividualStudent}
                            disabled={isAddingStudent || !individualStudent.registrationNo.trim() || !individualStudent.studentName.trim() || !individualStudent.discipline.trim()}
                            className={`h-full px-4 py-2 text-sm rounded-md font-medium transition-all flex items-center whitespace-nowrap ${isAddingStudent || !individualStudent.registrationNo.trim() || !individualStudent.studentName.trim() || !individualStudent.discipline.trim()
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                              }`}
                          >
                            {isAddingStudent ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Adding...
                              </>
                            ) : (
                              <>
                                <FiUserPlus className="h-4 w-4 mr-2" />
                                Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Simple hint */}
                      <p className="text-xs text-gray-400 mt-2 flex items-center">
                        <FiInfo className="h-3 w-3 mr-1" />
                        Registration number must be unique
                      </p>
                    </div>
                  </div>

                  {/* Students List */}
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Total Registered: <span className="font-semibold">{registeredStudents?.registeredStudents?.length || 0}</span> students
                    </p>

                    {registeredStudents?.registeredStudents?.length > 0 && (
                      <button
                        onClick={openDeleteAllModal}
                        className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-xs font-medium"
                      >
                        <FiTrash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete All ({registeredStudents?.registeredStudents?.length || 0})
                      </button>
                    )}
                  </div>

                  {studentsLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600"></div>
                      <p className="mt-3 text-sm text-gray-500">Loading students...</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden flex-1">
                      <div className="max-h-[200px] overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Registration No</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Discipline</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {registeredStudents?.registeredStudents?.length > 0 ? (
                              registeredStudents.registeredStudents.map((student, index) => (
                                <tr key={student._id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm text-gray-600">{index + 1}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900 font-mono">
                                    {editingStudent && editingStudent._id === student._id ? (
                                      <input
                                        type="text"
                                        name="registrationNo"
                                        value={editFormData.registrationNo}
                                        onChange={handleEditFormChange}
                                        className="w-full px-2 py-1 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        autoFocus
                                      />
                                    ) : (
                                      student.registrationNo
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {editingStudent && editingStudent._id === student._id ? (
                                      <input
                                        type="text"
                                        name="studentName"
                                        value={editFormData.studentName}
                                        onChange={handleEditFormChange}
                                        className="w-full px-2 py-1 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      />
                                    ) : (
                                      student.studentName
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {editingStudent && editingStudent._id === student._id ? (
                                      <input
                                        type="text"
                                        name="discipline"
                                        value={editFormData.discipline}
                                        onChange={handleEditFormChange}
                                        className="w-full px-2 py-1 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      />
                                    ) : (
                                      student.discipline || '-'
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-center">
                                    {editingStudent && editingStudent._id === student._id ? (
                                      <div className="flex items-center justify-center space-x-1">
                                        <button
                                          onClick={handleSaveEdit}
                                          disabled={isEditingStudent}
                                          className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                                          title="Save"
                                        >
                                          <FiSave className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={handleCancelEdit}
                                          disabled={isEditingStudent}
                                          className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                          title="Cancel"
                                        >
                                          <FiXCircle className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center space-x-1">
                                        <button
                                          onClick={() => handleEditStudent(student)}
                                          className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                          title="Edit Student"
                                        >
                                          <FiEdit className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteStudent(student._id)}
                                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                          title="Remove Student"
                                        >
                                          <FiUserMinus className="h-4 w-4" />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                                  <FiUsers className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                  No students registered yet
                                  <p className="text-xs text-gray-400 mt-1">
                                    Use the form above to add students
                                  </p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Import Students Tab - Enhanced Design */}
              {activeStudentTab === 'import' && (
                <div className="h-full flex flex-col">

                  {/* Course Info Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FiBook className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Selected Course</p>
                          <p className="text-sm font-semibold text-gray-800">{selectedSubject.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{selectedSubject.code}</span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">Sem {selectedSubject.semester}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right bg-blue-50 px-4 py-2 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium">Registered</p>
                        <p className="text-xl font-bold text-blue-700 text-center">{selectedSubject.registeredStudentsCount || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Main Upload Section - Modern Card Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Left Column - Upload Area */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                        <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                        Upload File
                      </h4>

                      <div
                        className={`relative border-2 rounded-xl transition-all duration-200 ${dragActive
                          ? 'border-blue-400 bg-blue-50'
                          : importedStudents.length > 0
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploading}
                        />

                        <div className="p-6 text-center">
                          {isUploading ? (
                            <div className="flex flex-col items-center">
                              <div className="relative">
                                <div className="w-14 h-14 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-gray-700 mt-3">Processing file...</p>
                              <p className="text-xs text-gray-400 mt-1">Please wait</p>
                            </div>
                          ) : importedStudents.length > 0 ? (
                            <div className="flex flex-col items-center">
                              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <FiCheckCircle className="h-7 w-7 text-green-600" />
                              </div>
                              <p className="text-sm font-semibold text-gray-800">{importedStudents.length} Students Loaded</p>
                              <p className="text-xs text-gray-500 mt-1">Click or drag to replace</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                                <FiUploadCloud className="h-7 w-7 text-blue-500" />
                              </div>
                              <p className="text-sm font-medium text-gray-700">
                                <span className="text-blue-600 font-semibold">Click to upload</span> or drag & drop
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Excel files (.xlsx, .xls, .csv)
                              </p>
                              <p className="text-[10px] text-gray-300 mt-2">
                                Max file size: 5MB
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Requirements & Template */}
                    <div className="space-y-3">
                      {/* Requirements Card */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                          <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                          File Requirements
                        </h4>

                        <div className="space-y-2.5">
                          <div className="flex items-center">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-green-600 text-[10px] font-bold">✓</span>
                            </div>
                            <span className="text-xs text-gray-600">Column: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 text-[10px] font-medium">Registration No</span></span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-green-600 text-[10px] font-bold">✓</span>
                            </div>
                            <span className="text-xs text-gray-600">Column: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 text-[10px] font-medium">Student Name</span></span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-green-600 text-[10px] font-bold">✓</span>
                            </div>
                            <span className="text-xs text-gray-600">Column: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 text-[10px] font-medium">Discipline</span></span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-yellow-600 text-[10px] font-bold">!</span>
                            </div>
                            <span className="text-xs text-gray-600">All three columns are required</span>
                          </div>
                        </div>
                      </div>

                      {/* Template Card */}
                      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-blue-800 mb-1">Need a template?</h4>
                            <p className="text-[10px] text-blue-600 mb-3">Download our sample file to get started</p>
                          </div>
                          <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                            <FiFileText className="h-4 w-4 text-blue-700" />
                          </div>
                        </div>
                        <button
                          onClick={downloadDummyExcel}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <FiDownload className="h-3.5 w-3.5" />
                          Download Template
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preview Section - Modern Table Design */}
                  {importedStudents.length > 0 && (
                    <div className="mt-3 flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                      {/* Preview Header */}
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-green-100 rounded-md">
                            <FiTable className="h-3.5 w-3.5 text-green-600" />
                          </div>
                          <h4 className="text-xs font-semibold text-gray-700">Preview Import</h4>
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                            {importedStudents.length} students
                          </span>
                        </div>

                        <button
                          onClick={clearImportedStudents}
                          className="flex items-center px-2 py-1 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <FiX className="h-3 w-3 mr-1" />
                          Clear all
                        </button>
                      </div>

                      {/* Preview Table */}
                      <div className="flex-1 overflow-y-auto p-2">
                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">#</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Registration No</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Student Name</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Discipline</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {importedStudents.slice(0, 5).map((student, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-[11px] text-gray-500">{index + 1}</td>
                                  <td className="px-3 py-2 text-[11px] font-mono font-medium text-gray-800">{student.registrationNo}</td>
                                  <td className="px-3 py-2 text-[11px] text-gray-700">{student.studentName}</td>
                                  <td className="px-3 py-2 text-[11px] text-gray-700">{student.discipline}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {importedStudents.length > 5 && (
                            <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 text-[10px] text-gray-400 text-center">
                              +{importedStudents.length - 5} more students
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer with Enhanced Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStudentManagementModal(false);
                  setImportedStudents([]);
                  setIndividualStudent({ registrationNo: '', studentName: '', discipline: '' });
                  setEditingStudent(null);
                }}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              {activeStudentTab === 'import' && (
                <button
                  onClick={handleInsertStudents}
                  disabled={importedStudents.length === 0 || studentsLoading}
                  className={`px-5 py-2 text-xs rounded-lg font-medium transition-all flex items-center shadow-sm ${importedStudents.length > 0 && !studentsLoading
                    ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {studentsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <FiUpload className="h-4 w-4 mr-2" />
                      Import {importedStudents.length > 0 ? `${importedStudents.length} Students` : 'Students'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default TeacherSubjects_Page