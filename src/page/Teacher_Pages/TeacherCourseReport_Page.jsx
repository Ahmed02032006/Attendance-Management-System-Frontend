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
  FiPercent
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
  Area
} from 'recharts'
import { toast } from 'react-toastify'

const TeacherCourseReport_Page = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { subjects } = useSelector((state) => state.teacherSubject)

  const [selectedCourse, setSelectedCourse] = useState('all')
  const [dateRange, setDateRange] = useState('thisMonth')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('overview')
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock data for reports (replace with actual API data)
  const mockAttendanceData = [
    { date: 'Week 1', present: 85, absent: 10, late: 5 },
    { date: 'Week 2', present: 78, absent: 15, late: 7 },
    { date: 'Week 3', present: 92, absent: 5, late: 3 },
    { date: 'Week 4', present: 88, absent: 8, late: 4 },
    { date: 'Week 5', present: 82, absent: 12, late: 6 },
    { date: 'Week 6', present: 90, absent: 7, late: 3 }
  ]

  const mockPerformanceData = [
    { name: 'A Grade (90-100%)', value: 15, color: '#10B981' },
    { name: 'B Grade (80-89%)', value: 25, color: '#3B82F6' },
    { name: 'C Grade (70-79%)', value: 18, color: '#F59E0B' },
    { name: 'D Grade (60-69%)', value: 8, color: '#EF4444' },
    { name: 'F Grade (<60%)', value: 4, color: '#6B7280' }
  ]

  const mockWeeklyTrend = [
    { week: 'Week 1', attendance: 85, assignments: 78, quizzes: 82 },
    { week: 'Week 2', attendance: 78, assignments: 82, quizzes: 75 },
    { week: 'Week 3', attendance: 92, assignments: 88, quizzes: 90 },
    { week: 'Week 4', attendance: 88, assignments: 85, quizzes: 86 },
    { week: 'Week 5', attendance: 82, assignments: 90, quizzes: 84 },
    { week: 'Week 6', attendance: 90, assignments: 87, quizzes: 92 }
  ]

  const mockTopPerformers = [
    { rank: 1, name: 'Sarah Ahmed', regNo: '25FA-001-BCS', attendance: 98, assignments: 95, quizzes: 96, overall: 96.3 },
    { rank: 2, name: 'Bilal Khan', regNo: '25FA-015-BCS', attendance: 95, assignments: 92, quizzes: 94, overall: 93.7 },
    { rank: 3, name: 'Ayesha Malik', regNo: '25FA-008-BCS', attendance: 96, assignments: 90, quizzes: 91, overall: 92.3 },
    { rank: 4, name: 'Usman Ali', regNo: '25FA-022-BCS', attendance: 92, assignments: 89, quizzes: 88, overall: 89.7 },
    { rank: 5, name: 'Fatima Zaidi', regNo: '25FA-031-BCS', attendance: 89, assignments: 91, quizzes: 87, overall: 89.0 }
  ]

  const mockCourseStats = {
    'all': {
      totalCourses: subjects.length || 8,
      totalStudents: subjects.reduce((acc, s) => acc + (s.registeredStudentsCount || 0), 0) || 245,
      avgAttendance: 86.5,
      passRate: 92.3,
      topPerformer: 'Computer Science (Fall 2026)',
      improvement: '+5.2%'
    },
    'CS101': {
      totalStudents: 45,
      avgAttendance: 89.2,
      passRate: 94.5,
      topPerformer: 'Sarah Ahmed',
      improvement: '+3.8%'
    }
  }

  const courseOptions = [
    { value: 'all', label: 'All Courses' },
    ...subjects.map(subject => ({
      value: subject.id,
      label: `${subject.title} (${subject.code})`
    }))
  ]

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: FiPieChart },
    { id: 'attendance', label: 'Attendance', icon: FiUsers },
    { id: 'performance', label: 'Performance', icon: FiBarChart2 },
    { id: 'trends', label: 'Trends', icon: FiTrendingUp }
  ]

  const stats = selectedCourse === 'all' ? mockCourseStats.all : mockCourseStats['CS101']

  // Handle report generation
  const handleGenerateReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      toast.success('Report generated successfully!')
    }, 1500)
  }

  // Handle export
  const handleExport = (format) => {
    toast.success(`Report exported as ${format.toUpperCase()}`)
  }

  // Handle print
  const handlePrint = () => {
    window.print()
    toast.success('Sending to printer...')
  }

  // Handle email
  const handleEmail = () => {
    toast.success('Report sent to your email')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent
        heading="Course Reports & Analytics"
        subHeading="Comprehensive insights and performance metrics for your courses"
        role='admin'
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <FiArrowUp className="h-3 w-3 mr-0.5" />
                  {stats.improvement}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiBook className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
                <p className="text-xs text-gray-500 mt-1">Enrolled</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiUsers className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Avg. Attendance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgAttendance}%</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <FiArrowUp className="h-3 w-3 mr-0.5" />
                  +2.4%
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Pass Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.passRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Above average</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiAward className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Top Performer</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 truncate max-w-[120px]">
                  {stats.topPerformer}
                </p>
                <p className="text-xs text-blue-600 mt-1">View details</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiTarget className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left side - Course Selection & Filters */}
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
                  placeholder="Search reports, courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors flex items-center whitespace-nowrap ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <FiFilter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            {/* Right side - Actions */}
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
                <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Departments</option>
                  <option>Computer Science</option>
                  <option>Engineering</option>
                  <option>Business</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Semester</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Semesters</option>
                  <option>1st Semester</option>
                  <option>2nd Semester</option>
                  <option>3rd Semester</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Performance</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Students</option>
                  <option>Top Performers</option>
                  <option>At Risk</option>
                  <option>Needs Improvement</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Attendance</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All</option>
                  <option>Above 90%</option>
                  <option>75% - 90%</option>
                  <option>Below 75%</option>
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
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${selectedReportType === type.id
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
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Trend */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Attendance Trend</h3>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+5.2% vs last month</span>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockAttendanceData}>
                      <defs>
                        <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey="present" stroke="#3B82F6" fill="url(#attendanceGradient)" name="Present %" />
                      <Area type="monotone" dataKey="absent" stroke="#EF4444" fill="#FEE2E2" name="Absent %" />
                      <Area type="monotone" dataKey="late" stroke="#F59E0B" fill="#FEF3C7" name="Late %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Grade Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Grade Distribution</h3>
                    <span className="text-xs text-gray-500">Total Students: 70</span>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockPerformanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {mockPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Performance */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Weekly Performance Overview</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">Attendance</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">Assignments</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-purple-600 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">Quizzes</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockWeeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="week" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="attendance" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="assignments" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="quizzes" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Performers Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Top Performing Students</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Assignments</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quizzes</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Overall</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockTopPerformers.map((student) => (
                        <tr key={student.rank} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                              ${student.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                                student.rank === 2 ? 'bg-gray-200 text-gray-700' : 
                                student.rank === 3 ? 'bg-orange-100 text-orange-700' : 
                                'bg-gray-100 text-gray-600'}`}>
                              {student.rank}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{student.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{student.regNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{student.attendance}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{student.assignments}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{student.quizzes}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {student.overall}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Attendance Section */}
          {selectedReportType === 'attendance' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Attendance Report</h3>
              <p className="text-gray-500">Attendance analytics and insights will be displayed here</p>
            </div>
          )}

          {/* Performance Section */}
          {selectedReportType === 'performance' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance Analytics</h3>
              <p className="text-gray-500">Performance metrics and grade analysis will be displayed here</p>
            </div>
          )}

          {/* Trends Section */}
          {selectedReportType === 'trends' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Trends & Predictions</h3>
              <p className="text-gray-500">Historical trends and future predictions will be displayed here</p>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Average Score</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">84.6%</p>
                <p className="text-xs text-blue-600 mt-1">+2.3% from last month</p>
              </div>
              <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                <FiPercent className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Assignment Completion</p>
                <p className="text-2xl font-bold text-green-900 mt-1">92%</p>
                <p className="text-xs text-green-600 mt-1">45/49 students</p>
              </div>
              <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">At Risk Students</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">8</p>
                <p className="text-xs text-purple-600 mt-1">Need attention</p>
              </div>
              <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">Classes Conducted</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">24</p>
                <p className="text-xs text-orange-600 mt-1">This semester</p>
              </div>
              <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                <FiClock className="h-5 w-5 text-orange-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

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