import React, { useEffect, useState } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiKey, FiEdit, FiUsers, FiDownload, FiFilter } from 'react-icons/fi';
import { getAllUsers } from '../../store/Super_Admin-Slicer/Super_Admin-Users-Slicer';
import { useDispatch, useSelector } from 'react-redux';
import { format, parseISO } from 'date-fns';

const SuperAdminSystemRoles_Page = () => {
  const [searchTerm, setSearchTerm] = useState('');
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
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Roles...</p>
        </div>
      </div>
    );
  }

  // Calculate role counts
  const roleCounts = allUsers.reduce((acc, user) => {
    acc[user.userRole] = (acc[user.userRole] || 0) + 1;
    return acc;
  }, {});

  // Get unique roles
  const uniqueRoles = [...new Set(allUsers.map(user => user.userRole))];

  // Role descriptions mapping
  const roleDescriptions = {
    'Super_Admin': 'Full system access with all privileges',
    'Admin': 'Administrative access with most system privileges',
    'Principal': 'School principal with academic oversight',
    'Teacher': 'Classroom educator with teaching privileges',
    'Registrar': 'Manages student records and enrollment',
    'Accountant': 'Financial management and billing',
    'Student': 'School student with learning access',
    'Parent': 'Parent/guardian with student monitoring'
  };

  // Role color mapping
  const roleColors = {
    'Super_Admin': 'bg-purple-100 text-purple-800',
    'Admin': 'bg-blue-100 text-blue-800',
    'Principal': 'bg-indigo-100 text-indigo-800',
    'Teacher': 'bg-green-100 text-green-800',
    'Registrar': 'bg-amber-100 text-amber-800',
    'Accountant': 'bg-emerald-100 text-emerald-800',
    'Student': 'bg-sky-100 text-sky-800',
    'Parent': 'bg-rose-100 text-rose-800'
  };

  const filteredRoles = uniqueRoles
    .filter(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(role => ({
      name: role,
      displayName: role === 'Super_Admin' ? 'Super Admin' : role,
      description: roleDescriptions[role] || 'No description available',
      usersCount: roleCounts[role] || 0,
      color: roleColors[role] || 'bg-gray-100 text-gray-800',
      createdAt: '2022-01-01' // Placeholder - replace with actual creation date if available
    }));

  const handleDelete = (roleName) => {
    console.log('Delete role:', roleName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation - Clean Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-[18px] flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-800">
            Super Admin System Roles Page
          </h1>
        </div>
      </header>

      <main className="px-6 py-6">
        {/* Enhanced Search and Action Bar with premium styling */}
        <div className="mb-6 bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search input with advanced styling */}
              <div className="relative flex-1 max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all duration-200 shadow-xs hover:border-gray-300"
                  placeholder="Search roles by name, permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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

              {/* Action buttons group */}
              <div className="flex items-center gap-3">
                <button
                  className="hidden sm:inline-flex items-center px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-100 transition-all duration-200"
                  title="Filter roles"
                >
                  <FiFilter className="h-4 w-4 mr-2 text-gray-500" />
                  Filters
                </button>

                <button
                  className="hidden sm:inline-flex items-center px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-100 transition-all duration-200"
                  title="Export data"
                >
                  <FiDownload className="h-4 w-4 mr-2 text-gray-500" />
                  Export
                </button>

                {/* Primary action button with subtle gradient animation */}
                <button
                  className="relative inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden group"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <span className="relative z-10 flex items-center">
                    <FiPlus className="h-4 w-4 mr-2 text-white/90" />
                    Create New Role
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>

            {/* Optional: Advanced search options that appear when searching */}
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

        {/* Enhanced Table Container */}
        <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-gray-200">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Users
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role) => (
                    <tr key={role.name} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${role.color}`}>
                            <FiKey className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{role.displayName}</div>
                            <div className="text-xs text-gray-500">Created {role.createdAt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{role.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.usersCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {role.usersCount} {role.usersCount === 1 ? 'user' : 'users'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="text-sky-600 hover:text-sky-900 p-2 rounded-lg hover:bg-sky-50 transition-colors duration-150"
                            onClick={() => console.log('Edit role:', role.name)}
                            title="Edit Role"
                          >
                            <FiEdit className="h-5 w-5" />
                          </button>
                          {role.name !== 'Super_Admin' && (
                            <button
                              onClick={() => handleDelete(role.name)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-150"
                              title="Delete Role"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                          <FiKey className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No roles found</h3>
                        <p className="text-gray-500 mt-1 max-w-md">
                          {searchTerm
                            ? `No roles match your search for "${searchTerm}"`
                            : 'There are currently no roles in the system'}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mt-3 text-sm text-sky-600 hover:text-sky-800 font-medium"
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
        </div>
      </main>
    </div>
  );
};

export default SuperAdminSystemRoles_Page;