import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Check } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuthStore } from '../../stores/useAuthStore';
import { getConnectionStatus, sendConnectionRequest, removeConnection } from '../../lib/supabase/connections';

export function ConnectButton({ profileId }) {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useAuthStore();

  useEffect(() => {
    const loadConnectionStatus = async () => {
      if (profile?.id && profileId) {
        try {
          const currentStatus = await getConnectionStatus(profile.id, profileId);
          setStatus(currentStatus);
        } catch (error) {
          console.error('Error getting connection status:', error);
        }
      }
    };

    loadConnectionStatus();
  }, [profile?.id, profileId]);

  const handleConnect = async () => {
    if (!profile?.id || !profileId) return;
    
    setIsLoading(true);
    try {
      if (status === 'accepted') {
        await removeConnection(profile.id, profileId);
        setStatus(null);
      } else {
        await sendConnectionRequest(profile.id, profileId);
        setStatus('pending');
      }
    } catch (error) {
      console.error('Error updating connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile || profile.id === profileId) return null;

  if (status === 'accepted') {
    return (
      <Button
        variant="danger"
        onClick={handleConnect}
        isLoading={isLoading}
        className="px-3 py-2"
      >
        <UserMinus className="w-4 h-4 mr-2" />
        Disconnect
      </Button>
    );
  }

  if (status === 'pending') {
    return (
      <Button
        variant="secondary"
        disabled
        className="px-3 py-2"
      >
        <Check className="w-4 h-4 mr-2" />
        Pending
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      isLoading={isLoading}
      className="px-3 py-2"
    >
      <UserPlus className="w-4 h-4 mr-2" />
      Connect
    </Button>
  );
}