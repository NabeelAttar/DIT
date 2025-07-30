import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  // Mock data - in a real app, this would come from APIs
  const systemStats = {
    totalUsers: 1245,
    activeCourses: 48,
    openComplaints: 12,
    systemHealth: 98
  };

  const recentActivity = [
    {
      id: 1,
      action: 'New user registration',
      user: 'John Doe (Student)',
      timestamp: '2 minutes ago',
      type: 'user'
    },
    {
      id: 2,
      action: 'Complaint submitted',
      user: 'Jane Smith',
      timestamp: '15 minutes ago',
      type: 'complaint'
    },
    {
      id: 3,
      action: 'Course created',
      user: 'Prof. Johnson',
      timestamp: '1 hour ago',
      type: 'course'
    },
    {
      id: 4,
      action: 'Event published',
      user: 'Admin User',
      timestamp: '2 hours ago',
      type: 'event'
    }
  ];

  const departmentStats = [
    { name: 'Computer Science', students: 345, courses: 12 },
    { name: 'Information Technology', students: 287, courses: 10 },
    { name: 'Electronics', students: 234, courses: 8 },
    { name: 'Mechanical', students: 198, courses: 9 }
  ];

  const quickStats = [
    {
      name: 'Total Users',
      value: systemStats.totalUsers,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      href: '/users'
    },
    {
      name: 'Active Courses',
      value: systemStats.activeCourses,
      icon: BookOpenIcon,
      color: 'bg-green-500',
      href: '/courses'
    },
    {
      name: 'Open Complaints',
      value: systemStats.openComplaints,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      href: '/complaints'
    },
    {
      name: 'System Health',
      value: `${systemStats.systemHealth}%`,
      icon: ShieldCheckIcon,
      color: 'bg-emerald-500',
      href: '/system'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return UserPlusIcon;
      case 'complaint':
        return ExclamationTriangleIcon;
      case 'course':
        return BookOpenIcon;
      default:
        return DocumentChartBarIcon;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user':
        return 'text-green-600';
      case 'complaint':
        return 'text-red-600';
      case 'course':
        return 'text-blue-600';
      default:
        return 'text-purple-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-secondary-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 bg-secondary-50 rounded-lg"
                >
                  <Icon className={`h-5 w-5 mt-0.5 ${getActivityColor(activity.type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-secondary-500">{activity.user}</p>
                    <p className="text-xs text-secondary-400 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Overview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Department Overview</h3>
          <div className="space-y-3">
            {departmentStats.map((dept) => (
              <div
                key={dept.name}
                className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
              >
                <div>
                  <h4 className="text-sm font-medium text-secondary-900">{dept.name}</h4>
                  <p className="text-xs text-secondary-500">{dept.courses} courses</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-secondary-900">{dept.students}</p>
                  <p className="text-xs text-secondary-500">students</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Management */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">System Management</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            to="/users"
            className="flex flex-col items-center p-4 text-center bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <UserGroupIcon className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">Manage Users</span>
          </Link>
          <Link
            to="/courses"
            className="flex flex-col items-center p-4 text-center bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <BookOpenIcon className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">Manage Courses</span>
          </Link>
          <Link
            to="/complaints"
            className="flex flex-col items-center p-4 text-center bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <ExclamationTriangleIcon className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">Handle Complaints</span>
          </Link>
          <Link
            to="/system"
            className="flex flex-col items-center p-4 text-center bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <Cog6ToothIcon className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">System Settings</span>
          </Link>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">Analytics Overview</h3>
          <Link
            to="/analytics"
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            View detailed reports
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <ChartBarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-lg font-semibold text-blue-900">85%</p>
            <p className="text-sm text-blue-600">Course Completion Rate</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <UserGroupIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-semibold text-green-900">92%</p>
            <p className="text-sm text-green-600">Student Satisfaction</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <DocumentChartBarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-lg font-semibold text-purple-900">78%</p>
            <p className="text-sm text-purple-600">Assignment Submission Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;