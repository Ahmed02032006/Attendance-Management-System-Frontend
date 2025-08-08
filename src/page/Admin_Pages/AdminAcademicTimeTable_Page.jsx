import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiEdit, FiX, FiSearch, FiAlertTriangle } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import {
  createTimeTable,
  getTimetablesBySchoolId,
  getTimetableById,
  updateTimetable,
  deleteTimetable
} from '../../store/Admin-Slicer/Admin-TimeTable-Slicer';
import { toast } from 'react-toastify';
import { getClassesBySchoolId } from '../../store/Admin-Slicer/Admin-Class-Slicer';
import { getSubjectsBySchoolId } from '../../store/Admin-Slicer/Admin-Subject-Slicer';

const AdminAcademicTimeTable_Page = () => {
  const dispatch = useDispatch();

  const {
    timeTables,
    isLoading,
  } = useSelector((state) => state.adminTimeTable);

  // Replace with your actual school ID
  const schoolId = sessionStorage.getItem("currentSchoolId") || null;

  // Modal states
  const [newTimeTableModal, setNewTimeTableModal] = useState(false);
  const [editTimeTableModal, setEditTimeTableModal] = useState(false);
  const [deleteTimeTableModal, setDeleteTimeTableModal] = useState(false);
  const [selectedTimeTable, setSelectedTimeTable] = useState(null);

  const [grades, setGrades] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const { classes } = useSelector((state) => state.adminClass);
  const { subjects } = useSelector((state) => state.adminSubject);

  // Form states
  const [periods, setPeriods] = useState([{ from: '', to: '', mon: '', tue: '', wed: '', thu: '', fri: '' }]);
  const [formData, setFormData] = useState({
    name: '',
    academicYear: '2023-2024',
    grade: 'Grade 1',
    status: 'Active'
  });

  // Fetch timetables on component mount
  useEffect(() => {
    dispatch(getTimetablesBySchoolId(schoolId));
  }, [dispatch, schoolId]);

  // Open new timetable modal
  const openNewModal = () => {
    setFormData({
      name: '',
      academicYear: '2023-2024',
      grade: 'Grade 1',
      status: 'Active'
    });
    setPeriods([{ from: '', to: '', mon: '', tue: '', wed: '', thu: '', fri: '' }]);
    setNewTimeTableModal(true);
  };

  // Open edit timetable modal
  const openEditModal = async (table) => {
    try {
      // Fetch the full timetable data
      await dispatch(getTimetableById(table._id));

      setSelectedTimeTable(table);
      setFormData({
        name: table.name,
        academicYear: table.academicYear,
        grade: table.grade,
        status: table.status
      });

      // Convert periods to editable format
      const editablePeriods = table.periods.map(period => {
        const [from, to] = period.time.split(' - ');
        return {
          from,
          to,
          mon: period.mon,
          tue: period.tue,
          wed: period.wed,
          thu: period.thu,
          fri: period.fri
        };
      });

      setPeriods(editablePeriods);
      setEditTimeTableModal(true);
    } catch (error) {
      console.error('Error fetching timetable details:', error);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (table) => {
    setSelectedTimeTable(table);
    setDeleteTimeTableModal(true);
  };

  // Close all modals
  const closeModals = () => {
    setNewTimeTableModal(false);
    setEditTimeTableModal(false);
    setDeleteTimeTableModal(false);
    setSelectedTimeTable(null);
  };

  // Add new period row
  const addPeriod = () => {
    setPeriods([...periods, { from: '', to: '', mon: '', tue: '', wed: '', thu: '', fri: '' }]);
  };

  // Remove period row
  const removePeriod = (index) => {
    const updatedPeriods = [...periods];
    updatedPeriods.splice(index, 1);
    setPeriods(updatedPeriods);
  };

  // Handle period field changes
  const handlePeriodChange = (index, field, value) => {
    const updatedPeriods = [...periods];
    updatedPeriods[index][field] = value;
    setPeriods(updatedPeriods);
  };

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Create new timetable
  const handleCreate = async (e) => {
    e.preventDefault();

    const formattedPeriods = periods.map(period => ({
      time: `${period.from} - ${period.to}`,
      mon: period.mon,
      tue: period.tue,
      wed: period.wed,
      thu: period.thu,
      fri: period.fri
    }));

    const timetableData = {
      ...formData,
      schoolId,
      periods: formattedPeriods
    };

    try {
      await dispatch(createTimeTable(timetableData));
      closeModals();
      // Refresh the list
      dispatch(getTimetablesBySchoolId(schoolId));
      toast.success("Timetable Created Successfully");
    } catch (error) {
      console.error('Error creating timetable:', error);
    }
  };

  // Update existing timetable
  const handleUpdate = async (e) => {
    e.preventDefault();

    const formattedPeriods = periods.map(period => ({
      time: `${period.from} - ${period.to}`,
      mon: period.mon,
      tue: period.tue,
      wed: period.wed,
      thu: period.thu,
      fri: period.fri
    }));

    const updatedTimetable = {
      ...formData,
      periods: formattedPeriods
    };

    try {
      await dispatch(updateTimetable({
        id: selectedTimeTable._id,
        formData: updatedTimetable
      }));
      closeModals();
      // Refresh the list
      dispatch(getTimetablesBySchoolId(schoolId));
      toast.success("Timetable Updated Successfully");
    } catch (error) {
      console.error('Error updating timetable:', error);
    }
  };

  // Delete timetable
  const handleDelete = async () => {
    try {
      await dispatch(deleteTimetable(selectedTimeTable._id));
      closeModals();
      // Refresh the list
      dispatch(getTimetablesBySchoolId(schoolId));
      toast.success("Timetable Deleted Successfully");
    } catch (error) {
      console.error('Error deleting timetable:', error);
    }
  };

  useEffect(() => {
    if (!schoolId) return;
    dispatch(getClassesBySchoolId(schoolId));
    dispatch(getSubjectsBySchoolId(schoolId));
  }, [dispatch, schoolId]);

  useEffect(() => {
    if (classes && classes.length > 0) {
      setGrades(classes);
    }
    setLoadingGrades(false);

    if (subjects && subjects.length > 0) {
      setAllSubjects(subjects);
    }
    setLoadingSubjects(false);
  }, [classes, subjects]);

  const getUniqueClassNames = () => {
    if (!grades || grades.length === 0) return [];
    const uniqueNames = [...new Set(grades.map(grade => grade.name))];
    return uniqueNames;
  };

  if (loadingGrades && loadingSubjects) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Grades & Subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-[19px] flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-800">
            Admin Academic TimeTable Page
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Search and Add Subject Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          {/* Search Bar */}
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search timetable..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>

          {/* Add Subject Button */}
          <button
            onClick={openNewModal}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors w-full sm:w-auto justify-center"
          >
            <FiPlus className="mr-2" />
            New Timetable
          </button>
        </div>

        {/* Timetables List */}
        <div className="space-y-6">
          {timeTables.length > 0 ? (
            timeTables.map((table) => (
              <div key={table._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{table.name}</h3>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                      <span>Academic Year: {table.academicYear}</span>
                      <span>Grade: {table.grade}</span>
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${table.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {table.status}
                      </span>
                      <span>Last Updated: {new Date(table.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(table)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    >
                      <FiEdit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(table)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Timetable Schedule */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monday
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tuesday
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wednesday
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thursday
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Friday
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {table.periods.map((period, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {period.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {period.mon}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {period.tue}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {period.wed}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {period.thu}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {period.fri}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            !isLoading && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <FiClock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No timetables found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new timetable
                </p>
                <div className="mt-6">
                  <button
                    onClick={openNewModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                  >
                    <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                    Create New Timetable
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </main>

      {/* New Timetable Modal */}
      {newTimeTableModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Timetable</h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Timetable Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      placeholder="e.g. Grade 1 Morning Schedule"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year *
                    </label>
                    <select
                      id="academicYear"
                      value={formData.academicYear}
                      onChange={(e) => handleFormChange('academicYear', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    >
                      <option value="2025-2026">2025-2026</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                      Grade *
                    </label>
                    <select
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => handleFormChange('grade', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    >
                      {getUniqueClassNames().map((gradeName, index) => (
                        <option key={index} value={gradeName}>
                          {gradeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule *</label>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mon</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tue</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Wed</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thur</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fri</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {periods.map((period, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="time"
                                value={period.from}
                                onChange={(e) => handlePeriodChange(index, 'from', e.target.value)}
                                className="w-full border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                required
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="time"
                                value={period.to}
                                onChange={(e) => handlePeriodChange(index, 'to', e.target.value)}
                                className="w-full border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                required
                              />
                            </td>
                            {['mon', 'tue', 'wed', 'thu', 'fri'].map((day) => (
                              <td key={day} className="px-4 py-3 whitespace-nowrap">
                                <select
                                  value={period[day]}
                                  onChange={(e) => handlePeriodChange(index, day, e.target.value)}
                                  className="w-full border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                  required
                                >
                                  <option value="">Select Subject</option>
                                  {allSubjects.map((subject) => {
                                    return (<option key={subject.name} value={subject.name}>{subject.name}</option>)
                                  })}
                                </select>
                              </td>
                            ))}
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => removePeriod(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={addPeriod}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                  >
                    <FiPlus className="-ml-0.5 mr-1.5 h-4 w-4" />
                    Add Period
                  </button>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                  >
                    Create Timetable
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Timetable Modal */}
      {editTimeTableModal && selectedTimeTable && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Timetable</h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Timetable Name *
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-academicYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year *
                    </label>
                    <select
                      id="edit-academicYear"
                      value={formData.academicYear}
                      onChange={(e) => handleFormChange('academicYear', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    >
                      <option value="2025-2026">2025-2026</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-grade" className="block text-sm font-medium text-gray-700 mb-1">
                      Grade *
                    </label>
                    <select
                      id="edit-grade"
                      value={formData.grade}
                      onChange={(e) => handleFormChange('grade', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    >
                      {getUniqueClassNames().map((gradeName, index) => (
                        <option key={index} value={gradeName}>
                          {gradeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      id="edit-status"
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule *</label>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Monday</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tuesday</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Wednesday</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thursday</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Friday</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {periods.map((period, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="time"
                                value={period.from}
                                onChange={(e) => handlePeriodChange(index, 'from', e.target.value)}
                                className="w-full border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                required
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="time"
                                value={period.to}
                                onChange={(e) => handlePeriodChange(index, 'to', e.target.value)}
                                className="w-full border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                required
                              />
                            </td>
                            {['mon', 'tue', 'wed', 'thu', 'fri'].map((day) => (
                              <td key={day} className="px-4 py-3 whitespace-nowrap">
                                <select
                                  value={period[day]}
                                  onChange={(e) => handlePeriodChange(index, day, e.target.value)}
                                  className="w-full border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                  required
                                >
                                  <option value="">Select Subject</option>
                                  {/* Subjects */}
                                  {allSubjects.map((subject) => {
                                    return (<option key={subject.name} value={subject.name}>{subject.name}</option>)
                                  })}
                                </select>
                              </td>
                            ))}
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => removePeriod(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={addPeriod}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                  >
                    <FiPlus className="-ml-0.5 mr-1.5 h-4 w-4" />
                    Add Period
                  </button>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                  >
                    Update Timetable
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTimeTableModal && selectedTimeTable && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl transform transition-all duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Delete Timetable</h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <FiAlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Delete <span className="font-semibold">"{selectedTimeTable.name}"</span>?
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>This will permanently remove the timetable and all associated data.</p>
                    <p className="mt-1 font-medium">This action cannot be undone.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 font-medium text-sm shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete Timetable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademicTimeTable_Page;