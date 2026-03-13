// AdminTrash_Page.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiTrash2, 
  FiRefreshCw, 
  FiX, 
  FiRefreshCcw,
  FiBookOpen,
  FiUsers,
  FiClock,
  FiAlertCircle,
  FiEye,
  FiRotateCcw,
  FiChevronLeft,
  FiChevronRight
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

  // Fetch trash items on component mount
  useEffect(() => {
    loadTrashItems();
    
    return () => {
      dispatch(clearSelectedTrashItem());
    };
  }, [dispatch]);

  const loadTrashItems = () => {
    dispatch(getTrashItems());
  };

  const handleRefresh = () => {
    loadTrashItems();
    toast.info('Trash data refreshed');
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
      
      toast.success(`Successfully recovered ${itemToActOn.subject.title}`);
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
      
      toast.success(`Permanently deleted ${itemToActOn.subject.title}`);
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

        {/* Summary Cards - Updated without expired items */}
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
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-sm"
              disabled={isLoading}
            >
              <FiRefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
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

        {/* Trash Items Table - Updated to match provided design */}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Schedule
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
                            {item.subject.title?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {item.subject.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.subject.session} | {item.subject.creditHours} Cr
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {item.subject.department}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-mono">
                          {item.subject.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">
                          {item.subject.semester}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 space-y-0.5">
                          {formatSchedule(item.subject.classSchedule)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">
                          {item.statistics.registeredStudents || 0}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getExpiryStatusColor(item.deletion.daysRemaining)}`}>
                          {item.deletion.daysRemaining > 0 ? `${item.deletion.daysRemaining}d left` : 'Expired'}
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

      {/* Recover Confirmation Modal - Keep as is */}
      {showRecoverModal && itemToActOn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiRotateCcw className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Recover Item</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to recover "{itemToActOn.subject.title}"? 
              This will restore the subject and all its attendance records.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium">{itemToActOn.subject.title}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Code:</span>
                <span className="font-medium">{itemToActOn.subject.code}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Records to restore:</span>
                <span className="font-medium">{itemToActOn.statistics.attendanceRecords} attendance</span>
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

      {/* Permanent Delete Confirmation Modal - Keep as is */}
      {showDeleteModal && itemToActOn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Permanently Delete</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to permanently delete "{itemToActOn.subject.title}"? 
              This action cannot be undone.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium">{itemToActOn.subject.title}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Code:</span>
                <span className="font-medium">{itemToActOn.subject.code}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Records to delete:</span>
                <span className="font-medium">{itemToActOn.statistics.attendanceRecords} attendance</span>
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

      {/* Details Modal - Keep as is */}
      {showDetailsModal && selectedTrashItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Trash Item Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  dispatch(clearSelectedTrashItem());
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Subject Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Subject Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Title</p>
                    <p className="font-medium">{selectedTrashItem.subjectDetails.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Code</p>
                    <p className="font-medium">{selectedTrashItem.subjectDetails.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p>{selectedTrashItem.subjectDetails.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Credit Hours</p>
                    <p>{selectedTrashItem.subjectDetails.creditHours}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Semester</p>
                    <p>{selectedTrashItem.subjectDetails.semester}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Session</p>
                    <p>{selectedTrashItem.subjectDetails.session}</p>
                  </div>
                </div>
              </div>

              {/* Teacher Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Teacher Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{selectedTrashItem.subjectDetails.teacher.name}</p>
                  <p className="text-sm text-gray-600">{selectedTrashItem.subjectDetails.teacher.email}</p>
                </div>
              </div>

              {/* Class Schedule */}
              {selectedTrashItem.classSchedule?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Class Schedule</h3>
                  <div className="space-y-2">
                    {selectedTrashItem.classSchedule.map((schedule, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                        <span className="font-medium">{schedule.day}</span>
                        <span className="text-gray-600">{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registered Students */}
              {selectedTrashItem.registeredStudents?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Registered Students ({selectedTrashItem.registeredStudents.length})
                  </h3>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Roll No</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Discipline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedTrashItem.registeredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{student.registrationNo}</td>
                            <td className="px-4 py-2 text-sm">{student.studentName}</td>
                            <td className="px-4 py-2 text-sm">{student.discipline}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Attendance Overview */}
              {selectedTrashItem.attendanceOverview && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Attendance Overview</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-700">{selectedTrashItem.attendanceOverview.totalRecords}</p>
                      <p className="text-xs text-blue-600">Total Records</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-700">{selectedTrashItem.attendanceOverview.uniqueDates}</p>
                      <p className="text-xs text-green-600">Unique Dates</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-700">{selectedTrashItem.attendanceOverview.uniqueStudents}</p>
                      <p className="text-xs text-purple-600">Unique Students</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Deletion Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Deletion Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Deleted By</p>
                    <p className="font-medium">{selectedTrashItem.deletionInfo.deletedBy.name}</p>
                    <p className="text-xs text-gray-600">{selectedTrashItem.deletionInfo.deletedBy.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Deleted At</p>
                    <p className="font-medium">{formatDate(selectedTrashItem.deletionInfo.deletedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expires At</p>
                    <p className="font-medium">{formatDate(selectedTrashItem.deletionInfo.expiresAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Days Remaining</p>
                    <p className={`font-medium ${
                      selectedTrashItem.deletionInfo.daysRemaining > 7 
                        ? 'text-green-600' 
                        : selectedTrashItem.deletionInfo.daysRemaining > 0 
                        ? 'text-orange-600' 
                        : 'text-red-600'
                    }`}>
                      {selectedTrashItem.deletionInfo.daysRemaining > 0 
                        ? `${selectedTrashItem.deletionInfo.daysRemaining} days` 
                        : 'Expired'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    dispatch(clearSelectedTrashItem());
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleRecoverClick(selectedTrashItem);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Recover
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleDeleteClick(selectedTrashItem);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrash_Page;