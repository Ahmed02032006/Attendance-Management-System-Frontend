import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentsBySchoolId } from '../../store/Admin-Slicer/Admin-Student-Slicer';

const AdminStudentAttendance_Page = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState('attendance');
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [filteredData, setFilteredData] = useState({
    attendance: [],
    leaveRequests: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [studentLoading, setStudentLoading] = useState(true);

  const { students } = useSelector((state) => state.adminStudent);
  const dispatch = useDispatch();
  const schoolId = sessionStorage.getItem("currentSchoolId") || null;

  useEffect(() => {
    if (!schoolId) return;
    dispatch(getStudentsBySchoolId(schoolId));
  }, [dispatch, schoolId]);

  // Process students data when loaded
  useEffect(() => {
    if (students) {
      setAllStudents(students);
      setStudentLoading(false);
    }
  }, [students]);

  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredStudents = searchTerm
    ? allStudents.filter(student => {
        const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.classId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        return matchesSearch;
      })
    : allStudents.slice(0, 5); // Show first 5 students by default

  const StatusBadge = ({ status }) => {
    const colorClasses = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-sky-100 text-sky-800',
      active: 'bg-sky-100 text-sky-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const TypeBadge = ({ type }) => {
    const colorClasses = {
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-sky-100 text-sky-800',
      professional: 'bg-sky-100 text-sky-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getDayFromDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { weekday: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSelectedDate(null);
    setSearchTerm('');
    setShowSearchResults(false);

    const studentAttendance = Array.from(student.attendance || []);
    const studentLeaveRequests = Array.from(student.leaveRequests || []);

    const filteredAttendance = studentAttendance
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredData({
      attendance: filteredAttendance,
      leaveRequests: studentLeaveRequests
    });
  };

  const handleDateFilter = (date) => {
    setSelectedDate(date);

    const studentAttendance = Array.from(selectedStudent.attendance || []);
    const studentLeaveRequests = Array.from(selectedStudent.leaveRequests || []);

    if (!date) {
      setFilteredData({
        attendance: studentAttendance
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
        leaveRequests: studentLeaveRequests
      });
      return;
    }

    setFilteredData({
      attendance: studentAttendance
        .filter(record => new Date(record.date).toISOString().split('T')[0] === date),
      leaveRequests: studentLeaveRequests
        .filter(record => new Date(record.date).toISOString().split('T')[0] === date)
    });
  };

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-[19px] flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Student Attendance Management
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Search Section */}
        <div className="bg-white rounded-lg p-4 mb-3 border-gray-200 border" ref={searchRef}>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full relative">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-md bg-gray-50 focus:bg-gray-100 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors duration-200 outline-none"
                  placeholder="Search by student name, ID, or class"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  onFocus={handleSearchFocus}
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setShowSearchResults(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {showSearchResults && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-2 text-base ring-1 ring-gray-200 overflow-auto max-h-96">
                  <div className="divide-y divide-gray-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <div
                          key={student._id}
                          onClick={() => handleSelectStudent(student)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center transition-colors duration-150 group"
                        >
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3 border-2 border-gray-200 group-hover:border-sky-300 transition-colors duration-200">
                            <img
                              className="h-full w-full object-cover"
                              src={student.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg'}
                              alt={student.studentName}
                              onError={(e) => e.target.src = '/default-avatar.svg'}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-sky-600 transition-colors duration-200">
                              {student.studentName}
                            </p>
                            <div className="flex items-center mt-1">
                              <p className="text-xs text-gray-500 truncate mr-2">
                                {student.classId?.name}-{student.section}
                              </p>
                              <span className="text-xs px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded-full">
                                Roll No: {student.rollNumber}
                              </span>
                            </div>
                          </div>
                          <div className="ml-2 flex flex-col items-end">
                            <StatusBadge status={student.currentStatus?.toLowerCase() || 'active'} />
                            <span className="text-xs mt-1 text-gray-500">
                              {student.attendance?.length || 0} records
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-sm text-gray-500">
                        <svg className="mx-auto h-5 w-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        No students found matching your search
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-auto">
              <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    id="date-filter"
                    className="text-sm border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 bg-gray-50 focus:bg-gray-100 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors duration-200 outline-none w-full"
                    onChange={(e) => handleDateFilter(e.target.value)}
                    value={selectedDate || ''}
                    disabled={!selectedStudent}
                  />
                </div>
                <button
                  onClick={() => handleDateFilter('')}
                  className="text-sm px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap"
                  disabled={!selectedStudent}
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedStudent ? (
          <>
            {/* Student Profile Section */}
            <div className="bg-white overflow-hidden border rounded-lg border-gray-200 mb-3">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="h-32 w-32 rounded-lg overflow-hidden border-2 border-sky-100">
                        <img
                          className="h-full w-full object-cover"
                          src={selectedStudent.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg'}
                          alt={selectedStudent.studentName}
                          onError={(e) => e.target.src = '/default-avatar.svg'}
                        />
                      </div>
                      <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2">
                        <StatusBadge status={selectedStudent.currentStatus?.toLowerCase() || 'active'} />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {selectedStudent.studentName}
                        </h2>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                            {selectedStudent.classId?.name}-{selectedStudent.section}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Roll No: {selectedStudent.rollNumber}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            ID: {selectedStudent.studentId || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-w-[200px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-600">Attendance</span>
                          <span className="text-sm font-semibold text-sky-600">
                            {Math.round(
                              ((selectedStudent.attendance || []).filter(a => a.status === 'present').length /
                              Math.max((selectedStudent.attendance || []).length, 1) * 100
                            ))}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-sky-500 h-2 rounded-full"
                            style={{
                              width: `${Math.round(
                                ((selectedStudent.attendance || []).filter(a => a.status === 'present').length /
                                Math.max((selectedStudent.attendance || []).length, 1) * 100
                              ))}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-green-50 mr-3">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Present</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {(selectedStudent.attendance || []).filter(a => a.status === 'present').length}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-red-100 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-red-50 mr-3">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {(selectedStudent.attendance || []).length -
                                (selectedStudent.attendance || []).filter(a => a.status === 'present').length}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-sky-100 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-sky-50 mr-3">
                            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Leaves</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {(selectedStudent.leaveRequests || []).length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance and Leave Tabs */}
            <div className="bg-white border-gray-200 border rounded-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'attendance' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <svg className={`mr-2 h-5 w-5 ${activeTab === 'attendance' ? 'text-sky-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Attendance Records
                    <span className="ml-2 bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-xs">
                      {filteredData.attendance.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('leaveRequests')}
                    className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'leaveRequests' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <svg className={`mr-2 h-5 w-5 ${activeTab === 'leaveRequests' ? 'text-sky-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Leave Requests
                    <span className="ml-2 bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-xs">
                      {filteredData.leaveRequests.length}
                    </span>
                  </button>
                </nav>
              </div>

              <div className="p-4">
                {activeTab === 'attendance' ? (
                  filteredData.attendance.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div className="max-h-[340px] overflow-y-auto hide-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.attendance.map((record) => (
                              <tr key={record._id} className="hover:bg-gray-50">
                                <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatDate(record.date)}
                                </td>
                                <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-500 text-center">
                                  {getDayFromDate(record.date)}
                                </td>
                                <td className="px-6 py-3.5 whitespace-nowrap text-center">
                                  <StatusBadge status={record.status} />
                                </td>
                                <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-500 text-center">
                                  {record.checkIn} - {record.checkOut || '--'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedDate
                          ? `No attendance records found for ${formatDate(selectedDate)}`
                          : 'No attendance records available'}
                      </p>
                    </div>
                  )
                ) : (
                  filteredData.leaveRequests.length > 0 ? (
                    <div className="max-h-[340px] hide-scrollbar overflow-y-auto overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredData.leaveRequests.map((record) => (
                            <tr key={record._id} className="hover:bg-gray-50">
                              <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatDate(record.date)}
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-500 text-center">
                                {getDayFromDate(record.date)}
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap text-center">
                                <TypeBadge type={record.type} />
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap text-center">
                                <StatusBadge status={record.status} />
                              </td>
                              <td className="px-6 py-3.5 text-sm text-gray-500 text-center max-w-xs truncate">
                                {record.reason}
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() => {
                                    setSelectedLeave(record);
                                    setIsLeaveModalVisible(true);
                                  }}
                                  className="text-sky-600 hover:text-sky-800 text-sm font-medium"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-900">
                        {selectedDate
                          ? `No leave requests found for ${formatDate(selectedDate)}`
                          : 'No leave requests available'}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No student selected</h3>
            <p className="mt-1 text-sm text-gray-500">
              Search for a student using the search bar above to view attendance records
            </p>
          </div>
        )}
      </main>

      {/* Leave Request Modal */}
      {isLeaveModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-500/65 bg-opacity-75" onClick={() => setIsLeaveModalVisible(false)}></div>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Leave Request Details</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedLeave?.date ? formatDate(selectedLeave.date) : 'No date specified'}
                  </p>
                </div>
                <button
                  onClick={() => setIsLeaveModalVisible(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="mt-1 text-sm font-medium">
                      <StatusBadge status={selectedLeave?.status || 'pending'} />
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="mt-1 text-sm font-medium">
                      {selectedLeave?.type ? <TypeBadge type={selectedLeave.type} /> : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLeave?.reason || 'No reason provided'}
                  </p>
                </div>

                {selectedLeave?.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLeave.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsLeaveModalVisible(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentAttendance_Page;