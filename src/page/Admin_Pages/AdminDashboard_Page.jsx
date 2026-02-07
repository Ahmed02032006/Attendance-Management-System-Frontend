import React, { useState, useEffect } from 'react';
import { FiUsers, FiBookOpen, FiTrendingUp, FiActivity, FiChevronRight, FiChevronLeft, FiEdit, FiTrash2, FiMail, FiCheck, FiSlash } from 'react-icons/fi';
import HeaderComponent from '../../components/HeaderComponent';

const AdminDashboard_Page = () => {
  // Stats data
  const [stats, setStats] = useState({
    allTeachers: 0,
    activeTeachers: 0,
    activeSubjects: 0,
    allSubjects: 0
  });

  // Teachers data
  const [teachers, setTeachers] = useState([]);
  const [currentTeacherPage, setCurrentTeacherPage] = useState(1);
  const [teachersPerPage] = useState(5);

  // Subjects data
  const [subjects, setSubjects] = useState([]);
  const [currentSubjectPage, setCurrentSubjectPage] = useState(1);
  const [subjectsPerPage] = useState(5);

  // Loading states
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockStats = {
        allTeachers: 45,
        activeTeachers: 38,
        activeSubjects: 28,
        allSubjects: 32
      };

      const mockTeachers = [
        { id: 1, name: "John Doe", email: "john@example.com", subjects: 5, status: "Active", joined: "2024-01-15" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", subjects: 3, status: "Active", joined: "2024-02-20" },
        { id: 3, name: "Robert Johnson", email: "robert@example.com", subjects: 7, status: "Active", joined: "2023-11-05" },
        { id: 4, name: "Emily Davis", email: "emily@example.com", subjects: 4, status: "Inactive", joined: "2024-03-10" },
        { id: 5, name: "Michael Wilson", email: "michael@example.com", subjects: 6, status: "Active", joined: "2023-12-01" },
        { id: 6, name: "Sarah Brown", email: "sarah@example.com", subjects: 2, status: "Active", joined: "2024-01-25" },
        { id: 7, name: "David Miller", email: "david@example.com", subjects: 8, status: "Inactive", joined: "2023-10-15" }
      ];

      const mockSubjects = [
        { id: 1, name: "Mathematics", code: "MATH101", teacher: "John Doe", students: 45, status: "Active" },
        { id: 2, name: "Physics", code: "PHY201", teacher: "Jane Smith", students: 38, status: "Active" },
        { id: 3, name: "Chemistry", code: "CHEM101", teacher: "Robert Johnson", students: 42, status: "Active" },
        { id: 4, name: "Biology", code: "BIO101", teacher: "Emily Davis", students: 35, status: "Inactive" },
        { id: 5, name: "Computer Science", code: "CS101", teacher: "Michael Wilson", students: 50, status: "Active" },
        { id: 6, name: "English", code: "ENG101", teacher: "Sarah Brown", students: 40, status: "Active" },
        { id: 7, name: "History", code: "HIST101", teacher: "David Miller", students: 30, status: "Inactive" }
      ];

      setStats(mockStats);
      setTeachers(mockTeachers);
      setSubjects(mockSubjects);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get first letter of name for avatar
  const getAvatarLetter = (name) => {
    if (!name) return 'T';
    return name.charAt(0).toUpperCase();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Teachers pagination
  const indexOfLastTeacher = currentTeacherPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = teachers.slice(indexOfFirstTeacher, indexOfLastTeacher);
  const teacherTotalPages = Math.ceil(teachers.length / teachersPerPage);

  // Subjects pagination
  const indexOfLastSubject = currentSubjectPage * subjectsPerPage;
  const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage;
  const currentSubjects = subjects.slice(indexOfFirstSubject, indexOfLastSubject);
  const subjectTotalPages = Math.ceil(subjects.length / subjectsPerPage);

  // Teacher pagination functions
  const teacherPaginate = (pageNumber) => setCurrentTeacherPage(pageNumber);
  const teacherNextPage = () => setCurrentTeacherPage(prev => Math.min(prev + 1, teacherTotalPages));
  const teacherPrevPage = () => setCurrentTeacherPage(prev => Math.max(prev - 1, 1));

  // Subject pagination functions
  const subjectPaginate = (pageNumber) => setCurrentSubjectPage(pageNumber);
  const subjectNextPage = () => setCurrentSubjectPage(prev => Math.min(prev + 1, subjectTotalPages));
  const subjectPrevPage = () => setCurrentSubjectPage(prev => Math.max(prev - 1, 1));

  // Render pagination buttons
  const renderPagination = (currentPage, totalPages, paginateFunction) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return (
      <div className="flex items-center space-x-1">
        <button
          onClick={() => paginateFunction(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>

        {pageNumbers.map((number, index) => (
          number === '...' ? (
            <span key={`dots-${index}`} className="px-2 text-gray-500">...</span>
          ) : (
            <button
              key={number}
              onClick={() => paginateFunction(number)}
              className={`px-3 py-1.5 text-sm font-medium ${currentPage === number
                ? 'border-sky-600 bg-sky-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                } rounded-md transition-colors border`}
            >
              {number}
            </button>
          )
        ))}

        <button
          onClick={() => paginateFunction(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent
        heading={"Admin Dashboard"}
        subHeading={"Overview of your institution's performance"}
        role='admin'
      />

      <div className="container max-w-full mx-auto p-4 lg:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* All Teachers Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-sky-100 rounded-xl">
                <FiUsers className="h-6 w-6 text-sky-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.allTeachers}</div>
                <div className="text-sm text-gray-600 mt-1">Total</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">All Teachers</h3>
            <p className="text-sm text-gray-600">Total number of faculty members</p>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm">
                <FiTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+12%</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          </div>

          {/* Active Teachers Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FiActivity className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.activeTeachers}</div>
                <div className="text-sm text-gray-600 mt-1">Active</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Teachers</h3>
            <p className="text-sm text-gray-600">Currently active faculty members</p>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">{Math.round((stats.activeTeachers / stats.allTeachers) * 100)}%</span>
                <span className="text-gray-500 ml-2">active rate</span>
              </div>
            </div>
          </div>

          {/* Active Subjects Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiBookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.activeSubjects}</div>
                <div className="text-sm text-gray-600 mt-1">Active</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Subjects</h3>
            <p className="text-sm text-gray-600">Currently running courses</p>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm">
                <FiTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+8%</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          </div>

          {/* All Subjects Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FiBookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.allSubjects}</div>
                <div className="text-sm text-gray-600 mt-1">Total</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">All Subjects</h3>
            <p className="text-sm text-gray-600">Total courses in institution</p>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">{Math.round((stats.activeSubjects / stats.allSubjects) * 100)}%</span>
                <span className="text-gray-500 ml-2">active rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Teachers Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Recent Teachers</h3>
                  <p className="text-sm text-gray-600 mt-1">Latest faculty members</p>
                </div>
                <button className="text-sky-600 hover:text-sky-800 font-medium text-sm flex items-center">
                  View All
                  <FiChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Subjects
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTeachers.length > 0 ? (
                    currentTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="shrink-0 h-10 w-10 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-sky-500">
                              <span className="text-white font-bold text-lg">
                                {getAvatarLetter(teacher.name)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {teacher.name}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                <FiMail className="h-3 w-3 mr-1" />
                                {teacher.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                          <span className="px-2 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-medium">
                            {teacher.subjects} subjects
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {formatDate(teacher.joined)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center ${teacher.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}>
                            {teacher.status === "Active" ? (
                              <>
                                <FiCheck className="h-3 w-3 mr-1.5" />
                                Active
                              </>
                            ) : (
                              <>
                                <FiSlash className="h-3 w-3 mr-1.5" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-sky-600 hover:text-sky-900 transition-colors p-1"
                              title="Edit Teacher"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 transition-colors p-1"
                              title="Delete Teacher"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">No teachers found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {teachers.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-3 sm:mb-0">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstTeacher + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastTeacher, teachers.length)}</span> of{' '}
                    <span className="font-medium">{teachers.length}</span> teachers
                  </p>
                </div>
                {renderPagination(currentTeacherPage, teacherTotalPages, teacherPaginate)}
              </div>
            )}
          </div>

          {/* Subjects Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Recent Subjects</h3>
                  <p className="text-sm text-gray-600 mt-1">Latest courses</p>
                </div>
                <button className="text-sky-600 hover:text-sky-800 font-medium text-sm flex items-center">
                  View All
                  <FiChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Teacher
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Students
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSubjects.length > 0 ? (
                    currentSubjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {subject.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Code: {subject.code}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                          <div className="flex items-center">
                            <div className="shrink-0 h-8 w-8 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-sky-500 mr-2">
                              <span className="text-white font-bold text-sm">
                                {getAvatarLetter(subject.teacher)}
                              </span>
                            </div>
                            {subject.teacher}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            {subject.students} students
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center ${subject.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}>
                            {subject.status === "Active" ? (
                              <>
                                <FiCheck className="h-3 w-3 mr-1.5" />
                                Active
                              </>
                            ) : (
                              <>
                                <FiSlash className="h-3 w-3 mr-1.5" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-sky-600 hover:text-sky-900 transition-colors p-1"
                              title="Edit Subject"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 transition-colors p-1"
                              title="Delete Subject"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          <FiBookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">No subjects found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {subjects.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-3 sm:mb-0">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstSubject + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastSubject, subjects.length)}</span> of{' '}
                    <span className="font-medium">{subjects.length}</span> subjects
                  </p>
                </div>
                {renderPagination(currentSubjectPage, subjectTotalPages, subjectPaginate)}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg p-4 flex items-center justify-center transition-colors group">
              <div className="text-center">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-sky-200 transition-colors">
                  <FiUsers className="h-6 w-6 text-sky-600" />
                </div>
                <span className="text-sm font-medium text-gray-800">Add New Teacher</span>
              </div>
            </button>
            <button className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 flex items-center justify-center transition-colors group">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                  <FiBookOpen className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-800">Create Subject</span>
              </div>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 flex items-center justify-center transition-colors group">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                  <FiUsers className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-800">Manage Students</span>
              </div>
            </button>
            <button className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 flex items-center justify-center transition-colors group">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                  <FiActivity className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-800">View Reports</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard_Page;