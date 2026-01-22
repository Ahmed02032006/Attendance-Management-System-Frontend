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
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiUser
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
    isLoading,
    error
  } = useSelector((state) => state.teacherDashboard)

  const [selectedSubject, setSelectedSubject] = useState(null)
  const [currentDate, setCurrentDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(5)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [hasData, setHasData] = useState(false)

  const { user } = useSelector((state) => state.auth)
  const userId = user?.id

  // Check if user has any data
  const checkIfHasData = () => {
    const hasSubjects = dashboardSubjects.length > 0
    const hasAttendance = Object.keys(dashboardAttendance).length > 0
    return hasSubjects || hasAttendance
  }

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
        setDataLoaded(true)
        
        // Only show error toast if it's not a "no data" scenario
        if (error.response?.status !== 404 && !error.message?.includes('No data')) {
          toast.error('Failed to load dashboard data')
        }
      }
    }

    if (userId) {
      fetchData()
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearDashboard())
    }
  }, [dispatch, userId])

  // Update hasData state when data is loaded
  useEffect(() => {
    if (dataLoaded) {
      const dataExists = checkIfHasData()
      setHasData(dataExists)
      
      // Set initial selected subject when subjects are loaded
      if (dashboardSubjects.length > 0 && !selectedSubject) {
        setSelectedSubject(dashboardSubjects[0].id)

        // Set initial date to the latest available date for the first subject
        const subjectAttendance = dashboardAttendance[dashboardSubjects[0].id]
        if (subjectAttendance && Object.keys(subjectAttendance).length > 0) {
          const latestDate = Object.keys(subjectAttendance).sort().reverse()[0]
          setCurrentDate(latestDate)
        }
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
    if (!dateString) return 'No date selected'
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

  // Color mapping for subjects
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
        </div>
      </div>
    );
  }

  // Empty state - No data available (fresh account)
  if (dataLoaded && !hasData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent 
          heading={"Teacher Dashboard"} 
          subHeading={"Welcome to your dashboard"} 
          role='teacher' 
        />

        <div className="container max-w-full mx-auto p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="max-w-md mx-auto text-center bg-white rounded-xl border border-gray-200 p-8 sm:p-10">
              <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBook className="h-10 w-10 text-sky-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Welcome to Your Dashboard!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your dashboard is ready, but it looks like you haven't been assigned to any subjects yet or there's no attendance data available.
              </p>
              
              <div className="space-y-4 text-left mb-8">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center">
                      <FiUser className="h-3 w-3 text-sky-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">No Subjects Assigned</h4>
                    <p className="text-sm text-gray-600">
                      You need to be assigned to subjects by the administrator.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center">
                      <FiCalendar className="h-3 w-3 text-sky-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">No Attendance Records</h4>
                    <p className="text-sm text-gray-600">
                      Attendance data will appear here once you start taking attendance for your classes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center">
                      <FiClock className="h-3 w-3 text-sky-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">What to Do Next</h4>
                    <p className="text-sm text-gray-600">
                      Contact your administrator to get assigned to subjects and start using the attendance system.
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  // You can add a refresh function here
                  window.location.reload();
                }}
                className="inline-flex items-center px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <FiArrowRight className="mr-2 h-5 w-5" />
                Refresh Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent 
        heading={"Teacher Dashboard"} 
        subHeading={"Overview of your teaching activities"} 
        role='teacher' 
      />

      <div className="container max-w-full mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Subjects */}
          <div className="xl:col-span-1">
            {/* My Subjects */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Subjects</h3>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                  {dashboardSubjects.length} total
                </span>
              </div>

              {dashboardSubjects.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <FiBook className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                  <p className="text-gray-500 text-base sm:text-lg font-medium">No subjects assigned</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    You will see subjects here once assigned by admin
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {dashboardSubjects.map((subject, index) => (
                    <div
                      key={subject.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${selectedSubject === subject.id
                        ? 'bg-sky-50 border border-sky-200'
                        : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      onClick={() => handleSubjectSelect(subject.id)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${getSubjectColor(index)} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white font-semibold text-xs sm:text-sm">
                            {subject.name?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-medium truncate ${selectedSubject === subject.id ? 'text-sky-700' : 'text-gray-900'
                              }`}
                            title={subject.name}
                          >
                            {subject.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{subject.code}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
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
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Date Navigation */}
            {availableDates.length > 0 && selectedSubject && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between space-x-4">
                  <button
                    onClick={() => navigateDate('prev')}
                    disabled={currentDateIndex >= availableDates.length - 1}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${currentDateIndex >= availableDates.length - 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <FiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  <div className="text-center flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {formatDate(currentDate)}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {selectedSubjectData?.name} • {currentAttendanceRecords.length} students present
                    </p>
                  </div>

                  <button
                    onClick={() => navigateDate('next')}
                    disabled={currentDateIndex <= 0}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${currentDateIndex <= 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <FiChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Attendance Records Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                  {selectedSubject && (
                    <div className="text-sm text-gray-500">
                      {currentAttendanceRecords.length} students
                    </div>
                  )}
                </div>

                {!selectedSubject ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiEye className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-base sm:text-lg font-medium mb-2">Select a subject to view attendance</p>
                    <p className="text-gray-400 text-sm">
                      Choose a subject from the left panel to see attendance records
                    </p>
                  </div>
                ) : currentRecords.length > 0 ? (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Roll No.
                          </th>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-sm font-medium text-gray-600">
                                    {record.studentName?.charAt(0) || 'S'}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                  {record.studentName}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {record.rollNo}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center text-sm text-gray-500">
                              <div className="flex items-center justify-center">
                                <FiClock className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                                {record.time}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : selectedSubject && availableDates.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCalendar className="h-10 w-10 text-yellow-500" />
                    </div>
                    <p className="text-gray-500 text-base sm:text-lg font-medium mb-2">No attendance data yet</p>
                    <p className="text-gray-400 text-sm mb-4">
                      No attendance records found for {selectedSubjectData?.name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Start taking attendance for this subject to see records here
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiEye className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-base sm:text-lg font-medium mb-2">No records for this date</p>
                    <p className="text-gray-400 text-sm">
                      Select a different date from the navigation above
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {currentAttendanceRecords.length > recordsPerPage && (
                <div className="px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs sm:text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastRecord, currentAttendanceRecords.length)}</span> of{' '}
                      <span className="font-medium">{currentAttendanceRecords.length}</span> students
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                      <FiChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    </button>

                    {totalPages <= 4 ? (
                      Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-2.5 sm:px-3.5 py-1.5 border text-xs sm:text-sm font-medium ${currentPage === number
                            ? 'border-sky-600 bg-sky-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            } rounded-md transition-colors`}
                        >
                          {number}
                        </button>
                      ))
                    ) : (
                      <>
                        {currentPage > 2 && (
                          <button
                            onClick={() => paginate(1)}
                            className="px-2.5 sm:px-3.5 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium rounded-md transition-colors"
                          >
                            1
                          </button>
                        )}
                        {currentPage > 3 && <span className="px-1 sm:px-2 text-gray-500">...</span>}
                        {[
                          currentPage - 1,
                          currentPage,
                          currentPage + 1
                        ]
                          .filter(num => num > 0 && num <= totalPages)
                          .map(number => (
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`px-2.5 sm:px-3.5 py-1.5 border text-xs sm:text-sm font-medium ${currentPage === number
                                ? 'border-sky-600 bg-sky-600 text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                } rounded-md transition-colors`}
                            >
                              {number}
                            </button>
                          ))}
                        {currentPage < totalPages - 2 && <span className="px-1 sm:px-2 text-gray-500">...</span>}
                        {currentPage < totalPages - 1 && (
                          <button
                            onClick={() => paginate(totalPages)}
                            className="px-2.5 sm:px-3.5 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium rounded-md transition-colors"
                          >
                            {totalPages}
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                      <FiChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
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