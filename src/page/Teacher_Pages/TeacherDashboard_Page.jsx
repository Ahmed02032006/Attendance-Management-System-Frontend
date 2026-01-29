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
  FiMessageCircle,
  FiSend,
  FiX,
  FiHelpCircle,
  FiUser,
  FiSmile
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
  
  // Chat state variables
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Welcome! I'm your AI assistant. How can I help you with the attendance system today?",
      sender: 'assistant',
      timestamp: 'Just now',
      avatar: '🤖'
    },
    {
      id: 2,
      text: "You can ask me about attendance reports, student management, or any technical issues.",
      sender: 'assistant',
      timestamp: 'Just now',
      avatar: '🤖'
    }
  ])
  const [isSending, setIsSending] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

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
        setDataLoaded(true)
      }
    }

    fetchData()

    return () => {
      dispatch(clearDashboard())
    }
  }, [dispatch, userId])

  // Set initial selected subject when subjects are loaded
  useEffect(() => {
    if (dashboardSubjects.length > 0 && !selectedSubject && dataLoaded) {
      setSelectedSubject(dashboardSubjects[0].id)

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

  // Chat functions
  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage = {
      id: chatMessages.length + 1,
      text: message,
      sender: 'user',
      timestamp: 'Just now',
      avatar: '👤'
    }

    setChatMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsSending(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand your query about attendance management. Let me help you with that.",
        "For attendance reports, you can export data from the attendance section. Would you like more details?",
        "I can help you with student attendance tracking and generate reports. What specific information do you need?",
        "For technical issues, please contact our support team at support@attendance.com or try clearing your browser cache.",
        "You can manage student attendance by selecting the subject and date from the dashboard above."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiResponse = {
        id: chatMessages.length + 2,
        text: randomResponse,
        sender: 'assistant',
        timestamp: 'Just now',
        avatar: '🤖'
      }
      setChatMessages(prev => [...prev, aiResponse])
      setIsSending(false)
    }, 800)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setChatMessages([
      {
        id: 1,
        text: "Chat cleared. How can I assist you today?",
        sender: 'assistant',
        timestamp: 'Just now',
        avatar: '🤖'
      }
    ])
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent heading={"Teacher Dashboard"} subHeading={"Overview of your teaching activities"} role='admin' />

      <div className="container max-w-full mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Subjects */}
          <div className="xl:col-span-1">
            {/* My Subjects */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Subjects</h3>
              </div>

              {dashboardSubjects.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <FiBook className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                  <p className="text-gray-500 text-base sm:text-lg font-medium">No subjects found</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    You are not assigned to any subjects yet
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
                    <FiEye className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg font-medium">Select a subject to view attendance</p>
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
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                {record.studentName}
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center text-sm text-gray-500">
                              {record.rollNo}
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center text-sm text-gray-500">
                              {record.time}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <FiEye className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg font-medium">No attendance records found</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
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

      {/* Floating Chat Widget */}
      {!isChatOpen ? (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 group"
          aria-label="Open support chat"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
              <FiMessageCircle className="h-7 w-7" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-bold">!</span>
              </div>
            </div>
          </div>
          <div className="absolute right-20 bottom-4 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Need help? Chat with us
          </div>
        </button>
      ) : (
        <div className={`fixed right-6 z-50 transition-all duration-300 ${isMinimized ? 'bottom-6' : 'bottom-6'}`}>
          {isMinimized ? (
            <div 
              onClick={() => setIsMinimized(false)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-xl px-5 py-3 cursor-pointer hover:shadow-2xl transition-all duration-300 flex items-center space-x-3 group"
            >
              <FiMessageCircle className="h-5 w-5" />
              <span className="font-medium">Support Chat</span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm">Click to open</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-80 sm:w-96">
              {/* Chat Header with Gradient */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <FiHelpCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">AI Support Assistant</h3>
                    <p className="text-indigo-100 text-xs">Online • 24/7 Support</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMinimize}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    aria-label="Minimize chat"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    aria-label="Close chat"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="h-80 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                    >
                      {msg.sender === 'assistant' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                          {msg.avatar}
                        </div>
                      )}
                      <div className="max-w-[75%]">
                        <div
                          className={`rounded-2xl px-4 py-3 ${msg.sender === 'user'
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                            }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-right text-gray-500' : 'text-gray-400'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                      {msg.sender === 'user' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                          {msg.avatar}
                        </div>
                      )}
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start items-end space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                        🤖
                      </div>
                      <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={() => setMessage("How to generate attendance reports?")}
                    className="text-xs bg-white border border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    📊 Reports
                  </button>
                  <button
                    onClick={() => setMessage("How to mark attendance?")}
                    className="text-xs bg-white border border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    ✓ Mark Attendance
                  </button>
                  <button
                    onClick={() => setMessage("Technical issues with attendance system")}
                    className="text-xs bg-white border border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    🔧 Tech Support
                  </button>
                </div>

                {/* Chat Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isSending}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button
                      onClick={clearChat}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors"
                      title="Clear chat"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg p-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      <FiSend className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Press Enter to send • Shift + Enter for new line
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard_Page