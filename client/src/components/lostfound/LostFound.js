import React from 'react';

const LostFound = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Lost & Found</h1>
        <p className="text-secondary-600">
          Campus lost and found system. Features include:
        </p>
        <ul className="mt-4 space-y-2 text-secondary-600">
          <li>• Report lost items</li>
          <li>• Report found items</li>
          <li>• Search lost/found items</li>
          <li>• Claim items with verification</li>
          <li>• Item photos and descriptions</li>
          <li>• Location and date tracking</li>
        </ul>
      </div>
    </div>
  );
};

export default LostFound;