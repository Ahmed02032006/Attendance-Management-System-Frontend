import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Users,
  MapPin,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Parentheses,
  CreditCard,
  User
} from "lucide-react";
import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthUser, logOutUser } from '../../store/Auth-Slicer/Auth-Slicer';
import { toast } from 'react-toastify';
import { getSchoolsById, setCurrentSchoolId } from '../../store/Admin-Slicer/Admin-School-Slicer';

const AdminDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const dispatch = useDispatch();

  // Define routes where school fetching should be skipped
  const skipFetchRoutes = [
    '/admin/onboarding',
    '/admin/contactSupport',
    '/admin/createSchool'
  ];

  // Check if current route should skip school fetching
  const shouldSkipFetch = skipFetchRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  // Define routes where sidebar should be hidden (if still needed)
  const hideSidebarRoutes = [...skipFetchRoutes]; // Can reuse or customize
  const shouldHideSidebar = hideSidebarRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  const { currentSchoolId } = useSelector(state => state.adminSchool);
  const schoolId = sessionStorage.getItem("currentSchoolId");
  const effectiveId = id || currentSchoolId || schoolId;

  const fetchSchoolById = (id) => {
    if (shouldSkipFetch) return; // Early return if on excluded route

    dispatch(getSchoolsById(id))
      .then((res) => {
        if (res.payload?.status === "Error") {
          toast.error(res.payload.message);
          console.log("======================================");
        }
      })
      .catch((err) => {
        console.log(err.message);
        toast.error("An unexpected error occurred.");
        console.log("======================================");
      });
  };

  // Effect for when ID changes
  useEffect(() => {
    if (id && !shouldSkipFetch) {
      dispatch(setCurrentSchoolId(id));
      fetchSchoolById(id);
      sessionStorage.setItem("currentSchoolId", id);
    }
  }, [id, dispatch, shouldSkipFetch]);

  // Effect for initial load when no currentSchoolId
  useEffect(() => {
    if (!currentSchoolId && !shouldSkipFetch && schoolId) {
      fetchSchoolById(schoolId);
      dispatch(setCurrentSchoolId(schoolId));
    }
  }, [currentSchoolId, dispatch, shouldSkipFetch, schoolId]);

  const { isSchoolLoading, specificSchool } = useSelector((state) => state.adminSchool);
  const { user } = useSelector((state) => state.auth);

  // Auth check effect
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
        sessionStorage.removeItem("currentSchoolId");
      })
      .catch((err) => {
        toast.error(err.message || "Logout failed");
      });
  };

  const tabs = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      path: `/admin/dashboard/${effectiveId}`
    },
    {
      name: "ManageTeachers",
      icon: GraduationCap,
      label: "Teachers",
      path: "/admin/teachers",
      subItems: [
        { label: "All Teachers", path: "/admin/teachers/manage" },
        { label: "Attendance", path: "/admin/teachers/attendance" }
      ]
    },
    {
      name: "ManageStudents",
      icon: Users,
      label: "Students",
      path: "/admin/students",
      subItems: [
        { label: "All Students", path: "/admin/students/manage" },
        { label: "Admissions", path: "/admin/students/admissions" },
        { label: "Attendance", path: "/admin/students/attendance" }
      ]
    },
    {
      name: "ManageParent",
      icon: Parentheses,
      label: "Parents",
      path: "/admin/parents",
      subItems: [
        { label: "All Parents", path: "/admin/parents/manage" },
      ]
    },
    {
      name: "Academic",
      icon: BookOpen,
      label: "Academic",
      path: "/admin/academic",
      subItems: [
        { label: "Classes", path: "/admin/academic/classes" },
        { label: "Subjects", path: "/admin/academic/subjects" },
        { label: "Timetable", path: "/admin/academic/timetable" }
      ]
    },
    {
      name: "Finance",
      icon: CreditCard,
      label: "Finance",
      path: "/admin/finance",
      subItems: [
        { label: "Payments", path: "/admin/finance/payments" }
      ]
    }
  ];

  if (isSchoolLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Only show mobile menu button if sidebar should be visible */}
      {!shouldHideSidebar && (
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
      )}

      {/* Sidebar Container - only render if not on hidden routes */}
      {!shouldHideSidebar && (
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
                    src={specificSchool?.schoolLogo}
                    alt="CampusTrack X Logo"
                    className={`rounded-md object-cover transition-transform duration-300 hover:scale-105 ${sidebarOpen ? 'h-9 w-9' : 'h-9.5 w-9'}`}
                  />
                </div>
                {sidebarOpen && (
                  <div className="truncate ml-3">
                    <h2 className="font-medium text-slate-900 text-sm">{specificSchool?.schoolName}</h2>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="h-3 w-3 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{specificSchool?.address}</span>
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
                        src={user?.profilePicture}
                        alt="User Avatar"
                        className="h-9 w-9 rounded-full object-contain border-1 border-gray-400"
                      />
                      <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium text-slate-900">{user?.userName}</span>
                      <span className="text-[11px] text-slate-500">{user?.userRole == "Admin" ? "School Owner" : "Unknown"}</span>
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
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-x-hidden ${shouldHideSidebar ? 'ml-0' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboardLayout;