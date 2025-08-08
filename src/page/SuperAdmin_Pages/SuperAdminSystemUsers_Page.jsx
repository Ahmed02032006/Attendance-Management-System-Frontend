import React, { useEffect, useState } from 'react';
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUser,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiEye
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers } from '../../store/Super_Admin-Slicer/Super_Admin-Users-Slicer';

const SuperAdminSystemUsers_Page = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { isLoading, allUsers } = useSelector((state) => state.superAdminUser);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  if (isLoading || !allUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Users...</p>
        </div>
      </div>
    );
  }

  const usersPerPage = 8;

  const filteredUsers = allUsers.filter(user => {
    return user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - Clean Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-[18px] flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-800">
            Super Admin System Users Page
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        {/* Enhanced User Search & Actions Toolbar */}
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
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {/* Clear search button appears when text exists */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-100 transition-all duration-200">
                  <FiFilter className="h-4 w-4 mr-2 text-gray-500" />
                  Filter
                </button>

                {/* Primary Action */}
                <button className="relative inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden group">
                  <span className="relative z-10 flex items-center">
                    <FiPlus className="h-4 w-4 mr-2 text-white/90" />
                    Add New User
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>

            {/* Search Results Summary (appears when searching) */}
            {searchTerm && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Showing results for: <span className="font-medium text-gray-700">"{searchTerm}"</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-sky-600 hover:text-sky-700 text-xs font-medium"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created On
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-sky-400 text-white font-medium">
                            {user.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{user.userName}</div>
                            <div className="text-sm text-gray-500">{user.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.userRole === 'Super_Admin' ? 'bg-purple-100 text-purple-800' :
                            user.userRole === 'Admin' ? 'bg-sky-100 text-sky-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {user.userRole === 'Super_Admin' ? 'Super Admin' : user.userRole}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' :
                          user.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(user.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
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
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FiUser className="h-14 w-14 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-700">No users found</h3>
                        <p className="text-gray-500 mt-1 max-w-md">
                          {searchTerm
                            ? "Try adjusting your search criteria"
                            : "There are currently no users in the system"}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mt-4 px-4 py-2 text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          {filteredUsers.length > 0 && (
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="mb-3 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{' '}
                  <span className="font-medium">{filteredUsers.length}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>

                {/* Improved pagination display */}
                {totalPages <= 6 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3.5 py-1.5 border text-sm font-medium ${currentPage === number
                        ? 'border-sky-500 bg-sky-50 text-sky-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} rounded-md transition-colors`}
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
                    ].filter(num => num > 0 && num <= totalPages).map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3.5 py-1.5 border text-sm font-medium ${currentPage === number
                          ? 'border-sky-500 bg-sky-50 text-sky-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} rounded-md transition-colors`}
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
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminSystemUsers_Page;
