import React from 'react';
import {
  FiUsers,
  FiShield,
  FiBook,
  FiActivity,
  FiTrendingUp,
  FiAlertCircle,
  FiCalendar,
  FiPlus,
  FiSearch
} from 'react-icons/fi';

const SuperAdminDashboard_Page = () => {
  // Sample data - replace with real data from your backend
  const stats = [
    { title: "Total Schools", value: "24", change: "+3", icon: <FiBook className="h-6 w-6" />, color: "bg-indigo-100 text-indigo-600", link: "/schools" },
    { title: "Active Users", value: "1,842", change: "+12%", icon: <FiUsers className="h-6 w-6" />, color: "bg-green-100 text-green-600", link: "/users" },
    { title: "System Roles", value: "8", change: "0", icon: <FiShield className="h-6 w-6" />, color: "bg-purple-100 text-purple-600", link: "/roles" },
    { title: "Audit Logs", value: "3,456", change: "+124", icon: <FiActivity className="h-6 w-6" />, color: "bg-amber-100 text-amber-600", link: "/audit-logs" }
  ];

  const recentActivities = [
    { id: 1, action: "Created new school", user: "admin@example.com", time: "2 mins ago", status: "completed" },
    { id: 2, action: "Updated user permissions", user: "admin@example.com", time: "15 mins ago", status: "completed" },
    { id: 3, action: "Deleted inactive user", user: "admin@example.com", time: "1 hour ago", status: "completed" },
    { id: 4, action: "System maintenance", user: "system", time: "3 hours ago", status: "pending" }
  ];

  const quickActions = [
    { title: "Add New School", icon: <FiPlus className="h-5 w-5" />, link: "/schools/add" },
    { title: "Create User", icon: <FiPlus className="h-5 w-5" />, link: "/users/add" },
    { title: "Configure Roles", icon: <FiShield className="h-5 w-5" />, link: "/roles/edit" },
    { title: "View Reports", icon: <FiActivity className="h-5 w-5" />, link: "/reports" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-[18px] flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-800">
            Super Admin Dashboard
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        {/* Stats Cards */}
        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 hover:border-sky-200 transition-colors duration-200 cursor-pointer group"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-20`}>
                    {React.cloneElement(stat.icon, { className: "h-5 w-5" })}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                    {stat.change}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-gray-800">{stat.value}</h3>
                  <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 group-hover:border-sky-100 transition-colors">
                  <div className="flex items-center text-xs text-sky-600 font-medium">
                    View details
                    <svg
                      className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activities and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
              <button className="text-sm font-medium text-sky-600 hover:text-sky-700">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className={`p-2 rounded-lg ${activity.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    <FiActivity className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">by {activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sky-300 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-sky-100 text-sky-600 mr-3">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default SuperAdminDashboard_Page;