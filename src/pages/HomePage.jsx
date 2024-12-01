import React from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { HeroSection } from '../components/home/HeroSection';
import { Feed } from '../components/feed/Feed';
import { ProfileSidebar } from '../components/profile/ProfileSidebar';
import { Link } from 'react-router-dom';
import { Home, Users, Trophy, MessageCircle, Bell } from 'lucide-react';

export function HomePage() {
  const { profile, isLoading, error } = useAuthStore();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto">
        <HeroSection />
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-lg">
            Connect your wallet to join the largest on-chain ecosystem
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex gap-6">
        {/* Left Sidebar - Navigation */}
        <div className="hidden lg:block w-64 space-y-4 sticky top-24">
          <Link 
            to="/" 
            className="flex items-center space-x-3 p-3 rounded-lg bg-dark-100 text-white hover:bg-dark-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link 
            to={`/profile/${profile.address}`} 
            className="flex items-center space-x-3 p-3 rounded-lg text-gray-400 hover:bg-dark-100 transition-colors"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.address}`}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            </div>
            <span>{profile.username}</span>
          </Link>
          <Link 
            to="/connections" 
            className="flex items-center space-x-3 p-3 rounded-lg text-gray-400 hover:bg-dark-100 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Connections</span>
          </Link>
          <Link 
            to="/messages" 
            className="flex items-center space-x-3 p-3 rounded-lg text-gray-400 hover:bg-dark-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Messages</span>
          </Link>
          <Link 
            to="/rewards" 
            className="flex items-center space-x-3 p-3 rounded-lg text-gray-400 hover:bg-dark-100 transition-colors"
          >
            <Trophy className="w-5 h-5" />
            <span>Rewards</span>
          </Link>
        </div>

        {/* Main Content - Feed */}
        <div className="flex-1 max-w-2xl">
          <Feed showCreatePost userId={profile.id} connectionFeed />
        </div>

        {/* Right Sidebar - Profile & Stats */}
        <div className="hidden xl:block w-80 space-y-6 sticky top-24">
          <ProfileSidebar profile={profile} minimal />
          <div className="bg-dark-100 rounded-lg p-4 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Notifications</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Unread Messages</span>
                <span className="bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded">
                  {profile.unread_messages || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Connection Requests</span>
                <span className="bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded">
                  {profile.pending_connections || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}