import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import {
  FiBook,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiMessageSquare,
  FiSend,
  FiX,
  FiHelpCircle
} from 'react-icons/fi'
import { BiSupport } from "react-icons/bi";
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
      text: "Hello! I'm your virtual assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [isSending, setIsSending] = useState(false)

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
        // toast.error('Failed to load dashboard data')
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

  // Chat functions
  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage = {
      id: chatMessages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setChatMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsSending(true)

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = {
        id: chatMessages.length + 2,
        text: `I've received your query: "${message}". This is a simulated response. In a real application, this would connect to a support system.`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setChatMessages(prev => [...prev, aiResponse])
      setIsSending(false)
    }, 1000)
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
        text: "Hello! I'm your virtual assistant. How can I help you today?",
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
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

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
        aria-label="Open customer support chat"
      >
        {isChatOpen ? (
          <FiX className="h-6 w-6" />
        ) : (
          // <FiMessageSquare className="h-6 w-6" />
          <BiSupport className="h-6 w-6" />
        )}
      </button>

      {/* Chat Assistant Box */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-sky-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <FiHelpCircle className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Customer Support</h3>
                <p className="text-sky-100 text-xs">Virtual Assistant</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="text-sky-100 hover:text-white text-sm font-medium px-2 py-1 rounded hover:bg-sky-700 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${msg.sender === 'user'
                        ? 'bg-sky-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.sender === 'user' ? 'You' : 'Assistant'} • {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 text-gray-800 rounded-lg rounded-bl-none px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Type your query and press Enter to send
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard_Page
