import React, { useState } from 'react';
import {
  FiHome, FiUsers, FiBook, FiCalendar, FiSettings,
  FiDollarSign, FiBarChart2, FiMail, FiBell,
  FiEye, FiEdit2, FiTrash2,
  FiEdit,
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiTrendingUp,
  FiTrendingDown,
  FiPlus
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// Format date function
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const AdminDashboard_Page = () => {
  const stats = [
    { title: "Total Students", value: "1,245", change: "+12%", trend: "up" },
    { title: "Total Teachers", value: "68", change: "+5%", trend: "up" },
    { title: "Active Classes", value: "32", change: "-2%", trend: "down" },
    { title: "Pending Fees", value: "$12,450", change: "+8%", trend: "up" }
  ];

  const students = [
    {
      _id: "1",
      id: "#STU-1001",
      name: "John Smith",
      class: "10-A",
      parent: "Michael Smith",
      contact: "+1 555-123-4567",
      admissionDate: "2023-01-15",
      status: "Active",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      _id: "2",
      id: "#STU-1002",
      name: "Sarah Johnson",
      class: "9-B",
      parent: "David Johnson",
      contact: "+1 555-987-6543",
      admissionDate: "2023-02-20",
      status: "Active",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      _id: "3",
      id: "#STU-1003",
      name: "Emma Williams",
      class: "11-C",
      parent: "Robert Williams",
      contact: "+1 555-456-7890",
      admissionDate: "2023-03-10",
      status: "Pending",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      _id: "4",
      id: "#STU-1004",
      name: "James Brown",
      class: "12-A",
      parent: "Thomas Brown",
      contact: "+1 555-789-0123",
      admissionDate: "2023-04-05",
      status: "Active",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg"
    },
    {
      _id: "5",
      id: "#STU-1005",
      name: "Olivia Davis",
      class: "8-C",
      parent: "Christopher Davis",
      contact: "+1 555-234-5678",
      admissionDate: "2023-05-12",
      status: "Inactive",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg"
    }
  ];

  // Attendance data for chart
  const attendanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Students',
        data: [85, 79, 83, 87, 82, 78],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
      {
        label: 'Teachers',
        data: [95, 89, 93, 97, 92, 102],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
      },
    ],
  };

  // Fees data for chart
  const feesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Fees Collected',
        data: [12000, 19000, 15000, 18000, 21000, 19500],
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
      },
    ],
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5); // Showing 3 students per page for demo

  // Calculate pagination variables
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(students.length / studentsPerPage);

  // Pagination functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation - Clean Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-6 py-[19px] flex items-center justify-between">
            <h1 className="text-2xl font-medium text-gray-800">
              Admin Dashboard Page
            </h1>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Enhanced Welcome Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl p-6 mb-6 text-white shadow-xl">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full transform -translate-x-20 translate-y-20"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2 flex items-center">
                Welcome back, Admin!
                <span className="ml-3 animate-wave">👋</span>
              </h2>
              <p className="text-lg opacity-95 ">Here's what's happening with your school today.</p>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 h-full flex items-center pr-6">
              <div className="w-24 h-24 bg-white/10 rounded-full backdrop-blur-sm"></div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {stat.trend === 'up' ? <FiTrendingUp className="w-5 h-5" /> : <FiTrendingDown className="w-5 h-5" />}
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`inline-flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                    {stat.trend === 'up' ? (
                      <FiTrendingUp className="ml-1 w-4 h-4" />
                    ) : (
                      <FiTrendingDown className="ml-1 w-4 h-4" />
                    )}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">vs last period</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            {/* Attendance Chart */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-800">Attendance Overview</h2>
                <div className="flex items-center space-x-2">
                  <select className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition">
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceData.labels.map((label, i) => ({
                      name: label,
                      Students: attendanceData.datasets[0].data[i],
                      Teachers: attendanceData.datasets[1].data[i]
                    }))}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        background: 'rgba(255, 255, 255, 0.96)'
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: 10 }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar
                      dataKey="Students"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      barSize={12}
                    />
                    <Bar
                      dataKey="Teachers"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={12}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fees Chart */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-800">Fees Collection</h2>
                <div className="flex items-center space-x-2">
                  <select className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition">
                    <option>Last 6 Months</option>
                    <option>This Year</option>
                    <option>Last Year</option>
                  </select>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={feesData.labels.map((label, i) => ({
                      name: label,
                      'Fees Collected': feesData.datasets[0].data[i]
                    }))}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        background: 'rgba(255, 255, 255, 0.96)'
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: 10 }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar
                      dataKey="Fees Collected"
                      fill="#38bdf8"
                      radius={[4, 4, 0, 0]}
                      barSize={75}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto hide-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admission Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentStudents.length > 0 ? (
                    currentStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 overflow-hidden border-1 border-gray-400">
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                          {student.class}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                          {student.parent}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                          {student.contact}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                          {formatDate(student.admissionDate)}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${student.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : student.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-3">
                            <button
                              className="text-sky-600 hover:text-sky-900"
                              title="View"
                            >
                              <FiEye className="h-5 w-5" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit"
                            >
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {students.length > 0 && (
              <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="mb-3 sm:mb-0">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastStudent, students.length)}</span> of{' '}
                    <span className="font-medium">{students.length}</span> students
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  >
                    <FiChevronLeft className="h-4 w-4 mr-1" />
                  </button>

                  {totalPages <= 6 ? (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3.5 py-1.5 border text-sm font-medium ${currentPage === number
                            ? 'border-sky-600 bg-sky-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          } rounded-md transition-colors`}
                      >
                        {number}
                      </button>
                    ))
                  ) : (
                    <>
                      {currentPage > 3 && (
                        <button
                          onClick={() => paginate(1)}
                          className="px-3.5 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
                        >
                          1
                        </button>
                      )}
                      {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                      {[
                        currentPage - 2,
                        currentPage - 1,
                        currentPage,
                        currentPage + 1,
                        currentPage + 2
                      ]
                        .filter(num => num > 0 && num <= totalPages)
                        .map(number => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3.5 py-1.5 border text-sm font-medium ${currentPage === number
                                ? 'border-sky-600 bg-sky-600 text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                              } rounded-md transition-colors`}
                          >
                            {number}
                          </button>
                        ))}
                      {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                      {currentPage < totalPages - 2 && (
                        <button
                          onClick={() => paginate(totalPages)}
                          className="px-3.5 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
                        >
                          {totalPages}
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  >
                    <FiChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard_Page;