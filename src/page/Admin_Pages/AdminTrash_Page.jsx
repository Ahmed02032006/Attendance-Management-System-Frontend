// AdminTrash_Page.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiTrash2, 
  FiRefreshCw, 
  FiSearch, 
  FiX, 
  FiCalendar,
  FiFilter,
  FiBookOpen,
  FiUsers,
  FiClock,
  FiAlertCircle,
  FiDownload,
  FiEye,
  FiRotateCcw,
  FiChevronDown,
  FiChevronUp,
  FiArchive
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import {
  getTrashItems,
  getTrashItemDetails,
  recoverFromTrash,
  permanentDeleteFromTrash,
  clearSelectedTrashItem,
  setFilters,
  clearTrash
} from '../../store/Admin-Slicer/Trash-Slicer';
import HeaderComponent from '../../components/HeaderComponent';

const AdminTrash_Page = () => {
  const dispatch = useDispatch();
  const { trashItems, selectedTrashItem, isLoading, error, summary } = useSelector(
    (state) => state.adminTrash
  );
  const { user } = useSelector((state) => state.auth);

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deletedFromFilter, setDeletedFromFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [itemToActOn, setItemToActOn] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  // Fetch trash items on component mount
  useEffect(() => {
    loadTrashItems();
    
    return () => {
      dispatch(clearTrash());
    };
  }, [dispatch]);

  const loadTrashItems = (filters = {}) => {
    const filterParams = {
      search: searchTerm || undefined,
      deletedFrom: deletedFromFilter || undefined,
      startDate: dateRange.start || undefined,
      endDate: dateRange.end || undefined,
      ...filters
    };
    dispatch(getTrashItems(filterParams));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTrashItems();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDeletedFromFilter('');
    setDateRange({ start: '', end: '' });
    dispatch(setFilters({}));
    loadTrashItems({});
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
      const result = await dispatch(recoverFromTrash({
        trashId: itemToActOn.id,
        userId: user?.id
      })).unwrap();
      
      toast.success(`Successfully recovered ${itemToActOn.subject.title}`);
      setShowRecoverModal(false);
      setItemToActOn(null);
      setSelectedItems([]);
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
      const result = await dispatch(permanentDeleteFromTrash(itemToActOn.id)).unwrap();
      
      toast.success(`Permanently deleted ${itemToActOn.subject.title}`);
      setShowDeleteModal(false);
      setItemToActOn(null);
      setSelectedItems([]);
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
        // You'll need to implement bulk delete endpoint
        for (const id of selectedItems) {
          await dispatch(permanentDeleteFromTrash(id)).unwrap();
        }
        toast.success(`Deleted ${selectedItems.length} items`);
        setSelectedItems([]);
      } catch (error) {
        toast.error('Failed to delete some items');
      }
    }
  };

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getExpiryStatusColor = (daysRemaining) => {
    if (daysRemaining > 14) return 'bg-green-100 text-green-700 border-green-200';
    if (daysRemaining > 7) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (daysRemaining > 0) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              onClick={() => dispatch(clearTrash())}
              className="text-red-500 hover:text-red-700"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-gray-800">{summary.totalItems}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiArchive className="h-5 w-5 text-blue-600" />
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

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expired Items</p>
                <p className="text-2xl font-bold text-gray-800">{summary.expiredItems}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-4">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, code, or semester..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <FiFilter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                disabled={isLoading}
              >
                <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <FiTrash2 className="h-4 w-4" />
                  <span>Delete Selected ({selectedItems.length})</span>
                </button>
              )}
            </form>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deleted By
                  </label>
                  <select
                    value={deletedFromFilter}
                    onChange={(e) => setDeletedFromFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trash Items List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.length === trashItems.length && trashItems.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-3">Subject</div>
            <div className="col-span-2">Teacher</div>
            <div className="col-span-2">Statistics</div>
            <div className="col-span-2">Deleted By</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Items */}
          {trashItems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiArchive className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Trash is empty</h3>
              <p className="text-sm text-gray-500">No items found in trash</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {trashItems.map((item) => (
                <div key={item.id} className="hover:bg-gray-50 transition-colors">
                  {/* Main Row */}
                  <div className="grid grid-cols-12 gap-4 p-4 items-center">
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="flex items-center space-x-2 text-left"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiBookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.subject.title}</p>
                          <p className="text-xs text-gray-500">{item.subject.code}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {item.subject.semester} • {item.subject.department}
                          </p>
                        </div>
                      </button>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm text-gray-900">{item.teacher.name}</p>
                      <p className="text-xs text-gray-500">{item.teacher.email}</p>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-xs bg-blue-50 px-2 py-1 rounded">
                          <FiUsers className="h-3 w-3 text-blue-600" />
                          <span className="text-blue-700">{item.statistics.registeredStudents}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs bg-green-50 px-2 py-1 rounded">
                          <FiClock className="h-3 w-3 text-green-600" />
                          <span className="text-green-700">{item.statistics.attendanceRecords}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm text-gray-900">{item.deletion.deletedBy.name}</p>
                      <p className="text-xs text-gray-500">{item.deletion.deletedBy.role}</p>
                      <p className="text-xs text-gray-400">{formatDate(item.deletion.deletedAt)}</p>
                    </div>

                    <div className="col-span-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExpiryStatusColor(item.deletion.daysRemaining)}`}>
                        {item.deletion.daysRemaining > 0 ? `${item.deletion.daysRemaining}d` : 'Expired'}
                      </span>
                    </div>

                    <div className="col-span-1 text-right space-x-1">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRecoverClick(item)}
                        className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Recover"
                      >
                        <FiRotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Permanently Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedItems[item.id] && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 ml-14">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-2">Class Schedule</h4>
                          {item.statistics.classSchedules > 0 ? (
                            <div className="space-y-1">
                              {/* You would map through actual schedules here */}
                              <p className="text-sm text-gray-600">{item.statistics.classSchedules} schedule(s)</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No schedules</p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-2">Additional Info</h4>
                          <p className="text-sm text-gray-600">Credit Hours: {item.subject.creditHours}</p>
                          <p className="text-sm text-gray-600">Session: {item.subject.session}</p>
                          <p className="text-sm text-gray-600">Expires: {formatDate(item.deletion.expiresAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recover Confirmation Modal */}
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

      {/* Permanent Delete Confirmation Modal */}
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

      {/* Details Modal */}
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

                  {/* Attendance by Date */}
                  {Object.keys(selectedTrashItem.attendanceOverview.byDate || {}).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Attendance by Date</h4>
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                        {Object.entries(selectedTrashItem.attendanceOverview.byDate).map(([date, data]) => (
                          <div key={date} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{date}</span>
                              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {data.count} students
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {data.students.slice(0, 3).map(s => s.name).join(', ')}
                              {data.students.length > 3 && ` and ${data.students.length - 3} more`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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