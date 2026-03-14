import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import {
  FiPlus, FiEdit, FiTrash2, FiSearch, FiX, FiChevronLeft, FiChevronRight,
  FiUser, FiMail, FiCheck, FiSlash, FiShield, FiUsers, FiClock,
  FiActivity, FiUserPlus, FiCalendar, FiCamera,
  FiDownload, FiBarChart2, FiFileText, FiAlertCircle
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  getTeachersByUser,
  createTeacher,
  updateTeacher,
  deleteTeacher
} from '../../store/Admin-Slicer/Teacher-Slicer.js'
import {
  getTeacherAuditLogs,
  deleteAllTeacherAuditLogs
} from '../../store/Admin-Slicer/AuditLog-Slicer.js';


const AdminTeachers_Page = () => {
  const dispatch = useDispatch()

  const { teachers, isLoading } = useSelector((state) => state.adminTeacher)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isTeacherLoading, setIsTeacherLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('Teacher')
  const [currentPage, setCurrentPage] = useState(1)
  const [teachersPerPage] = useState(5)

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPagination, setAuditPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  const [showDeleteAllAuditModal, setShowDeleteAllAuditModal] = useState(false);
  const [isDeletingAllAudit, setIsDeletingAllAudit] = useState(false);

  const [teacherForm, setTeacherForm] = useState({
    userName: '',
    userEmail: '',
    userPassword: '',
    confirmPassword: '',
    status: 'Active'
  })

  // Fetch real audit logs from API
  const fetchTeacherAuditLogs = async (teacherId, page = 1) => {
    try {
      setAuditLoading(true);
      const result = await dispatch(getTeacherAuditLogs({
        teacherId,
        page,
        limit: 20
      })).unwrap();

      if (result.success) {
        setAuditLogs(result.data.logs);
        setAuditPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleDeleteAllAuditLogs = async () => {
    if (!selectedTeacher) return;

    try {
      setIsDeletingAllAudit(true);
      const result = await dispatch(deleteAllTeacherAuditLogs(selectedTeacher._id)).unwrap();

      if (result.success) {
        toast.success(result.message || 'All audit logs deleted successfully');
        setAuditLogs([]); // Clear the logs in local state
        setAuditPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0
        });
        setShowDeleteAllAuditModal(false);
      }
    } catch (error) {
      console.error('Error deleting audit logs:', error);
      toast.error(error?.message || 'Failed to delete audit logs');
    } finally {
      setIsDeletingAllAudit(false);
    }
  };

  // Fetch teachers on component mount
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

  // Filter teachers based on search, filter, and role
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch =
      teacher.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'All' || teacher.status === statusFilter
    const matchesRole = roleFilter === 'All' || teacher.userRole === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  // Separate function to check if a teacher can be deleted
  const canDeleteTeacher = (teacher) => {
    return teacher.userRole !== 'Admin'
  }

  // Pagination
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

  // Handle status toggle in form
  const handleStatusToggle = (status) => {
    setTeacherForm(prev => ({
      ...prev,
      status: status
    }))
  }

  // Get first letter of username for avatar
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
    setSelectedTeacher(teacher);
    setShowAuditModal(true);
    fetchTeacherAuditLogs(teacher._id);
  };

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

  // Format date for display
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

  // Format audit timestamp
  const formatAuditTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Format full date for display
  const formatFullDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get role badge color
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

  // Get action icon based on action type
  const getActionIcon = (action) => {
    switch (action) {
      case 'create':
        return <FiPlus className="h-4 w-4" />;
      case 'edit':
        return <FiEdit className="h-4 w-4" />;
      case 'delete':
        return <FiTrash2 className="h-4 w-4" />;
      case 'register':
        return <FiUserPlus className="h-4 w-4" />;
      case 'edit_schedule':
        return <FiCalendar className="h-4 w-4" />;
      case 'create_qr':
        return <FiCamera className="h-4 w-4" />;
      case 'export_attendance':
        return <FiDownload className="h-4 w-4" />;
      case 'generate_report':
        return <FiBarChart2 className="h-4 w-4" />;
      case 'export_report':
        return <FiFileText className="h-4 w-4" />;
      default:
        return <FiActivity className="h-4 w-4" />;
    }
  };

  // Get action badge color based on action type
  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'create':
        return 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200';
      case 'edit':
      case 'edit_schedule':
        return 'bg-blue-50 text-blue-600 ring-1 ring-blue-200';
      case 'delete':
        return 'bg-rose-50 text-rose-600 ring-1 ring-rose-200';
      case 'register':
        return 'bg-violet-50 text-violet-600 ring-1 ring-violet-200';
      case 'create_qr':
        return 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200';
      case 'export_attendance':
      case 'export_report':
        return 'bg-amber-50 text-amber-600 ring-1 ring-amber-200';
      case 'generate_report':
        return 'bg-cyan-50 text-cyan-600 ring-1 ring-cyan-200';
      default:
        return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200';
    }
  };

  // Get human-readable action text
  const getActionText = (action) => {
    switch (action) {
      case 'create':
        return 'Created';
      case 'edit':
        return 'Edited';
      case 'delete':
        return 'Deleted';
      case 'register':
        return 'Registered';
      case 'edit_schedule':
        return 'Schedule Updated';
      case 'create_qr':
        return 'QR Created';
      case 'export_attendance':
        return 'Attendance Exported';
      case 'generate_report':
        return 'Report Generated';
      case 'export_report':
        return 'Report Exported';
      default:
        return action;
    }
  };

  // Show loading state while fetching data
  if (isTeacherLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiUsers className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading Teachers...</p>
          <p className="mt-2 text-sm text-gray-500">Fetching teacher records</p>
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

            {/* Create Teacher Button */}
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
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
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
                  <th scope="col" className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Subjects Count
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
                          {teacher.subjectCount}
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
                              className="text-indigo-600 hover:text-purple-900 transition-colors p-1"
                              title="View Course Audit Logs"
                              disabled={isLoading}
                            >
                              <FiFileText className="h-4 w-4 lg:h-5 lg:w-5" />
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

      {/* Audit Log Modal */}
      {showAuditModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center ring-1 ring-purple-100">
                    <FiClock className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FiUser className="h-3.5 w-3.5" />
                      {selectedTeacher.userName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Delete All Button - Only show if there are logs */}
                  {auditLogs.length > 0 && (
                    <button
                      onClick={() => setShowDeleteAllAuditModal(true)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5"
                      title="Delete all audit logs"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                      Delete All ({auditLogs.length})
                    </button>
                  )}
                  <button
                    onClick={() => setShowAuditModal(false)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-all text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(80vh-120px)] bg-gray-100">
              {auditLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {auditLogs.map((log) => (
                    <div
                      key={log._id}
                      className="group bg-white rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        {/* Action Icon */}
                        <div className={`p-2.5 rounded-xl ${getActionBadgeColor(log.action)}`}>
                          {getActionIcon(log.action)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Top row with action type and date/status */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {getActionText(log.action)}
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Date first */}
                              <span className="text-xs text-gray-400 flex items-center">
                                <FiClock className="h-3 w-3 mr-1" />
                                {formatAuditTime(log.timestamp)}
                              </span>
                              {/* Status on the right */}
                              <span className={`
                          text-xs px-2 py-0.5 rounded-full font-medium
                          ${log.status === 'success' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50' :
                                  log.status === 'warning' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50' :
                                    'bg-rose-50 text-rose-700 ring-1 ring-rose-200/50'}
                        `}>
                                {log.status}
                              </span>
                            </div>
                          </div>

                          {/* Heading */}
                          <p className="text-sm font-medium text-gray-900">
                            {log.heading}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {auditPagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4 pt-2">
                      <button
                        onClick={() => fetchTeacherAuditLogs(selectedTeacher._id, auditPagination.currentPage - 1)}
                        disabled={auditPagination.currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {auditPagination.currentPage} of {auditPagination.totalPages}
                      </span>
                      <button
                        onClick={() => fetchTeacherAuditLogs(selectedTeacher._id, auditPagination.currentPage + 1)}
                        disabled={auditPagination.currentPage === auditPagination.totalPages}
                        className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!auditLoading && auditLogs.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-gray-200">
                    <FiClock className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No activity logs found</p>
                  <p className="text-sm text-gray-400 mt-1">Activities will appear here</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 bg-white">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all ring-1 ring-gray-200 hover:ring-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Audit Logs Confirmation Modal */}
      {showDeleteAllAuditModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiTrash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Delete All Audit Logs</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedTeacher.userName}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiAlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Are you sure you want to delete all audit logs?
                </p>
                <p className="text-xs text-gray-500">
                  This will permanently remove <span className="font-semibold text-red-600">{auditLogs.length}</span> activity log{auditLogs.length !== 1 ? 's' : ''} for this teacher.
                </p>
                <p className="text-xs text-red-500 font-medium mt-3">
                  This action cannot be undone!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteAllAuditModal(false)}
                disabled={isDeletingAllAudit}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-100 rounded-lg transition-colors ring-1 ring-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllAuditLogs}
                disabled={isDeletingAllAudit}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingAllAudit ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="h-3.5 w-3.5" />
                    Delete All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminTeachers_Page
