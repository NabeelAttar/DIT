import React from 'react';
import { useParams } from 'react-router-dom';

const CourseDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Course Details</h1>
        <p className="text-secondary-600 mb-4">Course ID: {id}</p>
        <p className="text-secondary-600">
          Detailed course information will be displayed here, including:
        </p>
        <ul className="mt-4 space-y-2 text-secondary-600">
          <li>• Course description and objectives</li>
          <li>• Instructor information</li>
          <li>• Class schedule and location</li>
          <li>• Course materials and resources</li>
          <li>• Enrolled students list (for teachers)</li>
          <li>• Assignment and grade information</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseDetail;