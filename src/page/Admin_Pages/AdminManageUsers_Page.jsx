import React, { useEffect, useState } from 'react';
import {
    Search, MoreVertical, Edit, User, Phone, Calendar,
    GraduationCap, Plus, Camera, Hash, ChevronDown, Mail,
    DollarSign, Lock, Shield, Users, Key,
    MapPin
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { FiChevronLeft, FiChevronRight, FiEdit, FiEye, FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
    getOtherUsersBySchoolId,
    createOtherUser,
    updateOtherUser,
    deleteOtherUser,
    updateOtherUserStatus,
    clearOtherUserMessages
} from '../../store/Admin-Slicer/Admin-OtherUser-Slicer';
import { updateUserByEmail } from '../../store/Auth-Slicer/Auth-Slicer';

const AdminManageUsers_Page = () => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(9); // Items per page
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(false);

    // Add user form state
    const [imageFile, setImageFile] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [uploadedImageUrl, setUploadImageUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState({
        userGender: false,
        userRole: false
    });

    const { users, isLoading } = useSelector((state) => state.adminOtherUsers);
    const dispatch = useDispatch();
    const id = sessionStorage.getItem("currentSchoolId") || null;

    useEffect(() => {
        if (!id) return;
        dispatch(getOtherUsersBySchoolId(id));
    }, [dispatch, id]);

    const initialFormData = {
        UserId: 'U_001',
        name: '',
        email: '',
        password: '',
        ProfilePicture: imageUrl,
        contact: '',
        userRole: '',
        status: 'Active',
        gender: '',
        salary: '',
        address: '',
        schoolId: id
    };

    const [formData, setFormData] = useState(initialFormData);

    const userGenderOptions = ['Male', 'Female', 'Other'];
    const userRoleOptions = ['Registrar', 'Principal', 'Accountant'];

    // Filter users based on search term
    const filteredUsers = Array.isArray(users)
        ? users.filter(user =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.UserId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userRole?.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    // Get current users for pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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
            day: 'numeric',
            // hour: '2-digit',
            // minute: '2-digit'
        });
    };

    // User form handlers
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
                    ProfilePicture: URL.createObjectURL(selectedFile)
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
            return response?.data?.result?.url;
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setIsImageLoading(false);
        }
    }

    const toggleDropdown = (dropdown) => {
        setDropdownOpen(prev => ({
            ...prev,
            [dropdown]: !prev[dropdown],
            ...(dropdown === 'userRole' ? { userGender: false } : {}),
            ...(dropdown === 'userGender' ? { userRole: false } : {})
        }));
    };

    const handleSelect = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Close the dropdown after selection
        setDropdownOpen({
            userGender: false,
            userRole: false
        });
    };

    // View/Edit modals
    const [selectedUser, setSelectedUser] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleCreateNewUser = async () => {
        const createOtherUserForm = {
            userName: formData.name,
            userEmail: formData.email,
            userPassword: formData.password,
            userRole: formData.userRole,
            profilePicture: imageUrl,
            status: "Active",
        };

        const result4 = await axios.post(
            "http://localhost:5000/api/v1/auth/dynamicRegisterUser/",
            createOtherUserForm
        );

        console.log(result4.data);
    }

    const handleUpdateUser = async () => {
        const updateData = {
            userName: formData.name,
            newEmail: formData.email,
            userPassword: formData.password,
            profilePicture: imageUrl,
            status: formData.status,
        };

        await dispatch(updateUserByEmail({ currentEmail: selectedUser.email, updateData }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let profilePictureUrl = formData.ProfilePicture;

            // If a new image was uploaded, upload it first
            if (imageFile && typeof formData.ProfilePicture === 'string' && formData.ProfilePicture.startsWith('blob:')) {
                profilePictureUrl = await uploadImage();
            }

            const userData = {
                ...formData,
                ProfilePicture: profilePictureUrl,
                schoolId: id
            };

            // Handle create
            dispatch(createOtherUser(userData));
            handleCreateNewUser();
            setShowAddUserModal(false);
            setFormData(initialFormData);
            setImageUrl("");
            toast.success("User created Successfully")

            if (showEditModal && selectedUser) {
                // Handle update
                handleUpdateUser();
                dispatch(updateOtherUser({ id: selectedUser._id, formData: userData }));
                setFormData(initialFormData);
                setImageUrl("");
                setShowEditModal(false);
                toast.success("User Updated Successfully")
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleDelete = async () => {
        try {
            if (selectedUser) {
                await dispatch(deleteOtherUser(selectedUser._id));
                setShowDeleteModal(false);
                toast.success('User deleted successfully');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete user');
        }
    };

    if (isLoading && !users.length) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700">Loading Users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="px-6 py-[19px] flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Manage Users
                    </h1>
                </div>
            </header>

            <main className="p-6">
                {/* Search and Add User */}
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative flex-grow max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users..."
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
                            setShowAddUserModal(true);
                            setFormData({ ...initialFormData, schoolId: id });
                            setImageUrl("");
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                        <FiPlus className="mr-2 h-4 w-4" />
                        Add New User
                    </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto hide-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User Info
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact No.
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Address
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joining Data
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentUsers.length > 0 ? (
                                    currentUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 overflow-hidden border-1 border-gray-400">
                                                        <img
                                                            src={user.ProfilePicture || 'https://via.placeholder.com/150'}
                                                            alt={user.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-xs text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                                                {user.UserId}
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                    {user.userRole}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                                                {user.contact}
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500 max-w-52 truncate">
                                                {user.address || 'N/A'}
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm text-gray-500">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-center">
                                                <p className={`px-0.5 py-1 text-xs font-medium rounded-full ${user.status === "Active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                    } border-none focus:ring-1 focus:ring-sky-500`}>{user.status}</p>
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center space-x-3">
                                                    <button
                                                        className="text-sky-600 hover:text-sky-900"
                                                        title="View"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowViewModal(true);
                                                        }}
                                                    >
                                                        <FiEye className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="Edit"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setFormData({
                                                                name: user.name,
                                                                email: user.email,
                                                                password: user.password,
                                                                ProfilePicture: user.ProfilePicture,
                                                                contact: user.contact,
                                                                userRole: user.userRole,
                                                                status: user.status,
                                                                gender: user.gender,
                                                                salary: user.salary,
                                                                address: user.address
                                                            });
                                                            setImageUrl(user.ProfilePicture);
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
                                        <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                            {searchTerm ? 'No users match your search' : 'No users found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length > 0 && (
                        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <div className="mb-3 sm:mb-0">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{' '}
                                    <span className="font-medium">{filteredUsers.length}</span> users
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

                {/* Add/Edit User Modal */}
                {(showAddUserModal || showEditModal) && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {showEditModal ? 'Edit User' : 'Add New User'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowAddUserModal(false);
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
                                                        {formData.ProfilePicture ? (
                                                            <>
                                                                <div className="h-20 w-20 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                                                                    <img
                                                                        src={formData.ProfilePicture}
                                                                        alt="Profile"
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData(prev => ({ ...prev, ProfilePicture: '' }));
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
                                                            name="ProfilePicture"
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

                                            {/* Full Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
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
                                                        name="email"
                                                        value={formData.email}
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
                                                        <Key className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                                                        placeholder="Set a password"
                                                        required
                                                    // required={!showEditModal}
                                                    />
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <MapPin className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <input
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                                                        placeholder="Enter full address"
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Professional Information */}
                                        <div className="space-y-4">
                                            <h3 className="text-md font-medium text-gray-700 pb-2 border-b border-gray-200">
                                                Professional Information
                                            </h3>

                                            {/* User Role */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">User Role *</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleDropdown('userRole')}
                                                        className={`flex items-center justify-between w-full px-3 py-2 text-sm border ${formData.userRole ? 'border-gray-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white text-left`}
                                                    >
                                                        <span className={formData.userRole ? 'text-gray-800' : 'text-gray-400'}>
                                                            {formData.userRole || 'Select Role'}
                                                        </span>
                                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen.userRole ? 'transform rotate-180' : ''}`} />
                                                    </button>
                                                    {dropdownOpen.userRole && (
                                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-md rounded-md py-1 border border-gray-200 max-h-60 overflow-auto">
                                                            {userRoleOptions.map(option => (
                                                                <div
                                                                    key={option}
                                                                    onClick={() => handleSelect('userRole', option)}
                                                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${formData.userRole === option ? 'bg-gray-50 text-sky-600' : 'text-gray-700'}`}
                                                                >
                                                                    {option}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Gender */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleDropdown('userGender')}
                                                        className={`flex items-center justify-between w-full px-3 py-2 text-sm border ${formData.gender ? 'border-gray-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white text-left`}
                                                    >
                                                        <span className={formData.gender ? 'text-gray-800' : 'text-gray-400'}>
                                                            {formData.gender || 'Select Gender'}
                                                        </span>
                                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen.userGender ? 'transform rotate-180' : ''}`} />
                                                    </button>
                                                    {dropdownOpen.userGender && (
                                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-md rounded-md py-1 border border-gray-200 max-h-60 overflow-auto">
                                                            {userGenderOptions.map(option => (
                                                                <div
                                                                    key={option}
                                                                    onClick={() => handleSelect('gender', option)}
                                                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${formData.gender === option ? 'bg-gray-50 text-sky-600' : 'text-gray-700'}`}
                                                                >
                                                                    {option}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
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
                                                        type="text"
                                                        name="salary"
                                                        value={formData.salary}
                                                        onChange={handleChange}
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                                                        placeholder="Enter salary"
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
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    {showEditModal ? 'Updating...' : 'Creating...'}
                                                </span>
                                            ) : showEditModal ? 'Update User' : 'Create User'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                            <div className="p-6">
                                <div className="flex items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <FiTrash2 className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Delete User
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* View User Modal */}
                {showViewModal && selectedUser && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">User Details</h3>
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Profile Picture and Basic Info */}
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden border border-gray-200">
                                            <img
                                                src={selectedUser.ProfilePicture || 'https://via.placeholder.com/150'}
                                                alt={selectedUser.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900">{selectedUser.name}</h4>
                                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                            <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                                {selectedUser.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* User Details */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="border-t border-gray-200 pt-4">
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">USER INFORMATION</h4>
                                            <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
                                                <div className="sm:col-span-1">
                                                    <dt className="text-sm font-medium text-gray-500">User ID</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedUser.UserId || 'N/A'}</dd>
                                                </div>
                                                <div className="sm:col-span-1">
                                                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedUser.userRole || 'N/A'}</dd>
                                                </div>
                                                <div className="sm:col-span-1">
                                                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedUser.gender || 'N/A'}</dd>
                                                </div>
                                                <div className="sm:col-span-1">
                                                    <dt className="text-sm font-medium text-gray-500">Contact</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{selectedUser.contact || 'N/A'}</dd>
                                                </div>
                                                <div className="sm:col-span-1">
                                                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {selectedUser.address || 'N/A'}
                                                    </dd>
                                                </div>
                                                <div className="sm:col-span-1">
                                                    <dt className="text-sm font-medium text-gray-500">Salary</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {selectedUser.salary ? `$${selectedUser.salary}` : 'N/A'}
                                                    </dd>
                                                </div>
                                                <div className="sm:col-span-1">
                                                    <dt className="text-sm font-medium text-gray-500">Joining Date</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {formatDate(selectedUser.createdAt)}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowViewModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}

export default AdminManageUsers_Page;