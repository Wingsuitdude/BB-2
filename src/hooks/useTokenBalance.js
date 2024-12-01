import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useTokenContract } from './useTokenContract';

export function useTokenBalance() {
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const tokenContract = useTokenContract();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected || !address || !tokenContract) return;

      try {
        setIsLoading(true);
        const rawBalance = await tokenContract.balanceOf(address);
        setBalance(formatEther(rawBalance));
      } catch (error) {
        console.error('Error fetching token balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [address, isConnected, tokenContract]);

  return { balance, isLoading };
}