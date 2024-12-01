import React from 'react';
import { useContractRead } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACT_ADDRESSES } from '../../lib/constants';
import BasedTokenABI from '../../contracts/BasedToken.json';

export function TokenStats() {
  const { data: totalSupply } = useContractRead({
    address: CONTRACT_ADDRESSES.mainnet.token,
    abi: BasedTokenABI.abi,
    functionName: 'totalSupply',
  });

  return (
    <div className="bg-dark-100 rounded-lg p-6 border border-gray-800">
      <h2 className="text-xl font-semibold text-white mb-4">Token Stats</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Supply</span>
          <span className="text-white">
            {totalSupply ? formatEther(totalSupply) : '0'} BASED
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">ETH Pool</span>
          <span className="text-white">45.67 ETH</span>
        </div>
      </div>
    </div>
  );
}