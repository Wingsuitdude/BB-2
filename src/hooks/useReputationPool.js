import { useState } from 'react';
import { useContractWrite, useContractRead, useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../lib/constants';
import ReputationPoolABI from '../contracts/ReputationPool.json';

export function useReputationPool() {
  const [error, setError] = useState(null);

  const { data: dailyReward } = useContractRead({
    address: CONTRACT_ADDRESSES.mainnet.reputationPool,
    abi: ReputationPoolABI.abi,
    functionName: 'calculateDailyReward',
    args: [address]
  });

  const { write: claimReward, data: claimData } = useContractWrite({
    address: CONTRACT_ADDRESSES.mainnet.reputationPool,
    abi: ReputationPoolABI.abi,
    functionName: 'claimDailyReward'
  });

  const { isLoading } = useWaitForTransaction({
    hash: claimData?.hash,
  });

  const handleClaimReward = async () => {
    try {
      setError(null);
      await claimReward();
    } catch (err) {
      setError(err.message);
      console.error('Error claiming reward:', err);
    }
  };

  return {
    dailyReward,
    claimReward: handleClaimReward,
    isLoading,
    error
  };
}