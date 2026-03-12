import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX, FiChevronLeft, FiChevronRight, FiUser, FiMail, FiCheck, FiSlash, FiShield, FiUsers, FiClock, FiBookOpen, FiFileText, FiGrid, FiEye, FiCalendar, FiCode, FiMapPin } from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  getTeachersByUser,
  createTeacher,
  updateTeacher,
  deleteTeacher
} from '../../store/Admin-Slicer/Teacher-Slicer.js'

const AdminTeachers_Page = () => {
  const dispatch = useDispatch()

  const { teachers, isLoading } = useSelector((state) => state.adminTeacher)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isTeacherLoading, setIsTeacherLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [showSubjectsModal, setShowSubjectsModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('Teacher')
  const [currentPage, setCurrentPage] = useState(1)
  const [teachersPerPage] = useState(5)

  const [teacherForm, setTeacherForm] = useState({
    userName: '',
    userEmail: '',
    userPassword: '',
    confirmPassword: '',
    status: 'Active'
  })

  // Mock teacher subjects data
  const getTeacherSubjects = (teacher) => {
    if (!teacher) return []

    return [
      {
        id: 1,
        name: 'Advanced Mathematics',
        code: 'MATH-401',
        registeredStudents: 45,
        schedule: 'Monday, Wednesday • 10:00 AM - 11:30 AM',
        room: 'Room 301',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Physics 101',
        code: 'PHYS-101',
        registeredStudents: 38,
        schedule: 'Tuesday, Thursday • 2:00 PM - 3:30 PM',
        room: 'Lab 201',
        createdAt: '2024-01-20T14:15:00Z'
      },
      {
        id: 3,
        name: 'Organic Chemistry',
        code: 'CHEM-202',
        registeredStudents: 32,
        schedule: 'Monday, Wednesday • 2:00 PM - 3:30 PM',
        room: 'Lab 105',
        createdAt: '2024-02-05T09:45:00Z'
      },
      {
        id: 4,
        name: 'Computer Science Fundamentals',
        code: 'CS-101',
        registeredStudents: 52,
        schedule: 'Tuesday, Thursday • 10:00 AM - 11:30 AM',
        room: 'Room 405',
        createdAt: '2024-02-10T11:20:00Z'
      },
      {
        id: 5,
        name: 'English Literature',
        code: 'ENG-202',
        registeredStudents: 28,
        schedule: 'Friday • 9:00 AM - 12:00 PM',
        room: 'Room 203',
        createdAt: '2024-03-01T13:10:00Z'
      }
    ]
  }

  // Enhanced mock audit logs data
  const getMockAuditLogs = (teacher) => {
    if (!teacher) return []

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const threeDaysAgo = new Date(today)
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)
    const twoWeeksAgo = new Date(today)
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    return [
      {
        id: 1,
        action: 'created',
        item: 'course',
        name: 'Advanced Mathematics',
        details: 'Created new course with 45 registered students',
        time: today.toISOString(),
        type: 'create'
      },
      {
        id: 2,
        action: 'created',
        item: 'course',
        name: 'Physics 101',
        details: 'Created new course with 38 registered students',
        time: yesterday.toISOString(),
        type: 'create'
      },
      {
        id: 3,
        action: 'edited',
        item: 'course',
        name: 'Computer Science',
        details: 'Updated course schedule and description',
        time: yesterday.toISOString(),
        type: 'edit'
      },
      {
        id: 4,
        action: 'generated QR',
        item: 'attendance',
        name: 'Physics 101',
        details: 'Generated QR code for Monday 10:00 AM class',
        time: yesterday.toISOString(),
        type: 'qr'
      },
      {
        id: 5,
        action: 'deleted',
        item: 'course',
        name: 'History 101',
        details: 'Permanently removed course from system',
        time: lastWeek.toISOString(),
        type: 'delete'
      },
      {
        id: 6,
        action: 'marked attendance',
        item: 'manual',
        name: 'Chemistry Lab',
        details: 'Manually marked attendance for 8 students',
        time: lastWeek.toISOString(),
        type: 'manual'
      },
      {
        id: 7,
        action: 'generated report',
        item: 'Monthly Attendance',
        name: 'January 2024',
        details: 'Generated comprehensive attendance report',
        time: twoWeeksAgo.toISOString(),
        type: 'report'
      }
    ]
  }

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsTeacherLoading(true);
        await dispatch(getTeachersByUser());
      } catch (error) {
        console.error('Error fetching teachers:', error);
        toast.error('Failed to load teachers');
      } finally {
        setTimeout(() => {
          setIsTeacherLoading(false);
        }, 300);
      }
    };

    fetchTeachers();
  }, [dispatch])

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch =
      teacher.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'All' || teacher.status === statusFilter
    const matchesRole = roleFilter === 'All' || teacher.userRole === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  const canDeleteTeacher = (teacher) => {
    return teacher.userRole !== 'Admin'
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Student':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const indexOfLastTeacher = currentPage * teachersPerPage
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage
  const currentTeachers = filteredTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher)
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTeacherForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStatusToggle = (status) => {
    setTeacherForm(prev => ({
      ...prev,
      status: status
    }))
  }

  const getAvatarLetter = (name) => {
    if (!name) return 'T'
    return name.charAt(0).toUpperCase()
  }

  const handleCreateTeacher = async (e) => {
    e.preventDefault()

    if (!teacherForm.userName || !teacherForm.userEmail || !teacherForm.userPassword || !teacherForm.confirmPassword) {
      toast.error('Please fill all required fields')
      return
    }

    if (teacherForm.userPassword !== teacherForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      const formData = {
        userName: teacherForm.userName,
        userEmail: teacherForm.userEmail,
        userPassword: teacherForm.userPassword,
        userRole: 'Teacher',
        status: 'Active'
      }

      await dispatch(createTeacher(formData)).unwrap()

      setShowCreateModal(false)
      resetForm()
      toast.success('Teacher created successfully!')
    } catch (error) {
      console.error('Create teacher error:', error)
      toast.error(error?.message || error?.data?.message || 'Failed to create teacher')
    }
  }

  const handleEditTeacher = async (e) => {
    e.preventDefault()

    if (!teacherForm.userName || !teacherForm.userEmail) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const formData = {
        userName: teacherForm.userName,
        userEmail: teacherForm.userEmail,
        status: teacherForm.status
      }

      await dispatch(updateTeacher({
        id: selectedTeacher._id,
        formData: formData
      })).unwrap()

      setShowEditModal(false)
      resetForm()
      toast.success('Teacher updated successfully!')
    } catch (error) {
      console.error('Update teacher error:', error)
      toast.error(error?.message || error?.data?.message || 'Failed to update teacher')
    }
  }

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return

    if (!canDeleteTeacher(selectedTeacher)) {
      toast.error('Cannot delete admin users from this page')
      setShowDeleteModal(false)
      return
    }

    try {
      await dispatch(deleteTeacher(selectedTeacher._id)).unwrap()

      setShowDeleteModal(false)
      toast.success('Teacher deleted successfully!')
    } catch (error) {
      console.error('Delete teacher error:', error)
      toast.error(error?.message || error?.data?.message || 'Failed to delete teacher')
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher)
    setTeacherForm({
      userName: teacher.userName || '',
      userEmail: teacher.userEmail || '',
      userPassword: '',
      confirmPassword: '',
      status: teacher.status || 'Active'
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (teacher) => {
    if (!canDeleteTeacher(teacher)) {
      toast.error('Cannot delete admin users')
      return
    }

    setSelectedTeacher(teacher)
    setShowDeleteModal(true)
  }

  const openAuditModal = (teacher) => {
    setSelectedTeacher(teacher)
    setShowAuditModal(true)
  }

  const openSubjectsModal = (teacher) => {
    setSelectedTeacher(teacher)
    setShowSubjectsModal(true)
  }

  const resetForm = () => {
    setTeacherForm({
      userName: '',
      userEmail: '',
      userPassword: '',
      confirmPassword: '',
      status: 'Active'
    })
    setSelectedTeacher(null)
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return new Intl.RelativeTimeFormat('en', {
          numeric: 'auto',
        }).format(-count, interval.label);
      }
    }

    return 'just now';
  }

  const getActionIcon = (type) => {
    switch(type) {
      case 'create':
        return <FiPlus className="h-4 w-4 text-green-600" />
      case 'edit':
        return <FiEdit className="h-4 w-4 text-blue-600" />
      case 'delete':
        return <FiTrash2 className="h-4 w-4 text-red-600" />
      case 'qr':
        return <FiGrid className="h-4 w-4 text-indigo-600" />
      case 'manual':
        return <FiUsers className="h-4 w-4 text-amber-600" />
      case 'report':
        return <FiFileText className="h-4 w-4 text-gray-600" />
      default:
        return <FiClock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionText = (log) => {
    switch(log.type) {
      case 'create':
        return `Created ${log.item}: ${log.name}`
      case 'edit':
        return `Edited ${log.item}: ${log.name}`
      case 'delete':
        return `Deleted ${log.item}: ${log.name}`
      case 'qr':
        return `Generated QR for ${log.item}: ${log.name}`
      case 'manual':
        return `Marked manual attendance for ${log.name}`
      case 'report':
        return `Generated ${log.item}: ${log.name}`
      default:
        return log.action
    }
  }

  const auditLogs = getMockAuditLogs(selectedTeacher)
  const teacherSubjects = getTeacherSubjects(selectedTeacher)

  if (isTeacherLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent
          heading={"Teachers Management"}
          subHeading={"Manage all faculty members and their profiles"}
          role='admin'
        />

        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Loading Teachers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent
        heading={"Teachers Management"}
        subHeading={"Manage all faculty members and their profiles"}
        role='admin'
      />

      <div className="container max-w-full mx-auto p-4 lg:p-6">
        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto sm:flex-1 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search teachers by name or email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="Teacher">Teachers Only</option>
              <option value="All">All Roles</option>
              <option value="Admin">Admins</option>
            </select>

            <button
              onClick={openCreateModal}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlus className="h-4 w-4" />
              <span>Add Teacher</span>
            </button>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher Profile
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Role
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Joined Date
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden md:table-cell"
                    onClick={() => selectedTeacher && openSubjectsModal(selectedTeacher)}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <FiBookOpen className="h-3 w-3" />
                      <span>Subjects Count</span>
                    </div>
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Last Login
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTeachers.length > 0 ? (
                  currentTeachers.map((teacher) => {
                    const isAdmin = teacher.userRole === 'Admin'
                    return (
                      <tr key={teacher._id || teacher.id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="shrink-0 h-10 w-10 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center">
                              {teacher.profilePicture ? (
                                <img
                                  src={teacher.profilePicture}
                                  alt={teacher.userName}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentNode;
                                    const fallback = document.createElement('div');
                                    fallback.className = 'h-full w-full flex items-center justify-center bg-blue-500';
                                    fallback.innerHTML = `<span class="text-white font-bold text-lg">${getAvatarLetter(teacher.userName)}</span>`;
                                    parent.appendChild(fallback);
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-blue-500">
                                  <span className="text-white font-bold text-lg">
                                    {getAvatarLetter(teacher.userName)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">
                                  {teacher.userName}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                <FiMail className="h-3 w-3 mr-1" />
                                {teacher.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full inline-flex items-center ${getRoleBadgeColor(teacher.userRole)}`}>
                            {teacher.userRole === 'Admin' ? (
                              <>
                                <FiShield className="h-3 w-3 mr-1.5" />
                                Admin
                              </>
                            ) : (
                              <>
                                <FiUsers className="h-3 w-3 mr-1.5" />
                                {teacher.userRole}
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 hidden md:table-cell">
                          {formatDate(teacher.createdAt)}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 hidden md:table-cell">
                          <button
                            onClick={() => openSubjectsModal(teacher)}
                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                          >
                            <FiBookOpen className="h-3 w-3 mr-1" />
                            {teacher.subjectCount || 5} Subjects
                          </button>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 hidden md:table-cell">
                          {timeAgo(teacher.lastLogin)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className={`px-1 py-1 text-xs font-semibold rounded-full flex items-center justify-center w-[75px] mx-auto ${teacher.status === "Active"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                            }`}>
                            {teacher.status === "Active" ? (
                              <>
                                <FiCheck className="h-3 w-3 mr-1.5" />
                                Active
                              </>
                            ) : (
                              <>
                                <FiSlash className="h-3 w-3 mr-1.5" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-2 lg:space-x-3">
                            <button
                              onClick={() => openAuditModal(teacher)}
                              className="text-gray-600 hover:text-gray-900 transition-colors p-1"
                              title="View Audit Log"
                              disabled={isLoading}
                            >
                              <FiEye className="h-4 w-4 lg:h-5 lg:w-5" />
                            </button>
                            
                            <button
                              onClick={() => openEditModal(teacher)}
                              className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                              title="Edit User"
                              disabled={isLoading}
                            >
                              <FiEdit className="h-4 w-4 lg:h-5 lg:w-5" />
                            </button>

                            <button
                              onClick={() => openDeleteModal(teacher)}
                              className={`transition-colors p-1 ${!canDeleteTeacher(teacher)
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-red-600 hover:text-red-900'
                                }`}
                              title={!canDeleteTeacher(teacher) ? "Cannot delete admin users" : "Delete User"}
                              disabled={isLoading || !canDeleteTeacher(teacher)}
                            >
                              <FiTrash2 className="h-4 w-4 lg:h-5 lg:w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        <FiUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No users found</p>
                        <p className="mt-1">
                          {searchTerm || statusFilter !== 'All' || roleFilter !== 'Teacher'
                            ? 'Try adjusting your search or filter'
                            : 'Get started by adding your first teacher'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredTeachers.length > 0 && (
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="mb-3 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstTeacher + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastTeacher, filteredTeachers.length)}</span> of{' '}
                  <span className="font-medium">{filteredTeachers.length}</span> {roleFilter === 'Teacher' ? 'teachers' : 'users'}
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
                        ? 'border-blue-600 bg-blue-600 text-white'
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
                            ? 'border-blue-600 bg-blue-600 text-white'
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

      {/* Create Teacher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiPlus className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Add New Teacher</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTeacher}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={teacherForm.userName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="userEmail"
                    value={teacherForm.userEmail}
                    onChange={handleInputChange}
                    placeholder="teacher@example.com"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="userPassword"
                      value={teacherForm.userPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={teacherForm.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-lg hover:bg-gray-100"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiEdit className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Edit {selectedTeacher?.userRole === 'Admin' ? 'Admin' : 'Teacher'}
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditTeacher}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={teacherForm.userName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="userEmail"
                    value={teacherForm.userEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Status
                  </label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => handleStatusToggle('Active')}
                      className={`flex-1 flex items-center justify-center py-2.5 rounded-lg border transition-all ${teacherForm.status === 'Active'
                        ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                      disabled={isLoading}
                    >
                      <FiCheck className={`h-4 w-4 mr-2 ${teacherForm.status === 'Active' ? 'opacity-100' : 'opacity-60'}`} />
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusToggle('Inactive')}
                      className={`flex-1 flex items-center justify-center py-2.5 rounded-lg border transition-all ${teacherForm.status === 'Inactive'
                        ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                      disabled={isLoading}
                    >
                      <FiSlash className={`h-4 w-4 mr-2 ${teacherForm.status === 'Inactive' ? 'opacity-100' : 'opacity-60'}`} />
                      Inactive
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-lg hover:bg-gray-100"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTeacher && canDeleteTeacher(selectedTeacher) && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <FiTrash2 className="h-4 w-4 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Delete Teacher</h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="shrink-0 h-16 w-16 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-blue-500">
                  {selectedTeacher?.profilePicture ? (
                    <img
                      src={selectedTeacher.profilePicture}
                      alt={selectedTeacher.userName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {getAvatarLetter(selectedTeacher?.userName)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedTeacher?.userName}</h4>
                  <p className="text-sm text-gray-600">{selectedTeacher?.userEmail}</p>
                  <p className="text-xs text-gray-500">{selectedTeacher?.userRole || 'Teacher'}</p>
                </div>
              </div>
              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete{' '}
                <strong className="text-gray-900 font-semibold">{selectedTeacher?.userName}</strong>?
              </p>
              <p className="text-red-600 text-sm text-center mb-6">
                This action cannot be undone. All teacher data will be permanently removed.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-lg hover:bg-gray-100"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeacher}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Audit Log Modal */}
      {showAuditModal && selectedTeacher && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiEye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Activity Timeline</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {selectedTeacher.userName} • {selectedTeacher.userEmail}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Timeline Activity List */}
            <div className="max-h-[500px] overflow-y-auto px-6 py-4">
              {auditLogs.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  <div className="space-y-6">
                    {auditLogs.map((log, index) => (
                      <div key={log.id} className="relative flex items-start space-x-4">
                        {/* Timeline dot with icon */}
                        <div className={`relative z-10 w-12 h-12 ${log.type === 'create' ? 'bg-green-100' : 
                          log.type === 'edit' ? 'bg-blue-100' :
                          log.type === 'delete' ? 'bg-red-100' :
                          log.type === 'qr' ? 'bg-purple-100' :
                          log.type === 'manual' ? 'bg-amber-100' :
                          'bg-gray-100'} rounded-xl flex items-center justify-center shadow-sm`}>
                          {getActionIcon(log.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              log.type === 'create' ? 'bg-green-50 text-green-700' :
                              log.type === 'edit' ? 'bg-blue-50 text-blue-700' :
                              log.type === 'delete' ? 'bg-red-50 text-red-700' :
                              log.type === 'qr' ? 'bg-purple-50 text-purple-700' :
                              log.type === 'manual' ? 'bg-amber-50 text-amber-700' :
                              'bg-gray-50 text-gray-700'
                            }`}>
                              {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center">
                              <FiClock className="h-3 w-3 mr-1" />
                              {formatDateTime(log.time)}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-800 mb-1">
                            {log.action.charAt(0).toUpperCase() + log.action.slice(1)} {log.item}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">{log.name}</p>
                          {log.details && (
                            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
                              {log.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiEye className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-base font-medium text-gray-700 mb-1">No Activity Found</h4>
                  <p className="text-sm text-gray-500">This teacher hasn't performed any actions yet</p>
                </div>
              )}
            </div>

            {/* Footer with stats */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{auditLogs.length}</span> total activities
                </span>
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {auditLogs.filter(l => l.type === 'create').length}
                  </span> creates
                </span>
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {auditLogs.filter(l => l.type === 'edit').length}
                  </span> edits
                </span>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Subjects Modal */}
      {showSubjectsModal && selectedTeacher && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <FiBookOpen className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Teacher Courses</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {selectedTeacher.userName} • {selectedTeacher.userEmail}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubjectsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Subjects List */}
            <div className="max-h-[500px] overflow-y-auto p-6">
              {teacherSubjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {teacherSubjects.map((subject) => (
                    <div key={subject.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                      {/* Course Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <FiBookOpen className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-gray-800">{subject.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {subject.code}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center">
                          <FiCalendar className="h-3 w-3 mr-1" />
                          {formatDateTime(subject.createdAt)}
                        </span>
                      </div>

                      {/* Course Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <FiUsers className="h-4 w-4 text-blue-500" />
                            <span className="text-xs text-gray-500">Registered Students</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-800 mt-1">{subject.registeredStudents}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                          <div className="flex items-center space-x-2">
                            <FiClock className="h-4 w-4 text-amber-500" />
                            <span className="text-xs text-gray-500">Class Schedule</span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 mt-1">{subject.schedule}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <FiMapPin className="h-3 w-3 mr-1" />
                            {subject.room}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiBookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-base font-medium text-gray-700 mb-1">No Courses Found</h4>
                  <p className="text-sm text-gray-500">This teacher hasn't been assigned any courses yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Total <span className="font-semibold text-gray-900">{teacherSubjects.length}</span> courses
              </span>
              <button
                onClick={() => setShowSubjectsModal(false)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm"
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

export default AdminTeachers_Page
