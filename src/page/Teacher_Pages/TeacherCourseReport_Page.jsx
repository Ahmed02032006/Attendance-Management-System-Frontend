import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import {
  FiDownload,
  FiCalendar,
  FiBook,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiChevronDown,
  FiSearch,
  FiEye,
  FiMail,
  FiFileText,
  FiBarChart2
} from 'react-icons/fi'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { toast } from 'react-toastify'

const TeacherCourseReport_Page = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { subjects } = useSelector((state) => state.teacherSubject)

  const [selectedCourse, setSelectedCourse] = useState('all')
  const [dateRange, setDateRange] = useState('thisMonth')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showStudentModal, setShowStudentModal] = useState(false)

  // Sample data
  const attendanceData = [
    { name: 'Week 1', present: 42, absent: 5, late: 3 },
    { name: 'Week 2', present: 38, absent: 8, late: 4 },
    { name: 'Week 3', present: 45, absent: 3, late: 2 },
    { name: 'Week 4', present: 41, absent: 6, late: 3 },
    { name: 'Week 5', present: 44, absent: 4, late: 2 },
    { name: 'Week 6', present: 43, absent: 5, late: 2 }
  ]

  const studentData = [
    { id: 1, name: 'Sarah Ahmed', regNo: '25FA-001-BCS', present: 22, absent: 2, late: 0, percentage: 96, status: 'Good' },
    { id: 2, name: 'Bilal Khan', regNo: '25FA-015-BCS', present: 20, absent: 3, late: 1, percentage: 87, status: 'Good' },
    { id: 3, name: 'Ayesha Malik', regNo: '25FA-008-BCS', present: 21, absent: 2, late: 1, percentage: 91, status: 'Good' },
    { id: 4, name: 'Usman Ali', regNo: '25FA-022-BCS', present: 15, absent: 7, late: 2, percentage: 65, status: 'Risk' },
    { id: 5, name: 'Fatima Zaidi', regNo: '25FA-031-BCS', present: 18, absent: 4, late: 2, percentage: 78, status: 'Average' },
    { id: 6, name: 'Hamza Ali', regNo: '25FA-042-BCS', present: 12, absent: 10, late: 2, percentage: 52, status: 'Risk' }
  ]

  const distributionData = [
    { name: '≥90%', value: 15, color: '#10B981' },
    { name: '75-89%', value: 12, color: '#3B82F6' },
    { name: '60-74%', value: 5, color: '#F59E0B' },
    { name: '<60%', value: 3, color: '#EF4444' }
  ]

  const courseOptions = [
    { value: 'all', label: 'All Courses' },
    ...subjects.map(subject => ({
      value: subject.id,
      label: `${subject.title} (${subject.code})`
    }))
  ]

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Good': return 'bg-green-100 text-green-700'
      case 'Average': return 'bg-blue-100 text-blue-700'
      case 'Risk': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleExport = () => {
    toast.success('Report downloaded successfully')
  }

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setShowStudentModal(true)
  }

  const handleSendReminder = (student) => {
    toast.info(`Reminder sent to ${student.name}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent
        heading="Attendance Reports"
        subHeading="Track and analyze student attendance"
        role='admin'
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Attendance</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">86.5%</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FiUsers className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Classes</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">24</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <FiBook className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Present Today</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">43/50</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">At Risk</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">8</p>
              </div>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[150px]"
              >
                {courseOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisSemester">This Semester</option>
              </select>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center"
              >
                <FiDownload className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Weekly Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="present" stroke="#3B82F6" strokeWidth={2} name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} name="Absent" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Attendance Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700">Student Attendance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reg No</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Late</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">%</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentData.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-medium">
                          {student.name.charAt(0)}
                        </div>
                        <span className="ml-2 text-sm text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{student.regNo}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-600">{student.present}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-600">{student.absent}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-600">{student.late}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">{student.percentage}%</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSendReminder(student)}
                          className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                          title="Send Reminder"
                        >
                          <FiMail className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Details Modal */}
        {showStudentModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-base font-medium text-gray-900">Student Details</h3>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiXCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">{selectedStudent.name}</h4>
                    <p className="text-sm text-gray-500">{selectedStudent.regNo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Present</p>
                    <p className="text-xl font-semibold text-green-600">{selectedStudent.present}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Absent</p>
                    <p className="text-xl font-semibold text-red-600">{selectedStudent.absent}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Late</p>
                    <p className="text-xl font-semibold text-orange-600">{selectedStudent.late}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Percentage</p>
                    <p className="text-xl font-semibold text-blue-600">{selectedStudent.percentage}%</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowStudentModal(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleSendReminder(selectedStudent)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Send Reminder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherCourseReport_Page