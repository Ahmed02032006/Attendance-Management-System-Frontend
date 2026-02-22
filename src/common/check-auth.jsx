import { Navigate, useLocation } from "react-router-dom";

const CheckAuth = ({ isAuthenticated, user, isInitialAuthCheckComplete, children }) => {
  const location = useLocation();
  const userRole = user?.userRole;

  // Show loading state while auth check is in progress
  if (!isInitialAuthCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          {/* <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p> */}
        </div>
      </div>
    );
  }

  // Handle root path redirect
  if (location.pathname === "/") {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" />;
    } else {
      if (userRole === "Admin") {
        return <Navigate to="/admin" />;
      } else if (userRole === "Teacher") {
        return <Navigate to="/teacher" />;
      } else {
        return <Navigate to="/auth/login" />;
      }
    }
  }

  // Prevent authenticated users from accessing auth routes
  if (
    isAuthenticated &&
    (location.pathname.includes("/auth/login") ||
      location.pathname.includes("/auth/register"))
  ) {
    if (userRole === "Admin") {
      return <Navigate to="/admin" />;
    } else if (userRole === "Teacher") {
      return <Navigate to="/teacher" />;
    }
  }

  // Prevent unauthenticated users from accessing protected routes
  if (
    !isAuthenticated &&
    !location.pathname.includes("/auth")
  ) {
    return <Navigate to="/auth/login" />;
  }

  // Role-based route protection
  if (isAuthenticated) {

    // Admin can only access admin routes
    if (userRole === "Admin" && !location.pathname.includes("admin")) {
      return <Navigate to="/admin" />;
    }

    // Teacher can only access teacher routes
    if (userRole === "Teacher" && !location.pathname.includes("teacher")) {
      return <Navigate to="/teacher" />;
    }
  }

  return <>{children}</>;
};

export default CheckAuth;
