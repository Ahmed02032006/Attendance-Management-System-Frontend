import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiChevronLeft, FiChevronRight, FiEdit } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { 
  getSubjectsByUser, 
  createSubject, 
  updateSubject, 
  deleteSubject,
} from '../../store/Teacher-Slicer/Subject-Slicer.js'

const TeacherSubjects_Page = () => {
  const dispatch = useDispatch()
  const { subjects, isLoading, currentSubject } = useSelector((state) => state.teacherSubject)
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [subjectsPerPage] = useState(5)

  const [subjectForm, setSubjectForm] = useState({
    subjectTitle: '',
    subjectName: '',
    subjectCode: '',
    status: 'Active',
    semester: '',
    userId: ''
  })

  const { user } = useSelector((state) => state.auth)

  const currentUserId = user?.id

  useEffect(() => {
    if (currentUserId) {
      dispatch(getSubjectsByUser(currentUserId)).unwrap();
    }
  }, [dispatch, currentUserId])

  // Filter subjects based on search and filter
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = 
      subject.subjectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    
    if (!subjectForm.subjectTitle || !subjectForm.subjectName || !subjectForm.subjectCode || !subjectForm.semester) {
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
    
    if (!subjectForm.subjectTitle || !subjectForm.subjectName || !subjectForm.subjectCode || !subjectForm.semester) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      await dispatch(updateSubject({ 
        id: selectedSubject._id, 
        formData: subjectForm 
      })).unwrap()
      
      setShowEditModal(false)
      resetForm()
      toast.success('Subject updated successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to update subject')
    }
  }

  const handleDeleteSubject = async () => {
    try {
      await dispatch(deleteSubject(selectedSubject._id)).unwrap()
      setShowDeleteModal(false)
      toast.success('Subject deleted successfully!')
    } catch (error) {
      toast.error(error?.message || 'Failed to delete subject')
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (subject) => {
    setSelectedSubject(subject)
    setSubjectForm({
      subjectTitle: subject.subjectTitle,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      semester: subject.semester,
      status: subject.status,
      userId: subject.userId
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (subject) => {
    setSelectedSubject(subject)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setSubjectForm({
      subjectTitle: '',
      subjectName: '',
      subjectCode: '',
      semester: '',
      status: 'Active',
      userId: ''
    })
    setSelectedSubject(null)
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

  if(isLoading){
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent heading={"Subjects Management"} subHeading={"Create and manage your teaching subjects"} role='admin' />

      <div className="container max-w-full mx-auto p-6">
        {/* Search and Filter Section */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search subjects by title, name or code..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Subjects Table */}
        {!isLoading && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto hide-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Info
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Semester
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSubjects.length > 0 ? (
                    currentSubjects.map((subject) => (
                      <tr key={subject._id} className="hover:bg-gray-50">
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 overflow-hidden border border-gray-300 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {subject.subjectTitle?.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{subject.subjectName}</div>
                              <div className="text-xs text-gray-500">Course Code : <span className='border-b border-gray-400'>{subject.subjectCode}</span></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                          {formatDate(subject.createdAt)}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                          {subject.semester}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-center">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            subject.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {subject.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => openEditModal(subject)}
                              className="text-sky-600 hover:text-sky-900 transition-colors"
                              title="Edit Subject"
                            >
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(subject)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete Subject"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          <FiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">No subjects found</p>
                          <p className="mt-1">
                            {searchTerm || statusFilter !== 'All' 
                              ? 'Try adjusting your search or filter' 
                              : 'Get started by creating your first subject'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredSubjects.length > 0 && (
              <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="mb-3 sm:mb-0">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstSubject + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastSubject, filteredSubjects.length)}</span> of{' '}
                    <span className="font-medium">{filteredSubjects.length}</span> subjects
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

      {/* Floating Create Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={openCreateModal}
          disabled={isLoading}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-3 sm:py-3 sm:px-4 rounded-full sm:rounded-lg transition-all duration-200 flex items-center space-x-2 hover:shadow-xl transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus className="h-5 w-5 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Create Subject</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Create Subject Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Create New Subject</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubject}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Title *
                  </label>
                  <input
                    type="text"
                    name="subjectTitle"
                    value={subjectForm.subjectTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    name="subjectName"
                    value={subjectForm.subjectName}
                    onChange={handleInputChange}
                    placeholder="e.g., Advanced Mathematics"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    name="subjectCode"
                    value={subjectForm.subjectCode}
                    onChange={handleInputChange}
                    placeholder="e.g., MATH101"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester *
                  </label>
                  <input
                    type="text"
                    name="semester"
                    value={subjectForm.semester}
                    onChange={handleInputChange}
                    placeholder="e.g., 2nd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
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
                  {isLoading ? 'Creating...' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Edit Subject</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubject}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Title *
                  </label>
                  <input
                    type="text"
                    name="subjectTitle"
                    value={subjectForm.subjectTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    name="subjectName"
                    value={subjectForm.subjectName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    name="subjectCode"
                    value={subjectForm.subjectCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester *
                  </label>
                  <input
                    type="text"
                    name="semester"
                    value={subjectForm.semester}
                    onChange={handleInputChange}
                    placeholder="e.g., 2nd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={subjectForm.status}
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
                  {isLoading ? 'Updating...' : 'Update Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Minimalist */}
{showDeleteModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-gray-200">
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiTrash2 className="h-8 w-8 text-red-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Delete Subject?
        </h3>
        
        <p className="text-gray-600 text-sm mb-2">
          <strong className="text-gray-900 font-semibold">"{selectedSubject?.subjectTitle}"</strong> will be permanently deleted.
        </p>
        
        <p className="text-red-600 text-xs mb-6">
          This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteSubject}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      
    </div>
  )
}

export default TeacherSubjects_Page
