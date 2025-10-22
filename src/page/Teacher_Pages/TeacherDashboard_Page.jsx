import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import {
  FiBook,
  FiBarChart2,
  FiEye,
  FiArrowRight,
  FiUsers,
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  getDashboardSubjects,
  getDashboardAttendance,
  clearDashboard
} from '../../store/Teacher-Slicer/Dashboard-Slicer.js'

const TeacherDashboard_Page = () => {
  const dispatch = useDispatch()
  const {
    dashboardSubjects,
    dashboardAttendance,
    isLoading
  } = useSelector((state) => state.teacherDashboard)

  const [selectedSubject, setSelectedSubject] = useState(null)
  const [currentDate, setCurrentDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(5)
  const [dataLoaded, setDataLoaded] = useState(false)

  const { user } = useSelector((state) => state.auth)

  const userId = user?.id

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoaded(false)
        await Promise.all([
          dispatch(getDashboardSubjects(userId)).unwrap(),
          dispatch(getDashboardAttendance(userId)).unwrap()
        ])
        setDataLoaded(true)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setDataLoaded(true) // Set to true even on error to stop loading
        toast.error('Failed to load dashboard data')
      }
    }

    fetchData()

    // Cleanup on unmount
    return () => {
      dispatch(clearDashboard())
    }
  }, [dispatch, userId])

  // Set initial selected subject when subjects are loaded
  useEffect(() => {
    if (dashboardSubjects.length > 0 && !selectedSubject && dataLoaded) {
      setSelectedSubject(dashboardSubjects[0].id)

      // Set initial date to the latest available date for the first subject
      const subjectAttendance = dashboardAttendance[dashboardSubjects[0].id]
      if (subjectAttendance && Object.keys(subjectAttendance).length > 0) {
        const latestDate = Object.keys(subjectAttendance).sort().reverse()[0]
        setCurrentDate(latestDate)
      }
    }
  }, [dashboardSubjects, selectedSubject, dashboardAttendance, dataLoaded])

  // Get available dates for selected subject
  const getAvailableDates = () => {
    if (!selectedSubject) return []
    const subjectData = dashboardAttendance[selectedSubject]
    return subjectData ? Object.keys(subjectData).sort().reverse() : []
  }

  const availableDates = getAvailableDates()
  const currentDateIndex = availableDates.indexOf(currentDate)

  // Get current attendance records
  const getCurrentAttendanceRecords = () => {
    if (!selectedSubject) return []
    const subjectData = dashboardAttendance[selectedSubject]
    return subjectData && subjectData[currentDate] ? subjectData[currentDate] : []
  }

  const currentAttendanceRecords = getCurrentAttendanceRecords()
  const selectedSubjectData = dashboardSubjects.find(subject => subject.id === selectedSubject)

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = currentAttendanceRecords.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(currentAttendanceRecords.length / recordsPerPage)

  // Pagination functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Navigation functions
  const navigateDate = (direction) => {
    const currentIndex = availableDates.indexOf(currentDate)
    if (direction === 'prev' && currentIndex < availableDates.length - 1) {
      setCurrentDate(availableDates[currentIndex + 1])
      setCurrentPage(1)
    } else if (direction === 'next' && currentIndex > 0) {
      setCurrentDate(availableDates[currentIndex - 1])
      setCurrentPage(1)
    }
  }

  // Handle subject selection
  const handleSubjectSelect = (subjectId) => {
    setSelectedSubject(subjectId)
    setCurrentPage(1)

    // Set to latest date for the selected subject
    const subjectAttendance = dashboardAttendance[subjectId]
    if (subjectAttendance && Object.keys(subjectAttendance).length > 0) {
      const latestDate = Object.keys(subjectAttendance).sort().reverse()[0]
      setCurrentDate(latestDate)
    } else {
      setCurrentDate('')
    }
  }

  // Reset pagination when subject or date changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedSubject, currentDate])

  // Color mapping for subjects (you can modify this based on your needs)
  const getSubjectColor = (index) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-orange-500', 'bg-red-500', 'bg-indigo-500',
      'bg-pink-500', 'bg-teal-500', 'bg-cyan-500', 'bg-amber-500'
    ]
    return colors[index % colors.length]
  }

  // Show loader when data is still loading
  if (isLoading || !dataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Dashboard...</p>
          {/* <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data</p> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent heading={"Teacher Dashboard"} subHeading={"Overview of your teaching activities"} role='admin' />

      <div className="container max-w-full mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Subjects */}
          <div className="lg:col-span-1">
            {/* My Subjects */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Subjects</h3>
                {/* <button className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center">
                  View All
                </button> */}
              </div>

              {dashboardSubjects.length === 0 ? (
                <div className="text-center py-8">
                  <FiBook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No subjects found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    You are not assigned to any subjects yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardSubjects.map((subject, index) => (
                    <div
                      key={subject.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${selectedSubject === subject.id
                        ? 'bg-sky-50 border border-sky-200'
                        : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      onClick={() => handleSubjectSelect(subject.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg ${getSubjectColor(index)} flex items-center justify-center`}>
                          <span className="text-white font-semibold text-sm">
                            {subject.name?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div>
                          <p
                            className={`text-xs font-medium truncate w-[145px] whitespace-nowrap overflow-hidden text-ellipsis ${selectedSubject === subject.id ? 'text-sky-700' : 'text-gray-900'
                              }`}
                            title={subject.name}
                          >
                            {subject.name}
                          </p>

                          <p className="text-xs text-gray-500">{subject.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${selectedSubject === subject.id ? 'text-sky-700' : 'text-gray-900'
                          }`}>
                          {subject.students || 0}
                        </p>
                        <p className="text-xs text-gray-500">students</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Attendance Records */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Navigation */}
            {availableDates.length > 0 && selectedSubject && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigateDate('prev')}
                    disabled={currentDateIndex >= availableDates.length - 1}
                    className={`p-2 rounded-lg transition-colors ${currentDateIndex >= availableDates.length - 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatDate(currentDate)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedSubjectData?.name} • {currentAttendanceRecords.length} students present
                    </p>
                  </div>

                  <button
                    onClick={() => navigateDate('next')}
                    disabled={currentDateIndex <= 0}
                    className={`p-2 rounded-lg transition-colors ${currentDateIndex <= 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Attendance Records Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                  {selectedSubject && (
                    <div className="text-sm text-gray-500">
                      {currentAttendanceRecords.length} students
                    </div>
                  )}
                </div>

                {!selectedSubject ? (
                  <div className="text-center py-8">
                    <FiEye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Select a subject to view attendance</p>
                  </div>
                ) : currentRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Roll No.
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                              {record.rollNo}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                              {record.time}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiEye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No attendance records found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {availableDates.length === 0
                        ? `No attendance data available for ${selectedSubjectData?.name}`
                        : `No records for ${formatDate(currentDate)}`
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {currentAttendanceRecords.length > recordsPerPage && (
                <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50">
                  <div className="mb-3 sm:mb-0">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastRecord, currentAttendanceRecords.length)}</span> of{' '}
                      <span className="font-medium">{currentAttendanceRecords.length}</span> students
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard_Page