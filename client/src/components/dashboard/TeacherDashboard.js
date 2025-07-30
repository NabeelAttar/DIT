import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  PlusIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const TeacherDashboard = () => {
  // Mock data - in a real app, this would come from APIs
  const stats = {
    activeCourses: 4,
    totalStudents: 120,
    pendingGrading: 8,
    upcomingClasses: 3
  };

  const recentSubmissions = [
    {
      id: 1,
      student: 'John Doe',
      assignment: 'Data Structures Lab 3',
      course: 'CS 201',
      submittedAt: '2024-01-14',
      status: 'pending'
    },
    {
      id: 2,
      student: 'Jane Smith',
      assignment: 'Algorithm Analysis',
      course: 'CS 202',
      submittedAt: '2024-01-14',
      status: 'graded'
    },
    {
      id: 3,
      student: 'Mike Johnson',
      assignment: 'Database Design',
      course: 'CS 301',
      submittedAt: '2024-01-13',
      status: 'pending'
    }
  ];

  const myCourses = [
    {
      id: 1,
      title: 'Data Structures',
      code: 'CS 201',
      students: 35,
      schedule: 'Mon, Wed, Fri 10:00 AM'
    },
    {
      id: 2,
      title: 'Algorithms',
      code: 'CS 202',
      students: 30,
      schedule: 'Tue, Thu 2:00 PM'
    },
    {
      id: 3,
      title: 'Database Systems',
      code: 'CS 301',
      students: 28,
      schedule: 'Mon, Wed 3:00 PM'
    }
  ];

  const quickStats = [
    {
      name: 'Active Courses',
      value: stats.activeCourses,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      href: '/courses'
    },
    {
      name: 'Total Students',
      value: stats.totalStudents,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      href: '/courses'
    },
    {
      name: 'Pending Grading',
      value: stats.pendingGrading,
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-yellow-500',
      href: '/assignments'
    },
    {
      name: 'Upcoming Classes',
      value: stats.upcomingClasses,
      icon: CalendarDaysIcon,
      color: 'bg-purple-500',
      href: '/events'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="card card-hover group"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-secondary-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Submissions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Recent Submissions</h3>
            <Link
              to="/assignments"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">
                    {submission.assignment}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {submission.student} • {submission.course}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-secondary-500">
                    {submission.submittedAt}
                  </span>
                  <span
                    className={`badge ${
                      submission.status === 'graded'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}
                  >
                    {submission.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Courses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">My Courses</h3>
            <Link
              to="/courses"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {myCourses.map((course) => (
              <div
                key={course.id}
                className="p-3 bg-secondary-50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900">
                      {course.title} ({course.code})
                    </h4>
                    <p className="text-xs text-secondary-500 mt-1">{course.schedule}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-secondary-900">{course.students}</p>
                    <p className="text-xs text-secondary-500">students</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            to="/courses"
            className="flex flex-col items-center p-4 text-center bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <PlusIcon className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">Create Course</span>
          </Link>
          <Link
            to="/assignments"
            className="flex flex-col items-center p-4 text-center bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <DocumentTextIcon className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">New Assignment</span>
          </Link>
          <Link
            to="/events"
            className="flex flex-col items-center p-4 text-center bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <CalendarDaysIcon className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">Schedule Event</span>
          </Link>
          <Link
            to="/assignments"
            className="flex flex-col items-center p-4 text-center bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <ClipboardDocumentCheckIcon className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">Grade Submissions</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;