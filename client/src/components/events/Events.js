import React from 'react';

const Events = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Events</h1>
        <p className="text-secondary-600">
          Campus events management will be implemented here. Features include:
        </p>
        <ul className="mt-4 space-y-2 text-secondary-600">
          <li>• Browse upcoming campus events</li>
          <li>• Event registration and management</li>
          <li>• Create and organize events</li>
          <li>• Event calendar integration</li>
          <li>• Attendance tracking</li>
          <li>• Event notifications and reminders</li>
        </ul>
      </div>
    </div>
  );
};

export default Events;