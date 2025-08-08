import React, { useEffect, useState, useRef } from 'react';
import { FiSearch, FiPlus, FiFilter, FiDownload, FiEye, FiEdit2, FiTrash2, FiEdit, FiChevronDown, FiCheck, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { FaUserTie, FaUsers } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSchools, updateSchoolVerificationStatus } from '../../store/Super_Admin-Slicer/Super_Admin-Schools-Slicer';
import { toast } from 'react-toastify';

const SuperAdminSystemSchools_Page = () => {
  const dispatch = useDispatch();
  const { isLoading, allSchools } = useSelector((state) => state.superAdminSchool);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [currentStatus, setCurrentStatus] = useState(null); // Track current status of the open dropdown
  const dropdownRef = useRef(null);
  const schoolsPerPage = 12;

  const fetchAllSchools = () => {
    dispatch(getAllSchools())
      .then((res) => {
        if (res.payload?.status === "Error") {
          toast.error(res.payload.message);
        }
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  useEffect(() => {
    fetchAllSchools();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusChange = (schoolId, verificationStatus) => {
    dispatch(updateSchoolVerificationStatus({ schoolId, verificationStatus }))
      .unwrap()
      .then(() => {
        toast.success(`Status updated to ${verificationStatus}`);
      })
      .catch((error) => {
        toast.error(error.message || "Failed to update status");
      })
      .finally(() => {
        setOpenDropdown(null);
      });
  };

  // Calculate pagination
  const indexOfLastSchool = currentPage * schoolsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
  const currentSchools = allSchools?.slice(indexOfFirstSchool, indexOfLastSchool) || [];
  const totalPages = Math.ceil((allSchools?.length || 0) / schoolsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const toggleDropdown = (id, event, status) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: buttonRect.bottom + window.scrollY + 5,
      left: buttonRect.left + window.scrollX,
      width: buttonRect.width
    });
    setCurrentStatus(status); // Set the current status when opening dropdown
    setOpenDropdown(openDropdown === id ? null : id);
  };

  if (isLoading || !allSchools) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Navigation - Clean Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-[18px] flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-800">
            Super Admin System Schools Page
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Enhanced School Search & Actions Toolbar */}
        <div className="mb-6 bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search Input */}
              <div className="relative flex-1 max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all duration-200 shadow-xs hover:border-gray-300"
                  placeholder="Search schools by name, location, or ID..."
                />
                {/* Clear search button appears when text exists */}
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center opacity-0 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400 hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button className="hidden sm:inline-flex items-center px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-100 transition-all duration-200">
                  <FiFilter className="h-4 w-4 mr-2 text-gray-500" />
                  Filters
                </button>

                <button className="hidden sm:inline-flex items-center px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-100 transition-all duration-200">
                  <FiDownload className="h-4 w-4 mr-2 text-gray-500" />
                  Export
                </button>

                {/* Primary Action */}
                <button className="relative inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden group">
                  <span className="relative z-10 flex items-center">
                    <FiPlus className="h-4 w-4 mr-2 text-white/90" />
                    Add School
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>

            {/* Active Filters Indicator (appears when filters are active) */}
            <div className="mt-3 pt-3 border-t border-gray-100 hidden">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">Active filters:</span>
                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                  Verified
                  <button className="ml-1.5 text-sky-500 hover:text-sky-700">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schools Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FaUserTie className="text-gray-400" />
                      <span>Teachers</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FaUsers className="text-gray-400" />
                      <span>Students</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentSchools.length > 0 ? (
                  currentSchools.map((school) => (
                    <tr key={school._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6">
                            <img className="h-6 w-6 rounded-full" src={school.schoolLogo} alt={school.schoolName} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{school.schoolName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{school.city},{school.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{school.noOfTeacher}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{school.noOfStudent}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center relative">
                        <div className="inline-block">
                          <button
                            type="button"
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${school.verificationStatus === 'Verified' ? 'bg-green-100 text-green-800' :
                              school.verificationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            onClick={(e) => toggleDropdown(school._id, e, school.verificationStatus)}
                          >
                            {school.verificationStatus.charAt(0).toUpperCase() + school.verificationStatus.slice(1)}
                            <FiChevronDown className="ml-1 h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {school.createdAt.slice(0, 10)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
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
                      No schools found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Only show if there are schools */}
          {allSchools.length > 0 && (
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="mb-3 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstSchool + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastSchool, allSchools.length)}</span> of{' '}
                  <span className="font-medium">{allSchools.length}</span> schools
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

                {/* Improved pagination display */}
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

        {/* Status Dropdown (positioned absolutely) */}
        {openDropdown && (
          <div
            ref={dropdownRef}
            className="fixed z-50 mt-1 w-48 rounded-lg shadow-lg bg-white ring-1 ring-gray-200"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              minWidth: `${dropdownPosition.width}px`
            }}
          >
            <div className="py-1">
              <button
                onClick={() => handleStatusChange(openDropdown, 'Verified')}
                className={`flex items-center w-full px-4 py-2 text-sm ${currentStatus === 'Verified' ? 'bg-green-50 text-green-800' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className={`w-2 h-2 rounded-full mr-3 ${currentStatus === 'Verified' ? 'bg-green-500' : 'bg-green-300'}`}></span>
                <span>Verified</span>
                {currentStatus === 'Verified' && <FiCheck className="ml-auto text-green-500" />}
              </button>
              <button
                onClick={() => handleStatusChange(openDropdown, 'Pending')}
                className={`flex items-center w-full px-4 py-2 text-sm ${currentStatus === 'Pending' ? 'bg-yellow-50 text-yellow-800' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className={`w-2 h-2 rounded-full mr-3 ${currentStatus === 'Pending' ? 'bg-yellow-500' : 'bg-yellow-300'}`}></span>
                <span>Pending</span>
                {currentStatus === 'Pending' && <FiCheck className="ml-auto text-yellow-500" />}
              </button>
              <button
                onClick={() => handleStatusChange(openDropdown, 'Rejected')}
                className={`flex items-center w-full px-4 py-2 text-sm ${currentStatus === 'Rejected' ? 'bg-red-50 text-red-800' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className={`w-2 h-2 rounded-full mr-3 ${currentStatus === 'Rejected' ? 'bg-red-500' : 'bg-red-300'}`}></span>
                <span>Rejected</span>
                {currentStatus === 'Rejected' && <FiCheck className="ml-auto text-red-500" />}
              </button>
            </div>
          </div>
        )}


      </main>
    </div>
  );
};

export default SuperAdminSystemSchools_Page;