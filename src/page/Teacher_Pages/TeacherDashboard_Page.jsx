import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import {
  FiBook,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiSend,
  FiX,
  FiHelpCircle,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiHeart,
  FiUsers
} from 'react-icons/fi'
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
  'https://attendance-management-system-fronte-two.vercel.app/teacher/dashboard': 'Dashboard',
  'https://attendance-management-system-fronte-two.vercel.app/teacher/subject': 'Subjects',
  'https://attendance-management-system-fronte-two.vercel.app/teacher/attendance': 'Attendance',
  'http://localhost:5000/teacher/dashboard': 'Dashboard',
  'http://localhost:5000/teacher/subject': 'Subjects',
  'http://localhost:5000/teacher/attendance': 'Attendance',
  'http://localhost:3000/teacher/dashboard': 'Dashboard',
  'http://localhost:3000/teacher/subject': 'Subjects',
  'http://localhost:3000/teacher/attendance': 'Attendance',
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

  // Refs
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const { user } = useSelector((state) => state.auth)
  const userId = user?.id

  // API configuration
  const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api/v1/ai/query'
    : 'https://attendance-management-system-backen.vercel.app/api/v1/ai/query';

  // Function to split text into numbered list items (from prev code)
  const splitNumberedList = (text) => {
    // Regex to match numbered list items like "1. ", "2. ", etc.
    const numberedListRegex = /(\d+\.\s+)/g;
    const parts = text.split(numberedListRegex);

    if (parts.length <= 1) {
      // No numbered list found
      return [text];
    }

    const result = [];
    for (let i = 0; i < parts.length; i++) {
      if (numberedListRegex.test(parts[i])) {
        // This is a number prefix (e.g., "1. ")
        const numberPart = parts[i];
        const contentPart = parts[i + 1] || '';
        result.push(numberPart + contentPart);
        i++; // Skip the next part since we've combined it
      } else if (parts[i].trim()) {
        // Non-numbered content
        result.push(parts[i]);
      }
    }

    return result;
  };

  // Helper function to process a single line for URLs (from prev code)
  const processLineForURLs = (line) => {
    // Clean up markdown formatting
    let cleanedLine = line
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/`/g, '') // Remove backticks
      .trim();

    // Create a regex pattern to match all known URLs
    const urlPattern = new RegExp(
      Object.keys(PAGE_NAME_MAPPING)
        .map(url => url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|'),
      'g'
    );

    // Split the line by URLs
    const parts = cleanedLine.split(urlPattern);
    const matches = cleanedLine.match(urlPattern) || [];

    // If no URLs found, return the line as is
    if (matches.length === 0) {
      return cleanedLine;
    }

    // Reconstruct with clickable links
    const elements = parts.reduce((acc, part, index) => {
      if (part) {
        acc.push(part);
      }
      if (index < matches.length) {
        const url = matches[index];
        const pageName = PAGE_NAME_MAPPING[url];
        acc.push(
          <a
            key={`link-${index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            {pageName}
          </a>
        );
      }
      return acc;
    }, []);

    return elements;
  };

  // Updated Format AI response with full formatting (from prev code)
  const formatAIResponse = (text) => {
    if (!text) return text;

    // First, handle numbered lists that might be concatenated
    const lines = text.split('\n');
    const formattedLines = [];

    for (let line of lines) {
      // Check if line starts with # (heading)
      if (line.trim().startsWith('#')) {
        // Remove the # and trim, then wrap in heading element
        const headingText = line.replace(/^#+\s*/, '').trim();
        if (headingText) {
          formattedLines.push(
            <div key={`heading-${formattedLines.length}`} className="font-semibold text-base text-gray-900 mt-3 mb-2">
              {headingText}
            </div>
          );
        }
      } else {
        // Check if this line contains numbered list items without proper line breaks
        if (line.match(/\d+\.\s+/)) {
          // Split the line into individual numbered items
          const listItems = splitNumberedList(line);

          listItems.forEach((item, index) => {
            if (item.trim()) {
              // Check if it's a numbered item
              if (item.match(/^\d+\.\s+/)) {
                formattedLines.push(
                  <div key={`list-${formattedLines.length}-${index}`} className="flex items-start ml-2 my-1">
                    <span className="font-medium text-gray-700 mr-2 min-w-5">{item.match(/^\d+/)[0]}.</span>
                    <span className="flex-1">{processLineForURLs(item.replace(/^\d+\.\s+/, ''))}</span>
                  </div>
                );
              } else {
                // Regular text (not a numbered item)
                const processedLine = processLineForURLs(item);
                formattedLines.push(
                  <div key={`line-${formattedLines.length}-${index}`} className="my-1">
                    {processedLine}
                  </div>
                );
              }
            }
          });
        } else {
          // Regular line - check for bullet points
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
            formattedLines.push(
              <div key={`bullet-${formattedLines.length}`} className="flex items-start ml-2 my-1">
                <span className="mr-2">•</span>
                <span className="flex-1">{processLineForURLs(trimmedLine.substring(1).trim())}</span>
              </div>
            );
          } else {
            // Regular text line
            const processedLine = processLineForURLs(line);
            formattedLines.push(
              <div key={`line-${formattedLines.length}`} className="my-1">
                {processedLine}
              </div>
            );
          }
        }
      }
    }

    return formattedLines;
  };

  // Function to render message content with formatting (from prev code)
  const renderMessageContent = (text, sender) => {
    if (sender === 'user') {
      return text;
    }

    // For assistant messages, apply URL formatting
    const formattedContent = formatAIResponse(text);

    // Check if we have React elements (from formatting)
    if (Array.isArray(formattedContent)) {
      return (
        <div className="space-y-0.5">
          {formattedContent.map((item, index) => (
            <React.Fragment key={index}>
              {item}
            </React.Fragment>
          ))}
        </div>
      );
    }

    // If it's just a string, return it
    return formattedContent;
  };

  // Load chat history
  useEffect(() => {
    const savedChat = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedChat) {
      try {
        setChatMessages(JSON.parse(savedChat));
      } catch (error) {
        localStorage.removeItem(CHAT_STORAGE_KEY);
      }
    }
  }, []);

  // Save chat messages
  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  // Auto-scroll
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [isChatOpen, chatMessages]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoaded(false);
        await Promise.all([
          dispatch(getDashboardSubjects(userId)).unwrap(),
          dispatch(getDashboardAttendance(userId)).unwrap()
        ]);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDataLoaded(true);
      }
    };

    fetchData();
    return () => dispatch(clearDashboard());
  }, [dispatch, userId]);

  // Set initial subject
  useEffect(() => {
    if (dashboardSubjects.length > 0 && !selectedSubject && dataLoaded) {
      setSelectedSubject(dashboardSubjects[0].id);
      const subjectAttendance = dashboardAttendance[dashboardSubjects[0].id];
      if (subjectAttendance && Object.keys(subjectAttendance).length > 0) {
        setCurrentDate(Object.keys(subjectAttendance).sort().reverse()[0]);
      }
    }
  }, [dashboardSubjects, selectedSubject, dashboardAttendance, dataLoaded]);

  // Auto-focus input
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 150);
    }
  }, [isChatOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  // Get available dates
  const getAvailableDates = () => {
    if (!selectedSubject) return [];
    const subjectData = dashboardAttendance[selectedSubject];
    return subjectData ? Object.keys(subjectData).sort().reverse() : [];
  };

  const availableDates = getAvailableDates();
  const currentDateIndex = availableDates.indexOf(currentDate);

  // Get attendance records
  const getCurrentAttendanceRecords = () => {
    if (!selectedSubject) return [];
    const subjectData = dashboardAttendance[selectedSubject];
    return subjectData && subjectData[currentDate] ? subjectData[currentDate] : [];
  };

  const currentAttendanceRecords = getCurrentAttendanceRecords();
  const selectedSubjectData = dashboardSubjects.find(subject => subject.id === selectedSubject);

  // Quick stats
  const totalStudents = dashboardSubjects.reduce((acc, subject) => acc + (subject.students || 0), 0);
  const attendanceRate = selectedSubjectData ?
    Math.round((currentAttendanceRecords.length / (selectedSubjectData.students || 1)) * 100) : 0;

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = currentAttendanceRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(currentAttendanceRecords.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Navigate date
  const navigateDate = (direction) => {
    const currentIndex = availableDates.indexOf(currentDate);
    if (direction === 'prev' && currentIndex < availableDates.length - 1) {
      setCurrentDate(availableDates[currentIndex + 1]);
      setCurrentPage(1);
    } else if (direction === 'next' && currentIndex > 0) {
      setCurrentDate(availableDates[currentIndex - 1]);
      setCurrentPage(1);
    }
  };

  // Handle subject selection
  const handleSubjectSelect = (subjectId) => {
    setSelectedSubject(subjectId);
    setCurrentPage(1);
    const subjectAttendance = dashboardAttendance[subjectId];
    if (subjectAttendance && Object.keys(subjectAttendance).length > 0) {
      setCurrentDate(Object.keys(subjectAttendance).sort().reverse()[0]);
    } else {
      setCurrentDate('');
    }
  };

  // Subject color
  const getSubjectColor = (index) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500'];
    return colors[index % colors.length];
  };

  // AI API call
  const callAIApi = async (userQuery) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { Authorization: `Bearer ${user.token}` })
        },
        body: JSON.stringify({
          query: userQuery,
          userId: userId,
          context: {
            currentSubject: selectedSubjectData?.name,
            totalSubjects: dashboardSubjects.length
          }
        })
      });

      const data = await response.json();
      return data.response || "I couldn't process your request at the moment.";
    } catch (error) {
      return `I'm having trouble connecting. Please try again.`;
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsSending(true);

    try {
      const aiResponseText = await callAIApi(message);
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again.",
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    const initialChat = [{
      id: 1,
      text: "Hello! I'm your virtual assistant. How can I help you with attendance management today?",
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
    setChatMessages(initialChat);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(initialChat));
  };

  // Calculate how many students consistently attend
  const calculateRetention = () => {
    const studentAttendanceCount = {};
    const totalClasses = {};

    dashboardSubjects.forEach(subject => {
      const subjectAttendance = dashboardAttendance[subject.id];
      if (subjectAttendance) {
        const dates = Object.keys(subjectAttendance);
        totalClasses[subject.id] = dates.length;

        dates.forEach(date => {
          subjectAttendance[date].forEach(record => {
            const studentId = record.studentId || record.id;
            if (!studentAttendanceCount[studentId]) {
              studentAttendanceCount[studentId] = {};
            }
            studentAttendanceCount[studentId][subject.id] =
              (studentAttendanceCount[studentId][subject.id] || 0) + 1;
          });
        });
      }
    });

    // Students who attend > 80% of classes
    let consistentStudents = 0;
    let totalActiveStudents = Object.keys(studentAttendanceCount).length;

    Object.values(studentAttendanceCount).forEach(studentSubjects => {
      Object.entries(studentSubjects).forEach(([subjectId, attended]) => {
        if (totalClasses[subjectId] > 0) {
          const attendanceRate = (attended / totalClasses[subjectId]) * 100;
          if (attendanceRate >= 80) {
            consistentStudents++;
          }
        }
      });
    });

    const retentionRate = totalActiveStudents > 0
      ? Math.round((consistentStudents / totalActiveStudents) * 100)
      : 0;

    return { rate: retentionRate, consistent: consistentStudents, total: totalActiveStudents };
  };

  const retention = calculateRetention();

  // Loading state
  if (isLoading || !dataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiBook className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading your dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Preparing your teaching overview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent
        heading="Teacher Dashboard"
        subHeading="Overview of your teaching activities"
        role='admin'
      />

      <div className="max-w-7xl xl:max-w-[1600px] 2xl:max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 lg:py-8 xl:py-10">
        {/* Quick Stats - Responsive grid for all screen sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 xl:gap-8 mb-6 lg:mb-8 xl:mb-10">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 lg:p-6 xl:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm lg:text-base xl:text-lg text-gray-500">Total Subjects</p>
                <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-gray-900 mt-1 lg:mt-2 xl:mt-3">{dashboardSubjects.length}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-blue-50 rounded-lg flex items-center justify-center">
                <FiBook className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 lg:p-6 xl:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm lg:text-base xl:text-lg text-gray-500">Total Students</p>
                <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-gray-900 mt-1 lg:mt-2 xl:mt-3">{totalStudents}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-green-50 rounded-lg flex items-center justify-center">
                <FiUsers className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 lg:p-6 xl:p-8 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm lg:text-base xl:text-lg text-gray-500">Student Retention</p>
                <p className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-gray-900 mt-1 lg:mt-2 xl:mt-3">{retention.rate}%</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-emerald-50 rounded-lg flex items-center justify-center">
                <FiHeart className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid - Optimized for 2000px screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10">
          {/* Subjects Panel - Adjusted proportions for 2000px */}
          <div className="lg:col-span-4 xl:col-span-3 2xl:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 h-full">
              <div className="p-4 lg:p-5 xl:p-6 border-b border-gray-200">
                <h3 className="font-medium lg:font-semibold text-gray-900 text-base lg:text-lg xl:text-xl">My Subjects</h3>
                <p className="text-xs lg:text-sm xl:text-base text-gray-500 mt-1">{dashboardSubjects.length} subjects assigned</p>
              </div>

              {dashboardSubjects.length === 0 ? (
                <div className="p-8 lg:p-10 xl:p-12 text-center">
                  <FiBook className="h-8 w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm lg:text-base xl:text-lg">No subjects found</p>
                </div>
              ) : (
                <div className="p-3 lg:p-4 xl:p-5 max-h-[415px] lg:max-h-[500px] xl:max-h-[600px] 2xl:max-h-[700px] overflow-y-auto hide-scrollbar">
                  {dashboardSubjects.map((subject, index) => {
                    const isSelected = selectedSubject === subject.id;
                    return (
                      <div
                        key={subject.id}
                        onClick={() => handleSubjectSelect(subject.id)}
                        className={`
                          flex items-center p-3 lg:p-4 xl:p-5 rounded-lg mb-1 cursor-pointer transition-all
                          ${isSelected
                            ? 'bg-blue-50 border border-blue-100'
                            : 'hover:bg-gray-50 border border-transparent'
                          }
                        `}
                      >
                        <div className={`w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-md ${getSubjectColor(index)} flex items-center justify-center text-white text-xs lg:text-sm xl:text-base font-medium shrink-0`}>
                          {subject.title?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 lg:ml-4 xl:ml-5 flex-1 min-w-0">
                          <p className={`text-sm lg:text-base xl:text-lg font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                            {subject.title}
                          </p>
                          <p className="text-xs lg:text-sm xl:text-base text-gray-500 truncate">{subject.code}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className={`text-sm lg:text-base xl:text-lg font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                            {subject.students || 0}
                          </p>
                          <p className="text-xs lg:text-sm xl:text-base text-gray-400">students</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Attendance Panel - Expanded for 2000px */}
          <div className="lg:col-span-8 xl:col-span-9 2xl:col-span-9">
            {selectedSubject ? (
              <>
                {/* Date Navigation - Enhanced for large screens */}
                {availableDates.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-5 xl:p-6 mb-4 lg:mb-6 xl:mb-8">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => navigateDate('prev')}
                        disabled={currentDateIndex >= availableDates.length - 1}
                        className="p-1.5 lg:p-2 xl:p-3 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FiChevronLeft className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                      </button>

                      <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
                        <FiCalendar className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-gray-400" />
                        <span className="text-sm lg:text-base xl:text-lg font-medium text-gray-900">
                          {formatDate(currentDate)}
                        </span>
                        <span className="text-xs lg:text-sm xl:text-base bg-gray-100 text-gray-600 px-2 py-1 lg:px-3 lg:py-1.5 xl:px-4 xl:py-2 rounded-full">
                          {currentAttendanceRecords.length} present
                        </span>
                      </div>

                      <button
                        onClick={() => navigateDate('next')}
                        disabled={currentDateIndex <= 0}
                        className="p-1.5 lg:p-2 xl:p-3 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FiChevronRight className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Attendance Table - Optimized for 2000px */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 lg:p-5 xl:p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FiEye className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-gray-400" />
                        <h3 className="font-medium lg:font-semibold text-gray-900 text-base lg:text-lg xl:text-xl">Attendance Records</h3>
                      </div>
                      <span className="text-xs lg:text-sm xl:text-base text-gray-500">
                        {currentAttendanceRecords.length} students
                      </span>
                    </div>
                  </div>

                  {currentRecords.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">Student</th>
                              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-center text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-center text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">Time</th>
                              <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-center text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {currentRecords.map((record) => (
                              <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 whitespace-nowrap">
                                  <span className="text-sm lg:text-base xl:text-lg text-gray-900">{record.studentName}</span>
                                </td>
                                <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 whitespace-nowrap text-center text-sm lg:text-base xl:text-lg text-gray-600">
                                  {record.rollNo}
                                </td>
                                <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 whitespace-nowrap text-center text-sm lg:text-base xl:text-lg text-gray-600">
                                  <div className="flex items-center justify-center">
                                    <FiClock className="h-3 w-3 lg:h-4 lg:w-4 xl:h-5 xl:w-5 mr-1 text-gray-400" />
                                    {record.time}
                                  </div>
                                </td>
                                <td className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 whitespace-nowrap text-center">
                                  <span className="inline-flex items-center px-2 py-0.5 lg:px-3 lg:py-1 xl:px-4 xl:py-1.5 rounded-full text-xs lg:text-sm xl:text-base font-medium bg-green-100 text-green-800">
                                    Present
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination - Enhanced for large screens */}
                      {totalPages > 1 && (
                        <div className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                          <span className="text-xs lg:text-sm xl:text-base text-gray-500">
                            Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, currentAttendanceRecords.length)} of {currentAttendanceRecords.length}
                          </span>
                          <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
                            <button
                              onClick={prevPage}
                              disabled={currentPage === 1}
                              className="px-3 py-1 lg:px-4 lg:py-2 xl:px-5 xl:py-2.5 text-xs lg:text-sm xl:text-base border border-gray-300 rounded-md text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40"
                            >
                              Previous
                            </button>
                            <span className="text-xs lg:text-sm xl:text-base text-gray-600">
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              onClick={nextPage}
                              disabled={currentPage === totalPages}
                              className="px-3 py-1 lg:px-4 lg:py-2 xl:px-5 xl:py-2.5 text-xs lg:text-sm xl:text-base border border-gray-300 rounded-md text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 lg:p-12 xl:p-16 text-center">
                      <FiEye className="h-8 w-8 lg:h-12 lg:w-12 xl:h-16 xl:w-16 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm lg:text-base xl:text-lg text-gray-500">No attendance records found</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 lg:p-12 xl:p-16 text-center">
                <FiEye className="h-8 w-8 lg:h-12 lg:w-12 xl:h-16 xl:w-16 text-gray-300 mx-auto mb-2" />
                <p className="text-sm lg:text-base xl:text-lg text-gray-500">Select a subject to view attendance</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Chat Button - Optimized for large screens */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 xl:bottom-10 xl:right-10 2xl:bottom-12 2xl:right-12 z-40 w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
      >
        {isChatOpen ? <FiX className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 2xl:h-8 2xl:w-8" /> : <BiSupport className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 2xl:h-8 2xl:w-8" />}
      </button>

      {/* Chat Box - Scaled for 2000px screens */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 lg:bottom-24 lg:right-8 xl:bottom-28 xl:right-10 2xl:bottom-32 2xl:right-12 z-50 w-80 lg:w-96 xl:w-[400px] 2xl:w-[450px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-blue-600 px-4 lg:px-5 xl:px-6 2xl:px-8 py-3 lg:py-4 xl:py-5 2xl:py-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiHelpCircle className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-white" />
              <span className="text-sm lg:text-base xl:text-lg 2xl:text-xl font-medium text-white">Attendance Support</span>
            </div>
            <button
              onClick={clearChat}
              className="text-white/80 hover:text-white p-1 rounded"
            >
              <FiTrash2 className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-72 lg:h-96 xl:h-[400px] 2xl:h-[500px] overflow-y-auto p-3 lg:p-4 xl:p-5 2xl:p-6 bg-gray-50">
            <div className="space-y-3 lg:space-y-4 xl:space-y-5">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 lg:px-4 lg:py-3 xl:px-5 xl:py-4 2xl:px-6 2xl:py-5 text-sm lg:text-base xl:text-lg ${msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                  >
                    <div className="whitespace-pre-line">
                      {renderMessageContent(msg.text, msg.sender)}
                    </div>
                    <p className={`text-[10px] lg:text-xs xl:text-sm mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 lg:px-4 lg:py-3 xl:px-5 xl:py-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-3 lg:p-4 xl:p-5 2xl:p-6">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask something..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 lg:px-4 lg:py-3 xl:px-5 xl:py-4 text-sm lg:text-base xl:text-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 lg:p-3 xl:p-4 transition-colors disabled:opacity-50"
              >
                <FiSend className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard_Page;