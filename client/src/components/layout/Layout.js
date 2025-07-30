import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 0 || segments[0] === 'dashboard') {
      return 'Dashboard';
    }
    
    const titleMap = {
      'courses': 'Courses',
      'assignments': 'Assignments',
      'events': 'Events',
      'marketplace': 'Marketplace',
      'lost-found': 'Lost & Found',
      'complaints': 'Complaints',
      'profile': 'Profile'
    };
    
    return titleMap[segments[0]] || 'Smart Campus Hub';
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="lg:pl-72">
        <Header 
          setSidebarOpen={setSidebarOpen}
          title={getPageTitle()}
        />
        
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;