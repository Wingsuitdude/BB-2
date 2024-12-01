import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { useAuthStore } from '../stores/useAuthStore';
import { getProfile, createProfile } from '../lib/supabase';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading: isConnecting, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { setProfile, setError, setLoading, clearProfile } = useAuthStore();

  const loadProfile = async (userAddress) => {
    try {
      setLoading(true);
      let profile = await getProfile(userAddress);
      
      if (!profile) {
        profile = await createProfile(userAddress, ensName);
      }

      if (profile) {
        setProfile(profile);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async (connector) => {
    try {
      await connect({ connector });
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet');
      clearProfile();
    }
  };

  const disconnectWallet = () => {
    disconnect();
    clearProfile();
  };

  useEffect(() => {
    if (isConnected && address) {
      loadProfile(address);
    }
  }, [isConnected, address, ensName]);

  return {
    account: address,
    isConnecting,
    connectWallet,
    disconnectWallet,
    isConnected,
    error,
    connectors
  };
}