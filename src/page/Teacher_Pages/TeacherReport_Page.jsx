import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent.jsx'
import {
  FiFileText,
  FiDownload,
  FiSearch,
  FiUsers,
  FiAlertCircle,
  FiBarChart2,
  FiEye,
  FiX,
  FiCalendar,
  FiClock,
  FiMapPin
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  getSubjectAttendanceReport,
  getStudentAttendanceDetails,
  clearStudentDetails
} from '../../store/Teacher-Slicer/Report-Slicer.js'
import { getSubjectsByUser } from '../../store/Teacher-Slicer/Subject-Slicer.js'

const TeacherCourseReport_Page = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { subjects, isLoading: subjectsLoading } = useSelector((state) => state.teacherSubject || { subjects: [], isLoading: false })

  // Safe navigation with fallback
  const attendanceReportState = useSelector((state) => state.teacherReport) || {}
  const {
    reportData,
    isLoading,
    studentAttendanceDetails,
    studentDetailsLoading,
    error
  } = attendanceReportState

  // Form states
  const [selectedCourse, setSelectedCourse] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [processedData, setProcessedData] = useState(null)

  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [studentsPerPage] = useState(5)

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

  // Reset pagination when new report is generated
  useEffect(() => {
    setCurrentPage(1)
  }, [processedData])

  // Clear student details when modal closes
  useEffect(() => {
    if (!showStudentModal) {
      dispatch(clearStudentDetails())
      setSelectedStudent(null)
    }
  }, [showStudentModal, dispatch])

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

  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student)

    // Fetch detailed attendance for this student
    dispatch(getStudentAttendanceDetails({
      rollNo: student.rollNo,
      subjectId: selectedCourse,
      teacherId: user?.id
    })).then((result) => {
      if (result.payload?.success) {
        setShowStudentModal(true)
      } else {
        toast.error(result.payload?.message || 'Failed to fetch student details')
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

    // Add headers (without individual date columns)
    csvContent += "Student Name,Roll No.,Present Count,Absent Count,Percentage,Marked Attendance Days\n"

    // Add student data
    students.forEach(student => {
      const row = [
        `"${student.name}"`,
        student.rollNo,
        student.presentCount,
        student.absentCount,
        student.percentage + '%',
        student.attendance.length
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    return timeString
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    return status === 'Present'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700'
  }

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage
  const currentStudents = processedData?.students?.slice(indexOfFirstStudent, indexOfLastStudent) || []
  const totalPages = Math.ceil((processedData?.students?.length || 0) / studentsPerPage)

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

  if (subjectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiBarChart2 className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading Course Reports...</p>
          <p className="mt-2 text-sm text-gray-500">Gathering course report data for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent
        heading="Attendance Report"
        subHeading="Generate attendance reports for specific date ranges"
        role='admin'
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Report Generation Form */}
        <div className="bg-white rounded-lg border border-gray-400 p-6 mb-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Generate Attendance Report</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Course <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value)
                  setShowReport(false)
                  setProcessedData(null)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              {subjects.length === 0 && !subjectsLoading && (
                <p className="text-xs text-amber-600 mt-1">
                  No courses found. Please add courses first.
                </p>
              )}
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  setShowReport(false)
                  setProcessedData(null)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setShowReport(false)
                  setProcessedData(null)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || isLoading || subjectsLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGenerating || isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FiFileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <FiAlertCircle className="text-red-500 h-5 w-5 mt-0.5 mr-3 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error generating report</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Report Display */}
        {showReport && processedData && processedData.students && processedData.students.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-400 overflow-hidden">
            {/* Report Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  Attendance Report: {processedData.subjectDetails?.title} ({processedData.subjectDetails?.code})
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(processedData.dateRange?.fromDate)} to {formatDate(processedData.dateRange?.toDate)} •
                  Total Students: {processedData.summary?.totalStudents} •
                  Total Days: {processedData.summary?.totalDays} •
                  Avg Attendance: {processedData.summary?.averageAttendance}%
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <FiDownload className="h-3 w-3 mr-1" />
                  Export To Excel
                </button>
              </div>
            </div>

            {/* Report Table - Updated Columns with Fixed Height and Scroll */}
            <div className="overflow-x-auto">
              <div className="max-h-[400px] overflow-y-auto border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Student Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Roll No.
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Marked Sessions
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Present
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Absent
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        %
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                          {student.rollNo}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-600">
                          {student.presentCount + student.absentCount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium text-green-600">
                          {student.presentCount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium text-red-600">
                          {student.absentCount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${student.percentage >= 75 ? 'bg-green-100 text-green-700' :
                              student.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'}`}
                          >
                            {student.percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleViewStudentDetails(student)}
                            disabled={studentDetailsLoading}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View detailed attendance"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Fill empty rows if needed */}
                    {currentStudents.length < studentsPerPage && (
                      Array.from({ length: studentsPerPage - currentStudents.length }).map((_, index) => (
                        <tr key={`empty-${index}`} className="bg-gray-50">
                          <td colSpan="7" className="px-4 py-2 text-center text-sm text-gray-400">
                            &nbsp;
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastStudent, processedData.students.length)}
                    </span>{' '}
                    of <span className="font-medium">{processedData.students.length}</span> students
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                      Previous
                    </button>
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === number
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                        >
                          {number}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-5 gap-2 text-sm">
                <div className="text-center">
                  <span className="text-gray-500">Average Attendance</span>
                  <p className="font-medium text-blue-600">{processedData.summary?.averageAttendance}%</p>
                </div>
                <div className="text-center">
                  <span className="text-gray-500">Students ≥75%</span>
                  <p className="font-medium text-green-600">{processedData.summary?.studentsAbove75}</p>
                </div>
                <div className="text-center">
                  <span className="text-gray-500">Students &lt;75%</span>
                  <p className="font-medium text-yellow-600">{processedData.summary?.studentsBelow75}</p>
                </div>
                <div className="text-center">
                  <span className="text-gray-500">Students &lt;50%</span>
                  <p className="font-medium text-orange-600">{processedData.summary?.studentsBelow50}</p>
                </div>
                <div className="text-center">
                  <span className="text-gray-500">Students &lt;25%</span>
                  <p className="font-medium text-red-600">{processedData.summary?.studentsBelow25}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Attendance Details Modal */}
        {showStudentModal && studentAttendanceDetails && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Student Attendance Details
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedStudent?.name} - {selectedStudent?.rollNo}
                  </p>
                </div>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{studentAttendanceDetails.summary?.totalPresent}</p>
                    <p className="text-xs text-gray-500">Total Present</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{studentAttendanceDetails.summary?.totalAbsent}</p>
                    <p className="text-xs text-gray-500">Total Absent</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{studentAttendanceDetails.summary?.totalPossible}</p>
                    <p className="text-xs text-gray-500">Total Classes</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <p className={`text-2xl font-bold ${studentAttendanceDetails.summary?.attendancePercentage >= 75
                      ? 'text-green-600'
                      : studentAttendanceDetails.summary?.attendancePercentage >= 50
                        ? 'text-yellow-600'
                        : 'text-red-600'
                      }`}>
                      {studentAttendanceDetails.summary?.attendancePercentage}%
                    </p>
                    <p className="text-xs text-gray-500">Percentage</p>
                  </div>
                </div>

                {/* Attendance Table with Scroll */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Detailed Attendance Record</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Schedule</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marked At</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {studentAttendanceDetails.attendanceByDate?.map((dateEntry) => (
                            dateEntry.schedules?.map((schedule, idx) => (
                              <tr key={`${dateEntry.date}-${idx}`} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {formatDate(dateEntry.date)}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {schedule.day}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {schedule.startTime} - {schedule.endTime}
                                </td>
                                <td className="px-4 py-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(schedule.status)}`}>
                                    {schedule.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {schedule.time || 'N/A'}
                                </td>
                              </tr>
                            ))
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Modal */}
        {studentDetailsLoading && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700">Loading student details...</p>
            </div>
          </div>
        )}

        {/* No Students Registered */}
        {showReport && processedData && processedData.students && processedData.students.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiUsers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No Students Registered</h3>
            <p className="text-sm text-gray-500">This subject doesn't have any registered students yet.</p>
          </div>
        )}

        {/* No Report State */}
        {!showReport && selectedCourse && fromDate && toDate && !subjectsLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiFileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Click Generate Report to view attendance data</p>
          </div>
        )}

        {/* Empty State */}
        {!selectedCourse && !fromDate && !toDate && !subjectsLoading && subjects.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiSearch className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No Courses Available</h3>
            <p className="text-sm text-gray-500">Please create courses first to generate attendance reports</p>
          </div>
        )}

        {/* Empty State - With courses but no report generated */}
        {!selectedCourse && !fromDate && !toDate && !subjectsLoading && subjects.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiSearch className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No Report Generated</h3>
            <p className="text-sm text-gray-500">Select a course and date range to generate attendance report</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherCourseReport_Page