'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

function truncate(pk: string, head = 4, tail = 4) {
  if (!pk) return '';
  return `${pk.slice(0, head)}…${pk.slice(-tail)}`;
}

export function WalletButton() {
  const { publicKey, disconnect, connecting, connected, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!publicKey) {
      setBalance(null);
      return;
    }
    (async () => {
      try {
        const lamports = await connection.getBalance(publicKey);
        if (!cancelled) setBalance(lamports);
      } catch {
        if (!cancelled) setBalance(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  if (!connected) {
    return (
      <button
        onClick={() => setVisible(true)}
        disabled={connecting}
        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold transition shadow-lg shadow-amber-500/20"
      >
        {connecting ? 'Connecting…' : 'Connect Nightly'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex flex-col items-end text-xs text-slate-300">
        <span className="font-mono">{truncate(publicKey?.toBase58() ?? '')}</span>
        {balance !== null && (
          <span className="text-slate-500">
            {(balance / 1e9).toFixed(6)} COOK
          </span>
        )}
      </div>
      <button
        onClick={() => disconnect()}
        className="px-3 py-2 rounded-lg border border-slate-700 hover:border-amber-500/60 text-slate-200 text-sm transition"
        title={wallet?.adapter?.name}
      >
        Disconnect
      </button>
    </div>
  );
}
