import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX, FiChevronLeft, FiChevronRight, FiUser, FiMail, FiUserCheck, FiUserX } from 'react-icons/fi'
import { toast } from 'react-toastify'

// You'll need to create these Redux actions/slices for teachers
// import {
//   getTeachers,
//   createTeacher,
//   updateTeacher,
//   deleteTeacher,
//   updateTeacherStatus
// } from '../../store/Admin-Slicer/Teacher-Slicer.js'

const AdminTeachers_Page = () => {
  const dispatch = useDispatch()
  
  // Mock data for demonstration - replace with actual Redux state
  const [teachers, setTeachers] = useState([
    {
      _id: '1',
      profilePicture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      name: 'John Smith',
      email: 'john.smith@example.com',
      status: 'Active',
      createdAt: '2024-01-15T10:30:00Z',
      subjects: 5,
      role: 'Senior Lecturer',
      department: 'Computer Science'
    },
    {
      _id: '2',
      profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      status: 'Active',
      createdAt: '2024-02-20T14:45:00Z',
      subjects: 3,
      role: 'Assistant Professor',
      department: 'Mathematics'
    },
    {
      _id: '3',
      profilePicture: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      status: 'Inactive',
      createdAt: '2024-01-05T09:15:00Z',
      subjects: 2,
      role: 'Lecturer',
      department: 'Physics'
    },
  ])

  const isLoading = false // Replace with actual loading state from Redux

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [teachersPerPage] = useState(5)

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Lecturer',
    department: '',
    status: 'Active'
  })

  // Uncomment when you have Redux setup
  // useEffect(() => {
  //   dispatch(getTeachers())
  // }, [dispatch])

  // Filter teachers based on search and filter
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch =
      teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.department?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = statusFilter === 'All' || teacher.status === statusFilter

    return matchesSearch && matchesFilter
  })

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

  const handleCreateTeacher = async (e) => {
    e.preventDefault()

    if (!teacherForm.name || !teacherForm.email || !teacherForm.password || !teacherForm.confirmPassword) {
      toast.error('Please fill all required fields')
      return
    }

    if (teacherForm.password !== teacherForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      // Uncomment when you have Redux setup
      // await dispatch(createTeacher(teacherForm)).unwrap()
      
      // Mock success
      const newTeacher = {
        _id: Date.now().toString(),
        ...teacherForm,
        profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        createdAt: new Date().toISOString(),
        subjects: 0
      }
      setTeachers(prev => [...prev, newTeacher])
      
      setShowCreateModal(false)
      resetForm()
      toast.success('Teacher created successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to create teacher')
    }
  }

  const handleEditTeacher = async (e) => {
    e.preventDefault()

    if (!teacherForm.name || !teacherForm.email) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      // Uncomment when you have Redux setup
      // await dispatch(updateTeacher({
      //   id: selectedTeacher._id,
      //   formData: teacherForm
      // })).unwrap()

      // Mock update
      setTeachers(prev => prev.map(teacher => 
        teacher._id === selectedTeacher._id 
          ? { ...teacher, ...teacherForm }
          : teacher
      ))

      setShowEditModal(false)
      resetForm()
      toast.success('Teacher updated successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to update teacher')
    }
  }

  const handleDeleteTeacher = async () => {
    try {
      // Uncomment when you have Redux setup
      // await dispatch(deleteTeacher(selectedTeacher._id)).unwrap()
      
      // Mock delete
      setTeachers(prev => prev.filter(teacher => teacher._id !== selectedTeacher._id))
      
      setShowDeleteModal(false)
      toast.success('Teacher deleted successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to delete teacher')
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher)
    setTeacherForm({
      name: teacher.name,
      email: teacher.email,
      role: teacher.role || 'Lecturer',
      department: teacher.department || '',
      status: teacher.status
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (teacher) => {
    setSelectedTeacher(teacher)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setTeacherForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Lecturer',
      department: '',
      status: 'Active'
    })
    setSelectedTeacher(null)
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading && teachers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Teachers...</p>
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
              placeholder="Search teachers by name, email or department..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Create Teacher Button */}
            <button
              onClick={openCreateModal}
              disabled={isLoading}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlus className="h-4 w-4" />
              <span>Add Teacher</span>
            </button>
          </div>
        </div>

        {/* Teachers Table */}
        {!isLoading && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto hide-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher Profile
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Email
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Joined Date
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
                    currentTeachers.map((teacher) => (
                      <tr key={teacher._id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="shrink-0 h-10 w-10 rounded-full overflow-hidden border border-gray-300">
                              <img
                                src={teacher.profilePicture}
                                alt={teacher.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                <FiMail className="inline mr-1" size={12} />
                                {teacher.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 hidden sm:table-cell">
                          <div className="flex items-center justify-center">
                            <FiMail className="mr-2" size={14} />
                            {teacher.email}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {teacher.role}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 hidden md:table-cell">
                          {formatDate(teacher.createdAt)}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${teacher.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}>
                            {teacher.status === "Active" ? (
                              <FiUserCheck className="inline mr-1" size={12} />
                            ) : (
                              <FiUserX className="inline mr-1" size={12} />
                            )}
                            {teacher.status}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-2 lg:space-x-3">
                            <button
                              onClick={() => openEditModal(teacher)}
                              className="text-sky-600 hover:text-sky-900 transition-colors p-1"
                              title="Edit Teacher"
                            >
                              <FiEdit className="h-4 w-4 lg:h-5 lg:w-5" />
                            </button>

                            <button
                              onClick={() => openDeleteModal(teacher)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1"
                              title="Delete Teacher"
                            >
                              <FiTrash2 className="h-4 w-4 lg:h-5 lg:w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          <FiUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">No teachers found</p>
                          <p className="mt-1">
                            {searchTerm || statusFilter !== 'All'
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
                    <span className="font-medium">{filteredTeachers.length}</span> teachers
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
        )}
      </div>

      {/* Create Teacher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                  <FiPlus className="h-4 w-4 text-sky-600" />
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
                    name="name"
                    value={teacherForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                    name="email"
                    value={teacherForm.email}
                    onChange={handleInputChange}
                    placeholder="teacher@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                      name="password"
                      value={teacherForm.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={teacherForm.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    disabled={isLoading}
                  >
                    <option value="Lecturer">Lecturer</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={teacherForm.department}
                    onChange={handleInputChange}
                    placeholder="e.g., Computer Science"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={teacherForm.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    disabled={isLoading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                  <FiEdit className="h-4 w-4 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Edit Teacher</h3>
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
                    name="name"
                    value={teacherForm.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                    name="email"
                    value={teacherForm.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={teacherForm.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    disabled={isLoading}
                  >
                    <option value="Lecturer">Lecturer</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={teacherForm.department}
                    onChange={handleInputChange}
                    placeholder="e.g., Computer Science"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={teacherForm.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    disabled={isLoading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                <div className="shrink-0 h-16 w-16 rounded-full overflow-hidden border border-gray-300">
                  <img
                    src={selectedTeacher?.profilePicture}
                    alt={selectedTeacher?.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedTeacher?.name}</h4>
                  <p className="text-sm text-gray-600">{selectedTeacher?.email}</p>
                  <p className="text-xs text-gray-500">{selectedTeacher?.role}</p>
                </div>
              </div>
              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete{' '}
                <strong className="text-gray-900 font-semibold">{selectedTeacher?.name}</strong>?
              </p>
              <p className="text-red-600 text-sm text-center mb-6">
                This action cannot be undone. All teacher data will be permanently removed.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeacher}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTeachers_Page