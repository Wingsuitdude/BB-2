import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MoreVertical, UserPlus } from 'lucide-react';
import { Button } from '../common/Button';
import { truncateAddress } from '../../lib/utils/formatters';
import { useAuthStore } from '../../stores/useAuthStore';
import { setHomeBase } from '../../lib/supabase/profiles';

export function BaseMembers({ members = [], isOwner, baseId }) {
  const { profile, setProfile } = useAuthStore();

  const handleSetHomeBase = async (memberId) => {
    if (!profile || profile.id !== memberId) return;
    
    try {
      const updatedProfile = await setHomeBase(profile.id, baseId);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error setting home base:', error);
    }
  };

  if (!Array.isArray(members)) {
    console.error('Members prop must be an array');
    return null;
  }

  return (
    <div className="space-y-6">
      {isOwner && (
        <div className="flex justify-end">
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Members
          </Button>
        </div>
      )}

      <div className="bg-dark-100 rounded-lg border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Members ({members.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-800">
          {members.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No members yet
            </div>
          ) : (
            members.map((member) => {
              if (!member || !member.address) return null;
              const isCurrentUser = profile?.id === member.id;
              const isHomeBase = profile?.home_base?.id === baseId;
              
              return (
                <div key={member.id} className="p-6 flex items-center justify-between">
                  <Link 
                    to={`/profile/${member.address}`}
                    className="flex items-center space-x-4 flex-1"
                  >
                    <div className="w-12 h-12 rounded-full bg-dark-200 overflow-hidden">
                      <img
                        src={member.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${member.address}`}
                        alt={member.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-white">
                          {member.username || truncateAddress(member.address)}
                        </h3>
                        {member.verified && (
                          <Shield className="w-4 h-4 ml-1 text-primary-400" />
                        )}
                      </div>
                      {member.headline && (
                        <p className="text-sm text-gray-400">{member.headline}</p>
                      )}
                      {member.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{member.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center space-x-2">
                    {isCurrentUser && !isHomeBase && (
                      <Button
                        variant="secondary"
                        onClick={() => handleSetHomeBase(member.id)}
                      >
                        Set as Home Base
                      </Button>
                    )}
                    {isOwner && (
                      <button className="text-gray-400 hover:text-white">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}