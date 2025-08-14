import { ChevronDown, ChevronLeft, ChevronRight, ClipboardList, GraduationCap, LayoutDashboard, LogOut, MapPin, Menu, Settings, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthUser, logOutUser } from '../../store/Auth-Slicer/Auth-Slicer';
import { toast } from 'react-toastify';
import { FaUserShield } from 'react-icons/fa';

const SuperAdminDashboardLayout = () => {
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
      path: "/superAdmin/dashboard"
    },
    {
      name: "SystemManagement",
      icon: Settings,
      label: "System Management",
      path: "/superAdmin/system",
      subItems: [
        { label: "Schools", path: "/superAdmin/system/schools" },
        { label: "Users", path: "/superAdmin/system/users" },
        { label: "Roles", path: "/superAdmin/system/roles" }
      ]
    },
    {
      name: "AuditLogs",
      icon: ClipboardList,
      label: "Audit Logs",
      path: "/superAdmin/auditLogs"
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

          {/* Simple & Elegant Super Admin Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center">
              {/* Minimalist Icon */}
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 text-sky-600"
                >
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
              </div>

              {/* App Name & Description - Only shows when sidebar is open */}
              {sidebarOpen && (
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-gray-800">Manage Together</h1>
                  <p className="text-xs text-gray-400">Super Admin Dashboard</p>
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
                  <div className="relative h-9 w-9 rounded-full bg-sky-600 flex items-center justify-center border-2 border-white shadow-sm text-white">
                    <FaUserShield className="text-sm" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium text-slate-900">{user?.userName}</span>
                    <span className="text-[11px] text-slate-500">{user?.userRole == "Super_Admin" ? "Super Admin" : "Unknown"}</span>
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

export default SuperAdminDashboardLayout;
