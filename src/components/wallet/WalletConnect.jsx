import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, X, LogOut } from 'lucide-react';
import { WalletOption } from './WalletOption';
import { Button } from '../common/Button';
import { useWallet } from '../../hooks/useWallet';

export function WalletConnect() {
  const [isOpen, setIsOpen] = useState(false);
  const { connectWallet, disconnectWallet, isConnecting, connectors, account } = useWallet();

  const handleConnect = async (connector) => {
    try {
      await connectWallet(connector);
      setIsOpen(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const getWalletIcon = (id) => {
    switch (id) {
      case 'metaMask':
        return "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg";
      case 'coinbaseWallet':
        return "https://upload.wikimedia.org/wikipedia/commons/1/1a/Coinbase_Wallet_Logo.png";
      default:
        return null;
    }
  };

  const getWalletName = (id) => {
    switch (id) {
      case 'metaMask':
        return "MetaMask";
      case 'coinbaseWallet':
        return "Coinbase Wallet";
      default:
        return id;
    }
  };

  if (account) {
    return (
      <Button variant="outline" onClick={disconnectWallet} className="p-2">
        <LogOut className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        disabled={isConnecting}
        className="px-4 py-2 text-sm"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-[320px]"
            >
              <div className="bg-dark-100 rounded-lg border border-gray-800 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Connect Wallet</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {connectors.map((connector) => (
                    <WalletOption
                      key={connector.id}
                      name={getWalletName(connector.id)}
                      icon={getWalletIcon(connector.id)}
                      onClick={() => handleConnect(connector)}
                      disabled={!connector.ready}
                      isLoading={isConnecting && connector.id === 'coinbaseWallet'}
                    />
                  ))}
                </div>

                <p className="mt-4 text-sm text-gray-400 text-center">
                  By connecting your wallet, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}