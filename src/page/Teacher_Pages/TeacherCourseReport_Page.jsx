import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import {
  FiFileText,
  FiDownload,
  FiSearch,
  FiUsers,
  FiAlertCircle,
  FiCalendar,
  FiBookOpen,
  FiFilter,
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownloadCloud,
  FiRefreshCw
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { getSubjectAttendanceReport } from '../../store/Teacher-Slicer/Report-Slicer.js'
import { getSubjectsByUser } from '../../store/Teacher-Slicer/Subject-Slicer.js'

const TeacherCourseReport_Page = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { subjects, isLoading: subjectsLoading } = useSelector((state) => state.teacherSubject || { subjects: [], isLoading: false })
  
  // Safe navigation with fallback
  const attendanceReportState = useSelector((state) => state.attendanceReport) || {}
  const { reportData, isLoading, error } = attendanceReportState

  // Form states
  const [selectedCourse, setSelectedCourse] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [processedData, setProcessedData] = useState(null)

  // Fetch subjects when component mounts
  useEffect(() => {
    if (user?.id) {
      dispatch(getSubjectsByUser(user.id)).unwrap()
        .catch(error => {
          console.error('Failed to fetch subjects:', error)
          toast.error('Failed to load courses')
        })
    }
  }, [dispatch, user?.id])

  // Set default dates on component mount (last 30 days)
  useEffect(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    setToDate(today.toISOString().split('T')[0])
    setFromDate(thirtyDaysAgo.toISOString().split('T')[0])
  }, [])

  // Process the API data into the format expected by the component
  const processReportData = (apiData) => {
    if (!apiData || !apiData.students) return null

    // Get all unique dates from all students' attendance
    const allDates = []
    apiData.students.forEach(student => {
      student.attendance.forEach(record => {
        if (!allDates.includes(record.date)) {
          allDates.push(record.date)
        }
      })
    })
    allDates.sort() // Sort dates chronologically

    // Process each student
    const processedStudents = apiData.students.map(student => {
      // Create a map of attendance by date for quick lookup
      const attendanceMap = new Map()
      student.attendance.forEach(record => {
        attendanceMap.set(record.date, record)
      })

      // Create attendance array for all dates
      const attendance = allDates.map(date => {
        const record = attendanceMap.get(date)
        if (record) {
          return {
            date: record.date,
            status: record.status,
            time: record.time || null,
            discipline: record.discipline || null,
            attendanceId: record.attendanceId || null
          }
        } else {
          return {
            date: date,
            status: 'Absent',
            time: null,
            discipline: null,
            attendanceId: null
          }
        }
      })

      return {
        id: student.id || student.studentId,
        name: student.name,
        rollNo: student.rollNo,
        presentCount: student.presentCount || 0,
        absentCount: student.absentCount || 0,
        percentage: student.percentage || 0,
        attendance: attendance
      }
    })

    // Calculate summary statistics
    const totalStudents = processedStudents.length
    const totalDays = allDates.length
    const averageAttendance = totalStudents > 0 
      ? (processedStudents.reduce((sum, s) => sum + s.percentage, 0) / totalStudents).toFixed(1)
      : 0

    const studentsAbove75 = processedStudents.filter(s => s.percentage >= 75).length
    const studentsBelow75 = processedStudents.filter(s => s.percentage < 75 && s.percentage >= 50).length
    const studentsBelow50 = processedStudents.filter(s => s.percentage < 50 && s.percentage >= 25).length
    const studentsBelow25 = processedStudents.filter(s => s.percentage < 25).length

    return {
      subjectDetails: apiData.subjectDetails || {
        title: apiData.subjectTitle || 'Subject',
        code: apiData.subjectCode || '',
        department: apiData.department || '',
        semester: apiData.semester || '',
        session: apiData.session || ''
      },
      dateRange: apiData.dateRange || {
        fromDate: fromDate,
        toDate: toDate
      },
      summary: {
        totalStudents,
        totalDays,
        averageAttendance,
        studentsAbove75,
        studentsBelow75,
        studentsBelow50,
        studentsBelow25,
        dates: allDates
      },
      students: processedStudents
    }
  }

  const handleGenerateReport = () => {
    // Validate inputs
    if (!selectedCourse) {
      toast.error('Please select a course')
      return
    }
    if (!fromDate) {
      toast.error('Please select from date')
      return
    }
    if (!toDate) {
      toast.error('Please select to date')
      return
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error('From date cannot be greater than to date')
      return
    }

    setIsGenerating(true)
    
    // Dispatch action to fetch real report data
    dispatch(getSubjectAttendanceReport({
      subjectId: selectedCourse,
      teacherId: user?.id,
      fromDate,
      toDate
    })).then((result) => {
      setIsGenerating(false)
      console.log('API Response:', result)
      console.log('Payload data:', result.payload)
      
      if (result.payload?.success) {
        // Process the data for display
        const processed = processReportData(result.payload.data)
        setProcessedData(processed)
        setShowReport(true)
        toast.success('Report generated successfully')
      } else {
        toast.error(result.payload?.message || 'Failed to generate report')
      }
    })
  }

  const handleExportCSV = () => {
    if (!processedData?.students || processedData.students.length === 0) {
      toast.error('No data to export')
      return
    }

    const { students, subjectDetails, dateRange, summary } = processedData
    
    // Create CSV content
    let csvContent = `"Attendance Report - ${subjectDetails.title} (${subjectDetails.code})"\n`
    csvContent += `"Period: ${dateRange.fromDate} to ${dateRange.toDate}"\n`
    csvContent += `"Total Students: ${summary.totalStudents}", "Total Days: ${summary.totalDays}"\n\n`
    
    // Add headers
    csvContent += "Student Name,Roll No.,"
    
    // Add dates as headers
    if (students.length > 0) {
      const dates = summary.dates
      csvContent += dates.join(",") + ",Present Count,Absent Count,Percentage\n"
      
      // Add student data
      students.forEach(student => {
        const row = [
          `"${student.name}"`,
          student.rollNo,
          ...student.attendance.map(a => a.status),
          student.presentCount,
          student.absentCount,
          student.percentage + '%'
        ]
        csvContent += row.join(",") + "\n"
      })
      
      // Add summary
      csvContent += "\nSummary\n"
      csvContent += `Average Attendance,${summary.averageAttendance}%\n`
      csvContent += `Students ≥75%,${summary.studentsAbove75}\n`
      csvContent += `Students <75%,${summary.studentsBelow75}\n`
      csvContent += `Students <50%,${summary.studentsBelow50}\n`
      csvContent += `Students <25%,${summary.studentsBelow25}\n`
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance_report_${subjectDetails.code}_${dateRange.fromDate}_to_${dateRange.toDate}.csv`
      a.click()
      toast.success('Report exported successfully')
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get status badge color based on percentage
  const getPercentageBadgeColor = (percentage) => {
    if (percentage >= 75) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (percentage >= 50) return 'bg-amber-100 text-amber-700 border-amber-200'
    if (percentage >= 25) return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-rose-100 text-rose-700 border-rose-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <HeaderComponent
        heading="Attendance Report"
        subHeading="Generate and analyze attendance reports for your courses"
        role='admin'
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Report Generation Form - Enhanced Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
              <FiBarChart2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Generate Attendance Report</h2>
              <p className="text-sm text-gray-500">Select course and date range to analyze attendance patterns</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Course Selection - Enhanced */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiBookOpen className="h-4 w-4 mr-1.5 text-blue-500" />
                Select Course <span className="text-rose-500 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value)
                    setShowReport(false)
                    setProcessedData(null)
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                  disabled={subjectsLoading}
                >
                  <option value="">Choose a course</option>
                  {subjects && subjects.length > 0 ? (
                    subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.title} ({subject.code}) - {subject.session}
                      </option>
                    ))
                  ) : (
                    <option disabled value="">
                      {subjectsLoading ? 'Loading courses...' : 'No courses available'}
                    </option>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FiFilter className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {subjects.length === 0 && !subjectsLoading && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center">
                  <FiAlertCircle className="h-3 w-3 mr-1" />
                  No courses found. Please add courses first.
                </p>
              )}
            </div>

            {/* From Date - Enhanced */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiCalendar className="h-4 w-4 mr-1.5 text-blue-500" />
                From Date <span className="text-rose-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value)
                    setShowReport(false)
                    setProcessedData(null)
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FiCalendar className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* To Date - Enhanced */}
            <div className="space-y-1.5">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiCalendar className="h-4 w-4 mr-1.5 text-blue-500" />
                To Date <span className="text-rose-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value)
                    setShowReport(false)
                    setProcessedData(null)
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FiCalendar className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Generate Button - Enhanced */}
            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || isLoading || subjectsLoading}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isGenerating || isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FiRefreshCw className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State for Subjects - Enhanced */}
        {subjectsLoading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16 text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiBarChart2 className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-lg font-medium text-gray-700">Loading your courses...</p>
            <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your data</p>
          </div>
        )}

        {/* Error Display - Enhanced */}
        {error && (
          <div className="bg-rose-50/90 backdrop-blur-sm border border-rose-200 rounded-2xl p-5 mb-6 flex items-start shadow-lg">
            <div className="p-2 bg-rose-100 rounded-xl">
              <FiAlertCircle className="text-rose-600 h-5 w-5" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-semibold text-rose-800">Error generating report</h3>
              <p className="text-sm text-rose-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Report Display - Enhanced */}
        {showReport && processedData && processedData.students && processedData.students.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            {/* Report Header - Enhanced */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
                  <FiFileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {processedData.subjectDetails?.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                      {processedData.subjectDetails?.code}
                    </span>
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                      Sem {processedData.subjectDetails?.semester}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                      {processedData.subjectDetails?.session}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <FiCalendar className="h-3.5 w-3.5 mr-1.5" />
                    {formatDate(processedData.dateRange?.fromDate)} - {formatDate(processedData.dateRange?.toDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportCSV}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 flex items-center shadow-lg shadow-emerald-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <FiDownloadCloud className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>

            {/* Summary Cards - Enhanced */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{processedData.summary?.totalStudents}</p>
                <FiUsers className="h-4 w-4 text-blue-400 mt-1" />
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Total Days</p>
                <p className="text-2xl font-bold text-gray-900">{processedData.summary?.totalDays}</p>
                <FiCalendar className="h-4 w-4 text-purple-400 mt-1" />
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Avg Attendance</p>
                <p className="text-2xl font-bold text-blue-600">{processedData.summary?.averageAttendance}%</p>
                <FiTrendingUp className="h-4 w-4 text-blue-400 mt-1" />
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">≥75%</p>
                <p className="text-2xl font-bold text-emerald-600">{processedData.summary?.studentsAbove75}</p>
                <FiCheckCircle className="h-4 w-4 text-emerald-400 mt-1" />
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">&lt;25%</p>
                <p className="text-2xl font-bold text-rose-600">{processedData.summary?.studentsBelow25}</p>
                <FiXCircle className="h-4 w-4 text-rose-400 mt-1" />
              </div>
            </div>

            {/* Report Table - Enhanced with better sticky columns */}
            <div className="overflow-x-auto max-w-full relative" style={{ maxHeight: '500px' }}>
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50 z-30 min-w-[200px] border-r border-gray-200">
                        <div className="flex items-center">
                          <FiUsers className="h-3.5 w-3.5 mr-2 text-blue-500" />
                          Student Name
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-[200px] bg-gray-50 z-30 min-w-[130px] border-r border-gray-200">
                        <div className="flex items-center">
                          <FiFileText className="h-3.5 w-3.5 mr-2 text-purple-500" />
                          Roll No.
                        </div>
                      </th>
                      {/* Date Headers */}
                      {processedData.summary?.dates?.map((date, index) => (
                        <th key={index} className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[80px] bg-gray-50">
                          <div className="flex flex-col">
                            <span>{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-gray-400 font-medium">{new Date(date).getDate()}</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[90px] bg-gray-50">
                        <div className="flex items-center justify-center">
                          <FiCheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                          Present
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[90px] bg-gray-50">
                        <div className="flex items-center justify-center">
                          <FiXCircle className="h-3.5 w-3.5 mr-1 text-rose-500" />
                          Absent
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[90px] bg-gray-50">
                        <div className="flex items-center justify-center">
                          <FiTrendingUp className="h-3.5 w-3.5 mr-1 text-blue-500" />
                          %
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedData.students.map((student, index) => (
                      <tr key={student.id} className={`hover:bg-blue-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10 border-r border-gray-200">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3 shadow-sm">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            {student.name}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 sticky left-[200px] bg-inherit z-10 border-r border-gray-200 font-mono">
                          {student.rollNo}
                        </td>
                        {/* Attendance Status for each date */}
                        {student.attendance?.map((record, idx) => (
                          <td key={idx} className="px-4 py-3 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-semibold shadow-sm transition-all hover:scale-110
                              ${record.status === 'Present' 
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                : 'bg-rose-100 text-rose-700 border border-rose-200'
                              }`}
                              title={record.time ? `Time: ${record.time}` : ''}
                            >
                              {record.status === 'Present' ? 'P' : 'A'}
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                            {student.presentCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center text-sm font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                            {student.absentCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border ${getPercentageBadgeColor(student.percentage)}`}>
                            {student.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend Footer - Enhanced */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded-lg mr-2"></span>
                    <span className="text-sm text-gray-600">Present (P)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-rose-100 border border-rose-300 rounded-lg mr-2"></span>
                    <span className="text-sm text-gray-600">Absent (A)</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Hover over status for time</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Students Registered - Enhanced */}
        {showReport && processedData && processedData.students && processedData.students.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16 text-center">
            <div className="w-24 h-24 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiUsers className="h-12 w-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Registered</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              This subject doesn't have any registered students yet. Please add students to generate attendance reports.
            </p>
          </div>
        )}

        {/* No Report State - Enhanced */}
        {!showReport && selectedCourse && fromDate && toDate && !subjectsLoading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiFileText className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate Report</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Click the "Generate Report" button to view detailed attendance data for the selected course and date range.
            </p>
            <button
              onClick={handleGenerateReport}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 inline-flex items-center shadow-lg shadow-blue-200"
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Generate Report Now
            </button>
          </div>
        )}

        {/* Empty State - No Courses - Enhanced */}
        {!selectedCourse && !fromDate && !toDate && !subjectsLoading && subjects.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16 text-center">
            <div className="w-24 h-24 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiBookOpen className="h-12 w-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Available</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You haven't created any courses yet. Please create courses first to generate attendance reports.
            </p>
          </div>
        )}

        {/* Empty State - With courses but no report generated - Enhanced */}
        {!selectedCourse && !fromDate && !toDate && !subjectsLoading && subjects.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiSearch className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Report Generated</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Select a course and date range from the form above to generate an attendance report.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherCourseReport_Page