import React from "react";
import Profile from "../components/common/Profile";
import { useAuth } from "../contexts/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100 py-10">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
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
  );
};

export default ProfilePage;
