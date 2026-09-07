'use client';

import { useMemo } from 'react';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { COOKIE_CHAIN_RPC } from '@/lib/cookiechain';

// Default styles for the wallet modal
import '@solana/wallet-adapter-react-ui/styles.css';

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => COOKIE_CHAIN_RPC, []);

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      {children}
    </ConnectionProvider>
  );
}
