import React from 'react';
import { useParams } from 'react-router-dom';

const ComplaintDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Complaint Details</h1>
        <p className="text-secondary-600 mb-4">Complaint ID: {id}</p>
        <p className="text-secondary-600">Complaint details will include:</p>
        <ul className="mt-4 space-y-2 text-secondary-600">
          <li>• Complaint description and category</li>
          <li>• Priority level and status</li>
          <li>• Assigned staff member</li>
          <li>• Resolution progress updates</li>
          <li>• Feedback and rating system</li>
        </ul>
      </div>
    </div>
  );
};

export default ComplaintDetail;