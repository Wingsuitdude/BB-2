import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NotificationButtons } from './NotificationButtons';
import { ConnectButton } from './ConnectButton';
import { MessageButton } from '../messaging/MessageButton';
import { ImageUpload } from './ImageUpload';
import { ProfileStats } from './ProfileStats';
import { ProfileEdit } from './ProfileEdit';
import { Feed } from '../feed/Feed';
import { Button } from '../common/Button';
import { Settings } from 'lucide-react';

export function ProfileDashboard({ profile, isOwnProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  if (!profile) return null;

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-r from-primary-600/20 to-primary-800/20 border border-gray-800">
        {profile?.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-primary-800/20" />
        )}
        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <ImageUpload type="banners" />
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="relative -mt-20 px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-dark-100 overflow-hidden bg-dark-200 shadow-xl">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
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
            {isOwnProfile && (
              <div className="absolute bottom-0 right-0">
                <ImageUpload type="avatars" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
                <p className="text-gray-400 mt-1">{profile.headline || 'No headline set'}</p>
              </div>
              {isOwnProfile ? (
                <div className="flex items-center space-x-3">
                  <NotificationButtons profileId={profile.id} />
                  <Button variant="secondary" onClick={() => setIsEditing(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ConnectButton profileId={profile.id} />
                  <MessageButton
                    recipientId={profile.id}
                    recipientName={profile.username}
                  />
                </div>
              )}
            </div>
            <ProfileStats profile={profile} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-800">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'posts' && (
            <Feed userId={profile.id} showCreatePost={isOwnProfile} />
          )}

          {activeTab === 'about' && (
            <div className="bg-dark-100 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4">About</h2>
              <p className="text-gray-400 whitespace-pre-wrap">
                {profile.bio || 'No bio yet'}
              </p>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill) => (
                    <span
                      key={skill}
                      className="bg-primary-500/10 text-primary-400 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!profile.skills || profile.skills.length === 0) && (
                    <p className="text-gray-400">No skills added yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="bg-dark-100 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4">Experience</h2>
              {profile.experience?.length > 0 ? (
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="bg-dark-200 rounded-lg p-4 border border-gray-800">
                      <h3 className="font-medium text-white">{exp.title}</h3>
                      <p className="text-gray-400">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.duration}</p>
                      {exp.description && (
                        <p className="text-gray-400 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No experience added yet</p>
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="bg-dark-100 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4">Education</h2>
              {profile.education?.length > 0 ? (
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="bg-dark-200 rounded-lg p-4 border border-gray-800">
                      <h3 className="font-medium text-white">{edu.degree}</h3>
                      <p className="text-gray-400">{edu.school}</p>
                      <p className="text-sm text-gray-500">{edu.duration}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No education added yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <ProfileEdit onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
}