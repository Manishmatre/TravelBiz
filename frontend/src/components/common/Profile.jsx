import React from "react";

/**
 * Profile component to display user details (avatar, name, email, etc.)
 * Props:
 * - avatarUrl: string (profile image)
 * - name: string
 * - email: string
 * - additionalInfo: React node (optional, for extra details)
 */
const Profile = ({ avatarUrl, name, email, additionalInfo }) => {
  return (
    <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden flex flex-col items-center p-6">
      <img
        className="w-24 h-24 object-cover rounded-full border-4 border-blue-500 mb-4"
        src={avatarUrl || "/default-avatar.png"}
        alt={name || "User Avatar"}
      />
      <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
      <p className="text-gray-500 mb-2">{email}</p>
      {additionalInfo && <div className="mt-2 w-full">{additionalInfo}</div>}
    </div>
  );
};

export default Profile;
