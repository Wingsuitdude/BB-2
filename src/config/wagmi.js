import { createConfig, configureChains, mainnet } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { publicProvider } from 'wagmi/providers/public';
import { QueryClient } from '@tanstack/react-query';
import { APP_NAME } from '../lib/constants';

const { chains, publicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains,
      options: {
        shimDisconnect: true,
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: APP_NAME,
        headlessMode: true,
      },
    }),
  ],
  publicClient,
});