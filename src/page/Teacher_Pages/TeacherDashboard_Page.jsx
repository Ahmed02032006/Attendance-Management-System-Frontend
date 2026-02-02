import React, { useState, useEffect, useRef } from 'react'
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
  FiMessageSquare,
  FiSend,
  FiX,
  FiHelpCircle,
  FiTrash2,
  FiExternalLink
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { BiSupport } from "react-icons/bi";
import {
  getDashboardSubjects,
  getDashboardAttendance,
  clearDashboard
} from '../../store/Teacher-Slicer/Dashboard-Slicer.js'

// Key for localStorage
const CHAT_STORAGE_KEY = 'teacher_dashboard_chat_history';

// URL to page name mapping
const PAGE_NAME_MAPPING = {
  'https://attendance-management-system-fronte-two.vercel.app/teacher/dashboard': 'Dashboard Page',
  'https://attendance-management-system-fronte-two.vercel.app/teacher/subject': 'Subject Page',
  'https://attendance-management-system-fronte-two.vercel.app/teacher/attendance': 'Attendance Page',
  'http://localhost:5000/teacher/dashboard': 'Dashboard Page',
  'http://localhost:5000/teacher/subject': 'Subject Page',
  'http://localhost:5000/teacher/attendance': 'Attendance Page',
  'http://localhost:3000/teacher/dashboard': 'Dashboard Page',
  'http://localhost:3000/teacher/subject': 'Subject Page',
  'http://localhost:3000/teacher/attendance': 'Attendance Page',
};

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
      text: "Hello! I'm your virtual assistant. How can I help you with attendance management today?",
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [isSending, setIsSending] = useState(false)

  // Refs for auto-focus and auto-scroll
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const { user } = useSelector((state) => state.auth)
  const userId = user?.id

  // API configuration
  const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api/v1/ai/query'
    : 'https://attendance-management-system-backen.vercel.app/api/v1/ai/query';

  // Function to format AI response with clickable page names and styled headings
  const formatAIResponse = (text) => {
    if (!text) return text;
    
    // Clean up the text and split into lines
    const lines = text.split('\n');
    const formattedLines = [];
    
    // Process each line for formatting
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Handle headings (lines starting with # followed by text)
      if (line.startsWith('# ')) {
        // Extract heading text (remove # and any extra spaces)
        const headingText = line.replace(/^#+\s*/, '');
        formattedLines.push(
          <div key={`heading-${i}`} className="font-semibold text-gray-900 text-sm mb-1 mt-2 first:mt-0">
            {headingText}
          </div>
        );
      }
      // Handle numbered lists
      else if (/^\d+\.\s/.test(line)) {
        formattedLines.push(
          <div key={`list-${i}`} className="flex items-start space-x-2 ml-1 my-1">
            <span className="text-gray-600 font-medium text-xs mt-0.5">{line.match(/^\d+/)[0]}.</span>
            <span className="text-gray-700 text-sm flex-1">{line.replace(/^\d+\.\s*/, '')}</span>
          </div>
        );
      }
      // Handle bullet points (starting with •, -, or *)
      else if (/^[•\-\*]\s/.test(line)) {
        formattedLines.push(
          <div key={`bullet-${i}`} className="flex items-start space-x-2 ml-1 my-1">
            <span className="text-gray-400 mt-0.5">•</span>
            <span className="text-gray-700 text-sm flex-1">{line.replace(/^[•\-\*]\s*/, '')}</span>
          </div>
        );
      }
      // Handle URLs in the line
      else if (line.includes('http')) {
        // Check for known URLs in this line
        let processedLine = line;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = line.match(urlRegex) || [];
        
        if (urls.length > 0) {
          const parts = line.split(urlRegex);
          const elements = [];
          
          parts.forEach((part, index) => {
            elements.push(<span key={`text-${index}`}>{part}</span>);
            
            if (index < urls.length) {
              const url = urls[index];
              const pageName = PAGE_NAME_MAPPING[url];
              
              if (pageName) {
                elements.push(
                  <a
                    key={`link-${index}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 hover:underline font-medium transition-colors"
                  >
                    {pageName}
                  </a>
                );
              } else {
                elements.push(<span key={`url-${index}`}>{url}</span>);
              }
            }
          });
          
          formattedLines.push(
            <div key={`line-${i}`} className="text-gray-700 text-sm my-1">
              {elements}
            </div>
          );
        } else {
          // Regular text line
          formattedLines.push(
            <div key={`line-${i}`} className="text-gray-700 text-sm my-1">
              {line || <br />}
            </div>
          );
        }
      }
      // Regular text line (including empty lines for spacing)
      else {
        formattedLines.push(
          <div key={`line-${i}`} className="text-gray-700 text-sm my-1">
            {line || <br />}
          </div>
        );
      }
    }
    
    return formattedLines;
  };

  // Function to render message content with formatting
  const renderMessageContent = (text, sender) => {
    if (sender === 'user') {
      return text;
    }
    
    // For assistant messages, apply formatting
    const formattedContent = formatAIResponse(text);
    
    return (
      <div className="space-y-1">
        {formattedContent}
      </div>
    );
  };

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedChat = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedChat) {
      try {
        const parsedChat = JSON.parse(savedChat);
        setChatMessages(parsedChat);
      } catch (error) {
        console.error('Error loading chat history:', error);
        // If there's an error parsing, use default chat
        localStorage.removeItem(CHAT_STORAGE_KEY);
      }
    }
  }, []);

  // Save chat messages to localStorage whenever they change
  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  // Auto-scroll to bottom when chat opens or new messages are added
  useEffect(() => {
    if (isChatOpen) {
      // Small delay to ensure chat container is fully rendered
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [isChatOpen, chatMessages]);

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

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus()
      }, 150)
    }
  }, [isChatOpen])

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  }

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

  // Function to call the AI API via your backend proxy
  const callAIApi = async (userQuery) => {
    try {
      console.log('Sending query to AI service via proxy:', userQuery);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if needed
          ...(user?.token && { Authorization: `Bearer ${user.token}` })
        },
        body: JSON.stringify({
          query: userQuery,
          userId: userId,
          // Add context about the current dashboard state
          context: {
            currentSubject: selectedSubjectData?.name,
            currentDate: currentDate,
            totalSubjects: dashboardSubjects.length,
            hasAttendanceData: currentAttendanceRecords.length > 0
          }
        })
      });

      const data = await response.json();

      if (!data.success) {
        console.warn('AI service returned non-success:', data);
        return data.response || "I couldn't process your request at the moment.";
      }

      // Return the raw response - we'll format it in the render function
      return data.response;

    } catch (error) {
      console.error('Error calling AI proxy:', error);

      // Smart fallback responses based on query
      const lowerQuery = userQuery.toLowerCase();

      if (lowerQuery.includes('attendance') && lowerQuery.includes('add')) {
        return `To add attendance:\n\n1. Navigate to the Attendance Page\n2. Select a subject\n3. Choose the date for attendance\n4. Mark students as present/absent\n5. Click "Save Attendance"\n\nYou currently have ${dashboardSubjects.length} subjects assigned.`;

      } else if (lowerQuery.includes('view') && lowerQuery.includes('record')) {
        return `To view attendance records:\n\n1. Select a subject from the left panel\n2. Use date navigation to select a specific date\n3. View student records in the table\n4. Use pagination if there are many students\n\nCurrently showing ${currentAttendanceRecords.length} records for ${selectedSubjectData?.name || 'selected subject'}.`;

      } else if (lowerQuery.includes('dashboard') || lowerQuery.includes('overview')) {
        return `Your dashboard shows:\n\n• ${dashboardSubjects.length} assigned subjects on the left\n• Attendance records for selected subject on the right\n• Date navigation for historical records\n• Student details with roll numbers and timestamps\n\nSelect a subject to see detailed attendance.`;

      } else if (lowerQuery.includes('subject') || lowerQuery.includes('course')) {
        return `You have ${dashboardSubjects.length} subjects:\n${dashboardSubjects.map((sub, i) => `${i + 1}. ${sub.name} (${sub.code}) - ${sub.students || 0} students`).join('\n')}\n\nClick on any subject to view its attendance records.`;

      } else {
        return `I'm having trouble connecting to the AI service. Here's what you can do:\n\n1. Check your internet connection\n2. Try asking about:\n   • How to add attendance\n   • Viewing attendance records\n   • Understanding the dashboard\n   • Your assigned subjects\n3. Contact support if the issue persists\n\nError: ${error.message}`;
      }
    }
  };

  // Main chat function
  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage = {
      id: Date.now(), // Use timestamp for unique ID
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setChatMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsSending(true)

    try {
      // Call the AI API with user's message
      const aiResponseText = await callAIApi(message)

      const aiResponse = {
        id: Date.now() + 1, // Use timestamp for unique ID
        text: aiResponseText,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setChatMessages(prev => [...prev, aiResponse])

    } catch (error) {
      console.error('Error in chat:', error)

      // Fallback response if API fails
      const fallbackResponse = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Here are some common actions:\n\n1. To add attendance: Go to Attendance Page\n2. To view records: Select a subject above\n3. To see student details: Check the table below\n\nPlease try your query again or contact support if the issue persists.",
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setChatMessages(prev => [...prev, fallbackResponse])
      
    } finally {
      setIsSending(false)

      // Focus input after response
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    // Reset to initial message only
    const initialChat = [
      {
        id: 1,
        text: "Hello! I'm your virtual assistant. How can I help you with attendance management today?",
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    
    setChatMessages(initialChat);
    // Also clear from localStorage
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(initialChat));
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
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${getSubjectColor(index)} flex items-center justify-center shrink-0`}>
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
                      <div className="text-right shrink-0 ml-2">
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
                    className={`p-2 rounded-lg transition-colors shrink-0 ${currentDateIndex >= availableDates.length - 1
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
                    className={`p-2 rounded-lg transition-colors shrink-0 ${currentDateIndex <= 0
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
                <h3 className="text-white font-semibold">Attendance Support</h3>
                <p className="text-sky-100 text-xs">AI Assistant</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="text-sky-100 hover:text-white p-2 rounded-full hover:bg-sky-700 transition-colors"
              aria-label="Clear chat history"
              title="Clear Chat"
            >
              <FiTrash2 className="h-5 w-5" />
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
                    <div className="text-sm whitespace-pre-line">
                      {renderMessageContent(msg.text, msg.sender)}
                    </div>
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
                      <div className="text-sm text-gray-600">Thinking...</div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invisible element for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about attendance, subjects, or dashboard..."
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
              Ask about attendance management, subjects, or dashboard features
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard_Page