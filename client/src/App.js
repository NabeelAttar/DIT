import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Courses from './components/courses/Courses';
import CourseDetail from './components/courses/CourseDetail';
import Assignments from './components/assignments/Assignments';
import AssignmentDetail from './components/assignments/AssignmentDetail';
import Events from './components/events/Events';
import EventDetail from './components/events/EventDetail';
import Marketplace from './components/marketplace/Marketplace';
import MarketplaceDetail from './components/marketplace/MarketplaceDetail';
import LostFound from './components/lostfound/LostFound';
import LostFoundDetail from './components/lostfound/LostFoundDetail';
import Complaints from './components/complaints/Complaints';
import ComplaintDetail from './components/complaints/ComplaintDetail';
import Profile from './components/profile/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/:id" element={<CourseDetail />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="assignments/:id" element={<AssignmentDetail />} />
                <Route path="events" element={<Events />} />
                <Route path="events/:id" element={<EventDetail />} />
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="marketplace/:id" element={<MarketplaceDetail />} />
                <Route path="lost-found" element={<LostFound />} />
                <Route path="lost-found/:id" element={<LostFoundDetail />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="complaints/:id" element={<ComplaintDetail />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;