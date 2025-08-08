import React, { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiEdit, FiEye, FiTrash2, FiSearch, FiPlus } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentsBySchoolId } from '../../store/Admin-Slicer/Admin-Student-Slicer';
import { toast } from 'react-toastify';

const AdminManageStudent_Page = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentLoading, setStudentLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      const AllStudent = students;
      setAllStudents(AllStudent);
      setFilteredStudents(AllStudent);
      setStudentLoading(false);
    }
  }, [students]);

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(allStudents);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = allStudents.filter(student => {
        // Safely check each property before calling toLowerCase()
        const studentName = student.studentName ? student.studentName.toLowerCase() : '';
        const studentId = student.studentId ? student.studentId.toLowerCase() : '';
        const admissionNumber = student.admissionNumber ? student.admissionNumber.toLowerCase() : '';
        const className = student.classId?.name ? student.classId.name.toLowerCase() : '';
        const parentName = student.parentOrGuardianName ? student.parentOrGuardianName.toLowerCase() : '';
        const phone = student.phone ? student.phone.toLowerCase() : '';

        return (
          studentName.includes(searchTermLower) ||
          studentId.includes(searchTermLower) ||
          admissionNumber.includes(searchTermLower) ||
          className.includes(searchTermLower) ||
          parentName.includes(searchTermLower) ||
          phone.includes(searchTermLower)
        );
      });
      setFilteredStudents(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, allStudents]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(8); // Items per page

  // Get current students for pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            Manage Students
          </h1>
        </div>
      </header>

      <main className="p-6">
        {/* Search and Add Student Button */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Password
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class & Section
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
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
                              src={student.profilePicture}
                              alt={student.profilePicture}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                            <div className="text-xs text-gray-500">{student.studentEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                        {student.studentPassword}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                        {student.gender}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                        {student.admissionNumber}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                        {student.classId?.name} - {student.section}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                        <div>{student.parentOrGuardianName}</div>
                        <div className="text-gray-400">{student.phone}</div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-left text-sm text-gray-500 max-w-52 truncate">
                        {student.address}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                        <div>{formatDate(student.dateOfBirth)}</div>
                        <div className="text-gray-400">{student.age} Years Old</div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${student.currentStatus === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {student.currentStatus}
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
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? "No matching students found" : "No students found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredStudents.length > 0 && (
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="mb-3 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastStudent, filteredStudents.length)}</span> of{' '}
                  <span className="font-medium">{filteredStudents.length}</span> students
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
  );
};

export default AdminManageStudent_Page;