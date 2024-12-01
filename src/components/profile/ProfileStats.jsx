import React from 'react';
import { MapPin, Briefcase, Award, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProfileStats({ profile }) {
  return (
    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
      {profile.location && (
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{profile.location}</span>
        </div>
      )}
      <div className="flex items-center">
        <Building2 className="w-4 h-4 mr-1" />
        <span>
          {profile.base_count || 0} {profile.base_count === 1 ? 'Base' : 'Bases'}
        </span>
      </div>
      <div className="flex items-center">
        <Briefcase className="w-4 h-4 mr-1" />
        <span>{profile.completed_projects || 0} Projects</span>
      </div>
      <div className="flex items-center">
        <Award className="w-4 h-4 mr-1" />
        <span>{profile.reputation || 0} Reputation</span>
      </div>
      {profile.home_base && (
        <Link 
          to={`/bases/${profile.home_base.id}`}
          className="flex items-center text-primary-400 hover:text-primary-300"
        >
          <Building2 className="w-4 h-4 mr-1" />
          <span>{profile.home_base.name}</span>
        </Link>
      )}
    </div>
  );
}