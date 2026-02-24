import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import {
  FiPlus,
  FiEdit2,
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
  FiUpload
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import {
  getSubjectsByUser,
  createSubject,
  updateSubject,
  deleteSubject,
  resetSubjectAttendance
} from '../../store/Teacher-Slicer/Subject-Slicer.js'

const TeacherSubjects_Page = () => {
  const dispatch = useDispatch()
  const { subjects, isLoading, currentSubject } = useSelector((state) => state.teacherSubject)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showViewStudentsModal, setShowViewStudentsModal] = useState(false)
  const [showImportStudentsModal, setShowImportStudentsModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [subjectsPerPage] = useState(5)
  
  // For imported students data
  const [importedStudents, setImportedStudents] = useState([])
  const [isUploading, setIsUploading] = useState(false)

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
      subject.subjectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.departmentOffering?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.session?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.creditHours?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleCreateSubject = async (e) => {
    e.preventDefault()

    if (!subjectForm.subjectTitle || !subjectForm.departmentOffering || !subjectForm.session || !subjectForm.creditHours || !subjectForm.subjectCode || !subjectForm.semester) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const formData = {
        ...subjectForm,
        userId: currentUserId
      }

      await dispatch(createSubject(formData)).unwrap()
      setShowCreateModal(false)
      resetForm()
      toast.success('Subject created successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to create subject')
    }
  }

  const handleEditSubject = async (e) => {
    e.preventDefault()

    if (!subjectForm.subjectTitle || !subjectForm.departmentOffering || !subjectForm.session || !subjectForm.creditHours || !subjectForm.subjectCode || !subjectForm.semester) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      await dispatch(updateSubject({
        id: selectedSubject.id,
        formData: subjectForm
      })).unwrap();
      dispatch(getSubjectsByUser(currentUserId)).unwrap();

      setShowEditModal(false)
      resetForm()
      toast.success('Subject updated successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to update subject')
    }
  }

  const handleDeleteSubject = async () => {
    try {
      await dispatch(deleteSubject(selectedSubject.id)).unwrap()
      setShowDeleteModal(false)
      toast.success('Subject deleted successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to delete subject')
    }
  }

  const handleResetSubject = async () => {
    try {
      await dispatch(resetSubjectAttendance(selectedSubject.id)).unwrap()
      setShowResetModal(false)
      toast.success('Subject attendance records cleared successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to reset subject attendance')
    }
  }

  // Handle file upload for Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Extract only Registration No and Student Name
        const students = jsonData.map(row => ({
          registrationNo: row['Registration No'] || row['registrationNo'] || row['Registration'] || '',
          studentName: row['Student Name'] || row['studentName'] || row['Name'] || row['name'] || ''
        })).filter(student => student.registrationNo && student.studentName);

        setImportedStudents(students);
        toast.success(`${students.length} students imported successfully!`);
      } catch (error) {
        toast.error('Error parsing Excel file. Please check the format.');
        console.error('Error parsing Excel:', error);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
    // Clear the input
    e.target.value = '';
  };

  // Handle insert students
  const handleInsertStudents = () => {
    if (importedStudents.length === 0) {
      toast.error('No students to insert');
      return;
    }
    
    console.log('Imported Students Array:', importedStudents);
    toast.success(`${importedStudents.length} students logged to console!`);
    
    // You can add API call here to save students
    // For now, we'll just close the modal after logging
    setShowImportStudentsModal(false);
    setImportedStudents([]);
  };

  // Sample registered students data (replace with actual data from API)
  const getRegisteredStudents = (subjectId) => {
    // This is sample data - replace with actual API call
    return [
      { registrationNo: '2024-CS-001', studentName: 'John Doe' },
      { registrationNo: '2024-CS-002', studentName: 'Jane Smith' },
      { registrationNo: '2024-CS-003', studentName: 'Mike Johnson' },
      { registrationNo: '2024-CS-004', studentName: 'Sarah Williams' },
      { registrationNo: '2024-CS-005', studentName: 'David Brown' },
    ];
  };

  const openCreateModal = () => {
    resetForm()
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

  const openViewStudentsModal = (subject) => {
    setSelectedSubject(subject);
    setShowViewStudentsModal(true);
  }

  const openImportStudentsModal = (subject) => {
    setSelectedSubject(subject);
    setImportedStudents([]);
    setShowImportStudentsModal(true);
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

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

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
        {/* Quick Stats - Light and Clean */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
              New Courses
            </button>
          </div>
        </div>

        {/* Subjects Table - Clean */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
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
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
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
                    <tr key={subject._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 font-medium text-sm shrink-0">
                            {subject.title?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {subject.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subject.session}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-mono">
                          {subject.departmentOffering}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-mono">
                          {subject.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {subject.semester}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {formatDate(subject.createdAt)}
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
                            onClick={() => openViewStudentsModal(subject)}
                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                            title="View Registered Students"
                          >
                            <FiUsers className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openImportStudentsModal(subject)}
                            className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                            title="Import Students"
                          >
                            <FiUpload className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(subject)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Subject"
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
                            title="Delete Subject"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <div className="text-gray-500">
                        <FiBook className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">No subjects found</p>
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

          {/* Simple Pagination */}
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
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
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
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Department Offering the Course *
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
                    placeholder="e.g., 2 + 0"
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
              <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
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
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
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
                    placeholder="e.g., 2nd"
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
                    placeholder="e.g., 2nd"
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
              <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
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
                This action cannot be undone.
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
                This will permanently delete all attendance data.
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

      {/* View Students Modal */}
      {showViewStudentsModal && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">
                Registered Students - {selectedSubject.title}
              </h3>
              <button
                onClick={() => setShowViewStudentsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Course Code: <span className="font-medium">{selectedSubject.code}</span> | 
                  Semester: <span className="font-medium">{selectedSubject.semester}</span> | 
                  Session: <span className="font-medium">{selectedSubject.session}</span>
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Registration No</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getRegisteredStudents(selectedSubject.id).map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-mono">{student.registrationNo}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{student.studentName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowViewStudentsModal(false)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Students Modal */}
      {showImportStudentsModal && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">
                Import Students - {selectedSubject.title}
              </h3>
              <button
                onClick={() => {
                  setShowImportStudentsModal(false);
                  setImportedStudents([]);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Upload Excel file with columns:
                </p>
                <div className="flex items-center space-x-3">
                  <label className="relative">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className={`px-4 py-2 ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white text-sm rounded-md cursor-pointer transition-colors flex items-center`}>
                      <FiUpload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Upload Excel'}
                    </div>
                  </label>
                  {importedStudents.length > 0 && (
                    <span className="text-sm text-green-600">
                      {importedStudents.length} students loaded
                    </span>
                  )}
                </div>
              </div>

              {importedStudents.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Imported Students Preview:</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Registration No</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {importedStudents.map((student, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-600">{index + 1}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 font-mono">{student.registrationNo}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{student.studentName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowImportStudentsModal(false);
                  setImportedStudents([]);
                }}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertStudents}
                disabled={importedStudents.length === 0}
                className={`px-3 py-1.5 text-xs rounded-md font-medium ${
                  importedStudents.length > 0
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Insert {importedStudents.length > 0 ? `(${importedStudents.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherSubjects_Page