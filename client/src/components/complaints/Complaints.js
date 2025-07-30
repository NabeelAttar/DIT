import React from 'react';

const Complaints = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Complaints</h1>
        <p className="text-secondary-600">
          Campus complaint management system. Features include:
        </p>
        <ul className="mt-4 space-y-2 text-secondary-600">
          <li>• Submit complaints with categories</li>
          <li>• Track complaint status</li>
          <li>• Anonymous complaint options</li>
          <li>• Admin complaint management</li>
          <li>• Priority-based handling</li>
          <li>• Resolution tracking and feedback</li>
        </ul>
      </div>
    </div>
  );
};

export default Complaints;