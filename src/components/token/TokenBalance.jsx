import React from 'react';
import { useTokenBalance } from '../../hooks/useTokenBalance';

export function TokenBalance() {
  const { balance, isLoading } = useTokenBalance();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 w-20 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-primary-400">{balance}</span>
      <span className="text-gray-400">BASED</span>
    </div>
  );
}