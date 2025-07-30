import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user, isStudent, isTeacher, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-primary-100">
          {isStudent && "Ready to learn something new today?"}
          {isTeacher && "Time to inspire and educate!"}
          {isAdmin && "Let's make the campus better together."}
        </p>
      </div>

      {isStudent && <StudentDashboard />}
      {isTeacher && <TeacherDashboard />}
      {isAdmin && <AdminDashboard />}
    </div>
  );
};

export default Dashboard;