import React from 'react';
import { Shield, Settings } from 'lucide-react';
import { Button } from '../common/Button';
import { MessageButton } from '../messaging/MessageButton';
import { useAuthStore } from '../../stores/useAuthStore';

export function ProfileHeader({ profile, isOwnProfile }) {
  const currentProfile = useAuthStore(state => state.profile);

  return (
    <div className="relative">
      <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800 rounded-t-lg">
        {profile?.banner_url && (
          <img
            src={profile.banner_url}
            alt="Profile Banner"
            className="w-full h-full object-cover rounded-t-lg"
          />
        )}
      </div>
      <div className="px-6 pb-6">
        <div className="flex justify-between items-end -mt-16">
          <div className="flex items-end">
            <div className="w-32 h-32 rounded-full border-4 border-dark-100 overflow-hidden bg-dark-200">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile?.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/shapes/svg?seed=${profile?.address}`}
                  alt={profile?.username}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="ml-6 mb-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">{profile?.username}</h1>
                {profile?.verified && (
                  <Shield className="w-5 h-5 ml-2 text-primary-400" />
                )}
              </div>
              <p className="text-gray-400 mt-1">{profile?.headline || 'No headline yet'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isOwnProfile && currentProfile && (
              <MessageButton 
                recipientId={profile?.id}
                recipientName={profile?.username}
              />
            )}
            {isOwnProfile && (
              <Button variant="secondary">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}