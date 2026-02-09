import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiUsers, FiBookOpen, FiCheck, FiSlash, FiMail, FiChevronRight, FiChevronLeft, FiAlertCircle } from 'react-icons/fi';
import HeaderComponent from '../../components/HeaderComponent';
import { getTeachersByUser } from '../../store/Admin-Slicer/Teacher-Slicer.js';

const AdminDashboard_Page = () => {
  const dispatch = useDispatch();
  const { teachers = [], isLoading, error } = useSelector((state) => state.adminTeacher);

  // Stats data
  const [stats, setStats] = useState({
    allTeachers: 0,
    activeTeachers: 0,
    allSubjects: 0,
    activeSubjects: 0
  });

  // Teachers data
  const [dashboardTeachers, setDashboardTeachers] = useState([]);
  const [currentTeacherPage, setCurrentTeacherPage] = useState(1);
  const [teachersPerPage] = useState(4);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Use a ref to track initial mount
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      // Clear previous data
      setDashboardTeachers([]);
      setStats({
        allTeachers: 0,
        activeTeachers: 0,
        allSubjects: 0,
        activeSubjects: 0
      });

      // Fetch real teachers data - unwrap the promise to wait for completion
      await dispatch(getTeachersByUser()).unwrap();

      // Mark initial load as complete
      setInitialLoadComplete(true);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setErrorMessage(error?.message || 'Failed to load dashboard data');
      setInitialLoadComplete(true);
    } finally {
      setLoading(false);
    }
  };

  // Calculate and update stats whenever teachers data changes
  useEffect(() => {
    if (!teachers || !Array.isArray(teachers)) {
      return;
    }

    // Filter only Teacher role users
    const teacherUsers = teachers.filter(teacher => {
      const role = teacher.userRole || teacher.role || '';
      return role === 'Teacher' || role === '' || !role;
    });

    // Calculate stats from teacher data only
    const allTeachersCount = teacherUsers.length;
    const activeTeachersCount = teacherUsers.filter(teacher => {
      const status = teacher.status || teacher.userStatus || 'Active';
      return status === 'Active';
    }).length;

    // Calculate total subjects count from teachers only
    const allSubjectsCount = teacherUsers.reduce((total, teacher) => {
      return total + (teacher.subjectCount || teacher.subjectsCount || teacher.subjects?.length || 0);
    }, 0);

    const activeSubjectsCount = allSubjectsCount;

    setStats({
      allTeachers: allTeachersCount,
      activeTeachers: activeTeachersCount,
      allSubjects: allSubjectsCount,
      activeSubjects: activeSubjectsCount
    });

    setDashboardTeachers(teacherUsers);

    // Reset to first page when data changes
    setCurrentTeacherPage(1);

  }, [teachers]); // This will run whenever teachers data updates

  // Get first letter of name for avatar
  const getAvatarLetter = (name) => {
    if (!name) return 'T';
    return name.charAt(0).toUpperCase();
  };

  // Get display name
  const getDisplayName = (teacher) => {
    return teacher.userName || teacher.name || teacher.fullName || 'Unknown Teacher';
  };

  // Get display email
  const getDisplayEmail = (teacher) => {
    return teacher.userEmail || teacher.email || 'No email';
  };

  // Get subject count
  const getSubjectCount = (teacher) => {
    return teacher.subjectCount || teacher.subjectsCount || teacher.subjects?.length || 0;
  };

  // Get created date
  const getCreatedDate = (teacher) => {
    return teacher.createdAt || teacher.createdDate || teacher.joinedDate;
  };

  // Get last login date
  const getLastLoginDate = (teacher) => {
    return teacher.lastLogin || teacher.lastLoginDate || teacher.updatedAt || teacher.modifiedDate;
  };

  // Get status
  const getStatus = (teacher) => {
    return teacher.status || teacher.userStatus || 'Active';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Calculate time ago for last login
  const timeAgo = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);

      const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
      ];

      for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
          return new Intl.RelativeTimeFormat('en', {
            numeric: 'auto',
          }).format(-count, interval.label);
        }
      }

      return 'just now';
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Teachers pagination
  const indexOfLastTeacher = currentTeacherPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = dashboardTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher);
  const teacherTotalPages = Math.ceil(dashboardTeachers.length / teachersPerPage);

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

  // Handle retry
  const handleRetry = () => {
    fetchDashboardData();
  };

  if (loading && !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent
          heading={"Admin Dashboard"}
          subHeading={"Overview of your institution's performance"}
          role='admin'
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent
        heading={"Admin Dashboard"}
        subHeading={"Overview of your institution's performance"}
        role='admin'
      />

      <div className="container max-w-full mx-auto p-4 lg:p-6">
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">{errorMessage}</p>
                <p className="text-red-600 text-sm mt-1">
                  Please check if teachers exist in your system or try again.
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards - Modern Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* All Teachers Card */}
          <div className="bg-linear-to-br from-white to-sky-50 rounded-xl p-5 border border-sky-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sky-700 mb-1">All Teachers</p>
                <div className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.allTeachers}</div>
              </div>
              <div className="p-3 bg-sky-100 rounded-lg">
                <FiUsers className="h-6 w-6 text-sky-600" />
              </div>
            </div>
          </div>

          {/* Active Teachers Card */}
          <div className="bg-linear-to-br from-white to-green-50 rounded-xl p-5 border border-green-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Active Teachers</p>
                <div className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.activeTeachers}</div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiUsers className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* All Subjects Card */}
          <div className="bg-linear-to-br from-white to-purple-50 rounded-xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">All Subjects</p>
                <div className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.allSubjects}</div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiBookOpen className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Table Column */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Teachers List</h3>
                <p className="text-sm text-gray-600 mt-1">Manage faculty members</p>
              </div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors text-sm font-medium flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <FiUsers className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
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
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Subjects
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Last Login
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTeachers.length > 0 ? (
                  currentTeachers.map((teacher, index) => {
                    const displayName = getDisplayName(teacher);
                    const displayEmail = getDisplayEmail(teacher);
                    const subjectCount = getSubjectCount(teacher);
                    const createdDate = getCreatedDate(teacher);
                    const lastLoginDate = getLastLoginDate(teacher);
                    const status = getStatus(teacher);

                    return (
                      <tr key={teacher._id || teacher.id || `teacher-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="shrink-0 h-10 w-10 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-sky-500">
                              <span className="text-white font-bold text-lg">
                                {getAvatarLetter(displayName)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {displayName}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                <FiMail className="h-3 w-3 mr-1" />
                                {displayEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 hidden md:table-cell">
                          <span className="px-2 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-medium inline-block">
                            {subjectCount} subjects
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 hidden lg:table-cell">
                          {formatDate(createdDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 hidden md:table-cell">
                          {timeAgo(lastLoginDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center hidden md:table-cell">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center justify-center mx-auto ${status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}>
                            {status === "Active" ? (
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
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No teachers found</p>
                        <p className="text-sm mt-1">
                          {isLoading
                            ? "Loading teachers..."
                            : teachers.length === 0
                              ? "No teachers available in the system"
                              : "No teachers match the criteria. Try refreshing or check if teachers have the 'Teacher' role."
                          }
                        </p>
                        {!isLoading && (
                          <button
                            onClick={handleRetry}
                            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors text-sm font-medium"
                          >
                            Refresh Data
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {dashboardTeachers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between">
              <div className="mb-3 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstTeacher + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastTeacher, dashboardTeachers.length)}</span> of{' '}
                  <span className="font-medium">{dashboardTeachers.length}</span> teachers
                </p>
              </div>
              {renderPagination(currentTeacherPage, teacherTotalPages, teacherPaginate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard_Page;
