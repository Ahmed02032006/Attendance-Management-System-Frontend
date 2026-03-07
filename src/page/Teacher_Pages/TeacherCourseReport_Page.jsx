import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import {
  FiFileText,
  FiDownload,
  FiSearch,
  FiUsers,
  FiAlertCircle,
  FiBarChart2,
  FiEye,
  FiClock,
  FiCalendar,
  FiX
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
  
  // Student details modal state
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentAttendanceDetails, setStudentAttendanceDetails] = useState([])

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

    // Process each student
    const processedStudents = apiData.students.map(student => {
      return {
        id: student.id || student.studentId,
        name: student.name,
        rollNo: student.rollNo,
        presentCount: student.presentCount || 0,
        absentCount: student.absentCount || 0,
        percentage: student.percentage || 0,
        attendance: student.attendance || [] // Keep full attendance for details modal
      }
    })

    // Calculate summary statistics
    const totalStudents = processedStudents.length
    const totalDays = apiData.summary?.totalDays || 0
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
        studentsBelow25
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

  // Handle viewing student attendance details
  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student)
    
    // Format attendance records for display
    const attendanceDetails = student.attendance.map(record => ({
      date: record.date,
      status: record.status,
      time: record.time || '--',
      discipline: record.discipline || '--'
    }))
    
    // Sort by date (most recent first)
    attendanceDetails.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    setStudentAttendanceDetails(attendanceDetails)
    setShowStudentModal(true)
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

    // Add headers (simplified - removed individual dates)
    csvContent += "Student Name,Roll No.,Present Count,Absent Count,Percentage\n"

    // Add student data
    students.forEach(student => {
      const row = [
        `"${student.name}"`,
        student.rollNo,
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format date for modal display
  const formatModalDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

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
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
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
            <FiAlertCircle className="text-red-500 h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error generating report</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Report Display */}
        {showReport && processedData && processedData.students && processedData.students.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  Export CSV
                </button>
              </div>
            </div>

            {/* Report Table - Simplified without individual dates */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No.
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance Marked Days
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedData.students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {student.rollNo}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                          {student.presentCount} / {processedData.summary?.totalDays} days
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-green-600">
                        {student.presentCount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-red-600">
                        {student.absentCount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${student.percentage >= 75 ? 'bg-green-100 text-green-700' :
                            student.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'}`}
                        >
                          {student.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewStudentDetails(student)}
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Attendance Details"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-5 gap-2 text-sm">
                <div className="text-center">
                  <span className="text-gray-500">Average Attendance</span>
                  <p className="font-medium text-gray-900">{processedData.summary?.averageAttendance}%</p>
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

      {/* Student Attendance Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedStudent.name} - Attendance Details
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Roll No: {selectedStudent.rollNo} • Attendance: {selectedStudent.presentCount} Present, {selectedStudent.absentCount} Absent • {selectedStudent.percentage}%
                </p>
              </div>
              <button
                onClick={() => setShowStudentModal(false)}
                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
              >
                <FiX className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body - Attendance Records */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {studentAttendanceDetails.length > 0 ? (
                <div className="space-y-3">
                  {studentAttendanceDetails.map((record, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${record.status === 'Present' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${record.status === 'Present' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="font-medium text-gray-900">{formatModalDate(record.date)}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === 'Present' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <FiClock className="h-4 w-4 mr-2 text-gray-400" />
                          Time: {record.time}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FiCalendar className="h-4 w-4 mr-2 text-gray-400" />
                          Discipline: {record.discipline}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No attendance records found for this student
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowStudentModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherCourseReport_Page