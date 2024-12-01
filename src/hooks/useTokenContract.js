import { useContract, useProvider, useSigner } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../lib/constants';
import BasedTokenABI from '../contracts/BasedToken.json';

export function useTokenContract(withSigner = false) {
  const provider = useProvider();
  const { data: signer } = useSigner();

  return useContract({
    address: CONTRACT_ADDRESSES.mainnet.token,
    abi: BasedTokenABI.abi,
    signerOrProvider: withSigner ? signer : provider,
  });
}