import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBook, FiChevronLeft, FiChevronRight, FiEdit, FiClock, FiSearch, FiCalendar, FiX, FiAlertTriangle } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { getClassesBySchoolId } from '../../store/Admin-Slicer/Admin-Class-Slicer';
import { getTeachersBySchoolId } from '../../store/Admin-Slicer/Admin-Teacher-Slicer';
import { createSubject, deleteSubject, getSubjectsBySchoolId, updateSubject } from '../../store/Admin-Slicer/Admin-Subject-Slicer';
import { toast } from 'react-toastify';

const AdminAcademicSubjects_Page = () => {
  // Pagination and modal states
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectsPerPage] = useState(5);
  const [newSubjectModal, setNewSubjectModal] = useState(false);
  const [editSubjectModal, setEditSubjectModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [newSubjectData, setNewSubjectData] = useState({
    name: '',
    code: '',
    medium: '',
    category: '',
    status: 'Active',
    classes: [],
    teachers: [],
    createdAt: new Date().toISOString().split('T')[0],
  });

  // Data loading states
  const [grades, setGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [allTeachers, setAllTeachers] = useState([]);
  const [loadingSubject, setLoadingSubject] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redux state and dispatch
  const schoolId = sessionStorage.getItem("currentSchoolId") || null;
  const dispatch = useDispatch();
  const { classes } = useSelector((state) => state.adminClass);
  const { teachers } = useSelector((state) => state.adminTeacher);
  const { subjects } = useSelector((state) => state.adminSubject);

  // Fetch data on component mount
  useEffect(() => {
    if (!schoolId) return;
    dispatch(getClassesBySchoolId(schoolId));
    dispatch(getTeachersBySchoolId(schoolId));
    dispatch(getSubjectsBySchoolId(schoolId));
  }, [dispatch, schoolId]);

  // Process classes data when loaded
  useEffect(() => {
    if (classes) {
      const classNames = classes;
      setGrades(classNames);
      setLoadingGrades(false);
    }
  }, [classes]);

  // Process teachers data when loaded
  useEffect(() => {
    if (teachers) {
      const teacherNames = teachers;
      setAllTeachers(teacherNames);
      setLoadingTeachers(false);
    }
  }, [teachers]);

  // Process subjects data when loaded
  useEffect(() => {
    if (subjects) {
      setLoadingSubject(false);
    }
  }, [subjects]);

  const [searchTerm, setSearchTerm] = useState('');

  // Filter subjects based on search term
  const filteredSubjects = subjects?.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update pagination to use filtered subjects
  const indexOfLastSubject = currentPage * subjectsPerPage;
  const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage;
  const currentSubjects = filteredSubjects?.slice(indexOfFirstSubject, indexOfLastSubject);
  const totalPages = Math.ceil(filteredSubjects?.length / subjectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Delete subject handler with confirmation
  const handleDeleteClick = (subjectId) => {
    setSubjectToDelete(subjectId);
    setDeleteConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;
    try {
      const result = await dispatch(deleteSubject(subjectToDelete));

      if (result.payload.success) {
        toast.success(result.payload.message);
      } else {
        toast.error(result.payload.message);
      }
    } catch (error) {
      toast.error("Failed to delete subject");
      console.error('Error deleting subject:', error);
    } finally {
      setDeleteConfirmModal(false);
      setSubjectToDelete(null);
    }
  };

  // Edit subject handler
  const handleEditClick = (subject) => {
    setNewSubjectData({
      name: subject.name,
      code: subject.code,
      medium: subject.medium,
      category: subject.category,
      status: subject.status,
      classes: subject.classes.map(classes => classes._id),
      teachers: subject.teachers.map(teacher => teacher._id),
      _id: subject._id,
      createdAt: subject.createdAt
    });
    setEditSubjectModal(true);
  };

  // Form input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGradeChange = (grade, isChecked) => {
    setNewSubjectData(prev => {
      const newClasses = isChecked
        ? [...prev.classes, grade._id]
        : prev.classes.filter(g => g !== grade._id);
      return { ...prev, classes: newClasses };
    });
  };

  const handleTeacherChange = (teacher, isChecked) => {
    setNewSubjectData(prev => {
      const newTeachers = isChecked
        ? [...prev.teachers, teacher._id]
        : prev.teachers.filter(t => t !== teacher._id);
      return { ...prev, teachers: newTeachers };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = {
        ...newSubjectData,
        schoolId: schoolId
      };

      if (editSubjectModal) {
        const result = await dispatch(updateSubject({
          id: newSubjectData._id,
          formData: formData
        }));

        if (result.payload.success) {
          toast.success(result.payload.message);
        } else {
          toast.error(result.payload.message);
        }
      } else {
        const result = await dispatch(createSubject(formData));

        if (result.payload.success) {
          toast.success(result.payload.message);
        } else {
          toast.error(result.payload.message);
        }
      }
    } catch (error) {
      toast.error(`Failed to ${editSubjectModal ? 'update' : 'create'} subject`);
      console.error(`Error ${editSubjectModal ? 'updating' : 'creating'} subject:`, error);
    } finally {
      setIsSubmitting(false);
      setNewSubjectModal(false);
      setEditSubjectModal(false);
      setNewSubjectData({
        name: '',
        code: '',
        medium: '',
        category: '',
        status: 'Active',
        classes: [],
        teachers: [],
        createdAt: new Date().toISOString().split('T')[0],
      });
      setCurrentPage(1);
    }
  };

  const resetForm = () => {
    setNewSubjectData({
      name: '',
      code: '',
      medium: '',
      category: '',
      status: 'Active',
      classes: [],
      teachers: [],
      createdAt: new Date().toISOString().split('T')[0],
    });
    setNewSubjectModal(false);
    setEditSubjectModal(false);
  };

  if (loadingSubject) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Subjects...</p>
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
            Admin Academic Subjects Page
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
              placeholder="Search subjects..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>

          {/* Add Subject Button */}
          <button
            onClick={() => setNewSubjectModal(true)}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors w-full sm:w-auto justify-center"
          >
            <FiPlus className="mr-2" />
            Add Subject
          </button>
        </div>

        {/* Subjects Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medium
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Classes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teachers
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
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
                {currentSubjects?.length > 0 ? (
                  currentSubjects?.map((subject) => (
                    <tr key={subject._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                            <FiBook className="h-5 w-5 text-sky-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                            <div className="text-xs text-gray-500">{subject.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                        {subject.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subject.medium}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center overflow-x-auto max-w-[150px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          <div className="flex space-x-1 pb-1">
                            {subject.classes.map((cls, index) => (
                              <span key={index} className="flex-shrink-0 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                {cls.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center overflow-x-auto max-w-[150px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          <div className="flex space-x-1 pb-1">
                            {subject?.teachers?.length ? (
                              subject?.teachers?.map((teacher, index) => (
                                <span key={index} className="flex-shrink-0 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                  {teacher?.teacherName}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">No teachers</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs text-gray-500">
                          <FiCalendar className="mr-1.5 h-4 w-4 text-gray-400" />
                          {subject.createdAt.split('T')[0]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${subject.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {subject.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => handleEditClick(subject)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <FiEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(subject._id)}
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
                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                      No subjects found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {subjects?.length > 0 && (
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="mb-3 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstSubject + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastSubject, subjects?.length)}</span> of{' '}
                  <span className="font-medium">{subjects?.length}</span> subjects
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

      {/* Add/Edit Subject Modal */}
      {(newSubjectModal || editSubjectModal) && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl transform transition-all duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editSubjectModal ? 'Edit Subject' : 'Add New Subject'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subjectName"
                      name="name"
                      value={newSubjectData.name}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="e.g. Mathematics"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Subject Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subjectCode"
                      name="code"
                      value={newSubjectData.code}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="e.g. MATH101"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={newSubjectData.category}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="e.g. Core, Science, Arts"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="medium" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Medium <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="medium"
                      name="medium"
                      value={newSubjectData.medium}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="e.g. English, Hindi"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={newSubjectData.status}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Assign Classes
                    </label>
                    <div className="h-[150px] overflow-y-auto p-2 border border-gray-300 rounded-md bg-gray-50">
                      {loadingGrades ? (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-sky-600"></div>
                          <span className="ml-2 text-sm text-gray-500">Loading classes...</span>
                        </div>
                      ) : grades.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {grades.map((grade) => (
                            <div key={grade._id} className="flex items-center">
                              <input
                                id={`grade-${grade._id}`}
                                type="checkbox"
                                checked={newSubjectData.classes.includes(grade._id)}
                                onChange={(e) => handleGradeChange(grade, e.target.checked)}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`grade-${grade._id}`} className="ml-2 text-sm text-gray-700">
                                {grade.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No classes available</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Assign Teachers
                    </label>
                    <div className="h-[150px] overflow-y-auto p-2 border border-gray-300 rounded-md bg-gray-50">
                      {loadingTeachers ? (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-sky-600"></div>
                          <span className="ml-2 text-sm text-gray-500">Loading teachers...</span>
                        </div>
                      ) : allTeachers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {allTeachers.map((teacher) => (
                            <div key={teacher._id} className="flex items-center">
                              <input
                                id={`teacher-${teacher._id}`}
                                type="checkbox"
                                checked={newSubjectData.teachers.includes(teacher._id)}
                                onChange={(e) => handleTeacherChange(teacher, e.target.checked)}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`teacher-${teacher._id}`} className="ml-2 text-sm text-gray-700">
                                {teacher.teacherName}
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No teachers available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-all duration-200 font-medium text-sm shadow-sm focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 flex items-center justify-center min-w-[120px]"
                  disabled={loadingGrades || loadingTeachers || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editSubjectModal ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    editSubjectModal ? 'Update Subject' : 'Save Subject'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl transform transition-all duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Confirm Deletion</h3>
                <button
                  onClick={() => setDeleteConfirmModal(false)}
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
                  <h3 className="text-lg font-medium text-gray-900">Delete this subject?</h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>This will permanently remove the subject and all associated data.</p>
                    <p className="mt-1 font-medium">This action cannot be undone.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 font-medium text-sm shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademicSubjects_Page;