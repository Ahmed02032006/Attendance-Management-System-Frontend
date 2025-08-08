import { CalendarCheck, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, GraduationCap, LayoutDashboard, LogOut, MapPin, Menu, UserCheck, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthUser, logOutUser } from '../../store/Auth-Slicer/Auth-Slicer';
import { toast } from 'react-toastify';

const StudentDasboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { 
      name: "Dashboard", 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      path: "/student/dashboard" 
    },
    {
      name: "Timetable",
      icon: CalendarCheck,
      label: "Timetable",
      path: "/student/timetable"
    },
    {
      name: "Exams",
      icon: ClipboardList,
      label: "Exams",
      path: "/student/exams"
    },
    {
      name: "Attendance",
      icon: UserCheck,
      label: "Attendance",
      path: "/student/attendance"
    }
  ];

  const handleOnLogOut = (e) => {
    e.preventDefault();
    dispatch(logOutUser())
      .then(() => {
        toast.success("User logged out successfully");
      })
      .catch((err) => {
        toast.error(err.message || "Logout failed");
      });
  }

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

  const { isLoading, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthUser());
  }, [dispatch]);

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
            className="absolute -right-3 top-6 z-50 hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* School Header */}
          <div className="p-4 border-b border-slate-200 w-full bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0 rounded-md">
                <img
                  src="https://smpublic.edu.pk/wp-content/uploads/2021/03/Original-illustrator-file-01.webp"
                  alt="CampusTrack X Logo"
                  className={`rounded-md object-cover transition-transform duration-300 hover:scale-105 ${sidebarOpen ? 'h-9 w-9' : 'h-8 w-8'}`}
                />
              </div>
              {sidebarOpen && (
                <div className="truncate ml-3">
                  <h2 className="font-medium text-slate-900 text-sm">SM Public Academy</h2>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin className="h-3 w-3 flex-shrink-0 text-slate-400" />
                    <span className="truncate">Gulshan-e-Iqbal, Karachi</span>
                  </div>
                </div>
              )}
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
                    <div className={`p-1.5 rounded-md ${isActive(path) ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-600'}`}>
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
                        <div className={`p-1.5 rounded-md ${isActive(path) ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-600'}`}>
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
                    <img
                      src="https://i.pravatar.cc/40?img=1"
                      alt="User Avatar"
                      className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium text-slate-900">{user.userName}</span>
                    <span className="text-[11px] text-slate-500">{user.userRole}</span>
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

       {/* Main Content Area - Unchanged */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentDasboardLayout;
