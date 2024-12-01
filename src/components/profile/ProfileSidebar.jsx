import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Briefcase } from 'lucide-react';
import { Button } from '../common/Button';
import { truncateAddress } from '../../lib/utils/formatters';

export function ProfileSidebar({ profile, minimal = false }) {
  if (!profile) return null;

  if (minimal) {
    return (
      <div className="bg-dark-100 rounded-lg p-4 border border-gray-800">
        <Link to={`/profile/${profile.address}`} className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.address}`}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="font-medium text-white">{profile.username}</h3>
              {profile.verified && (
                <Shield className="w-4 h-4 ml-1 text-primary-400" />
              )}
            </div>
            <p className="text-sm text-gray-400">{truncateAddress(profile.address)}</p>
          </div>
        </Link>
        <div className="space-y-2 text-sm">
          {profile.location && (
            <div className="flex items-center text-gray-400">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{profile.location}</span>
            </div>
          )}
          <div className="flex items-center text-gray-400">
            <Briefcase className="w-4 h-4 mr-2" />
            <span>{profile.completed_projects || 0} Projects</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-100 rounded-lg p-6 border border-gray-800">
      <h2 className="text-xl font-semibold text-white mb-4">Profile Status</h2>
      {!profile?.verified && (
        <Button className="w-full mb-4">
          <Shield className="w-4 h-4 mr-2" />
          Verify Profile (0.001 ETH)
        </Button>
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-gray-400">
          <span>Completed Projects</span>
          <span>{profile?.completed_projects || 0}</span>
        </div>
        <div className="flex items-center justify-between text-gray-400">
          <span>Reputation Score</span>
          <span>{profile?.reputation || 0}</span>
        </div>
      </div>
    </div>
  );
}