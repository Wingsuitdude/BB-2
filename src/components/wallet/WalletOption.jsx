import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function WalletOption({ name, icon, onClick, disabled, isLoading }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full bg-dark-200 border border-gray-800 rounded-lg p-4 transition-colors flex items-center justify-between group
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-dark-300'}`}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-1">
          <img src={icon} alt={name} className="w-full h-full object-contain" />
        </div>
        <span className="ml-3 font-medium text-white">{name}</span>
      </div>
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
      ) : (
        <span className="text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Connect
        </span>
      )}
    </motion.button>
  );
}