import React, { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUsers, FiEye, FiChevronLeft, FiChevronRight, FiEdit, FiCalendar, FiX, FiChevronDown, FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  getClassesBySchoolId,
  createClass,
  updateClass,
  deleteClass,
  addTeacherToClass,
  removeTeacherFromClass
} from '../../store/Admin-Slicer/Admin-Class-Slicer';
import { getTeachersBySchoolId } from '../../store/Admin-Slicer/Admin-Teacher-Slicer';
import { getSubjectsBySchoolId } from '../../store/Admin-Slicer/Admin-Subject-Slicer';

const AdminAcademicClasses_Page = () => {
  // ================= STATE MANAGEMENT =================
  // Redux state
  const {
    isLoading,
    classes: schoolClasses,
  } = useSelector((state) => state.adminClass);
  const { teachers } = useSelector((state) => state.adminTeacher);
  const { subjects } = useSelector((state) => state.adminSubject);
  const dispatch = useDispatch();

  // Local state - School/User context
  const schoolId = sessionStorage.getItem("currentSchoolId") || null;
  const id = sessionStorage.getItem("currentSchoolId") || null;

  // Local state - UI Controls
  const [currentPage, setCurrentPage] = useState(1);
  const [classesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  // Local state - Modal Controls
  const [addTeacherModal, setAddTeacherModal] = useState(false);
  const [newClassModal, setNewClassModal] = useState(false);
  const [editClassModal, setEditClassModal] = useState(false);
  const [deleteClassModal, setDeleteClassModal] = useState(false);

  // Local state - Data
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [teacherFetchError, setTeacherFetchError] = useState(null);

  // Local state - Forms
  const [newClass, setNewClass] = useState({
    classId: '',
    name: '',
    section: '',
    roomNo: '',
    classTeacher: '',
    status: 'Active',
    createdAt: new Date().toISOString().split('T')[0],
    schoolId: schoolId
  });

  const [newTeacher, setNewTeacher] = useState({
    name: '',
    subject: '',
    email: ''
  });

  // ================= EFFECTS =================
  // Load classes on component mount and when schoolId changes
  useEffect(() => {
    if (!schoolId) return;
    dispatch(getClassesBySchoolId(schoolId));
  }, [dispatch, schoolId]);

  // Update local classes when Redux classes change
  useEffect(() => {
    if (schoolClasses) {
      setClasses(schoolClasses.map(cls => ({ ...cls, showTeachers: false })));
    }
  }, [schoolClasses]);

  // Load teachers when component mounts
  useEffect(() => {
    if (!id) return;
    dispatch(getTeachersBySchoolId(id));
    dispatch(getSubjectsBySchoolId(id));
  }, [dispatch, id]);

  // Fetch teachers when modals open
  useEffect(() => {
    if (addTeacherModal || newClassModal || editClassModal) {
      fetchTeachers();
    }
  }, [addTeacherModal, newClassModal, editClassModal]);

  // ================= DATA FETCHING =================
  const fetchTeachers = async () => {
    try {
      setIsLoadingTeachers(true);
      setTeacherFetchError(null);

      if (!teachers || teachers.length === 0) {
        await dispatch(getTeachersBySchoolId(id));
      }

      // Ensure consistent data structure
      const formattedTeachers = teachers?.map(teacher => ({
        _id: teacher._id,
        name: teacher.teacherName || teacher.name,
        email: teacher.teacherEmail || teacher.email
      })) || [];

      setAvailableTeachers(formattedTeachers);

      // Use real subjects from database
      const formattedSubjects = subjects?.map(subject => subject.name) || [];

      setAvailableSubjects(formattedSubjects);

      // If we're in edit mode and have a selected class, set the teacher
      if (editClassModal && selectedClass && selectedClass.classTeacher && formattedTeachers.length > 0) {
        if (selectedClass.classTeacher._id) {
          setSelectedTeacherId(selectedClass.classTeacher._id);
        } else if (selectedClass.classTeacher.email) {
          const matchingTeacher = formattedTeachers.find(teacher =>
            teacher.email === selectedClass.classTeacher.email
          );
          if (matchingTeacher) {
            setSelectedTeacherId(matchingTeacher._id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeacherFetchError('Failed to load teachers. Please try again.');
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  // ================= EVENT HANDLERS =================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass(prev => ({ ...prev, [name]: value }));
  };

  const handleTeacherSelect = (e) => {
    const teacherId = e.target.value;
    setSelectedTeacherId(teacherId);

    const selectedTeacher = availableTeachers.find(teacher => teacher._id === teacherId);
    if (selectedTeacher) {
      // Update the newClass state with the teacher details
      setNewClass(prev => ({
        ...prev,
        classTeacher: {
          name: selectedTeacher.name,
          email: selectedTeacher.email
        }
      }));

      // Also update the newTeacher state if needed
      setNewTeacher(prev => ({
        ...prev,
        name: selectedTeacher.name,
        email: selectedTeacher.email,
        subject: prev.subject || availableSubjects[0] || ''
      }));
    }
  };

  const handleSubjectSelect = (e) => {
    setNewTeacher(prev => ({
      ...prev,
      subject: e.target.value
    }));
  };

  // Class CRUD Operations
  const handleAddClass = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!selectedTeacherId || !newClass.classId || !newClass.name || !newClass.section || !newClass.roomNo) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        ...newClass,
        classTeacher: selectedTeacherId, // Only store the ID
        students: 0 // Default value
      };

      const result = await dispatch(createClass(payload));

      if (result.payload?.success) {
        toast.success("Class created successfully!");
        setNewClassModal(false);
        resetNewClassForm();
        dispatch(getClassesBySchoolId(schoolId)); // Refresh the list
      } else {
        toast.error(result.payload?.message || "Failed to create class");
      }
    } catch (error) {
      toast.error("Failed to create class");
      console.error('Error creating class:', error);
    }
  };

  const handleEditClass = (cls) => {
    setSelectedClass(cls);
    setNewClass({
      classId: cls.classId,
      name: cls.name,
      section: cls.section,
      roomNo: cls.roomNo,
      classTeacher: cls.classTeacher._id || cls.classTeacher, // Handle both populated and non-populated cases
      status: cls.status,
      createdAt: cls.createdAt.split('T')[0],
      schoolId: schoolId
    });

    setSelectedTeacherId(cls.classTeacher._id || cls.classTeacher);
    setEditClassModal(true);
  };

  // Add this useEffect to handle teacher selection when availableTeachers loads
  useEffect(() => {
    // When availableTeachers loads and we have a selectedClass with a teacher
    if (availableTeachers.length > 0 && selectedClass && selectedClass.classTeacher && !selectedTeacherId) {
      if (selectedClass.classTeacher._id) {
        // If we have teacher ID, use it directly
        setSelectedTeacherId(selectedClass.classTeacher._id);
      } else if (selectedClass.classTeacher.email) {
        // If no ID but has email, find by email
        const matchingTeacher = availableTeachers.find(teacher =>
          teacher.email === selectedClass.classTeacher.email
        );
        if (matchingTeacher) {
          setSelectedTeacherId(matchingTeacher._id);
        }
      }
    }
  }, [availableTeachers, selectedClass, selectedTeacherId]);

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
      // Create payload with only teacher ID
      const payload = {
        ...newClass,
        classTeacher: selectedTeacherId // Only store the ID
      };

      const result = await dispatch(updateClass({
        classId: selectedClass._id,
        formData: payload
      }));

      if (result.payload) {
        toast.success("Class updated successfully!");
        setEditClassModal(false);
      }
    } catch (error) {
      toast.error("Failed to update class");
      console.error('Error updating class:', error);
    }
  };

  const handleDeleteClass = async () => {
    try {
      const result = await dispatch(deleteClass(selectedClass._id));
      if (result.payload) {
        toast.success("Class deleted successfully!");
        setDeleteClassModal(false);
      }
    } catch (error) {
      toast.error("Failed to delete class");
      console.error('Error deleting class:', error);
    }
  };

  // Teacher CRUD Operations
  const handleAddTeacher = async (e) => {
    e.preventDefault();

    try {
      // Get the selected teacher from availableTeachers
      const selectedTeacher = availableTeachers.find(teacher => teacher._id === selectedTeacherId);

      if (!selectedTeacher) {
        toast.error("Selected teacher not found");
        return;
      }

      // Prepare the teacher data in the correct format
      const teacherData = {
        teacherId: selectedTeacher._id,
        subject: newTeacher.subject
      };

      const result = await dispatch(addTeacherToClass({
        classId: selectedClass._id,
        teacherData
      }));

      if (result.payload.success) {
        toast.success(result.payload.message);
        resetNewTeacherForm();
        dispatch(getClassesBySchoolId(schoolId));
      } else {
        toast.error(result.payload.message);
      }
    } catch (error) {
      toast.error("Failed to add teacher");
      console.error('Error adding teacher:', error);
    } finally {
      setAddTeacherModal(false);
    }
  };

  const handleRemoveTeacher = async (classId, teacherEmail) => {

    try {
      const result = await dispatch(removeTeacherFromClass({
        classId,
        teacherEmail
      }));
      if (result.payload) {
        toast.success("Teacher removed successfully!");
        dispatch(getClassesBySchoolId(schoolId));
      }
    } catch (error) {
      toast.error("Failed to remove teacher");
      console.error('Error removing teacher:', error);
    }
  };

  // UI Helpers
  const toggleTeachers = (classId) => {
    setClasses(classes.map(cls =>
      cls._id === classId ? { ...cls, showTeachers: !cls.showTeachers } : cls
    ));
  };

  // Form Resetters
  const resetNewClassForm = () => {
    setNewClass({
      classId: '',
      name: '',
      section: '',
      roomNo: '',
      classTeacher: { name: '', email: '' },
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      schoolId: schoolId
    });
    setSelectedTeacherId('');
  };

  const resetNewTeacherForm = () => {
    setNewTeacher({
      name: '',
      subject: '',
      email: ''
    });
  };

  // ================= DATA TRANSFORMATIONS =================
  const filteredClasses = classes.filter(cls => {
    return cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.classTeacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.roomNo.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = filteredClasses?.slice(indexOfFirstClass, indexOfLastClass);
  const totalPages = Math.ceil(filteredClasses?.length / classesPerPage);

  // Pagination handlers
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // ================= RENDER LOGIC =================
  if (isLoading && !classes.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - Clean Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-[19px] flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-800">
            Admin Academic Classes Page
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Search and Add Class */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search classes..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setNewClassModal(true)
              setNewClass({
                classId: '',
                name: '',
                section: '',
                roomNo: '',
                classTeacher: '',
                status: 'Active',
                createdAt: new Date().toISOString().split('T')[0],
                schoolId: schoolId
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add New Class
          </button>
        </div>

        {/* Classes Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Teacher
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
                {currentClasses?.length > 0 ? (
                  currentClasses?.map((cls) => (
                    <React.Fragment key={cls._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-9.5 w-9.5 rounded-full bg-sky-100 flex items-center justify-center border border-gray-300">
                              <span className="text-[10px] text-sky-800 font-medium">{cls.classId}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{cls.name} - Sec {cls.section}</div>
                              <div className="text-xs text-gray-500">Class ID: {cls.classId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                          {cls.roomNo}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                          {cls.students}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <div >
                            <div className="text-sm ml-6 font-medium text-gray-800">{cls.classTeacher?.teacherName || ''}</div>
                            <div className="text-xs text-gray-500">{cls.classTeacher?.teacherEmail || ''}</div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <div className="flex items-center text-xs text-gray-500">
                            <FiCalendar className="mr-1.5 h-4 w-4 text-gray-400" />
                            {new Date(cls.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${cls.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {cls.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => toggleTeachers(cls._id)}
                              className="text-sky-600 hover:text-sky-900"
                              title="Show Teachers"
                            >
                              <FiUsers className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditClass(cls)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit"
                            >
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClass(cls);
                                setDeleteClassModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Teachers Row */}
                      {cls.showTeachers && (
                        <tr className="bg-gray-50">
                          <td colSpan="7" className="px-1.5 py-1.5">
                            <div className="bg-white rounded-xs border border-gray-300 p-5">
                              {/* Header Section */}
                              <div className="flex items-center justify-between mb-5">
                                <div>
                                  <h4 className="text-base font-semibold text-gray-800">
                                    Teachers - {cls.name} (Section {cls.section})
                                  </h4>
                                  <p className="text-xs text-gray-500">Manage the teachers assigned to this class</p>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedClass(cls);
                                    setAddTeacherModal(true);
                                  }}
                                  className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-lg shadow-sm 
                       text-white bg-green-600 hover:bg-green-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                                >
                                  <FiPlus className="mr-2 h-4 w-4" />
                                  Add Teacher
                                </button>
                              </div>

                              {/* No Teachers State */}
                              {cls.teachers.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                  <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                                  <h3 className="mt-3 text-sm font-medium text-gray-900">
                                    No teachers added yet
                                  </h3>
                                  <p className="mt-1 text-xs text-gray-500">
                                    Start by adding teachers to this class.
                                  </p>
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                          Teacher
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                          Subject
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                          Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                      {cls.teachers.map((teacher, index) => (
                                        <tr
                                          key={index}
                                          className="hover:bg-gray-50 transition-colors duration-200"
                                        >
                                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                                            {teacher?.teacher?.teacherName}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                            {teacher.subject}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                            {teacher?.teacher?.teacherEmail}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap font-medium flex space-x-3">
                                            <div onClick={() => handleRemoveTeacher(cls._id, teacher?.teacher?.teacherEmail)} className='flex items-center justify-center gap-1.5 rounded-sm bg-red-500 px-1.5 py-0.5 cursor-pointer'>
                                              <button
                                                className="text-white hover:text-white transition cursor-pointer"
                                              >
                                                <FiTrash2 className="h-3.5 w-3.5" />
                                              </button>
                                              <p className='font-light text-white'>Delete</p>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No classes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredClasses?.length > 0 && (
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="mb-3 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstClass + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastClass, filteredClasses.length)}</span> of{' '}
                  <span className="font-medium">{filteredClasses.length}</span> classes
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

      {/* Add New Class Modal */}
      {newClassModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className=" w-full max-w-xl bg-white rounded-xl shadow-xl transform transition-all duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  Create New Class
                </h3>
                <button
                  onClick={() => {
                    setNewClassModal(false);
                    setSelectedTeacherId('');
                  }}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Fill in the details to create a new class
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddClass} className="p-6">
              <div className="space-y-5">
                {/* Class ID and Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Class ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="classId"
                      name="classId"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="CLA001"
                      value={newClass.classId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Class Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="Grade 1"
                      value={newClass.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Section and Room Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="section"
                      name="section"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="A"
                      value={newClass.section}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="roomNo" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Room Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="roomNo"
                      name="roomNo"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="101"
                      value={newClass.roomNo}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Class Teacher */}
                <div>
                  <label htmlFor="selectTeacher" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Class Teacher <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="selectTeacher"
                      name="teacher"
                      className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all appearance-none"
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      required
                      disabled={isLoadingTeachers || availableTeachers.length === 0}
                    >
                      <option value="">Select a teacher</option>
                      {availableTeachers.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <FiChevronDown className="h-5 w-5" />
                    </div>
                  </div>
                  {!selectedTeacherId && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center">
                      <FiAlertCircle className="mr-1.5 h-3.5 w-3.5" /> Please select a class teacher
                    </p>
                  )}
                  {availableTeachers.length === 0 && !isLoadingTeachers && (
                    <p className="mt-1.5 text-xs text-amber-600 flex items-center">
                      <FiAlertCircle className="mr-1.5 h-3.5 w-3.5" /> No teachers available to assign
                    </p>
                  )}
                </div>

                {/* Status and Created At */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      value={newClass.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Created At <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="createdAt"
                      name="createdAt"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all bg-gray-50"
                      value={newClass.createdAt}
                      onChange={handleInputChange}
                      required
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewClassModal(false);
                    setSelectedTeacherId('');
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-all duration-200 font-medium text-sm shadow-sm focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                  disabled={!selectedTeacherId || !newClass.classId || !newClass.name || !newClass.section || !newClass.roomNo}
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editClassModal && selectedClass && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-xl transform transition-all duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  Edit Class
                </h3>
                <button
                  onClick={() => {
                    setEditClassModal(false);
                    setSelectedTeacherId('');
                  }}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Update the details for this class
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateClass} className="p-6">
              <div className="space-y-5">
                {/* Class ID and Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editClassId" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Class ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="editClassId"
                      name="classId"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="CLA001"
                      value={newClass.classId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Class Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="editName"
                      name="name"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="Grade 1"
                      value={newClass.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Section and Room Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editSection" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="editSection"
                      name="section"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="A"
                      value={newClass.section}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="editRoomNo" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Room Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="editRoomNo"
                      name="roomNo"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="101"
                      value={newClass.roomNo}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Class Teacher */}
                <div>
                  <label htmlFor="editSelectTeacher" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Class Teacher <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="editSelectTeacher"
                      name="classTeacher"
                      className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all appearance-none"
                      value={selectedTeacherId}
                      onChange={(e) => {
                        setSelectedTeacherId(e.target.value);
                        setNewClass(prev => ({ ...prev, classTeacher: e.target.value }));
                      }}
                      required
                    >
                      <option value="">Select a teacher</option>
                      {availableTeachers.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <FiChevronDown className="h-5 w-5" />
                    </div>
                  </div>
                  {!selectedTeacherId && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center">
                      <FiAlertCircle className="mr-1.5 h-3.5 w-3.5" /> Please select a class teacher
                    </p>
                  )}
                  {availableTeachers.length === 0 && !isLoadingTeachers && (
                    <p className="mt-1.5 text-xs text-amber-600 flex items-center">
                      <FiAlertCircle className="mr-1.5 h-3.5 w-3.5" /> No teachers available to assign
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="editStatus"
                    name="status"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    value={newClass.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditClassModal(false);
                    setSelectedTeacherId('');
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-all duration-200 font-medium text-sm shadow-sm focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  disabled={!selectedTeacherId}
                >
                  Update Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addTeacherModal && selectedClass && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-xl transform transition-all duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Add Teacher</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedClass.name} - Section {selectedClass.section}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAddTeacherModal(false);
                    setNewTeacher({ name: '', subject: '', email: '' });
                    setSelectedTeacherId('');
                  }}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                  disabled={isLoadingTeachers}
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {isLoadingTeachers ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600 mb-4"></div>
                  <p className="text-gray-600 text-sm">Loading available teachers and subjects...</p>
                </div>
              ) : teacherFetchError ? (
                <div className="text-center py-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <FiAlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading data</h3>
                  <p className="text-sm text-gray-500 mb-4">{teacherFetchError}</p>
                  <button
                    onClick={fetchTeachers}
                    className="px-4 py-2.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors duration-200 font-medium text-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddTeacher} className="space-y-5">
                  {/* Teacher Selection */}
                  <div>
                    <label htmlFor="selectTeacher" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Select Teacher <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="selectTeacher"
                        name="teacher"
                        className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all appearance-none"
                        value={selectedTeacherId}
                        onChange={handleTeacherSelect}
                        required
                        disabled={isLoadingTeachers || availableTeachers.length === 0}
                      >
                        <option value="">Select a teacher</option>
                        {availableTeachers.map(teacher => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.name} ({teacher.email})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <FiChevronDown className="h-5 w-5" />
                      </div>
                    </div>
                    {availableTeachers.length === 0 && !isLoadingTeachers && (
                      <p className="mt-1.5 text-xs text-amber-600 flex items-center">
                        <FiAlertCircle className="mr-1.5 h-3.5 w-3.5" /> No teachers available to assign
                      </p>
                    )}
                  </div>

                  {/* Subject Selection */}
                  <div>
                    <label htmlFor="selectSubject" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Select Subject <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="selectSubject"
                        name="subject"
                        className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all appearance-none"
                        value={newTeacher.subject}
                        onChange={handleSubjectSelect}
                        required
                        disabled={isLoadingTeachers || availableSubjects.length === 0}
                      >
                        <option value="">Select a subject</option>
                        {availableSubjects.map((subject, index) => (
                          <option key={index} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <FiChevronDown className="h-5 w-5" />
                      </div>
                    </div>
                    {availableSubjects.length === 0 && !isLoadingTeachers && (
                      <p className="mt-1.5 text-xs text-amber-600 flex items-center">
                        <FiAlertCircle className="mr-1.5 h-3.5 w-3.5" /> No subjects available to assign
                      </p>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAddTeacherModal(false);
                        setNewTeacher({ name: '', subject: '', email: '' });
                        setSelectedTeacherId('');
                      }}
                      className="px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                      disabled={isLoadingTeachers}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200 font-medium text-sm shadow-sm focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70"
                      disabled={!selectedTeacherId || !newTeacher.subject || isLoadingTeachers}
                    >
                      {isLoadingTeachers ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : (
                        'Add Teacher'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteClassModal && selectedClass && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl transform transition-all duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Confirm Deletion</h3>
                <button
                  onClick={() => setDeleteClassModal(false)}
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
                    Delete {selectedClass.name} - Section {selectedClass.section}?
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>This will permanently remove the class and all associated data.</p>
                    <p className="mt-1 font-medium">This action cannot be undone.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setDeleteClassModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClass}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 font-medium text-sm shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AdminAcademicClasses_Page;