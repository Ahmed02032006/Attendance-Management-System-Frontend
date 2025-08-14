import React, { useEffect, useState } from 'react';
import {
  Search, MoreVertical, Edit, Trash2, User, Phone, Calendar,
  GraduationCap, Plus, Camera, Hash, ChevronDown, Mail,
  DollarSign, Lock, // Add Lock here
  SectionIcon,
  Section
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { changeTeacherStatus, getTeachersBySchoolId, updateTeacher } from '../../store/Admin-Slicer/Admin-Teacher-Slicer';
import { FiChevronLeft, FiChevronRight, FiEdit, FiEye, FiTrash2, FiSearch, FiPlus } from 'react-icons/fi';
import { createTeacher } from '../../store/Admin-Slicer/Admin-Teacher-Slicer';
import axios from 'axios';
import { toast } from 'react-toastify';
import { updateUserByEmail } from '../../store/Auth-Slicer/Auth-Slicer';

const AdminManageTeacher_Page = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [teachersPerPage] = useState(9); // Items per page
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);

  // Add teacher form state
  const [imageFile, setImageFile] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [uploadedImageUrl, setUploadImageUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState({
    department: false,
    teacherGender: false
  });

  const { isLoading, teachers } = useSelector((state) => state.adminTeacher);
  const dispatch = useDispatch();
  const id = sessionStorage.getItem("currentSchoolId") || null;

  const initialFormData = {
    teacherId: '',
    teacherName: '',
    teacherEmail: '',
    teacherPassword: '',
    teacherProfilePicture: imageUrl,
    schoolId: id,
    department: '',
    contact: '',
    userRole: 'Teacher',
    status: 'Active',
    qualification: '',
    teacherGender: '',
    salary: '',
    experienceYears: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const teacherGenderOptions = ['Male', 'Female', 'Other'];

  useEffect(() => {
    if (!id) return;
    dispatch(getTeachersBySchoolId(id));
  }, [dispatch, id]);

  // Filter teachers based on search term
  const filteredTeachers = Array.isArray(teachers)
    ? teachers.filter(teacher =>
      teacher.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  // Get current teachers for pagination
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher);
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Teacher form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setImageFile(selectedFile);
      setUploadImageUrl(URL.createObjectURL(selectedFile));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          teacherProfilePicture: URL.createObjectURL(selectedFile)
        }));
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const uploadImage = async () => {
    try {
      setIsImageLoading(true);
      const data = new FormData();
      data.append("file", imageFile);
      const response = await axios.post("http://localhost:5000/api/v1/media/upload-image", data);
      if (response.status == 200) {
        setUploadImageUrl(response?.data?.result?.url);
      }
      setImageUrl(response?.data?.result?.url);
    } catch (error) {
      console.log(error);
    } finally {
      setIsImageLoading(false);
    }
  }

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const toggleDropdown = (dropdown) => {
    setDropdownOpen(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown],
      ...(dropdown === 'department' ? { teacherGender: false } : { department: false })
    }));
  };

  const handleSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setDropdownOpen(prev => ({
      ...prev,
      [name === 'department' ? 'department' : name]: false
    }));
  };

  // ============================================= Update 

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showEditModal && selectedTeacher) {
      // Handle update

      const updateData = {
        userName: formData.teacherName,
        newEmail: formData.teacherEmail,
        userPassword: formData.teacherPassword,
        profilePicture: imageUrl,
        status: formData.status,
      };

      await dispatch(updateUserByEmail({ currentEmail: selectedTeacher.teacherEmail, updateData }));

      dispatch(updateTeacher({
        id: selectedTeacher._id,
        formData: { ...formData, teacherProfilePicture: imageUrl }
      })).then((res) => {
        if (res.payload?.status === "Success") {
          toast.success('Teacher Updated Successfully');
          setFormData(initialFormData);
          setImageUrl("");
          setShowEditModal(false);
        } else if (res.payload?.status === "Error") {
          toast.error(res.payload.message || "Teacher update failed.");
        }
      })
        .catch((err) => {
          toast.error("An unexpected error occurred.");
        });
    } else {
      // Handle create

      const createTeacherForm = {
        userName: formData.teacherName,
        userEmail: formData.teacherEmail,
        userPassword: formData.teacherPassword,
        userRole: "Teacher",
        profilePicture: formData.teacherProfilePicture,
        status: "Active",
      };

      dispatch(createTeacher({ ...formData, teacherProfilePicture: imageUrl }))
        .then(async (res) => {
          if (res.payload?.status === "Success") {
            await axios.post(
              "http://localhost:5000/api/v1/auth/dynamicRegisterUser/",
              createTeacherForm
            );
            toast.success('Teacher Created Successfully');
            dispatch(getTeachersBySchoolId(id));
            setShowAddTeacherModal(false);
            setFormData(initialFormData);
            setImageUrl("");
          } else if (res.payload?.status === "Error") {
            toast.error(res.payload.message || "Teacher Creation failed.");
          }
        })
        .catch((err) => {
          toast.error("An unexpected error occurred.");
        });
    }
  };

  // =============================================

  // const handleStatusChange = (teacherId, newStatus) => {
  //   dispatch(changeTeacherStatus({ teacherId, status: newStatus }))
  //     .unwrap()
  //     .catch((error) => {
  //       console.error('Failed to update status:', error);
  //     });
  // };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-[19px] flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Manage Teacher
          </h1>
        </div>
      </header>

      <main className="p-6">
        {/* Search and Add Teacher */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search teachers..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
          <button
            onClick={() => {
              setShowAddTeacherModal(true);
              setFormData({ ...formData, teacherProfilePicture: null });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add New Teacher
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table header and body remain the same as your original code */}
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher Id
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Password
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qualification
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joining Date
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
                {currentTeachers.length > 0 ? (
                  currentTeachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-gray-50">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 overflow-hidden border-1 border-gray-400">
                            <img
                              src={teacher.teacherProfilePicture}
                              alt={teacher.teacherName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{teacher.teacherName}</div>
                            <div className="text-xs text-gray-500">{teacher.teacherEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                        {teacher.teacherId}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                        {teacher.teacherPassword}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                        {teacher.contact}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                        {teacher.department}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-left text-sm text-gray-500">
                        {teacher.qualification}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                        {formatDate(teacher.createdAt)}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${teacher.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {teacher.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center space-x-3">
                          <button
                            className="text-sky-600 hover:text-sky-900"
                            title="View"
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setShowViewModal(true);
                            }}
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setFormData({
                                teacherId: teacher.teacherId,
                                teacherName: teacher.teacherName,
                                teacherEmail: teacher.teacherEmail,
                                teacherPassword: teacher.teacherPassword,
                                teacherProfilePicture: teacher.teacherProfilePicture,
                                schoolId: teacher.schoolId._id,
                                department: teacher.department,
                                contact: teacher.contact,
                                userRole: 'Teacher',
                                status: teacher.status,
                                qualification: teacher.qualification,
                                teacherGender: teacher.teacherGender,
                                salary: teacher.salary,
                                experienceYears: teacher.experienceYears
                              });
                              setImageUrl(teacher.teacherProfilePicture);
                              setShowEditModal(true);
                            }}
                          >
                            <FiEdit className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? 'No teachers match your search' : 'No teachers found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredTeachers.length > 0 && (
            <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="mb-3 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstTeacher + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastTeacher, filteredTeachers.length)}</span> of{' '}
                  <span className="font-medium">{filteredTeachers.length}</span> teachers
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

        {/* Add Teacher Modal */}
        {showAddTeacherModal && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Add New Teacher
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddTeacherModal(false);
                      setFormData(initialFormData);
                      setImageUrl("");
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-md font-medium text-gray-700 pb-2 border-b border-gray-200">
                        Personal Information
                      </h3>

                      {/* Profile Picture */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                        <div className="flex items-start space-x-4">
                          <div className="relative group">
                            {formData.teacherProfilePicture ? (
                              <>
                                <div className="h-20 w-20 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                                  <img
                                    src={formData.teacherProfilePicture}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, teacherProfilePicture: '' }));
                                    setImageUrl("");
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <div className="h-20 w-20 rounded-md bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center hover:border-sky-400 transition-colors cursor-pointer">
                                <Camera className="h-5 w-5 text-gray-400 group-hover:text-sky-500" />
                              </div>
                            )}
                            <input
                              type="file"
                              name="teacherProfilePicture"
                              onChange={handleFileChange}
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            <p className="font-medium text-gray-600 mb-1">Upload requirements:</p>
                            <ul className="space-y-1">
                              <li>• JPG or PNG format</li>
                              <li>• Max size: 2MB</li>
                              <li>• 400×400px recommended</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Teacher ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Hash className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="teacherId"
                            value={formData.teacherId}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="TCH-001"
                            required
                          />
                        </div>
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="teacherName"
                            value={formData.teacherName}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="teacherEmail"
                            value={formData.teacherEmail}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="john.doe@example.com"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {/* <Lock className="h-4 w-4 text-gray-400" /> */}
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="teacherPassword"
                            value={formData.teacherPassword}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Set a password"
                            required
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => toggleDropdown('teacherGender')}
                            className={`flex items-center justify-between w-full px-3 py-2 text-sm border ${formData.teacherGender ? 'border-gray-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white text-left`}
                          >
                            <span className={formData.teacherGender ? 'text-gray-800' : 'text-gray-400'}>
                              {formData.teacherGender || 'Select Gender'}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen.teacherGender ? 'transform rotate-180' : ''}`} />
                          </button>
                          {dropdownOpen.teacherGender && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-md rounded-md py-1 border border-gray-200 max-h-60 overflow-auto">
                              {teacherGenderOptions.map(option => (
                                <div
                                  key={option}
                                  onClick={() => handleSelect('teacherGender', option)}
                                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${formData.teacherGender === option ? 'bg-gray-50 text-sky-600' : 'text-gray-700'}`}
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Professional Information */}
                    <div className="space-y-4">
                      <h3 className="text-md font-medium text-gray-700 pb-2 border-b border-gray-200">
                        Professional Information
                      </h3>

                      {/* Department */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Section className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Computer Science"
                            required
                          />
                        </div>
                      </div>

                      {/* Contact */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="+1 (555) 123-4567"
                            required
                          />
                        </div>
                      </div>

                      {/* Qualification */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qualification *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="qualification"
                            value={formData.qualification}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="M.Sc. in Computer Science"
                            required
                          />
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years) *</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="experienceYears"
                            value={formData.experienceYears}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="5"
                            min="0"
                            max="50"
                            required
                          />
                          <span className="absolute right-3 top-2 text-gray-400 text-sm">years</span>
                        </div>
                      </div>

                      {/* Salary */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Salary *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="50000.00"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 appearance-none"
                          required
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                          <option value="On Leave">On Leave</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(initialFormData);
                        setImageUrl("");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      Create Teacher
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Teacher Details Modal */}
        {showViewModal && selectedTeacher && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-300 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Teacher Profile
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Detailed information about {selectedTeacher.teacherName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close modal"
                  >
                    <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Profile Card */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                          <div className="h-30 w-30 rounded-full border-1 border-gray-300 overflow-hidden shadow-md">
                            <img
                              src={selectedTeacher.teacherProfilePicture}
                              alt={selectedTeacher.teacherName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className={`absolute right-6 -bottom-1 px-2.5 py-0.5 text-xs font-light rounded-full ${selectedTeacher.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : selectedTeacher.status === "Inactive"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"} shadow-sm`}>
                            {selectedTeacher.status}
                          </span>
                        </div>

                        <p className="text-gray-500 text-sm">Teacher ID: {selectedTeacher.teacherId}</p>
                        <h3 className="text-sm font-bold text-gray-800 text-center">{selectedTeacher.teacherName}</h3>
                        <p className="text-sky-600 text-xs">{selectedTeacher.department}</p>

                        <div className="mt-6 w-full space-y-3">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <a
                              href={`mailto:${selectedTeacher.teacherEmail}`}
                              className="text-gray-700 hover:text-blue-600 text-sm truncate"
                              title={selectedTeacher.teacherEmail}
                            >
                              {selectedTeacher.teacherEmail}
                            </a>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <a
                              href={`tel:${selectedTeacher.contact}`}
                              className="text-gray-700 hover:text-blue-600 text-sm"
                            >
                              {selectedTeacher.contact}
                            </a>
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-700 text-sm capitalize">{selectedTeacher.teacherGender}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Details */}
                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      {/* Professional Information Section */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <GraduationCap className="h-5 w-5 text-blue-500 mr-2" />
                          Professional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</h4>
                            <p className="text-sm text-gray-800 mt-1">{selectedTeacher.qualification || 'Not specified'}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</h4>
                            <p className="text-sm text-gray-800 mt-1">
                              {selectedTeacher.experienceYears ? `${selectedTeacher.experienceYears} years` : 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</h4>
                            <p className="text-sm text-gray-800 mt-1">
                              {selectedTeacher.salary ? `$${parseFloat(selectedTeacher.salary).toLocaleString()}` : 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</h4>
                            <p className="text-sm text-gray-800 mt-1">{formatDate(selectedTeacher.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Information Section */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                          Additional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</h4>
                            <p className="text-sm text-gray-800 mt-1">{formatDate(selectedTeacher.updatedAt)}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">School</h4>
                            <p className="text-sm text-gray-800 mt-1">
                              {selectedTeacher.schoolId?.schoolName || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedTeacher(selectedTeacher);
                      setFormData({
                        teacherId: selectedTeacher.teacherId,
                        teacherName: selectedTeacher.teacherName,
                        teacherEmail: selectedTeacher.teacherEmail,
                        teacherPassword: selectedTeacher.teacherPassword,
                        teacherProfilePicture: selectedTeacher.teacherProfilePicture,
                        schoolId: selectedTeacher.schoolId._id,
                        department: selectedTeacher.department,
                        contact: selectedTeacher.contact,
                        userRole: 'Teacher',
                        status: selectedTeacher.status,
                        qualification: selectedTeacher.qualification,
                        teacherGender: selectedTeacher.teacherGender,
                        salary: selectedTeacher.salary,
                        experienceYears: selectedTeacher.experienceYears
                      });
                      setImageUrl(selectedTeacher.teacherProfilePicture);
                      setShowViewModal(false);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-500 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Teacher Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Edit Teacher: {selectedTeacher?.teacherName}
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setFormData(initialFormData);
                      setImageUrl("");
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Left Column - Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-md font-medium text-gray-700 pb-2 border-b border-gray-200">
                        Personal Information
                      </h3>

                      {/* Profile Picture */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                        <div className="flex items-start space-x-4">
                          <div className="relative group">
                            {formData.teacherProfilePicture ? (
                              <>
                                <div className="h-20 w-20 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                                  <img
                                    src={formData.teacherProfilePicture}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, teacherProfilePicture: '' }));
                                    setImageUrl("");
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <div className="h-20 w-20 rounded-md bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center hover:border-sky-400 transition-colors cursor-pointer">
                                <Camera className="h-5 w-5 text-gray-400 group-hover:text-sky-500" />
                              </div>
                            )}
                            <input
                              type="file"
                              name="teacherProfilePicture"
                              onChange={handleFileChange}
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            <p className="font-medium text-gray-600 mb-1">Upload requirements:</p>
                            <ul className="space-y-1">
                              <li>• JPG or PNG format</li>
                              <li>• Max size: 2MB</li>
                              <li>• 400×400px recommended</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Teacher ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Hash className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="teacherId"
                            value={formData.teacherId}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="TCH-001"
                            required
                          />
                        </div>
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="teacherName"
                            value={formData.teacherName}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => toggleDropdown('teacherGender')}
                            className={`flex items-center justify-between w-full px-3 py-2 text-sm border ${formData.teacherGender ? 'border-gray-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white text-left`}
                          >
                            <span className={formData.teacherGender ? 'text-gray-800' : 'text-gray-400'}>
                              {formData.teacherGender || 'Select Gender'}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen.teacherGender ? 'transform rotate-180' : ''}`} />
                          </button>
                          {dropdownOpen.teacherGender && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-md rounded-md py-1 border border-gray-200 max-h-60 overflow-auto">
                              {teacherGenderOptions.map(option => (
                                <div
                                  key={option}
                                  onClick={() => handleSelect('teacherGender', option)}
                                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${formData.teacherGender === option ? 'bg-gray-50 text-sky-600' : 'text-gray-700'}`}
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="teacherEmail"
                            value={formData.teacherEmail}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="john.doe@example.com"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="teacherPassword"
                            value={formData.teacherPassword}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Set a password"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Professional Information */}
                    <div className="space-y-4">
                      <h3 className="text-md font-medium text-gray-700 pb-2 border-b border-gray-200">
                        Professional Information
                      </h3>

                      {/* Department */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Section className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Computer Science"
                            required
                          />
                        </div>
                      </div>

                      {/* Contact */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="+1 (555) 123-4567"
                            required
                          />
                        </div>
                      </div>

                      {/* Qualification */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qualification *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="qualification"
                            value={formData.qualification}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="M.Sc. in Computer Science"
                            required
                          />
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years) *</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="experienceYears"
                            value={formData.experienceYears}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="5"
                            min="0"
                            max="50"
                            required
                          />
                          <span className="absolute right-3 top-2 text-gray-400 text-sm">years</span>
                        </div>
                      </div>

                      {/* Salary */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Salary *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="50000.00"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 appearance-none"
                          required
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                          <option value="On Leave">On Leave</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setFormData(initialFormData);
                        setImageUrl("");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      Update Teacher
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminManageTeacher_Page;