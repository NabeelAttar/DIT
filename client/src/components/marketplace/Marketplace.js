import React from 'react';

const Marketplace = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Campus Marketplace</h1>
        <p className="text-secondary-600">
          Campus marketplace for buying and selling items. Features include:
        </p>
        <ul className="mt-4 space-y-2 text-secondary-600">
          <li>• Browse items by category</li>
          <li>• Create listings with photos</li>
          <li>• Search and filter functionality</li>
          <li>• Express interest in items</li>
          <li>• User ratings and reviews</li>
          <li>• Transaction management</li>
        </ul>
      </div>
    </div>
  );
};

export default Marketplace;