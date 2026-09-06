'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

import { WalletButton } from '@/components/WalletButton';
import { Cookie } from '@/components/Cookie';
import { Stats } from '@/components/Stats';
import { UpgradeShop, UPGRADES, costFor } from '@/components/UpgradeShop';
import {
  buildClickTransaction,
  confirmSignature,
  makeConnection,
} from '@/lib/clicker';
import {
  CLICK_BURN_LAMPORTS,
  GOLDEN_COOKIE_CHANCE,
  GOLDEN_COOKIE_LAMPORTS,
} from '@/lib/cookiechain';

const TREASURY_PK = new PublicKey('11111111111111111111111111111111'); // TODO: replace at deploy
const STORAGE_KEY = 'click-the-cookie:v1';

type SaveState = {
  cookies: number;
  owned: Record<string, number>;
  lastTick: number; // unix ms
  lifetimeBurned: number; // lamports
  txCount: number;
};

function defaultState(): SaveState {
  return {
    cookies: 0,
    owned: {},
    lastTick: Date.now(),
    lifetimeBurned: 0,
    txCount: 0,
  };
}

export default function Home() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [save, setSave] = useState<SaveState>(defaultState);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err' | 'gold'; msg: string; sig?: string } | null>(null);
  const [goldenFlash, setGoldenFlash] = useState(false);
  const lastClickAt = useRef<number>(0);

  // Load save from localStorage on mount, scoped to wallet
  useEffect(() => {
    if (!publicKey) {
      setSave(defaultState());
      return;
    }
    const key = `${STORAGE_KEY}:${publicKey.toBase58()}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as SaveState;
        // Catch up on cps over the time we were away
        const now = Date.now();
        const cps = computeCps(parsed.owned);
        const earned = ((now - parsed.lastTick) / 1000) * cps;
        setSave({ ...parsed, cookies: parsed.cookies + earned, lastTick: now });
      } else {
        setSave(defaultState());
      }
    } catch {
      setSave(defaultState());
    }
  }, [publicKey]);

  // Persist on every change
  useEffect(() => {
    if (!publicKey) return;
    const key = `${STORAGE_KEY}:${publicKey.toBase58()}`;
    try {
      localStorage.setItem(key, JSON.stringify(save));
    } catch {}
  }, [save, publicKey]);

  // Tick for cps accumulation
  useEffect(() => {
    const id = setInterval(() => {
      setSave((s) => {
        const cps = computeCps(s.owned);
        if (cps <= 0) return { ...s, lastTick: Date.now() };
        return { ...s, cookies: s.cookies + cps, lastTick: Date.now() };
      });
    }, 200);
    return () => clearInterval(id);
  }, []);

  const perClick = useMemo(() => {
    const base = 1;
    const cursorBonus = (save.owned['cursor'] ?? 0) * 0.1;
    return base + cursorBonus;
  }, [save.owned]);

  const cps = useMemo(() => computeCps(save.owned), [save.owned]);

  const onClick = useCallback(async () => {
    if (!connected || !publicKey) {
      setToast({ kind: 'err', msg: 'Connect Nightly to click' });
      setTimeout(() => setToast(null), 2500);
      return;
    }
    // Throttle client-side: 80ms min between click tx submissions to keep the chain happy.
    const now = Date.now();
    if (now - lastClickAt.current < 80) {
      // Just give the user a visual + offline cookie (free click, no tx)
      setSave((s) => ({ ...s, cookies: s.cookies + perClick, txCount: s.txCount }));
      return;
    }
    lastClickAt.current = now;

    if (pending) return; // one in flight at a time
    setPending(true);

    const isGolden = Math.random() < GOLDEN_COOKIE_CHANCE;
    const clickNumber = save.txCount + 1;
    try {
      const tx = buildClickTransaction({
        wallet: publicKey,
        treasury: TREASURY_PK,
        clickNumber,
        burnLamports: CLICK_BURN_LAMPORTS,
        isGolden,
        goldenLamports: GOLDEN_COOKIE_LAMPORTS,
      });
      const { signature } = await (window as any).nightly?.solana?.signAndSendTransaction
        ? await (window as any).nightly.solana.signAndSendTransaction(tx)
        : await (async () => {
            // Fallback: sign via wallet adapter then send via connection
            throw new Error('Use Nightly wallet');
          })();

      // Optimistic UI update — give the cookies now, confirm async
      setSave((s) => ({
        ...s,
        cookies: s.cookies + perClick + (isGolden ? 100 : 0),
        lifetimeBurned: s.lifetimeBurned + CLICK_BURN_LAMPORTS + (isGolden ? GOLDEN_COOKIE_LAMPORTS : 0),
        txCount: s.txCount + 1,
        lastTick: Date.now(),
      }));

      if (isGolden) {
        setGoldenFlash(true);
        setTimeout(() => setGoldenFlash(false), 1500);
        setToast({ kind: 'gold', msg: `Golden Cookie! +100 🍪`, sig: signature });
      } else {
        setToast({ kind: 'ok', msg: `Click #${clickNumber} confirmed`, sig: signature });
      }
      setTimeout(() => setToast(null), 3500);

      // Confirm in the background (don't block)
      confirmSignature(signature).catch(() => {});
    } catch (err: any) {
      setToast({ kind: 'err', msg: err?.message ?? 'Click failed' });
      setTimeout(() => setToast(null), 3500);
    } finally {
      setPending(false);
    }
  }, [connected, publicKey, pending, save.txCount, perClick]);

  const onBuy = useCallback(
    (id: string) => {
      const def = UPGRADES.find((u) => u.id === id);
      if (!def) return;
      const owned = save.owned[id] ?? 0;
      const cost = costFor(def, owned);
      if (save.cookies < cost) return;
      setSave((s) => ({
        ...s,
        cookies: s.cookies - cost,
        owned: { ...s.owned, [id]: owned + 1 },
      }));
      // Off-chain buy: store upgrade tx as a memo'd on-chain call in the future.
      // For v1 it's free upgrades after you earn enough cookies.
    },
    [save]
  );

  return (
    <main className="min-h-screen flex flex-col bg-[#07111f] text-slate-100">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800/80 backdrop-blur bg-[#0b1324]/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 grid place-items-center text-amber-300 text-lg">
            🍪
          </div>
          <div>
            <div className="font-semibold tracking-tight">Click The Cookie</div>
            <div className="text-[11px] text-slate-500 -mt-0.5">
              on <a className="text-amber-300 hover:underline" href="https://www.cookiechain.wtf" target="_blank" rel="noreferrer">Cookie Chain</a>
            </div>
          </div>
        </div>
        <WalletButton />
      </header>

      <section className="flex-1 flex flex-col items-center justify-start gap-6 px-4 py-8 sm:py-12">
        <Stats
          clicks={Math.floor(save.cookies)}
          burned={save.lifetimeBurned}
          cps={cps}
          perClick={perClick}
          isGolden={goldenFlash}
        />

        <div className="relative">
          <Cookie disabled={!connected} onClick={onClick} />
          {goldenFlash && (
            <div className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-amber-300 animate-pulse" />
          )}
        </div>

        <div className="text-center text-xs text-slate-500 max-w-md">
          {connected ? (
            <>
              Every click sends a real on-chain tx on Cookie Chain — burns a tiny amount of COOK and writes a memo.
              <br />
              0.5% chance to hit a <span className="text-amber-300">Golden Cookie</span> for a bonus.
            </>
          ) : (
            <>Connect your Nightly wallet to start clicking. Every click is a real on-chain transaction.</>
          )}
        </div>

        {connected && (
          <div className="w-full max-w-2xl">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2 text-center">
              Upgrades
            </div>
            <UpgradeShop owned={save.owned} cookies={save.cookies} onBuy={onBuy} />
          </div>
        )}
      </section>

      <footer className="text-center text-[11px] text-slate-600 py-4 border-t border-slate-800/60">
        Built for the Cookie Chain cApp program. MIT licensed.
        <a className="ml-2 text-amber-300 hover:underline" href="https://github.com/" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </footer>

      {toast && (
        <div
          className={[
            'fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl border max-w-sm',
            toast.kind === 'err'
              ? 'bg-red-950/80 border-red-500/40 text-red-100'
              : toast.kind === 'gold'
              ? 'bg-amber-500/15 border-amber-400/60 text-amber-100'
              : 'bg-slate-900/80 border-slate-700 text-slate-100',
          ].join(' ')}
        >
          <div className="text-sm font-medium">{toast.msg}</div>
          {toast.sig && (
            <a
              href={`https://cookiescan.io/tx/${toast.sig}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-slate-400 hover:text-amber-300 truncate block"
            >
              {toast.sig.slice(0, 20)}…{toast.sig.slice(-10)} ↗
            </a>
          )}
        </div>
      )}
    </main>
  );
}

function computeCps(owned: Record<string, number>): number {
  let total = 0;
  for (const u of UPGRADES) {
    const count = owned[u.id] ?? 0;
    if (count > 0) total += u.cps * count;
  }
  return total;
}
