'use client';

import { useEffect, useState } from 'react';
import type { PublicKey } from '@solana/web3.js';

function truncate(pk: string | undefined, head = 4, tail = 4) {
  if (!pk) return '';
  return `${pk.slice(0, head)}…${pk.slice(-tail)}`;
}

type Props = {
  publicKey: PublicKey | null;
  nightlyReady: boolean;
  onConnect: () => void | Promise<void>;
  onDisconnect: () => void | Promise<void>;
};

export function WalletButton({ publicKey, nightlyReady, onConnect, onDisconnect }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!publicKey) {
      setBalance(null);
      return;
    }
    const id = setInterval(async () => {
      if (cancelled) return;
      try {
        const r = await fetch('https://rpc.cookiescan.io', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'balance-check',
            method: 'getBalance',
            params: [publicKey.toBase58()],
          }),
        });
        const j = await r.json();
        const v = j?.result?.value;
        if (typeof v === 'number' && !cancelled) setBalance(v);
      } catch {
        if (!cancelled) setBalance(null);
      }
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [publicKey]);

  if (!publicKey) {
    return (
      <button
        onClick={async () => {
          if (!nightlyReady) {
            window.open('https://nightly.app', '_blank', 'noreferrer');
            return;
          }
          setConnecting(true);
          try {
            await onConnect();
          } finally {
            setConnecting(false);
          }
        }}
        disabled={connecting}
        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold transition shadow-lg shadow-amber-500/20"
      >
        {!nightlyReady
          ? 'Install Nightly'
          : connecting
          ? 'Connecting…'
          : 'Connect Nightly'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex flex-col items-end text-xs text-slate-300">
        <span className="font-mono">{truncate(publicKey.toBase58())}</span>
        {balance !== null && (
          <span className="text-slate-500">{(balance / 1e9).toFixed(6)} COOK</span>
        )}
      </div>
      <button
        onClick={onDisconnect}
        className="px-3 py-2 rounded-lg border border-slate-700 hover:border-amber-500/60 text-slate-200 text-sm transition"
      >
        Disconnect
      </button>
    </div>
  );
}
