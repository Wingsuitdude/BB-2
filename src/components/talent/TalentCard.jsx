import React from 'react';
import { motion } from 'framer-motion';
import { Star, Shield, MapPin } from 'lucide-react';
import { MessageButton } from '../messaging/MessageButton';
import { ConnectButton } from '../profile/ConnectButton';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';
import { truncateAddress } from '../../lib/utils/formatters';

export function TalentCard({ profile, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-dark-100 rounded-lg p-6 border border-gray-800 hover:border-primary-500 transition-colors"
    >
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 rounded-full bg-dark-200 overflow-hidden flex-shrink-0">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.address}`}
            alt={profile.username}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h3 className="text-xl font-semibold text-white">
                {profile.username || truncateAddress(profile.address)}
              </h3>
              {profile.verified && (
                <Shield className="w-5 h-5 ml-2 text-primary-400" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-white font-semibold">{profile.reputation || 0}</span>
            </div>
          </div>

          <p className="text-gray-400 mb-3">{profile.headline || 'No headline yet'}</p>

          {profile.location && (
            <div className="flex items-center text-gray-400 text-sm mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{profile.location}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {profile.skills?.map((skill) => (
              <span
                key={skill}
                className="bg-primary-500/10 text-primary-400 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">
              {profile.completed_projects || 0} projects completed
            </span>
            <div className="flex items-center space-x-2">
              <ConnectButton profileId={profile.id} />
              <MessageButton
                recipientId={profile.id}
                recipientName={profile.username}
              />
              <Link to={`/profile/${profile.address}`}>
                <Button>View Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}