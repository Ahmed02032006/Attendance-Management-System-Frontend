import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import {
  FiCalendar,
  FiBook,
  FiUsers,
  FiFileText,
  FiDownload,
  FiPrinter,
  FiSearch,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'
import { toast } from 'react-toastify'

const TeacherCourseReport_Page = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { subjects } = useSelector((state) => state.teacherSubject)

  // Form states
  const [selectedCourse, setSelectedCourse] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReport, setShowReport] = useState(false)

  // Mock report data (this would come from API after generation)
  const [reportData, setReportData] = useState([])

  // Generate 30 days of attendance data
  const generateMockReport = () => {
    // Generate 30 dates
    const startDate = new Date('2024-01-15')
    const dates = []
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }

    const mockData = [
      { 
        id: 1,
        name: 'Sarah Ahmed', 
        rollNo: '25FA-001-BCS',
        attendance: dates.map(date => ({
          date,
          status: Math.random() > 0.1 ? 'Present' : 'Absent'
        })),
      },
      { 
        id: 2,
        name: 'Bilal Khan', 
        rollNo: '25FA-015-BCS',
        attendance: dates.map(date => ({
          date,
          status: Math.random() > 0.15 ? 'Present' : 'Absent'
        })),
      },
      { 
        id: 3,
        name: 'Ayesha Malik', 
        rollNo: '25FA-008-BCS',
        attendance: dates.map(date => ({
          date,
          status: Math.random() > 0.12 ? 'Present' : 'Absent'
        })),
      },
      { 
        id: 4,
        name: 'Usman Ali', 
        rollNo: '25FA-022-BCS',
        attendance: dates.map(date => ({
          date,
          status: Math.random() > 0.2 ? 'Present' : 'Absent'
        })),
      },
      { 
        id: 5,
        name: 'Fatima Zaidi', 
        rollNo: '25FA-031-BCS',
        attendance: dates.map(date => ({
          date,
          status: Math.random() > 0.08 ? 'Present' : 'Absent'
        })),
      },
      { 
        id: 6,
        name: 'Hamza Ali', 
        rollNo: '25FA-042-BCS',
        attendance: dates.map(date => ({
          date,
          status: Math.random() > 0.25 ? 'Present' : 'Absent'
        })),
      },
      { 
        id: 7,
        name: 'Zara Khan', 
        rollNo: '25FA-056-BCS',
        attendance: dates.map(date => ({
          date,
          status: Math.random() > 0.1 ? 'Present' : 'Absent'
        })),
      },
      { 
        id: 8,
        name: 'Omar Farooq', 
        rollNo: '25FA-078-BCS',
        attendance: dates.map(date => ({
          date,
          status: Math.random() > 0.05 ? 'Present' : 'Absent'
        })),
      }
    ]

    // Calculate present/absent counts for each student
    return mockData.map(student => ({
      ...student,
      presentCount: student.attendance.filter(a => a.status === 'Present').length,
      absentCount: student.attendance.filter(a => a.status === 'Absent').length
    }))
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
    
    // Simulate API call
    setTimeout(() => {
      const mockData = generateMockReport()
      setReportData(mockData)
      setShowReport(true)
      setIsGenerating(false)
      toast.success('Report generated successfully')
    }, 1500)
  }

  const handleExportCSV = () => {
    // Create CSV content
    let csvContent = "Student Name,Roll No.,"
    
    // Add dates as headers
    if (reportData.length > 0) {
      const dates = reportData[0].attendance.map(a => a.date)
      csvContent += dates.join(",") + ",Present Count,Absent Count,Percentage\n"
      
      // Add student data
      reportData.forEach(student => {
        const percentage = ((student.presentCount / student.attendance.length) * 100).toFixed(1)
        const row = [
          student.name,
          student.rollNo,
          ...student.attendance.map(a => a.status),
          student.presentCount,
          student.absentCount,
          percentage + '%'
        ]
        csvContent += row.join(",") + "\n"
      })
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance_report_${fromDate}_to_${toDate}.csv`
      a.click()
      toast.success('Report exported successfully')
    }
  }

  // Native print function
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    
    // Get course details
    const course = subjects.find(s => s.id === selectedCourse)
    
    // Generate table rows HTML
    const tableRows = reportData.map(student => {
      const percentage = ((student.presentCount / student.attendance.length) * 100).toFixed(1)
      const attendanceCells = student.attendance.map(record => 
        `<td style="padding: 6px 8px; border: 1px solid #e5e7eb; text-align: center; min-width: 50px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 9999px; font-size: 11px; font-weight: 500; ${record.status === 'Present' ? 'background-color: #dcfce7; color: #166534;' : 'background-color: #fee2e2; color: #991b1b;'}">
            ${record.status === 'Present' ? 'P' : 'A'}
          </span>
        </td>`
      ).join('')
      
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 6px 8px; border: 1px solid #e5e7eb; font-weight: 500; position: sticky; left: 0; background-color: white;">${student.name}</td>
          <td style="padding: 6px 8px; border: 1px solid #e5e7eb; position: sticky; left: 150px; background-color: white;">${student.rollNo}</td>
          ${attendanceCells}
          <td style="padding: 6px 8px; border: 1px solid #e5e7eb; text-align: center; color: #166534; font-weight: 500; min-width: 70px;">${student.presentCount}</td>
          <td style="padding: 6px 8px; border: 1px solid #e5e7eb; text-align: center; color: #991b1b; font-weight: 500; min-width: 70px;">${student.absentCount}</td>
          <td style="padding: 6px 8px; border: 1px solid #e5e7eb; text-align: center; min-width: 70px;">
            <span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500; ${percentage >= 75 ? 'background-color: #dcfce7; color: #166534;' : percentage >= 50 ? 'background-color: #fef3c7; color: #92400e;' : 'background-color: #fee2e2; color: #991b1b;'}">
              ${percentage}%
            </span>
          </td>
        </tr>
      `
    }).join('')
    
    // Generate date headers
    const dateHeaders = reportData[0]?.attendance.map(record => 
      `<th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-size: 11px; font-weight: 600; text-transform: uppercase; background-color: #f3f4f6; min-width: 60px;">
        ${new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </th>`
    ).join('')
    
    // Complete HTML for print
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 24px;
              margin: 0 0 5px 0;
              color: #111827;
            }
            .header p {
              font-size: 14px;
              margin: 5px 0;
              color: #4b5563;
            }
            .table-container {
              overflow-x: auto;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
              min-width: 1000px;
            }
            th {
              background-color: #f3f4f6 !important;
              font-weight: 600;
              padding: 8px;
              border: 1px solid #e5e7eb;
              text-align: left;
            }
            td {
              padding: 6px 8px;
              border: 1px solid #e5e7eb;
            }
            .footer {
              margin-top: 30px;
              font-size: 11px;
              color: #6b7280;
              text-align: right;
            }
            .sticky-col {
              position: sticky;
              left: 0;
              background-color: white;
              z-index: 10;
            }
            .sticky-col-second {
              position: sticky;
              left: 150px;
              background-color: white;
              z-index: 10;
            }
            @media print {
              body {
                padding: 0.25in;
              }
              .table-container {
                overflow: visible;
                border: none;
              }
              table {
                min-width: auto;
              }
              .sticky-col, .sticky-col-second {
                position: static;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Attendance Report</h1>
            <p>${course?.title} (${course?.code})</p>
            <p>${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}</p>
            <p>Total Students: ${reportData.length}</p>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="position: sticky; left: 0; background-color: #f3f4f6; z-index: 20;">Student Name</th>
                  <th style="position: sticky; left: 150px; background-color: #f3f4f6; z-index: 20;">Roll No.</th>
                  ${dateHeaders}
                  <th style="text-align: center;">Present</th>
                  <th style="text-align: center;">Absent</th>
                  <th style="text-align: center;">%</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `
    
    // Write to new window and print
    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  // Get selected course details
  const getSelectedCourseDetails = () => {
    return subjects.find(s => s.id === selectedCourse)
  }

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
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
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Choose a course</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.title} ({subject.code}) - {subject.session}
                  </option>
                ))}
              </select>
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
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGenerating ? (
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

        {/* Report Display */}
        {showReport && reportData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Report Header with Actions */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  Attendance Report: {getSelectedCourseDetails()?.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(fromDate)} to {formatDate(toDate)} • Total Students: {reportData.length} • Total Days: {reportData[0]?.attendance.length}
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
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FiPrinter className="h-3 w-3 mr-1" />
                  Print / PDF
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Indicator */}
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200 flex items-center text-xs text-blue-600">
              <FiChevronLeft className="h-4 w-4 mr-1" />
              <span>Scroll horizontally to view all {reportData[0]?.attendance.length} days</span>
              <FiChevronRight className="h-4 w-4 ml-1" />
            </div>

            {/* Report Table with Horizontal Scroll */}
            <div className="overflow-x-auto max-w-full" style={{ maxHeight: '500px' }}>
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-20 min-w-[180px]">
                        Student Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase sticky left-[180px] bg-gray-50 z-20 min-w-[120px]">
                        Roll No.
                      </th>
                      {/* Date Headers */}
                      {reportData[0]?.attendance.map((record, index) => (
                        <th key={index} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[70px]">
                          <div className="flex flex-col">
                            <span>{new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-gray-400">{new Date(record.date).getDate()}</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[80px]">
                        Present
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[80px]">
                        Absent
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[80px]">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((student) => {
                      const percentage = ((student.presentCount / student.attendance.length) * 100).toFixed(1)
                      
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                            {student.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 sticky left-[180px] bg-white z-10">
                            {student.rollNo}
                          </td>
                          {/* Attendance Status for each date */}
                          {student.attendance.map((record, idx) => (
                            <td key={idx} className="px-4 py-2 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium
                                ${record.status === 'Present' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {record.status === 'Present' ? 'P' : 'A'}
                              </span>
                            </td>
                          ))}
                          <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium text-green-600">
                            {student.presentCount}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium text-red-600">
                            {student.absentCount}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                              ${percentage >= 75 ? 'bg-green-100 text-green-700' : 
                                percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 
                                'bg-red-100 text-red-700'}`}
                            >
                              {percentage}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scroll Hint for Mobile */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
              <span>←→ Scroll to see all {reportData[0]?.attendance.length} days of attendance</span>
            </div>

            {/* Summary Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-1"></span>
                    <span className="text-gray-600">Present (P)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-1"></span>
                    <span className="text-gray-600">Absent (A)</span>
                  </div>
                </div>
                <p className="text-gray-500">
                  Total Classes: {reportData[0]?.attendance.length} | Date Range: {reportData[0]?.attendance.length} days
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Report State */}
        {!showReport && selectedCourse && fromDate && toDate && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiFileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Click Generate Report to view attendance data</p>
          </div>
        )}

        {/* Empty State */}
        {!selectedCourse && !fromDate && !toDate && (
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