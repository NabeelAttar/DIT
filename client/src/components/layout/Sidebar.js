import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  UserIcon,
  GraduationCapIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, isStudent, isTeacher, isAdmin } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['student', 'teacher', 'admin'] },
    { name: 'Courses', href: '/courses', icon: BookOpenIcon, roles: ['student', 'teacher', 'admin'] },
    { name: 'Assignments', href: '/assignments', icon: ClipboardDocumentListIcon, roles: ['student', 'teacher', 'admin'] },
    { name: 'Events', href: '/events', icon: CalendarDaysIcon, roles: ['student', 'teacher', 'admin'] },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBagIcon, roles: ['student', 'teacher', 'admin'] },
    { name: 'Lost & Found', href: '/lost-found', icon: MagnifyingGlassIcon, roles: ['student', 'teacher', 'admin'] },
    { name: 'Complaints', href: '/complaints', icon: ExclamationTriangleIcon, roles: ['student', 'teacher', 'admin'] },
    { name: 'Profile', href: '/profile', icon: UserIcon, roles: ['student', 'teacher', 'admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm">
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <GraduationCapIcon className="h-5 w-5 text-white" />
          </div>
          <span className="ml-3 text-xl font-semibold text-secondary-900">
            Smart Campus Hub
          </span>
        </div>
      </div>
      
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={`nav-link ${active ? 'nav-link-active' : 'nav-link-inactive'}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={`h-5 w-5 shrink-0 ${
                          active ? 'text-primary-600' : 'text-secondary-400'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </li>
          
          <li className="mt-auto">
            <div className="rounded-lg bg-secondary-50 p-4">
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                  <span className="text-sm font-medium text-primary-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-secondary-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-secondary-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-secondary-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;