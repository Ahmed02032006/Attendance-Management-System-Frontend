import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HeaderComponent from '../../components/HeaderComponent'
import {
  FiDownload,
  FiFilter,
  FiCalendar,
  FiBook,
  FiUsers,
  FiPieChart,
  FiBarChart2,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiChevronDown,
  FiSearch,
  FiEye,
  FiPrinter,
  FiMail,
  FiFileText,
  FiGrid,
  FiList,
  FiArrowUp,
  FiArrowDown,
  FiUser,
  FiAward,
  FiTarget,
  FiPercent,
  FiUserCheck,
  FiUserX,
  FiWatch,
  FiRefreshCw
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
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Scatter
} from 'recharts'
import { toast } from 'react-toastify'

const TeacherCourseReport_Page = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { subjects } = useSelector((state) => state.teacherSubject)

  const [selectedCourse, setSelectedCourse] = useState('all')
  const [dateRange, setDateRange] = useState('thisMonth')
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('overview')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showStudentDetails, setShowStudentDetails] = useState(false)

  // Mock attendance data (replace with actual API data)
  const mockAttendanceStats = {
    totalClasses: 24,
    attended: 18,
    absent: 4,
    late: 2,
    excused: 0,
    attendanceRate: 85.7
  }

  const mockDailyAttendance = [
    { date: '2024-01-15', present: 42, absent: 5, late: 3, total: 50 },
    { date: '2024-01-16', present: 40, absent: 7, late: 3, total: 50 },
    { date: '2024-01-17', present: 45, absent: 3, late: 2, total: 50 },
    { date: '2024-01-18', present: 38, absent: 8, late: 4, total: 50 },
    { date: '2024-01-19', present: 44, absent: 4, late: 2, total: 50 },
    { date: '2024-01-22', present: 43, absent: 5, late: 2, total: 50 },
    { date: '2024-01-23', present: 41, absent: 6, late: 3, total: 50 },
    { date: '2024-01-24', present: 46, absent: 2, late: 2, total: 50 },
    { date: '2024-01-25', present: 42, absent: 5, late: 3, total: 50 },
    { date: '2024-01-26', present: 47, absent: 2, late: 1, total: 50 }
  ]

  const mockWeeklyTrend = [
    { week: 'Week 1', attendance: 82, classes: 5 },
    { week: 'Week 2', attendance: 78, classes: 5 },
    { week: 'Week 3', attendance: 88, classes: 5 },
    { week: 'Week 4', attendance: 85, classes: 5 },
    { week: 'Week 5', attendance: 90, classes: 4 },
    { week: 'Week 6', attendance: 86, classes: 5 }
  ]

  const mockStudentAttendance = [
    { 
      id: 1,
      name: 'Sarah Ahmed', 
      regNo: '25FA-001-BCS', 
      present: 22, 
      absent: 2, 
      late: 0,
      percentage: 96,
      status: 'Excellent',
      lastAttendance: '2024-01-26',
      trend: '+2%'
    },
    { 
      id: 2,
      name: 'Bilal Khan', 
      regNo: '25FA-015-BCS', 
      present: 20, 
      absent: 3, 
      late: 1,
      percentage: 87,
      status: 'Good',
      lastAttendance: '2024-01-26',
      trend: '-1%'
    },
    { 
      id: 3,
      name: 'Ayesha Malik', 
      regNo: '25FA-008-BCS', 
      present: 21, 
      absent: 2, 
      late: 1,
      percentage: 91,
      status: 'Excellent',
      lastAttendance: '2024-01-25',
      trend: '+3%'
    },
    { 
      id: 4,
      name: 'Usman Ali', 
      regNo: '25FA-022-BCS', 
      present: 15, 
      absent: 7, 
      late: 2,
      percentage: 65,
      status: 'At Risk',
      lastAttendance: '2024-01-24',
      trend: '-5%'
    },
    { 
      id: 5,
      name: 'Fatima Zaidi', 
      regNo: '25FA-031-BCS', 
      present: 18, 
      absent: 4, 
      late: 2,
      percentage: 78,
      status: 'Good',
      lastAttendance: '2024-01-26',
      trend: '+1%'
    },
    { 
      id: 6,
      name: 'Hamza Ali', 
      regNo: '25FA-042-BCS', 
      present: 12, 
      absent: 10, 
      late: 2,
      percentage: 52,
      status: 'Critical',
      lastAttendance: '2024-01-23',
      trend: '-8%'
    },
    { 
      id: 7,
      name: 'Zara Khan', 
      regNo: '25FA-056-BCS', 
      present: 19, 
      absent: 4, 
      late: 1,
      percentage: 83,
      status: 'Good',
      lastAttendance: '2024-01-26',
      trend: '0%'
    },
    { 
      id: 8,
      name: 'Omar Farooq', 
      regNo: '25FA-078-BCS', 
      present: 23, 
      absent: 1, 
      late: 0,
      percentage: 100,
      status: 'Perfect',
      lastAttendance: '2024-01-26',
      trend: '+4%'
    }
  ]

  const mockAttendanceDistribution = [
    { name: 'Perfect (100%)', count: 8, color: '#10B981' },
    { name: 'Excellent (90-99%)', count: 15, color: '#3B82F6' },
    { name: 'Good (75-89%)', count: 12, color: '#F59E0B' },
    { name: 'At Risk (60-74%)', count: 5, color: '#EF4444' },
    { name: 'Critical (<60%)', count: 3, color: '#6B7280' }
  ]

  const mockMonthlySummary = [
    { month: 'Jan', avgAttendance: 85, totalClasses: 10 },
    { month: 'Feb', avgAttendance: 82, totalClasses: 12 },
    { month: 'Mar', avgAttendance: 88, totalClasses: 11 },
    { month: 'Apr', avgAttendance: 86, totalClasses: 10 },
    { month: 'May', avgAttendance: 90, totalClasses: 8 }
  ]

  const courseOptions = [
    { value: 'all', label: 'All Courses' },
    ...subjects.map(subject => ({
      value: subject.id,
      label: `${subject.title} (${subject.code})`
    }))
  ]

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: FiPieChart },
    { id: 'daily', label: 'Daily Attendance', icon: FiCalendar },
    { id: 'students', label: 'Student-wise', icon: FiUsers },
    { id: 'trends', label: 'Trends', icon: FiTrendingUp }
  ]

  const getStatusColor = (status) => {
    switch(status) {
      case 'Perfect': return 'bg-green-100 text-green-700 border-green-200'
      case 'Excellent': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Good': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'At Risk': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTrendIcon = (trend) => {
    if (trend.includes('+')) return <FiArrowUp className="h-3 w-3 text-green-500" />
    if (trend.includes('-')) return <FiArrowDown className="h-3 w-3 text-red-500" />
    return null
  }

  const handleGenerateReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      toast.success('Attendance report generated successfully!')
    }, 1500)
  }

  const handleExport = (format) => {
    toast.success(`Report exported as ${format.toUpperCase()}`)
  }

  const handlePrint = () => {
    window.print()
    toast.success('Sending to printer...')
  }

  const handleEmail = () => {
    toast.success('Report sent to your email')
  }

  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student)
    setShowStudentDetails(true)
  }

  const handleSendReminder = (student) => {
    toast.info(`Reminder sent to ${student.name}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent
        heading="Attendance Reports & Analytics"
        subHeading="Track attendance patterns, identify at-risk students, and generate comprehensive reports"
        role='admin'
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Avg. Attendance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">86.5%</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <FiArrowUp className="h-3 w-3 mr-0.5" />
                  +2.4% vs last month
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiPercent className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
                <p className="text-xs text-gray-500 mt-1">This semester</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiBook className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Perfect Attendance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
                <p className="text-xs text-green-600 mt-1">Students</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiUserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">At Risk Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
                <p className="text-xs text-red-600 mt-1">Below 75%</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FiUserX className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Late Arrivals</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                <p className="text-xs text-orange-600 mt-1">This month</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiWatch className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative min-w-[200px]">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  {courseOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="relative min-w-[150px]">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisSemester">This Semester</option>
                  <option value="custom">Custom Range</option>
                </select>
                <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students, courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors flex items-center whitespace-nowrap ${
                  showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FiFilter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                >
                  <FiGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                >
                  <FiList className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <FiRefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FiFileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>

              <div className="relative group">
                <button className="p-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiDownload className="h-4 w-4" />
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
                  >
                    Export as CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Attendance Range</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Students</option>
                  <option>Above 90%</option>
                  <option>75% - 90%</option>
                  <option>60% - 75%</option>
                  <option>Below 60%</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All</option>
                  <option>Perfect</option>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>At Risk</option>
                  <option>Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Departments</option>
                  <option>Computer Science</option>
                  <option>Engineering</option>
                  <option>Business</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>Attendance % (High to Low)</option>
                  <option>Attendance % (Low to High)</option>
                  <option>Name (A-Z)</option>
                  <option>Name (Z-A)</option>
                  <option>Last Attendance</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Report Type Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedReportType(type.id)}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedReportType === type.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <type.icon className="h-4 w-4 mr-2" />
              {type.label}
            </button>
          ))}
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {/* Overview Section */}
          {selectedReportType === 'overview' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Attendance Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Daily Attendance Trend</h3>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Last 10 days</span>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={mockDailyAttendance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickFormatter={(value) => value.split('-')[2]} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" fill="#3B82F6" name="Present" stackId="a" />
                      <Bar dataKey="absent" fill="#EF4444" name="Absent" stackId="a" />
                      <Bar dataKey="late" fill="#F59E0B" name="Late" stackId="a" />
                      <Line type="monotone" dataKey="total" stroke="#10B981" name="Total Students" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Attendance Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Attendance Distribution</h3>
                    <span className="text-xs text-gray-500">Total Students: 43</span>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockAttendanceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {mockAttendanceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Weekly Attendance Summary</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">Attendance %</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">Classes</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={mockWeeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="week" stroke="#6B7280" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Bar yAxisId="right" dataKey="classes" fill="#9CA3AF" name="Classes" />
                    <Line yAxisId="left" type="monotone" dataKey="attendance" stroke="#3B82F6" strokeWidth={2} name="Attendance %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* At Risk Students Alert */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FiAlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-semibold text-red-800">Students Needing Attention</h4>
                    <p className="text-xs text-red-600 mt-1">8 students have attendance below 75%. Consider sending reminders.</p>
                    <button className="mt-2 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
                      Send Bulk Reminders
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Daily Attendance Section */}
          {selectedReportType === 'daily' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-base font-semibold text-gray-900">Daily Attendance Record</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Late</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance %</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockDailyAttendance.map((day, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">{day.present}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">{day.absent}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-orange-600 font-medium">{day.late}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{day.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ((day.present / day.total) * 100) >= 90 ? 'bg-green-100 text-green-700' :
                            ((day.present / day.total) * 100) >= 75 ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {((day.present / day.total) * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Student-wise Section */}
          {selectedReportType === 'students' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-base font-semibold text-gray-900">Student Attendance Report</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg No</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Late</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockStudentAttendance.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-500">Last: {student.lastAttendance}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{student.regNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">{student.present}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">{student.absent}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-orange-600 font-medium">{student.late}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-900">{student.percentage}%</span>
                            <span className="ml-1">{getTrendIcon(student.trend)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleViewStudentDetails(student)}
                              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                              title="View Details"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleSendReminder(student)}
                              className="p-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
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
          )}

          {/* Trends Section */}
          {selectedReportType === 'trends' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Attendance Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockMonthlySummary}>
                    <defs>
                      <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="avgAttendance" stroke="#3B82F6" fill="url(#monthlyGradient)" name="Avg Attendance %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Attendance Pattern Analysis</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Peak Attendance Day</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">Tuesday</p>
                    <p className="text-xs text-green-600 mt-1">Average 92% attendance</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Lowest Attendance Day</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">Friday</p>
                    <p className="text-xs text-red-600 mt-1">Average 78% attendance</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">Prediction</p>
                    <p className="text-base font-semibold text-blue-800 mt-1">Expected attendance next month: 87%</p>
                    <p className="text-xs text-blue-600 mt-1">Based on historical trends</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Best Attendance Day</p>
                <p className="text-lg font-bold text-blue-900 mt-1">January 26</p>
                <p className="text-xs text-blue-600 mt-1">94% attendance</p>
              </div>
              <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Most Consistent</p>
                <p className="text-lg font-bold text-green-900 mt-1">Omar Farooq</p>
                <p className="text-xs text-green-600 mt-1">100% attendance</p>
              </div>
              <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                <FiAward className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Most Improved</p>
                <p className="text-lg font-bold text-purple-900 mt-1">Sarah Ahmed</p>
                <p className="text-xs text-purple-600 mt-1">+8% this month</p>
              </div>
              <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">Need Improvement</p>
                <p className="text-lg font-bold text-orange-900 mt-1">Hamza Ali</p>
                <p className="text-xs text-orange-600 mt-1">52% attendance</p>
              </div>
              <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="h-5 w-5 text-orange-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Student Attendance Details</h3>
              <button
                onClick={() => setShowStudentDetails(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">{selectedStudent.name}</h4>
                  <p className="text-sm text-gray-500">{selectedStudent.regNo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500">Present</p>
                  <p className="text-2xl font-bold text-green-600">{selectedStudent.present}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{selectedStudent.absent}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500">Late</p>
                  <p className="text-2xl font-bold text-orange-600">{selectedStudent.late}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500">Percentage</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedStudent.percentage}%</p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700">Recent Attendance</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">January 26, 2024</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Present</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">January 25, 2024</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Present</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">January 24, 2024</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">Late</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowStudentDetails(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => handleSendReminder(selectedStudent)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Send Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

export default TeacherCourseReport_Page