// AdminTrash_Page.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiTrash2,
  FiRefreshCw,
  FiX,
  FiBookOpen,
  FiUsers,
  FiClock,
  FiAlertCircle,
  FiEye,
  FiRotateCcw,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import {
  getTrashItems,
  getTrashItemDetails,
  recoverFromTrash,
  permanentDeleteFromTrash,
  clearSelectedTrashItem
} from '../../store/Admin-Slicer/Trash-Slicer';
import HeaderComponent from '../../components/HeaderComponent';

const AdminTrash_Page = () => {
  const dispatch = useDispatch();
  const { trashItems, selectedTrashItem, isLoading, error, summary } = useSelector(
    (state) => state.adminTrash
  );
  const { user } = useSelector((state) => state.auth);

  // Local state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [itemToActOn, setItemToActOn] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch trash items on component mount
  useEffect(() => {
    loadTrashItems();

    return () => {
      dispatch(clearSelectedTrashItem());
    };
  }, [dispatch]);

  const loadTrashItems = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(getTrashItems());
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadTrashItems();
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === trashItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(trashItems.map(item => item.id));
    }
  };

  const handleViewDetails = (item) => {
    dispatch(getTrashItemDetails(item.id));
    setItemToActOn(item);
    setShowDetailsModal(true);
  };

  const handleRecoverClick = (item) => {
    setItemToActOn(item);
    setShowRecoverModal(true);
  };

  const handleRecoverConfirm = async () => {
    if (!itemToActOn) return;

    try {
      await dispatch(recoverFromTrash({
        trashId: itemToActOn.id,
        userId: user?.id
      })).unwrap();

      toast.success(`Successfully recovered ${itemToActOn.subject?.title || 'item'}`);
      setShowRecoverModal(false);
      setItemToActOn(null);
      setSelectedItems([]);
      loadTrashItems();
    } catch (error) {
      toast.error(error?.message || 'Failed to recover item');
    }
  };

  const handleDeleteClick = (item) => {
    setItemToActOn(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToActOn) return;

    try {
      await dispatch(permanentDeleteFromTrash(itemToActOn.id)).unwrap();

      toast.success(`Permanently deleted ${itemToActOn.subject?.title || 'item'}`);
      setShowDeleteModal(false);
      setItemToActOn(null);
      setSelectedItems([]);
      loadTrashItems();
    } catch (error) {
      toast.error(error?.message || 'Failed to delete item');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.warning('No items selected');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete ${selectedItems.length} item(s)?`)) {
      try {
        for (const id of selectedItems) {
          await dispatch(permanentDeleteFromTrash(id)).unwrap();
        }
        toast.success(`Deleted ${selectedItems.length} items`);
        setSelectedItems([]);
        loadTrashItems();
      } catch (error) {
        toast.error('Failed to delete some items');
      }
    }
  };

  const getExpiryStatusColor = (daysRemaining) => {
    if (daysRemaining > 14) return 'bg-green-100 text-green-700';
    if (daysRemaining > 7) return 'bg-yellow-100 text-yellow-700';
    if (daysRemaining > 0) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSchedule = (schedules) => {
    if (!schedules || schedules.length === 0) return 'No schedule';

    const convertTo12Hour = (time) => {
      const [hour, minute] = time.split(':');
      const hourInt = parseInt(hour);
      const ampm = hourInt >= 12 ? 'PM' : 'AM';
      const hour12 = hourInt % 12 || 12;
      return `${hour12}:${minute} ${ampm}`;
    };

    const grouped = schedules.reduce((acc, curr) => {
      if (!acc[curr.day]) {
        acc[curr.day] = [];
      }
      const startTime12 = convertTo12Hour(curr.startTime);
      const endTime12 = convertTo12Hour(curr.endTime);
      acc[curr.day].push(`${startTime12} - ${endTime12}`);
      return acc;
    }, {});

    return Object.entries(grouped).map(([day, times]) => (
      <div key={day} className="text-xs">
        <span className="font-medium">{day.substring(0, 3)}:</span> {times.join(', ')}
      </div>
    ));
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = trashItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(trashItems.length / itemsPerPage);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (isLoading && trashItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent
          heading="Trash Management"
          subHeading="Recover or permanently delete items"
          role="admin"
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading trash items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent
        heading="Trash Management"
        subHeading="Recover or permanently delete items"
        role="admin"
      />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-700">
              <FiAlertCircle className="h-5 w-5" />
              <span>{typeof error === 'string' ? error : 'An error occurred'}</span>
            </div>
            <button
              onClick={() => dispatch(clearSelectedTrashItem())}
              className="text-red-500 hover:text-red-700"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-gray-800">{summary.totalItems}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiTrash2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Attendance Records</p>
                <p className="text-2xl font-bold text-gray-800">{summary.totalAttendanceRecords}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiClock className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Registered Students</p>
                <p className="text-2xl font-bold text-gray-800">{summary.totalRegisteredStudents}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiUsers className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Teacher Items</p>
                <p className="text-2xl font-bold text-gray-800">{summary.byDeletionType?.teacher || 0}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FiBookOpen className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Header with Refresh and Bulk Delete */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-800">Deleted Items</h2>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
              {trashItems.length} items
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-sm min-w-[80px] justify-center"
              disabled={isRefreshing}
            >
              <FiRefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Loading...' : 'Refresh'}</span>
            </button>
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <FiTrash2 className="h-4 w-4" />
                <span>Delete Selected ({selectedItems.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Trash Items Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === trashItems.length && trashItems.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discipline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-medium text-sm shrink-0">
                            {item.subject?.title?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {item.subject?.title || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.subject?.session || 'N/A'} | {item.subject?.creditHours || '0'} Cr
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {item.subject?.department || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-mono">
                          {item.subject?.code || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">
                          {item.subject?.semester || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">
                          {item.statistics?.registeredStudents || 0}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getExpiryStatusColor(item.deletion?.daysRemaining)}`}>
                          {item.deletion?.daysRemaining > 0 ? `${item.deletion.daysRemaining}d left` : 'Expired'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="p-1.5 text-yellow-600 hover:text-yellow-700 hover:bg-gray-100 rounded-md transition-colors"
                            title="View Details"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRecoverClick(item)}
                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                            title="Recover"
                          >
                            <FiRotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Permanently Delete"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                      <div className="text-gray-500">
                        <FiTrash2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">Trash is empty</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {trashItems.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, trashItems.length)} of {trashItems.length}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-gray-300 rounded-md text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-gray-300 rounded-md text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recover Confirmation Modal */}
      {showRecoverModal && itemToActOn && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiRotateCcw className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Recover Item</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to recover "{itemToActOn.subject?.title || 'this item'}"?
              This will restore the subject and all its attendance records.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium">{itemToActOn.subject?.title || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Code:</span>
                <span className="font-medium">{itemToActOn.subject?.code || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Records to restore:</span>
                <span className="font-medium">{itemToActOn.statistics?.attendanceRecords || 0} attendance</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRecoverModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRecoverConfirm}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Recover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showDeleteModal && itemToActOn && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Permanently Delete</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to permanently delete "{itemToActOn.subject?.title || 'this item'}"?
              This action cannot be undone.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium">{itemToActOn.subject?.title || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Code:</span>
                <span className="font-medium">{itemToActOn.subject?.code || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Records to delete:</span>
                <span className="font-medium">{itemToActOn.statistics?.attendanceRecords || 0} attendance</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal - Fixed with proper height and scrolling */}
      {showDetailsModal && selectedTrashItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header with gradient - Fixed at top */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FiTrash2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Trash Item Details</h2>
                  <p className="text-xs text-gray-300 mt-0.5">Review deleted item information</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  dispatch(clearSelectedTrashItem());
                }}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Course Header Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                      {selectedTrashItem.subjectDetails?.title?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{selectedTrashItem.subjectDetails?.title || 'N/A'}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded-md text-xs font-mono text-gray-600 border border-gray-200">
                          {selectedTrashItem.subjectDetails?.code || 'N/A'}
                        </span>
                        <span className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded-md text-xs text-gray-600 border border-gray-200">
                          {selectedTrashItem.subjectDetails?.semester || 'N/A'}
                        </span>
                        <span className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded-md text-xs text-gray-600 border border-gray-200">
                          {selectedTrashItem.subjectDetails?.creditHours || '0'} Cr
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      selectedTrashItem.deletionInfo?.daysRemaining > 7 
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : selectedTrashItem.deletionInfo?.daysRemaining > 0 
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {selectedTrashItem.deletionInfo?.daysRemaining > 0 
                        ? `${selectedTrashItem.deletionInfo.daysRemaining} days remaining` 
                        : 'Expired'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Subject Information Card */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <FiBookOpen className="h-4 w-4 mr-2 text-blue-600" />
                        Course Information
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">Course Name</span>
                          <span className="text-xs text-gray-800">{selectedTrashItem.subjectDetails?.title || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">Course Code</span>
                          <span className="text-xs text-gray-800">{selectedTrashItem.subjectDetails?.code || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">Semester</span>
                          <span className="text-xs text-gray-800">{selectedTrashItem.subjectDetails?.semester || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">Discipline</span>
                          <span className="text-xs text-gray-800">{selectedTrashItem.subjectDetails?.department || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">Session</span>
                          <span className="text-xs text-gray-800">{selectedTrashItem.subjectDetails?.session || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-xs text-gray-500">Credit Hours</span>
                          <span className="text-xs text-gray-800">{selectedTrashItem.subjectDetails?.creditHours || '0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deletion Information Card */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <FiAlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                        Deletion Information
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <FiTrash2 className="h-3 w-3 text-red-600" />
                            </div>
                            <span className="text-xs text-gray-500">Deleted By</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-800">{selectedTrashItem.deletionInfo?.deletedBy?.name || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-1 border-t border-gray-100">
                          <span className="text-xs text-gray-500">Deleted At</span>
                          <span className="text-xs text-gray-800">{selectedTrashItem.deletionInfo?.deletedAt ? formatDate(selectedTrashItem.deletionInfo.deletedAt) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-t border-gray-100">
                          <span className="text-xs text-gray-500">Expires At</span>
                          <span className="text-xs text-gray-800">{selectedTrashItem.deletionInfo?.expiresAt ? formatDate(selectedTrashItem.deletionInfo.expiresAt) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Class Schedule Card */}
                  {selectedTrashItem.classSchedule?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <FiClock className="h-4 w-4 mr-2 text-green-600" />
                          Class Schedule
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          {selectedTrashItem.classSchedule.map((schedule, index) => (
                            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                              <span className="text-xs font-medium text-gray-600">{schedule.day}</span>
                              <span className="text-sm text-gray-800">{schedule.startTime} - {schedule.endTime}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attendance Overview Card */}
                  {selectedTrashItem.attendanceOverview && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <FiCalendar className="h-4 w-4 mr-2 text-blue-600" />
                          Attendance Overview
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-blue-700">{selectedTrashItem.attendanceOverview.totalRecords || 0}</p>
                            <p className="text-xs text-blue-600 mt-1">Records</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-green-700">{selectedTrashItem.attendanceOverview.uniqueDates || 0}</p>
                            <p className="text-xs text-green-600 mt-1">Dates</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-indigo-700">{selectedTrashItem.attendanceOverview.uniqueStudents || 0}</p>
                            <p className="text-xs text-indigo-600 mt-1">Students</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Teacher Information Card */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <FiUsers className="h-4 w-4 mr-2 text-blue-600" />
                        Teacher Information
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {selectedTrashItem.subjectDetails?.teacher?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{selectedTrashItem.subjectDetails?.teacher?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{selectedTrashItem.subjectDetails?.teacher?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registered Students Section */}
              {selectedTrashItem.registeredStudents?.length > 0 && (
                <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                      <FiUsers className="h-4 w-4 mr-2 text-indigo-600" />
                      Registered Students
                    </h3>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {selectedTrashItem.registeredStudents.length} Total
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Registration No</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Discipline</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedTrashItem.registeredStudents.map((student, index) => (
                            <tr key={student.id || index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-2 text-xs text-gray-500">{index + 1}</td>
                              <td className="px-4 py-2 text-xs font-mono text-gray-800">{student.registrationNo || 'N/A'}</td>
                              <td className="px-4 py-2 text-xs text-gray-800">{student.studentName || 'N/A'}</td>
                              <td className="px-4 py-2 text-xs text-gray-600">{student.discipline || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions - Fixed at bottom */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-3 flex-shrink-0 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  dispatch(clearSelectedTrashItem());
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleRecoverClick(selectedTrashItem);
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm shadow-green-200"
              >
                <FiRotateCcw className="h-4 w-4 mr-2" />
                Recover Item
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleDeleteClick(selectedTrashItem);
                }}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center shadow-sm shadow-red-200"
              >
                <FiTrash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrash_Page;