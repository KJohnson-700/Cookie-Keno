'use client';

import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import { NightlyWalletAdapter } from '@/lib/nightly-adapter';
import { COOKIE_CHAIN_RPC } from '@/lib/cookiechain';

// Default styles for the wallet modal
import '@solana/wallet-adapter-react-ui/styles.css';

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  // Cookie Chain is its own network. The wallet-adapter expects a network enum;
  // we treat it as a custom endpoint.
  const network = WalletAdapterNetwork.Devnet; // unused; we override endpoint below
  const endpoint = useMemo(() => COOKIE_CHAIN_RPC, []);
  const wallets = useMemo(() => [new NightlyWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
