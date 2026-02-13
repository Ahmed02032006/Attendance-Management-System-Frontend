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
  FiUsers,
  FiBookOpen,
  FiAward,
  FiTrendingUp,
  FiCheckCircle,
  FiMoreVertical,
  FiMessageCircle
} from 'react-icons/fi'
import { BiSupport, BiTimeFive } from "react-icons/bi";
import { HiOutlineAcademicCap, HiOutlineUserGroup } from "react-icons/hi";
import { BsGraphUp, BsThreeDotsVertical } from "react-icons/bs";

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
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Refs for auto-focus and auto-scroll
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const { user } = useSelector((state) => state.auth)
  const userId = user?.id

  // API configuration
  const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api/v1/ai/query'
    : 'https://attendance-management-system-backen.vercel.app/api/v1/ai/query';

  // Function to split text into numbered list items
  const splitNumberedList = (text) => {
    const numberedListRegex = /(\d+\.\s+)/g;
    const parts = text.split(numberedListRegex);

    if (parts.length <= 1) {
      return [text];
    }

    const result = [];
    for (let i = 0; i < parts.length; i++) {
      if (numberedListRegex.test(parts[i])) {
        const numberPart = parts[i];
        const contentPart = parts[i + 1] || '';
        result.push(numberPart + contentPart);
        i++;
      } else if (parts[i].trim()) {
        result.push(parts[i]);
      }
    }

    return result;
  };

  // Function to format AI response with clickable page names and styled headings
  const formatAIResponse = (text) => {
    if (!text) return text;

    const lines = text.split('\n');
    const formattedLines = [];

    for (let line of lines) {
      if (line.trim().startsWith('#')) {
        const headingText = line.replace(/^#+\s*/, '').trim();
        if (headingText) {
          formattedLines.push(
            <div key={`heading-${formattedLines.length}`} className="font-semibold text-base text-gray-900 mt-3 mb-2 border-b border-gray-100 pb-1">
              {headingText}
            </div>
          );
        }
      } else {
        if (line.match(/\d+\.\s+/)) {
          const listItems = splitNumberedList(line);

          listItems.forEach((item, index) => {
            if (item.trim()) {
              if (item.match(/^\d+\.\s+/)) {
                formattedLines.push(
                  <div key={`list-${formattedLines.length}-${index}`} className="flex items-start ml-2 my-1.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-medium mr-2 shrink-0">
                      {item.match(/^\d+/)[0]}
                    </span>
                    <span className="flex-1 text-gray-700">{processLineForURLs(item.replace(/^\d+\.\s+/, ''))}</span>
                  </div>
                );
              } else {
                const processedLine = processLineForURLs(item);
                formattedLines.push(
                  <div key={`line-${formattedLines.length}-${index}`} className="my-1 text-gray-700">
                    {processedLine}
                  </div>
                );
              }
            }
          });
        } else {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
            formattedLines.push(
              <div key={`bullet-${formattedLines.length}`} className="flex items-start ml-2 my-1.5">
                <span className="mr-2 text-sky-600">•</span>
                <span className="flex-1 text-gray-700">{processLineForURLs(trimmedLine.substring(1).trim())}</span>
              </div>
            );
          } else {
            const processedLine = processLineForURLs(line);
            formattedLines.push(
              <div key={`line-${formattedLines.length}`} className="my-1 text-gray-700">
                {processedLine}
              </div>
            );
          }
        }
      }
    }

    return formattedLines;
  };

  // Helper function to process a single line for URLs
  const processLineForURLs = (line) => {
    let cleanedLine = line
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/`/g, '')
      .trim();

    const urlPattern = new RegExp(
      Object.keys(PAGE_NAME_MAPPING)
        .map(url => url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|'),
      'g'
    );

    const parts = cleanedLine.split(urlPattern);
    const matches = cleanedLine.match(urlPattern) || [];

    if (matches.length === 0) {
      return cleanedLine;
    }

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
            className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium hover:underline transition-colors bg-sky-50 px-2 py-0.5 rounded-md"
          >
            {pageName}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        );
      }
      return acc;
    }, []);

    return elements;
  };

  // Function to render message content with formatting
  const renderMessageContent = (text, sender) => {
    if (sender === 'user') {
      return <span className="break-words">{text}</span>;
    }

    const formattedContent = formatAIResponse(text);

    if (Array.isArray(formattedContent)) {
      return (
        <div className="space-y-1">
          {formattedContent.map((item, index) => (
            <React.Fragment key={index}>
              {item}
            </React.Fragment>
          ))}
        </div>
      );
    }

    return <span className="break-words">{formattedContent}</span>;
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
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      setUnreadMessages(0);
    }
  }, [isChatOpen, chatMessages]);

  // Fetch data on component mount
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

    return () => {
      dispatch(clearDashboard());
    };
  }, [dispatch, userId]);

  // Set initial selected subject when subjects are loaded
  useEffect(() => {
    if (dashboardSubjects.length > 0 && !selectedSubject && dataLoaded) {
      setSelectedSubject(dashboardSubjects[0].id);

      const subjectAttendance = dashboardAttendance[dashboardSubjects[0].id];
      if (subjectAttendance && Object.keys(subjectAttendance).length > 0) {
        const latestDate = Object.keys(subjectAttendance).sort().reverse()[0];
        setCurrentDate(latestDate);
      }
    }
  }, [dashboardSubjects, selectedSubject, dashboardAttendance, dataLoaded]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 150);
    }
  }, [isChatOpen]);

  // Update unread messages when not focused
  useEffect(() => {
    if (!isChatOpen && chatMessages.length > 0) {
      const lastAssistantMessage = [...chatMessages]
        .reverse()
        .find(msg => msg.sender === 'assistant');
      
      if (lastAssistantMessage && lastAssistantMessage.id > 1) {
        setUnreadMessages(prev => prev + 1);
      }
    }
  }, [chatMessages, isChatOpen]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  };

  // Get available dates for selected subject
  const getAvailableDates = () => {
    if (!selectedSubject) return [];
    const subjectData = dashboardAttendance[selectedSubject];
    return subjectData ? Object.keys(subjectData).sort().reverse() : [];
  };

  const availableDates = getAvailableDates();
  const currentDateIndex = availableDates.indexOf(currentDate);

  // Get current attendance records
  const getCurrentAttendanceRecords = () => {
    if (!selectedSubject) return [];
    const subjectData = dashboardAttendance[selectedSubject];
    return subjectData && subjectData[currentDate] ? subjectData[currentDate] : [];
  };

  const currentAttendanceRecords = getCurrentAttendanceRecords();
  const selectedSubjectData = dashboardSubjects.find(subject => subject.id === selectedSubject);

  // Calculate statistics
  const totalStudents = dashboardSubjects.reduce((acc, subject) => acc + (subject.students || 0), 0);
  const totalAttendanceRecords = Object.values(dashboardAttendance).reduce((acc, subject) => {
    return acc + Object.values(subject || {}).reduce((subAcc, date) => subAcc + date.length, 0);
  }, 0);
  const averageAttendance = selectedSubjectData ? 
    Math.round((currentAttendanceRecords.length / (selectedSubjectData.students || 1)) * 100) : 0;

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = currentAttendanceRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(currentAttendanceRecords.length / recordsPerPage);

  // Pagination functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Navigation functions
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
      const latestDate = Object.keys(subjectAttendance).sort().reverse()[0];
      setCurrentDate(latestDate);
    } else {
      setCurrentDate('');
    }
  };

  // Reset pagination when subject or date changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, currentDate]);

  // Color mapping for subjects
  const getSubjectColor = (index) => {
    const colors = [
      'from-sky-500 to-sky-600', 
      'from-emerald-500 to-emerald-600', 
      'from-violet-500 to-violet-600',
      'from-amber-500 to-amber-600', 
      'from-rose-500 to-rose-600', 
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600', 
      'from-cyan-500 to-cyan-600', 
      'from-orange-500 to-orange-600', 
      'from-teal-500 to-teal-600'
    ];
    return colors[index % colors.length];
  };

  // Function to call the AI API via your backend proxy
  const callAIApi = async (userQuery) => {
    try {
      console.log('Sending query to AI service via proxy:', userQuery);

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

      return data.response;

    } catch (error) {
      console.error('Error calling AI proxy:', error);

      const lowerQuery = userQuery.toLowerCase();

      if (lowerQuery.includes('attendance') && lowerQuery.includes('add')) {
        return `To add attendance:\n\n1. Navigate to the **Attendance Page**\n2. Select a subject from the dropdown\n3. Choose the date for attendance\n4. Mark students as present/absent\n5. Click "Save Attendance"\n\nYou currently have ${dashboardSubjects.length} subjects assigned.`;

      } else if (lowerQuery.includes('view') && lowerQuery.includes('record')) {
        return `To view attendance records:\n\n1. Select a subject from the left panel\n2. Use the date navigation arrows\n3. View student records in the table\n4. Use pagination for more records\n\nCurrently showing ${currentAttendanceRecords.length} records for ${selectedSubjectData?.name || 'selected subject'}.`;

      } else if (lowerQuery.includes('dashboard') || lowerQuery.includes('overview')) {
        return `Your dashboard overview:\n\n• **${dashboardSubjects.length}** assigned subjects\n• **${totalStudents}** total students\n• **${totalAttendanceRecords}** attendance records\n• **${averageAttendance}%** average attendance for selected subject\n\nSelect a subject to see detailed attendance.`;

      } else if (lowerQuery.includes('subject') || lowerQuery.includes('course')) {
        return `## Your Assigned Subjects\n\n${dashboardSubjects.map((sub, i) => `${i + 1}. **${sub.name}** (${sub.code})\n   • Students: ${sub.students || 0}\n   • Attendance records: ${Object.values(dashboardAttendance[sub.id] || {}).reduce((acc, date) => acc + date.length, 0)}\n`).join('\n')}\n\nClick on any subject to view its detailed attendance records.`;

      } else {
        return `I'm having trouble connecting to the AI service. Here are some things you can try:\n\n1. Check your internet connection\n2. Refresh the page\n3. Clear your browser cache\n4. Try asking about:\n   • How to add attendance\n   • Viewing attendance records\n   • Understanding the dashboard\n   • Your assigned subjects\n\nError: ${error.message}`;
      }
    }
  };

  // Main chat function
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

      const aiResponse = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('Error in chat:', error);

      const fallbackResponse = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Here are common actions you can take:\n\n1. **Add attendance**: Go to Attendance Page\n2. **View records**: Select a subject above\n3. **See student details**: Check the table below\n\nPlease try your query again or contact support if the issue persists.",
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, fallbackResponse]);

    } finally {
      setIsSending(false);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    const initialChat = [
      {
        id: 1,
        text: "Hello! I'm your virtual assistant. How can I help you with attendance management today?",
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setChatMessages(initialChat);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(initialChat));
  };

  // Show loader when data is still loading
  if (isLoading || !dataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiBook className="h-8 w-8 text-sky-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading your dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Preparing your teaching overview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <HeaderComponent heading="Teacher Dashboard" subHeading="Overview of your teaching activities" role="admin" />

      {/* Stats Cards */}
      <div className="container mx-auto px-4 sm:px-6 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardSubjects.length}</p>
                <p className="text-xs text-gray-500 mt-1">Active courses</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center">
                <HiOutlineAcademicCap className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudents}</p>
                <p className="text-xs text-gray-500 mt-1">Across all subjects</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <HiOutlineUserGroup className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Records</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalAttendanceRecords}</p>
                <p className="text-xs text-gray-500 mt-1">Total entries</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{averageAttendance}%</p>
                <p className="text-xs text-gray-500 mt-1">Current subject</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <BsGraphUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column - Subjects */}
          <div className="xl:col-span-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center">
                      <FiBook className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">My Subjects</h3>
                      <p className="text-sm text-gray-500">{dashboardSubjects.length} subjects assigned</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <BsThreeDotsVertical className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {dashboardSubjects.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiBook className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium text-lg">No subjects found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    You are not assigned to any subjects yet
                  </p>
                </div>
              ) : (
                <div className="p-4">
                  <div className="max-h-[480px] hide-scrollbar overflow-y-auto pr-2">
                    <div className="space-y-2">
                      {dashboardSubjects.map((subject, index) => {
                        const attendanceCount = Object.values(dashboardAttendance[subject.id] || {}).reduce((acc, date) => acc + date.length, 0);
                        const isSelected = selectedSubject === subject.id;
                        return (
                          <div
                            key={subject.id}
                            onClick={() => handleSubjectSelect(subject.id)}
                            className={`
                              relative group p-4 rounded-xl border-2 transition-all cursor-pointer
                              ${isSelected 
                                ? 'border-sky-500 bg-gradient-to-r from-sky-50 to-white shadow-sm' 
                                : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                              }
                            `}
                          >
                            <div className="flex items-start space-x-4">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getSubjectColor(index)} flex items-center justify-center shrink-0 shadow-sm`}>
                                <span className="text-white font-bold text-lg">
                                  {subject.name?.charAt(0).toUpperCase() || 'S'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className={`font-semibold text-base truncate ${isSelected ? 'text-sky-700' : 'text-gray-900'}`}>
                                      {subject.name}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-0.5">{subject.code}</p>
                                  </div>
                                  {isSelected && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 mt-2">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <FiUsers className="h-3.5 w-3.5 mr-1" />
                                    <span>{subject.students || 0} students</span>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <FiCalendar className="h-3.5 w-3.5 mr-1" />
                                    <span>{attendanceCount} records</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Attendance Records */}
          <div className="xl:col-span-8 space-y-6">
            {/* Date Navigation Card */}
            {availableDates.length > 0 && selectedSubject && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => navigateDate('prev')}
                        disabled={currentDateIndex >= availableDates.length - 1}
                        className={`
                          p-2.5 rounded-lg transition-all
                          ${currentDateIndex >= availableDates.length - 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                      >
                        <FiChevronLeft className="h-5 w-5" />
                      </button>

                      <div className="text-center">
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="h-5 w-5 text-sky-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatDate(currentDate)}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                            {selectedSubjectData?.name}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            {currentAttendanceRecords.length} Present
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {Math.round((currentAttendanceRecords.length / (selectedSubjectData?.students || 1)) * 100)}% Attendance
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigateDate('next')}
                        disabled={currentDateIndex <= 0}
                        className={`
                          p-2.5 rounded-lg transition-all
                          ${currentDateIndex <= 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                      >
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {availableDates.length} {availableDates.length === 1 ? 'date' : 'dates'} available
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Records Table Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                      <FiEye className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                      {selectedSubject && (
                        <p className="text-sm text-gray-500">
                          {currentAttendanceRecords.length} students present • Page {currentPage} of {totalPages}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!selectedSubject ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiEye className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium text-lg">No subject selected</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Select a subject from the left panel to view attendance records
                  </p>
                </div>
              ) : currentRecords.length > 0 ? (
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Roll Number
                          </th>
                          <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentRecords.map((record, index) => (
                          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                      {record.studentName?.charAt(0).toUpperCase() || 'S'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {record.studentName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {record.email || 'No email'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-sm font-medium text-gray-900">
                                {record.rollNo}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <FiClock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {record.time}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                <FiCheckCircle className="h-3 w-3 mr-1" />
                                Present
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Enhanced Pagination */}
                  {currentAttendanceRecords.length > recordsPerPage && (
                    <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50">
                      <div className="text-sm text-gray-700 mb-2 sm:mb-0">
                        Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(indexOfLastRecord, currentAttendanceRecords.length)}</span> of{' '}
                        <span className="font-medium">{currentAttendanceRecords.length}</span> students
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FiChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </button>
                        
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => paginate(pageNum)}
                                className={`
                                  relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors
                                  ${currentPage === pageNum
                                    ? 'border-sky-600 bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-sm'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                  }
                                `}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                          <FiChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiEye className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium text-lg">No attendance records found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {availableDates.length === 0
                      ? `No attendance data available for ${selectedSubjectData?.name}`
                      : `No records for ${formatDate(currentDate)}`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-40 group"
        aria-label="Open customer support chat"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-sky-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative w-14 h-14 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
            {isChatOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <BiSupport className="h-6 w-6" />
            )}
          </div>
          {unreadMessages > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
              {unreadMessages}
            </span>
          )}
        </div>
      </button>

      {/* Enhanced Chat Assistant Box */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slideUp">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                  <FiHelpCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Attendance Support</h3>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-sky-100 text-xs">Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className="text-sky-100 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                  aria-label="Clear chat history"
                  title="Clear Chat"
                >
                  <FiTrash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-sky-100 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50" ref={messagesEndRef}>
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`
                      max-w-[85%] rounded-2xl px-4 py-3 
                      ${msg.sender === 'user'
                        ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-br-none shadow-md'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                      }
                    `}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {renderMessageContent(msg.text, msg.sender)}
                    </div>
                    <div className={`flex items-center justify-end space-x-1 mt-2 ${msg.sender === 'user' ? 'text-sky-100' : 'text-gray-400'}`}>
                      <span className="text-xs">
                        {msg.timestamp}
                      </span>
                      {msg.sender === 'user' && (
                        <FiCheckCircle className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-600">Assistant is typing</div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent pr-10"
                  disabled={isSending}
                />
                <FiMessageCircle className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                className="bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-lg p-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-sky-600 shadow-sm"
                aria-label="Send message"
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Ask me about attendance, subjects, or dashboard features
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard_Page;