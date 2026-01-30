import { Navigate, useLocation } from "react-router-dom";

const CheckAuth = ({ isAuthenticated, user, isInitialAuthCheckComplete, children }) => {
  const location = useLocation();
  const userRole = user?.userRole;

  // Show loading state while auth check is in progress
  // if (!isInitialAuthCheckComplete) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //       <div className="text-center">
  //         <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
  //         <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Handle root path redirect
  // if (location.pathname === "/") {
  //   if (!isAuthenticated) {
  //     return <Navigate to="/auth/login" />;
  //   } else {
  //     if (userRole === "Super_Admin") {
  //       return <Navigate to="/superAdmin/dashboard" />;
  //     } else if (userRole === "Admin") {
  //       return <Navigate to="/admin/onboarding" />;
  //     } else if (userRole === "Principal") {
  //       return <Navigate to="/principal" />;
  //     } else if (userRole === "Teacher") {
  //       return <Navigate to="/teacher" />;
  //     } else if (userRole === "Registrar") {
  //       return <Navigate to="/registrar" />;
  //     } else if (userRole === "Student") {
  //       return <Navigate to="/student" />;
  //     } else if (userRole === "Accountant") {
  //       return <Navigate to="/accountant" />;
  //     } else if (userRole === "Parent") {
  //       return <Navigate to="/parent" />;
  //     } else {
  //       return <Navigate to="/auth/login" />;
  //     }
  //   }
  // }

  // Prevent authenticated users from accessing auth routes
  // if (
  //   isAuthenticated &&
  //   (location.pathname.includes("/auth/login") ||
  //     location.pathname.includes("/auth/register"))
  // ) {
  //   if (userRole === "Super_Admin") {
  //     return <Navigate to="/superAdmin/dashboard" />;
  //   } else if (userRole === "Admin") {
  //     return <Navigate to="/admin/onboarding" />;
  //   } else if (userRole === "Principal") {
  //     return <Navigate to="/principal" />;
  //   } else if (userRole === "Teacher") {
  //     return <Navigate to="/teacher" />;
  //   } else if (userRole === "Registrar") {
  //     return <Navigate to="/registrar" />;
  //   } else if (userRole === "Student") {
  //     return <Navigate to="/student" />;
  //   } else if (userRole === "Accountant") {
  //     return <Navigate to="/accountant" />;
  //   } else if (userRole === "Parent") {
  //     return <Navigate to="/parent" />;
  //   }
  // }

  // Prevent unauthenticated users from accessing protected routes
  // if (
  //   !isAuthenticated &&
  //   !location.pathname.includes("/auth")
  // ) {
  //   return <Navigate to="/auth/login" />;
  // }

  // Role-based route protection
  // if (isAuthenticated) {
  //   // Super Admin can only access super admin routes
  //   if (userRole === "Super_Admin" && !location.pathname.includes("superAdmin")) {
  //     return <Navigate to="/superAdmin/dashboard" />;
  //   }

  //   // Admin can only access admin routes
  //   if (userRole === "Admin" && !location.pathname.includes("admin")) {
  //     return <Navigate to="/admin/onboarding" />;
  //   }

  //   // Principal can only access principal routes
  //   if (userRole === "Principal" && !location.pathname.includes("principal")) {
  //     return <Navigate to="/principal" />;
  //   }

  //   // Teacher can only access teacher routes
  //   if (userRole === "Teacher" && !location.pathname.includes("teacher")) {
  //     return <Navigate to="/teacher" />;
  //   }

  //   // Registrar can only access registrar routes
  //   if (userRole === "Registrar" && !location.pathname.includes("registrar")) {
  //     return <Navigate to="/registrar" />;
  //   }

  //   // Student can only access student routes
  //   if (userRole === "Student" && !location.pathname.includes("student")) {
  //     return <Navigate to="/student" />;
  //   }

  //   // Accountant can only access accountant routes
  //   if (userRole === "Accountant" && !location.pathname.includes("accountant")) {
  //     return <Navigate to="/accountant" />;
  //   }

  //   // Parent can only access parent routes
  //   if (userRole === "Parent" && !location.pathname.includes("parent")) {
  //     return <Navigate to="/parent" />;
  //   }
  // }

  return <>{children}</>;
};

export default CheckAuth;

// =================== > Dynamic

// import React from "react";
// import { Navigate, useLocation } from "react-router-dom";

// const CheckAuth = ({ isAuthenticated, user, children }) => {
//   const location = useLocation();

//   // Define role-based redirect paths
//   const rolePaths = {
//     "Super_Admin": "/superAdmin",
//     "Admin": "/admin",
//     "Principal": "/administrator", // Assuming Principal uses administrator route
//     "Teacher": "/teacher",
//     "Administrator": "/administrator",
//     "Student": "/student",
//     "Accountant": "/accountant",
//     "Parent": "/parent"
//   };

//   // Handle root path redirect
//   if (location.pathname === "/") {
//     if (!isAuthenticated) {
//       return <Navigate to="/auth/login" />;
//     } else {
//       const redirectPath = rolePaths[user?.userRole] || "/auth/login";
//       return <Navigate to={redirectPath} />;
//     }
//   }

//   // Protect auth routes when authenticated
//   if (
//     isAuthenticated &&
//     location.pathname.startsWith("/auth")
//   ) {
//     const redirectPath = rolePaths[user?.userRole] || "/auth/login";
//     return <Navigate to={redirectPath} />;
//   }

//   // Protect against unauthenticated access
//   if (
//     !isAuthenticated &&
//     !location.pathname.startsWith("/auth")
//   ) {
//     return <Navigate to="/auth/login" />;
//   }

//   // Check role-based access for protected routes
//   if (isAuthenticated) {
//     const userRole = user?.userRole;
//     const currentPath = location.pathname;

//     // Check if user is trying to access a role-specific path without proper role
//     for (const [role, path] of Object.entries(rolePaths)) {
//       if (currentPath.startsWith(path) && userRole !== role) {
//         const redirectPath = rolePaths[userRole] || "/auth/login";
//         return <Navigate to={redirectPath} />;
//       }
//     }
//   }

//   return <>{children}</>;
// };

// export default CheckAuth;
