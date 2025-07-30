import React from 'react';
import { useParams } from 'react-router-dom';

const MarketplaceDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Item Details</h1>
        <p className="text-secondary-600 mb-4">Item ID: {id}</p>
        <p className="text-secondary-600">Item details will include:</p>
        <ul className="mt-4 space-y-2 text-secondary-600">
          <li>• Item photos and description</li>
          <li>• Price and condition</li>
          <li>• Seller information</li>
          <li>• Contact options</li>
          <li>• Similar items</li>
        </ul>
      </div>
    </div>
  );
};

export default MarketplaceDetail;