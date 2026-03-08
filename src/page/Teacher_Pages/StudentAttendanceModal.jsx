import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiCalendar, FiClock, FiMapPin, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { getStudentAttendanceDetail, clearStudentDetail } from '../../store/Teacher-Slicer/StudentAttendanceDetail-Slicer';

const StudentAttendanceModal = ({ isOpen, onClose, student, subjectId, teacherId }) => {
  const dispatch = useDispatch();
  const { studentDetail, isLoading, error } = useSelector((state) => state.studentAttendanceDetail || {});
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: ''
  });
  const [filteredData, setFilteredData] = useState(null);

  // Fetch student details when modal opens
  useEffect(() => {
    if (isOpen && student && subjectId && teacherId) {
      dispatch(getStudentAttendanceDetail({
        rollNo: student.rollNo,
        subjectId,
        teacherId,
        fromDate: dateRange.fromDate || undefined,
        toDate: dateRange.toDate || undefined
      }));
    }
  }, [isOpen, student, subjectId, teacherId, dispatch]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearStudentDetail());
      setDateRange({ fromDate: '', toDate: '' });
      setFilteredData(null);
    }
  }, [isOpen, dispatch]);

  // Filter data when date range changes or studentDetail updates
  useEffect(() => {
    if (studentDetail?.attendanceByDate) {
      if (dateRange.fromDate && dateRange.toDate) {
        const filtered = studentDetail.attendanceByDate.filter(entry => {
          const entryDate = new Date(entry.date);
          const from = new Date(dateRange.fromDate);
          const to = new Date(dateRange.toDate);
          from.setHours(0, 0, 0, 0);
          to.setHours(23, 59, 59, 999);
          return entryDate >= from && entryDate <= to;
        });
        setFilteredData(filtered);
      } else {
        setFilteredData(studentDetail.attendanceByDate);
      }
    }
  }, [studentDetail, dateRange]);

  if (!isOpen) return null;

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    return status === 'Present' 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    return status === 'Present' 
      ? <FiCheckCircle className="h-4 w-4 text-green-600" />
      : <FiXCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Student Attendance Details</h3>
            {student && (
              <p className="text-sm text-gray-600 mt-1">
                {student.name} • Roll No: {student.rollNo}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiCalendar className="h-6 w-6 text-blue-600 animate-pulse" />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">Loading attendance details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center max-w-md px-4">
              <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FiAlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Details</h4>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  dispatch(getStudentAttendanceDetail({
                    rollNo: student.rollNo,
                    subjectId,
                    teacherId,
                    fromDate: dateRange.fromDate || undefined,
                    toDate: dateRange.toDate || undefined
                  }));
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && studentDetail && (
          <>
            {/* Summary Cards */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3 shadow-xs">
                  <p className="text-xs text-gray-500 mb-1">Total Present</p>
                  <p className="text-xl font-bold text-green-600">{studentDetail.summary?.totalPresent || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-xs">
                  <p className="text-xs text-gray-500 mb-1">Total Absent</p>
                  <p className="text-xl font-bold text-red-600">{studentDetail.summary?.totalAbsent || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-xs">
                  <p className="text-xs text-gray-500 mb-1">Total Classes</p>
                  <p className="text-xl font-bold text-gray-700">{studentDetail.summary?.totalPossible || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-xs">
                  <p className="text-xs text-gray-500 mb-1">Percentage</p>
                  <p className={`text-xl font-bold ${
                    (studentDetail.summary?.attendancePercentage || 0) >= 75 
                      ? 'text-green-600' 
                      : (studentDetail.summary?.attendancePercentage || 0) >= 50 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                  }`}>
                    {studentDetail.summary?.attendancePercentage || 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Date Filter */}
            <div className="px-6 py-3 border-b border-gray-200 bg-white flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-gray-700">Filter by date:</span>
              <input
                type="date"
                value={dateRange.fromDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, fromDate: e.target.value }))}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.toDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, toDate: e.target.value }))}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {(dateRange.fromDate || dateRange.toDate) && (
                <button
                  onClick={() => setDateRange({ fromDate: '', toDate: '' })}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Attendance Table */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Day
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData && filteredData.length > 0 ? (
                      filteredData.map((dateEntry, dateIndex) => (
                        dateEntry.schedules.map((schedule, scheduleIndex) => (
                          <tr key={`${dateIndex}-${scheduleIndex}`} className="hover:bg-gray-50">
                            {scheduleIndex === 0 && (
                              <td rowSpan={dateEntry.schedules.length} className="px-4 py-3 align-top font-medium text-gray-900 border-r border-gray-100">
                                {new Date(dateEntry.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                            )}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {schedule.day}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {schedule.startTime} - {schedule.endTime}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(schedule.status)}`}>
                                {getStatusIcon(schedule.status)}
                                <span className="ml-1">{schedule.status}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {schedule.time ? (
                                <div className="flex items-center">
                                  <FiClock className="h-3 w-3 mr-1 text-gray-400" />
                                  {schedule.time}
                                </div>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {schedule.ipAddress || '—'}
                            </td>
                          </tr>
                        ))
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No attendance records found for the selected date range
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
              <p className="text-xs text-gray-500">
                Total Records: {filteredData?.reduce((acc, curr) => acc + curr.schedules.length, 0) || 0}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceModal;