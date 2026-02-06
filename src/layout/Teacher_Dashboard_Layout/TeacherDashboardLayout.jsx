import { Bell, BookOpen, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, GraduationCap, LayoutDashboard, LogOut, MapPin, Menu, MessageSquare, UserCheck, Users, X, Camera } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthUser, logOutUser } from '../../store/Auth-Slicer/Auth-Slicer';
import { toast } from 'react-toastify';

const TeacherDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    profilePicture: '',
    userName: '',
    userEmail: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.auth
  );

  // Initialize profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        profilePicture: user.profilePicture || '',
        userName: user.userName || '',
        userEmail: user.userEmail || ''
      });
    }
  }, [user]);

  // Format email to show ... after @
  const formatEmail = (email) => {
    if (!email) return '';
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return email;

    const username = email.substring(0, atIndex);
    const domain = email.substring(atIndex);

    // Show first 3 characters of username + ... + @ + domain
    return `${username.substring(0, 3)}...${domain}`;
  };

  // Function to get user's first letter capitalized
  const getInitial = () => {
    if (!user?.userName) return 'U';
    return user.userName.charAt(0).toUpperCase();
  };

  // Function to check if user has profile picture
  const hasProfilePicture = () => {
    return user?.profilePicture && user.profilePicture.trim() !== '';
  };

  // Check if user is inactive and show modal
  useEffect(() => {
    if (user?.status === 'Inactive') {
      setShowInactiveModal(true);
    }
  }, [user]);

  const tabs = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/teacher/dashboard"
    },
    {
      name: "MySubjects",
      icon: BookOpen,
      label: "My Subjects",
      path: "/teacher/subject"
    },
    {
      name: "Attendance",
      icon: UserCheck,
      label: "Attendance",
      path: "/teacher/attendance"
    },
  ];

  useEffect(() => {
    dispatch(checkAuthUser());
  }, [dispatch]);

  const toggleSubItems = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleOnLogOut = (e) => {
    e.preventDefault();
    dispatch(logOutUser())
      .then(() => {
        toast.success("User logged out successfully");
      })
      .catch((err) => {
        toast.error(err.message || "Logout failed");
      });
  };

  const handleCloseInactiveModal = () => {
    setShowInactiveModal(false);
    // Log out the user immediately when they close the modal
    handleOnLogOut({ preventDefault: () => { } });
  };

  const handleProfileClick = () => {
    setShowEditProfileModal(true);
  };

  const handleCloseEditProfileModal = () => {
    setShowEditProfileModal(false);
    // Reset to original user data when closing
    if (user) {
      setProfileData({
        profilePicture: user.profilePicture || '',
        userName: user.userName || '',
        userEmail: user.userEmail || ''
      });
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, we'll just use a URL for the selected file
      // In a real app, you would upload this to your server
      const imageUrl = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        profilePicture: imageUrl
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!profileData.userName.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      // Log the entire profile data object
      console.log('Full Profile Data:', profileData);

      // Show success message
      toast.success("Profile updated successfully!");

      // Close the modal
      setShowEditProfileModal(false);

      // Note: In a real app, you would update the Redux store with new user data
      // and possibly refresh the user data from the server

    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  // If user is inactive, don't render any dashboard content
  if (user?.status === 'Inactive') {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 items-center justify-center p-4">
        {/* Inactive User Modal - Enhanced Design */}
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200">
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm">
                  <X className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Account Suspended</h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="text-center space-y-6">
                {/* Warning Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                      <div className="h-16 w-16 rounded-full bg-red-200 flex items-center justify-center">
                        <X className="h-10 w-10 text-red-600" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center animate-bounce">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Inactive</h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-red-600 mx-auto rounded-full"></div>
                </div>

                {/* Message */}
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Your account has been <span className="font-semibold text-red-600">temporarily suspended</span> and you are unable to access the portal at this time.
                  </p>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          This action was taken by the system administrator. Please contact support for assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-500">Contact Support</p>
                      <a
                        href="mailto:m.ahmedofficial555@gmail.com"
                        className="text-blue-600 hover:text-blue-800 font-medium text-lg hover:underline transition-colors"
                      >
                        m.ahmedofficial555@gmail.com
                      </a>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Send an email to the above address with your account details for quick resolution.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleCloseInactiveModal}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                  >
                    Return to Login
                  </button>
                  <a
                    href="mailto:m.ahmedofficial555@gmail.com?subject=Account Reactivation Request&body=Hello,%0D%0A%0D%0AI would like to request reactivation of my account.%0D%0A%0D%0AAccount Details:%0D%%0D%0A- Name: %0D%0A- Email: %0D%0A%0D%0AThank you."
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-center"
                  >
                    Contact Support
                  </a>
                </div>

                {/* Additional Help */}
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Need immediate assistance? Include your account details in the email for faster processing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md bg-slate-600 text-white shadow-md"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={`${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
				md:translate-x-0 fixed md:relative inset-y-0 left-0 z-40 transition-transform duration-300
				${sidebarOpen ? 'w-64' : 'w-20'}`}>

        {/* Sidebar with toggle button */}
        <aside
          className={`h-full bg-white text-slate-800 flex flex-col border-r border-slate-200`}
        >
          {/* Desktop Toggle Button */}
          <button
            onClick={handleSidebarToggle}
            className="absolute -right-3 top-7 z-50 hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* ======================================================== */}
          <div className='bg-gradient-to-b to-sky-300 from-sky-600 h-4 rounded-bl-full'></div>
          {/* ======================================================== */}

          {/* School Header */}
          <div className="py-[9px] border-b border-slate-200 w-full bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-center">
              {
                sidebarOpen ? (
                  <p className='text-2xl'>TRACK EASE</p>
                ) :
                  <img
                    src="https://repository-images.githubusercontent.com/266040586/ea7a9500-cd19-11ea-9ec9-c7a5474b81af"
                    alt="CampusTrack X Logo"
                    className={`rounded-md object-cover border border-gray-200 w-14 h-8`}
                  />
              }
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {tabs.map(({ name, icon: Icon, label, path, subItems }) => (
              <div key={name}>
                {!subItems ? (
                  <button
                    onClick={() => {
                      navigate(path);
                      setMobileMenuOpen(false);
                    }}
                    className={`group relative cursor-pointer flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} w-full p-2 rounded-sm transition-all duration-200
											${isActive(path)
                        ? "text-slate-700 font-medium bg-slate-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-600"
                      }`}
                  >
                    <div className={`relative p-1.5 rounded-md ${isActive(path) ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-600'}`}>
                      <Icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                    </div>
                    {sidebarOpen && (
                      <span className={`ml-3 text-sm ${isActive(path) ? 'text-slate-700' : 'text-slate-600'}`}>{label}</span>
                    )}
                  </button>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleSubItems(name)}
                      className={`group relative cursor-pointer flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} w-full p-2 rounded-sm transition-all duration-200
												${isActive(path)
                          ? "text-slate-700 font-medium bg-slate-200"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-600"
                        }`}
                    >
                      <div className="flex items-center">
                        <div className={`relative p-1.5 rounded-md ${isActive(path) ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-600'}`}>
                          <Icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                        </div>
                        {sidebarOpen && (
                          <span className={`ml-3 text-sm ${isActive(path) ? 'text-slate-700' : 'text-slate-600'}`}>{label}</span>
                        )}
                      </div>
                      {sidebarOpen && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${expandedItems[name] ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>

                    {expandedItems[name] && sidebarOpen && (
                      <div className="ml-4 mt-1 mb-2 space-y-1">
                        {subItems.map((subItem) => (
                          <button
                            key={subItem.path}
                            onClick={() => {
                              navigate(subItem.path);
                              setMobileMenuOpen(false);
                            }}
                            className={`
															w-full text-left py-2 px-4 text-sm rounded transition-all duration-200
															${isActive(subItem.path)
                                ? "bg-slate-200 text-slate-800 font-medium"
                                : "text-slate-600 hover:bg-slate-100"
                              }
														`}
                          >
                            <div className="flex items-center">
                              <ChevronRight className={`w-3 h-3 mr-2 ${isActive(subItem.path) ? 'text-slate-700' : 'text-slate-500'}`} />
                              {subItem.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/50">
            {sidebarOpen ? (
              <div className="px-2 py-1.5">
                <div
                  className="flex items-center justify-between rounded-lg hover:bg-slate-100 transition-colors duration-150 cursor-pointer"
                  onClick={handleProfileClick}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="relative">
                      {hasProfilePicture() ? (
                        // Show profile picture if exists
                        <>
                          <img
                            src={user.profilePicture}
                            alt="User Avatar"
                            className="h-9 w-9 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                          />
                          <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                        </>
                      ) : (
                        // Show fallback avatar with background color and initial
                        <div className="h-9 w-9 rounded-full bg-sky-500 flex items-center justify-center border-2 border-gray-200 shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {getInitial()}
                          </span>
                          <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[13px] font-medium text-slate-900">{user.userName}</span>
                      <span className="text-[11px] text-slate-500" title={user.userEmail}>
                        {formatEmail(user.userEmail)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-red-500 transition-colors duration-200"
                    title="Logout"
                    onClick={(e) => handleOnLogOut(e)}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div
                  className="relative cursor-pointer"
                  onClick={handleProfileClick}
                >
                  {hasProfilePicture() ? (
                    // Show profile picture thumbnail in collapsed sidebar
                    <div className="relative">
                      <img
                        src={user.profilePicture}
                        alt="User Avatar"
                        className="h-9 w-9 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                      />
                      <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                    </div>
                  ) : (
                    // Show fallback avatar in collapsed sidebar
                    <div className="h-9 w-9 rounded-full bg-sky-500 flex items-center justify-center border-2 border-gray-200 shadow-sm">
                      <span className="text-white font-semibold text-sm">
                        {getInitial()}
                      </span>
                      <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                    </div>
                  )}
                </div>
                <button
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-red-500 transition-colors duration-200"
                  title="Logout"
                  onClick={(e) => handleOnLogOut(e)}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Edit Profile</h2>
              <button
                onClick={handleCloseEditProfileModal}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSaveProfile} className="p-5">
              {/* Profile Picture Upload - Compact */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {profileData.profilePicture ? (
                      <img
                        src={profileData.profilePicture}
                        alt="Profile"
                        className="h-16 w-16 rounded-full object-cover border-2 border-slate-200"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-sky-500 flex items-center justify-center border-2 border-slate-200">
                        <span className="text-white text-xl font-semibold">
                          {profileData.userName ? profileData.userName.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    )}
                    <label
                      htmlFor="profile-picture-upload"
                      className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow border border-slate-300 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-600" />
                    </label>
                    <input
                      id="profile-picture-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Click the camera icon to change picture</p>
                    <p className="text-xs text-slate-500">JPG, PNG or GIF (Max. 2MB)</p>
                  </div>
                </div>
              </div>

              {/* Name Field */}
              <div className="mb-5">
                <label htmlFor="userName" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={profileData.userName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Display (Read-only) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-600">
                  {user?.userEmail || 'No email available'}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Email cannot be changed
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEditProfileModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboardLayout;