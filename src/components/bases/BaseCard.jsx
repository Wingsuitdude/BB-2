import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, ArrowRight, Shield, Wallet } from 'lucide-react';
import { Button } from '../common/Button';
import { truncateAddress } from '../../lib/utils/formatters';

export function BaseCard({ base }) {
  return (
    <div className="bg-dark-100 rounded-lg p-6 border border-gray-800 hover:border-primary-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-xl font-semibold text-white">{base.name}</h3>
            {base.verified && <Shield className="w-5 h-5 text-primary-400" />}
          </div>
          <p className="text-gray-400">{base.description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-400">
            <Users className="w-5 h-5 mr-1" />
            <span>{base.member_count}</span>
          </div>
          <div className="flex items-center text-yellow-400">
            <Trophy className="w-5 h-5 mr-1" />
            <span>{base.reputation}</span>
          </div>
          {base.funding_goal && (
            <div className="flex items-center text-green-400">
              <Wallet className="w-5 h-5 mr-1" />
              <span>{base.current_funding} / {base.funding_goal} ETH</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <Link to={`/profile/${base.creator.address}`} className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src={base.creator.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${base.creator.address}`}
              alt={base.creator.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Created by </span>
            <span className="text-primary-400">{base.creator.username || truncateAddress(base.creator.address)}</span>
          </div>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {base.skills.map((skill) => (
          <span
            key={skill}
            className="bg-primary-500/10 text-primary-400 px-3 py-1 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex -space-x-2">
          {base.recent_members?.slice(0, 4).map((member) => (
            <div key={member.id} className="w-8 h-8 rounded-full border-2 border-dark-100 overflow-hidden">
              <img
                src={member.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${member.address}`}
                alt={member.username}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <Link to={`/bases/${base.id}`}>
          <Button>
            View Base
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}