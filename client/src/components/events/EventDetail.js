import React from 'react';
import { useParams } from 'react-router-dom';

const EventDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Event Details</h1>
        <p className="text-secondary-600 mb-4">Event ID: {id}</p>
        <p className="text-secondary-600">Event details will include:</p>
        <ul className="mt-4 space-y-2 text-secondary-600">
          <li>• Event description and agenda</li>
          <li>• Date, time, and location</li>
          <li>• Registration interface</li>
          <li>• Attendee list and capacity</li>
          <li>• Event updates and announcements</li>
        </ul>
      </div>
    </div>
  );
};

export default EventDetail;