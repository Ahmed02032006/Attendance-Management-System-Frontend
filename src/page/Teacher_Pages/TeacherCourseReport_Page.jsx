import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HeaderComponent from '../../components/HeaderComponent';
import {
  FiCalendar,
  FiBook,
  FiUsers,
  FiFileText,
  FiDownload,
  FiSearch,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getCourseAttendanceReport, exportAttendanceReport } from '../../redux/slices/teacherReportSlice'; // You'll need to create this slice

const TeacherCourseReport_Page = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { subjects } = useSelector((state) => state.teacherSubject);
  const { reportData, isLoading, exportLoading } = useSelector((state) => state.teacherReport);

  // Form states
  const [selectedCourse, setSelectedCourse] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showReport, setShowReport] = useState(false);

  // Set default dates on component mount
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    setToDate(today.toISOString().split('T')[0]);
    setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const handleGenerateReport = async () => {
    // Validate inputs
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }
    if (!fromDate) {
      toast.error('Please select from date');
      return;
    }
    if (!toDate) {
      toast.error('Please select to date');
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error('From date cannot be greater than to date');
      return;
    }

    try {
      const result = await dispatch(getCourseAttendanceReport({
        subjectId: selectedCourse,
        fromDate,
        toDate,
        teacherId: user?.id
      })).unwrap();

      if (result.success) {
        setShowReport(true);
        toast.success('Report generated successfully');
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to generate report');
    }
  };

  const handleExportCSV = async () => {
    try {
      await dispatch(exportAttendanceReport({
        subjectId: selectedCourse,
        fromDate,
        toDate,
        teacherId: user?.id
      })).unwrap();
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to export report');
    }
  };

  // Get selected course details
  const getSelectedCourseDetails = () => {
    return subjects.find(s => s.id === selectedCourse);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent
        heading="Attendance Report"
        subHeading="Generate attendance reports for specific date ranges"
        role='admin'
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Report Generation Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Generate Attendance Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Course <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setShowReport(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Choose a course</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.title} ({subject.code}) - {subject.session}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setShowReport(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setShowReport(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={isLoading || !selectedCourse || !fromDate || !toDate}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <FiRefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FiFileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Report Display */}
        {showReport && reportData && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Report Header with Actions */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  Attendance Report: {reportData.subjectInfo?.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(reportData.dateRange?.fromDate)} to {formatDate(reportData.dateRange?.toDate)} • 
                  Total Students: {reportData.summary?.totalStudents} • 
                  Total Days: {reportData.summary?.totalDays}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleExportCSV}
                  disabled={exportLoading}
                  className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {exportLoading ? (
                    <>
                      <FiRefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FiDownload className="h-3 w-3 mr-1" />
                      Export CSV
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Report Table with Horizontal Scroll */}
            <div className="overflow-x-auto max-w-full" style={{ maxHeight: '500px' }}>
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-20 min-w-[180px]">
                        Student Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase sticky left-[180px] bg-gray-50 z-20 min-w-[120px]">
                        Roll No.
                      </th>
                      {/* Date Headers */}
                      {reportData.summary?.attendanceDates?.map((date, index) => (
                        <th key={index} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[70px]">
                          <div className="flex flex-col">
                            <span>{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-gray-400">{new Date(date).getDate()}</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[80px]">
                        Present
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[80px]">
                        Absent
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[80px]">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.students?.map((student) => (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                          {student.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 sticky left-[180px] bg-white z-10">
                          {student.rollNo}
                        </td>
                        {/* Attendance Status for each date */}
                        {student.attendance?.map((record, idx) => (
                          <td key={idx} className="px-4 py-2 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium
                              ${record.status === 'Present' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {record.status === 'Present' ? 'P' : 'A'}
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium text-green-600">
                          {student.presentCount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium text-red-600">
                          {student.absentCount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${student.percentage >= 75 ? 'bg-green-100 text-green-700' : 
                              student.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-red-100 text-red-700'}`}
                          >
                            {student.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-1"></span>
                    <span className="text-gray-600">Present (P)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-1"></span>
                    <span className="text-gray-600">Absent (A)</span>
                  </div>
                </div>
                <div className="text-gray-500">
                  <span className="font-medium">Overall Attendance:</span>{' '}
                  {reportData.summary?.overallPresentCount} Present, {reportData.summary?.overallAbsentCount} Absent ({reportData.summary?.overallPercentage}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Report State */}
        {!showReport && selectedCourse && fromDate && toDate && !isLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiFileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Click Generate Report to view attendance data</p>
          </div>
        )}

        {/* Empty State */}
        {!selectedCourse && !fromDate && !toDate && !isLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiSearch className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No Report Generated</h3>
            <p className="text-sm text-gray-500">Select a course and date range to generate attendance report</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseReport_Page;