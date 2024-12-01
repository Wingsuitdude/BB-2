import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Bell } from 'lucide-react';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';
import { getUnreadMessageCount } from '../../lib/supabase/messages';
import { getPendingConnectionCount } from '../../lib/supabase/connections';

export function NotificationButtons({ profileId }) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingConnections, setPendingConnections] = useState(0);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!profileId) return;
      
      try {
        const [messages, connections] = await Promise.all([
          getUnreadMessageCount(profileId),
          getPendingConnectionCount(profileId)
        ]);

        setUnreadMessages(messages);
        setPendingConnections(connections);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [profileId]);

  return (
    <div className="flex items-center space-x-3">
      <Link to="/messages">
        <Button variant="secondary" className="relative">
          <MessageCircle className="w-5 h-5" />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {unreadMessages}
            </span>
          )}
        </Button>
      </Link>
      <Link to="/connections">
        <Button variant="secondary" className="relative">
          <Users className="w-5 h-5" />
          {pendingConnections > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {pendingConnections}
            </span>
          )}
        </Button>
      </Link>
    </div>
  );
}