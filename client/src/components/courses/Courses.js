import React from 'react';

const Courses = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Courses</h1>
        <p className="text-secondary-600">
          Course management functionality will be implemented here. This will include:
        </p>
        <ul className="mt-4 space-y-2 text-secondary-600">
          <li>• Browse and search available courses</li>
          <li>• Course enrollment for students</li>
          <li>• Course creation and management for teachers</li>
          <li>• View course materials and schedules</li>
          <li>• Student progress tracking</li>
        </ul>
      </div>
    </div>
  );
};

export default Courses;