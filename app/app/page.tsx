'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

import { WalletButton } from '@/components/WalletButton';
import { Cookie } from '@/components/Cookie';
import { Stats } from '@/components/Stats';
import { UpgradeShop, UPGRADES, costFor } from '@/components/UpgradeShop';
import { buildClickTransaction, confirmSignature } from '@/lib/clicker';
import { CLICK_BURN_LAMPORTS, GOLDEN_COOKIE_CHANCE } from '@/lib/cookiechain';

const TREASURY_PK = new PublicKey('5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29');
const STORAGE_KEY = 'click-the-cookie:v1';

// Direct window.nightly access — bypasses the wallet adapter for reliability.
// We only trust a publicKey AFTER a successful connect() call, because
// Nightly exposes a SystemProgram placeholder publicKey when not connected.
type NightlyProvider = {
  isNightly?: boolean;
  publicKey?: PublicKey | null;
  isConnected?: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction?: (tx: any, opts?: any) => Promise<{ signature: string }>;
  signTransaction: (tx: any) => Promise<any>;
};

const PLACEHOLDER_PK = new PublicKey('11111111111111111111111111111111');

function getNightly(): NightlyProvider | null {
  if (typeof window === 'undefined') return null;
  return (window as any).nightly?.solana ?? null;
}

function isPlaceholder(pk: PublicKey | null | undefined): boolean {
  if (!pk) return true;
  try {
    if (pk.equals(PLACEHOLDER_PK)) return true;
    // Also catch all-zero or all-equal bytes — some wallets use these as
    // a placeholder before unlock / before chain selection.
    const b = pk.toBytes();
    const allSame = b.every((x) => x === b[0]);
    if (allSame) return true;
    return false;
  } catch {
    return true;
  }
}

// Wait for Nightly to settle on a non-placeholder publicKey after connect().
// connect() resolves before Nightly has updated its publicKey, so a single
// read is racy. Poll for up to `timeoutMs`.
async function waitForRealPublicKey(n: NightlyProvider, timeoutMs: number): Promise<PublicKey | null> {
  const start = Date.now();
  let last: PublicKey | null = null;
  while (Date.now() - start < timeoutMs) {
    const cur = n.publicKey ?? null;
    if (cur && !isPlaceholder(cur)) return cur;
    if (cur) last = cur;
    await new Promise((r) => setTimeout(r, 100));
  }
  return last;
}

type SaveState = {
  cookies: number;
  owned: Record<string, number>;
  lastTick: number;
  lifetimeBurned: number;
  txCount: number;
  goldenCount: number;
};

function defaultState(): SaveState {
  return {
    cookies: 0,
    owned: {},
    lastTick: Date.now(),
    lifetimeBurned: 0,
    txCount: 0,
    goldenCount: 0,
  };
}

export default function Home() {
  const { connection } = useConnection();
  const [nightlyReady, setNightlyReady] = useState(false);
  const [nightlyPk, setNightlyPk] = useState<PublicKey | null>(null);
  const [save, setSave] = useState<SaveState>(defaultState);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err' | 'gold'; msg: string; sig?: string } | null>(null);
  const [goldenFlash, setGoldenFlash] = useState(false);
  const lastClickAt = useRef<number>(0);

  // Poll for Nightly provider presence only (not the publicKey, since that
  // can be a placeholder until connect() runs).
  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const n = getNightly();
      setNightlyReady(!!n);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const publicKey = nightlyPk;

  // Load save from localStorage, scoped to wallet
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

  // CPS tick
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

  const canClick = nightlyReady;

  const handleConnect = useCallback(async () => {
    const n = getNightly();
    if (!n) {
      window.open('https://nightly.app', '_blank', 'noreferrer');
      return;
    }
    try {
      await n.connect();
      // Just trust whatever n.publicKey is. If it's the placeholder, we'll
      // show the raw value in the UI so the user can tell us what Nightly
      // is actually returning. Don't gate on it.
      const pk = n.publicKey ?? PLACEHOLDER_PK;
      setNightlyPk(pk);
      // If we got a real key, also flash a toast for confirmation
      if (!isPlaceholder(pk)) {
        setToast({ kind: 'ok', msg: `Connected: ${pk.toBase58().slice(0, 6)}…` });
        setTimeout(() => setToast(null), 2500);
      }
    } catch (e: any) {
      setToast({ kind: 'err', msg: e?.message ?? 'Connect failed' });
      setTimeout(() => setToast(null), 5000);
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    const n = getNightly();
    if (n) {
      try {
        await n.disconnect();
      } catch {}
    }
    setNightlyPk(null);
  }, []);

  const onClick = useCallback(async () => {
    const n = getNightly();
    if (!n) {
      setToast({ kind: 'err', msg: 'Nightly not detected. Install from https://nightly.app' });
      setTimeout(() => setToast(null), 3500);
      return;
    }

    // Always re-read n.publicKey right before signing — Nightly updates
    // it asynchronously, so the value at click time is the source of truth.
    let wallet = n.publicKey ?? publicKey ?? PLACEHOLDER_PK;
    if (isPlaceholder(wallet)) {
      // Try a real connect one more time
      try {
        await n.connect();
        wallet = n.publicKey ?? wallet;
      } catch (e: any) {
        setToast({ kind: 'err', msg: e?.message ?? 'Connect failed' });
        setTimeout(() => setToast(null), 5000);
        return;
      }
    }
    setNightlyPk(wallet);

    // Throttle
    const now = Date.now();
    if (now - lastClickAt.current < 80) {
      setSave((s) => ({ ...s, cookies: s.cookies + perClick, txCount: s.txCount + 1 }));
      return;
    }
    lastClickAt.current = now;
    if (pending) return;
    setPending(true);

    const isGolden = Math.random() < GOLDEN_COOKIE_CHANCE;
    const clickNumber = save.txCount + 1;

    try {
      // Build the tx
      const tx = buildClickTransaction({
        wallet,
        treasury: TREASURY_PK,
        clickNumber,
        burnLamports: CLICK_BURN_LAMPORTS,
        isGolden,
      });

      // Set a real recent blockhash from the Cookie Chain RPC
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;

      // Sign with Nightly (works on every Solana-like wallet)
      const signed = await n.signTransaction(tx);

      // Submit via the connection (uses our Cookie Chain RPC)
      const raw = signed.serialize();
      const signature = await connection.sendRawTransaction(raw, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      // Optimistic UI update
      setSave((s) => ({
        ...s,
        cookies: s.cookies + perClick + (isGolden ? 100 : 0),
        lifetimeBurned: s.lifetimeBurned + CLICK_BURN_LAMPORTS,
        txCount: s.txCount + 1,
        goldenCount: s.goldenCount + (isGolden ? 1 : 0),
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

      // Background confirmation
      confirmSignature(signature).catch(() => {});
    } catch (err: any) {
      const raw = String(err?.message ?? err ?? 'Click failed');
      setToast({ kind: 'err', msg: raw.length > 160 ? raw.slice(0, 157) + '…' : raw });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setPending(false);
    }
  }, [pending, save.txCount, perClick, publicKey, connection]);

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
              on{' '}
              <a className="text-amber-300 hover:underline" href="https://www.cookiechain.wtf" target="_blank" rel="noreferrer">
                Cookie Chain
              </a>
            </div>
          </div>
        </div>
        <WalletButton
          publicKey={publicKey}
          nightlyReady={nightlyReady}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </header>

      {/* Debug strip — only visible when the address looks like a placeholder */}
      {typeof window !== 'undefined' && publicKey && isPlaceholder(publicKey) && (
        <div className="bg-red-950/60 border-b border-red-500/40 px-4 py-2 text-xs text-red-200 font-mono">
          DEBUG: Nightly publicKey = <span className="text-amber-300">{publicKey.toBase58()}</span>
          {' · '}isConnected = {String((window as any).nightly?.solana?.isConnected)}
          {' · '}Click the cookie; the actual error from the chain will show what Nightly is doing.
        </div>
      )}

      <section className="flex-1 flex flex-col items-center justify-start gap-6 px-4 py-8 sm:py-12">
        <Stats
          clicks={Math.floor(save.cookies)}
          burned={save.lifetimeBurned}
          cps={cps}
          perClick={perClick}
          goldenCount={save.goldenCount}
          isGolden={goldenFlash}
        />

        <div className="relative">
          <Cookie disabled={!canClick} onClick={onClick} />
          {goldenFlash && (
            <div className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-amber-300 animate-pulse" />
          )}
        </div>

        <div className="text-center text-xs text-slate-500 max-w-md">
          {!nightlyReady ? (
            <span className="text-amber-300/80">
              Install{' '}
              <a className="underline" href="https://nightly.app" target="_blank" rel="noreferrer">
                Nightly
              </a>{' '}
              and refresh.
            </span>
          ) : publicKey ? (
            <>
              Every click sends a real on-chain tx on Cookie Chain — burns a tiny amount of COOK and writes a memo.
              <br />
              0.5% chance to hit a <span className="text-amber-300">Golden Cookie</span> for a bonus.
            </>
          ) : (
            <>
              Nightly detected.{' '}
              <span className="text-amber-300">Click the cookie</span> to connect and start clicking.
            </>
          )}
        </div>

        {publicKey && (
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
