import React from 'react';
import { useParams } from 'react-router-dom';

const LostFoundDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Lost & Found Item</h1>
        <p className="text-secondary-600 mb-4">Item ID: {id}</p>
        <p className="text-secondary-600">Item details will include:</p>
        <ul className="mt-4 space-y-2 text-secondary-600">
          <li>• Item photos and description</li>
          <li>• Location where lost/found</li>
          <li>• Date and time</li>
          <li>• Contact information</li>
          <li>• Claim verification process</li>
        </ul>
      </div>
    </div>
  );
};

export default LostFoundDetail;