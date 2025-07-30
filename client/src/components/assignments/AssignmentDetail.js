import React from 'react';
import { useParams } from 'react-router-dom';

const AssignmentDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Assignment Details</h1>
        <p className="text-secondary-600 mb-4">Assignment ID: {id}</p>
        <p className="text-secondary-600">
          Detailed assignment information will be displayed here, including:
        </p>
        <ul className="mt-4 space-y-2 text-secondary-600">
          <li>• Assignment description and requirements</li>
          <li>• Due date and submission guidelines</li>
          <li>• File upload interface (students)</li>
          <li>• Submission history and status</li>
          <li>• Grading interface (teachers)</li>
          <li>• Feedback and comments</li>
        </ul>
      </div>
    </div>
  );
};

export default AssignmentDetail;