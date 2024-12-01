export const APP_NAME = 'Based Bases';
export const SUPPORTED_CHAINS = ['mainnet'];
export const DEFAULT_CHAIN = 'mainnet';

export const CONTRACT_ADDRESSES = {
  mainnet: {
    token: '0x0000000000000000000000000000000000000000',
    superLike: '0x0000000000000000000000000000000000000000',
    reputationPool: '0x0000000000000000000000000000000000000000'
  }
};

export const CHAIN_IDS = {
  mainnet: 1
};

export const SUPER_LIKE_COST = '0.0001'; // ETH

export const REPUTATION_MULTIPLIERS = {
  BASES_TOKEN: {
    TIER1: { min: 100, multiplier: 1.1 },
    TIER2: { min: 1000, multiplier: 1.25 },
    TIER3: { min: 10000, multiplier: 1.5 }
  }
};