import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  // Mock data - in a real app, this would come from APIs
  const stats = {
    enrolledCourses: 6,
    pendingAssignments: 3,
    upcomingEvents: 2,
    completedAssignments: 24
  };

  const recentAssignments = [
    {
      id: 1,
      title: 'Data Structures Assignment 3',
      course: 'CS 201',
      dueDate: '2024-01-15',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Database Design Project',
      course: 'CS 301',
      dueDate: '2024-01-18',
      status: 'submitted'
    },
    {
      id: 3,
      title: 'Algorithm Analysis Report',
      course: 'CS 202',
      dueDate: '2024-01-20',
      status: 'pending'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Tech Talk: AI in Healthcare',
      date: '2024-01-16',
      time: '2:00 PM',
      location: 'Auditorium A'
    },
    {
      id: 2,
      title: 'Career Fair 2024',
      date: '2024-01-22',
      time: '10:00 AM',
      location: 'Main Campus'
    }
  ];

  const quickStats = [
    {
      name: 'Enrolled Courses',
      value: stats.enrolledCourses,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      href: '/courses'
    },
    {
      name: 'Pending Assignments',
      value: stats.pendingAssignments,
      icon: ClipboardDocumentListIcon,
      color: 'bg-yellow-500',
      href: '/assignments'
    },
    {
      name: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: CalendarDaysIcon,
      color: 'bg-green-500',
      href: '/events'
    },
    {
      name: 'Completed Tasks',
      value: stats.completedAssignments,
      icon: CheckCircleIcon,
      color: 'bg-purple-500',
      href: '/assignments'
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
        {/* Recent Assignments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Recent Assignments</h3>
            <Link
              to="/assignments"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">
                    {assignment.title}
                  </p>
                  <p className="text-sm text-secondary-500">{assignment.course}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-xs text-secondary-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {assignment.dueDate}
                  </div>
                  <span
                    className={`badge ${
                      assignment.status === 'submitted'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}
                  >
                    {assignment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Upcoming Events</h3>
            <Link
              to="/events"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-secondary-50 rounded-lg"
              >
                <h4 className="text-sm font-medium text-secondary-900">{event.title}</h4>
                <div className="mt-1 flex items-center text-xs text-secondary-500">
                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                  {event.date} at {event.time}
                </div>
                <p className="text-xs text-secondary-500 mt-1">{event.location}</p>
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
            <BookOpenIcon className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">Browse Courses</span>
          </Link>
          <Link
            to="/assignments"
            className="flex flex-col items-center p-4 text-center bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">Submit Assignment</span>
          </Link>
          <Link
            to="/events"
            className="flex flex-col items-center p-4 text-center bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <CalendarDaysIcon className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">Register Event</span>
          </Link>
          <Link
            to="/marketplace"
            className="flex flex-col items-center p-4 text-center bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <AcademicCapIcon className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">Buy/Sell Items</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;