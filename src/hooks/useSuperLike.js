import { useState } from 'react';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES, SUPER_LIKE_COST } from '../lib/constants';
import SuperLikeABI from '../contracts/SuperLike.json';
import { addReputationEvent, REPUTATION_POINTS } from '../lib/supabase/reputation';

export function useSuperLike() {
  const [error, setError] = useState(null);

  const { write: superLike, data: superLikeData } = useContractWrite({
    address: CONTRACT_ADDRESSES.mainnet.superLike,
    abi: SuperLikeABI.abi,
    functionName: 'superLike',
    value: parseEther(SUPER_LIKE_COST)
  });

  const { isLoading } = useWaitForTransaction({
    hash: superLikeData?.hash,
    onSuccess: async (data) => {
      // Add reputation points for receiving a super like
      try {
        await addReputationEvent(data.to, 'SUPER_LIKE_RECEIVED', REPUTATION_POINTS.SUPER_LIKE_RECEIVED, {
          transaction_hash: data.hash
        });
      } catch (err) {
        console.error('Error adding reputation points:', err);
      }
    }
  });

  const handleSuperLike = async (postId, authorId) => {
    try {
      setError(null);
      await superLike({ args: [postId] });
    } catch (err) {
      setError(err.message);
      console.error('Error super liking:', err);
    }
  };

  return {
    superLike: handleSuperLike,
    isLoading,
    error
  };
}