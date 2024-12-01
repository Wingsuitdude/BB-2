import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile } from '../lib/supabase/profiles';
import { ProfileDashboard } from '../components/profile/ProfileDashboard';
import { useAuthStore } from '../stores/useAuthStore';

export function ProfilePage() {
  const { address } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentProfile = useAuthStore(state => state.profile);
  const isOwnProfile = currentProfile?.address?.toLowerCase() === address?.toLowerCase();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile(address);
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [address]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>Profile not found</p>
      </div>
    );
  }

  return <ProfileDashboard profile={profile} isOwnProfile={isOwnProfile} />;
}