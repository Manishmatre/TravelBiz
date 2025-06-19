import React from "react";
import Profile from "../components/common/Profile";
import { useAuth } from "../contexts/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-2 md:px-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
        </div>
        <div className="bg-white/80 border border-gray-100 rounded-2xl shadow-lg p-6">
          <Profile
            avatarUrl={user.avatarUrl || undefined}
            name={user.name}
            email={user.email}
            additionalInfo={
              <div className="text-sm text-gray-600 mt-2">
                <p>Role: {user.role}</p>
                {user.createdAt && (
                  <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
                )}
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
