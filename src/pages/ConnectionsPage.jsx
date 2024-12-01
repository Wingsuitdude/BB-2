import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, UserCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../stores/useAuthStore';
import { supabase } from '../lib/supabase/client';
import { truncateAddress } from '../lib/utils/formatters';

export function ConnectionsPage() {
  const [pendingConnections, setPendingConnections] = useState([]);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuthStore();

  useEffect(() => {
    if (!profile?.id) return;

    const loadConnections = async () => {
      try {
        // Get pending connection requests
        const { data: pending } = await supabase
          .from('connections')
          .select(`
            *,
            requester:profiles!connections_requester_id_fkey(
              id, username, avatar_url, address, headline
            )
          `)
          .eq('receiver_id', profile.id)
          .eq('status', 'pending');

        // Get accepted connections
        const { data: accepted } = await supabase
          .from('connections')
          .select(`
            *,
            requester:profiles!connections_requester_id_fkey(
              id, username, avatar_url, address, headline
            ),
            receiver:profiles!connections_receiver_id_fkey(
              id, username, avatar_url, address, headline
            )
          `)
          .or(`requester_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
          .eq('status', 'accepted');

        setPendingConnections(pending || []);
        setAcceptedConnections(accepted || []);
      } catch (error) {
        console.error('Error loading connections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConnections();
  }, [profile?.id]);

  const handleAccept = async (connectionId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;

      // Refresh connections
      setPendingConnections(prev => prev.filter(conn => conn.id !== connectionId));
      const accepted = pendingConnections.find(conn => conn.id === connectionId);
      if (accepted) {
        setAcceptedConnections(prev => [...prev, { ...accepted, status: 'accepted' }]);
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
    }
  };

  const handleReject = async (connectionId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      setPendingConnections(prev => prev.filter(conn => conn.id !== connectionId));
    } catch (error) {
      console.error('Error rejecting connection:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Connections</h1>

      {/* Pending Connections */}
      {pendingConnections.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Pending Requests</h2>
          <div className="space-y-4">
            {pendingConnections.map((connection) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-100 rounded-lg p-4 border border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-dark-200 overflow-hidden">
                      <img
                        src={connection.requester.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${connection.requester.address}`}
                        alt={connection.requester.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {connection.requester.username || truncateAddress(connection.requester.address)}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {connection.requester.headline || 'No headline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleAccept(connection.id)}
                      className="px-3 py-2"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleReject(connection.id)}
                      className="px-3 py-2"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Connections */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Your Connections</h2>
        {acceptedConnections.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {acceptedConnections.map((connection) => {
              const connectedUser = connection.requester_id === profile.id
                ? connection.receiver
                : connection.requester;

              return (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-100 rounded-lg p-4 border border-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-dark-200 overflow-hidden">
                      <img
                        src={connectedUser.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${connectedUser.address}`}
                        alt={connectedUser.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {connectedUser.username || truncateAddress(connectedUser.address)}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {connectedUser.headline || 'No headline'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No connections yet</p>
          </div>
        )}
      </div>
    </div>
  );
}