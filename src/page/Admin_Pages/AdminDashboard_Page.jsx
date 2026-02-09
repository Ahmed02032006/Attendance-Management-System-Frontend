import React, { useState, useEffect } from 'react';
import { FiUsers, FiBookOpen, FiCheck, FiSlash, FiMail, FiEdit, FiTrash2, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import HeaderComponent from '../../components/HeaderComponent';

const AdminDashboard_Page = () => {
  // Stats data
  const [stats, setStats] = useState({
    allTeachers: 0,
    activeTeachers: 0,
    allSubjects: 0,
    activeSubjects: 0
  });

  // Teachers data
  const [teachers, setTeachers] = useState([]);
  const [currentTeacherPage, setCurrentTeacherPage] = useState(1);
  const [teachersPerPage] = useState(4);

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
        allSubjects: 32,
        activeSubjects: 28
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

      setStats(mockStats);
      setTeachers(mockTeachers);
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

  // Teacher pagination functions
  const teacherPaginate = (pageNumber) => setCurrentTeacherPage(pageNumber);
  const teacherNextPage = () => setCurrentTeacherPage(prev => Math.min(prev + 1, teacherTotalPages));
  const teacherPrevPage = () => setCurrentTeacherPage(prev => Math.max(prev - 1, 1));

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
        {/* Stats Cards - Reordered as requested */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* All Teachers Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-sky-100 rounded-lg mr-4">
                <FiUsers className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.allTeachers}</div>
                <div className="text-sm font-medium text-gray-600">All Teachers</div>
              </div>
            </div>
          </div>

          {/* Active Teachers Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <FiUsers className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.activeTeachers}</div>
                <div className="text-sm font-medium text-gray-600">Active Teachers</div>
              </div>
            </div>
          </div>

          {/* All Subjects Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <FiBookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.allSubjects}</div>
                <div className="text-sm font-medium text-gray-600">All Subjects</div>
              </div>
            </div>
          </div>

          {/* Active Subjects Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-orange-100 rounded-lg mr-4">
                <FiBookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.activeSubjects}</div>
                <div className="text-sm font-medium text-gray-600">Active Subjects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tables in different columns */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8">
          {/* Teachers Table Column */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Teachers List</h3>
                <p className="text-sm text-gray-600 mt-1">Manage faculty members</p>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Last Login
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Status
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          1d Ago
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard_Page;