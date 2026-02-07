import { Bell, BookOpen, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, GraduationCap, LayoutDashboard, LogOut, MapPin, Menu, MessageSquare, UserCheck, Users, X } from 'lucide-react';
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

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.auth
  );

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

  // If user is inactive, don't render any dashboard content
  if (user?.status === 'Inactive') {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="shrink-0">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Account Status</h3>
                  <p className="text-sm text-slate-500">currently unavailable</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-5">
              <div className="space-y-5">
                {/* Status Icon */}
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                    <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                </div>

                {/* Message */}
                <div className="text-center space-y-3">
                  <h4 className="text-lg font-medium text-slate-800">Account Not Active</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Your teacher account is currently inactive. This means you cannot access the attendance management features.
                  </p>
                </div>

                {/* Contact Section */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <svg className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-slate-600">
                        Please contact the school administration to resolve this matter.
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <svg className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">CONTACT EMAIL</p>
                          <a
                            href="mailto:m.ahmedofficial555@gmail.com"
                            className="text-sky-600 hover:text-sky-700 text-sm font-medium hover:underline transition-colors"
                          >
                            m.ahmedofficial555@gmail.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50/50 rounded-b-xl border-t border-slate-100">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseInactiveModal}
                  className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                  Return to Login
                </button>
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
                  // <p className='text-2xl'>DAILY MARK</p>
                ) :
                  <img
                    src="https://repository-images.githubusercontent.com/266040586/ea7a9500-cd19-11ea-9ec9-c7a5474b81af"
                    // src="https://www.shutterstock.com/image-vector/effective-teamwork-icon-black-thin-600nw-2227180861.jpg"
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
                      <Icon className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0" />
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
                          <Icon className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0" />
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
              <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-150">
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
            ) : (
              <div className="flex justify-center">
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
    </div>
  );
};

export default TeacherDashboardLayout;