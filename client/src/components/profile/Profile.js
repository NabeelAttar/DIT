import React from 'react';

const Profile = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">Profile</h1>
        <p className="text-secondary-600">
          User profile management. Features include:
        </p>
        <ul className="mt-4 space-y-2 text-secondary-600">
          <li>• Edit personal information</li>
          <li>• Update contact details</li>
          <li>• Change password</li>
          <li>• Upload profile picture</li>
          <li>• Notification preferences</li>
          <li>• Account settings</li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;