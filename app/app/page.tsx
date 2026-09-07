'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { createMemoInstruction } from '@solana/spl-memo';

import { WalletButton } from '@/components/WalletButton';
import { KenoBoard } from '@/components/KenoBoard';
import { WagerPanel } from '@/components/WagerPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import { Leaderboard } from '@/components/Leaderboard';
import { MultiplierBadge } from '@/components/MultiplierBadge';
import { JackpotDisplay } from '@/components/JackpotDisplay';
import { Celebration } from '@/components/Celebration';
import {
  MIN_PICKS,
  MAX_PICKS,
  MIN_WAGER,
  MAX_WAGER,
  JACKPOT_CONTRIBUTION_RATE,
  JACKPOT_CHANCE,
  deriveDraw,
  countHits,
  calculatePayout,
} from '@/lib/keno';

const TREASURY_PK = new PublicKey('5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29');
const COOKIE_CHAIN_RPC = 'https://rpc.cookiescan.io';
const COOK_NAME_MULTIPLIER = 1.5; // 50% bonus for .cook name holders

const PLACEHOLDER_PK = new PublicKey('11111111111111111111111111111111');

// Note: Payouts are calculated but not sent in this demo version.
// For production, use a server-side API route to sign payout transactions.

type NightlyProvider = {
  isNightly?: boolean;
  publicKey?: PublicKey | null;
  isConnected?: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: any) => Promise<any>;
};

function getNightly(): NightlyProvider | null {
  if (typeof window === 'undefined') return null;
  return (window as any).nightly?.solana ?? null;
}

function isPlaceholder(pk: PublicKey | null | undefined): boolean {
  if (!pk) return true;
  try {
    if (pk.equals(PLACEHOLDER_PK)) return true;
    const b = pk.toBytes();
    const allSame = b.every((x) => x === b[0]);
    if (allSame) return true;
    return false;
  } catch {
    return true;
  }
}

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

type RoundResult = {
  picks: number[];
  draw: number[];
  hits: number;
  payout: number;
  wager: number;
  signature?: string;
  blockhash?: string;
  jackpotWon: boolean;
  jackpotAmount: number;
  timestamp: number;
};

export default function Home() {
  const { connection } = useConnection();
  const [nightlyReady, setNightlyReady] = useState(false);
  const [nightlyPk, setNightlyPk] = useState<PublicKey | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [wager, setWager] = useState(0.1);
  const [hasCookName, setHasCookName] = useState(false); // Toggle for demo - real impl needs name service
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err' | 'win'; msg: string; sig?: string } | null>(null);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [roundHistory, setRoundHistory] = useState<RoundResult[]>([]);
  const [jackpot, setJackpot] = useState(0); // Progressive jackpot pool
  const [jackpotTriggered, setJackpotTriggered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'win' | 'jackpot'>('win');

  // Poll for Nightly provider
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

  const handleConnect = useCallback(async () => {
    const n = getNightly();
    if (!n) {
      window.open('https://nightly.app', '_blank', 'noreferrer');
      return;
    }
    try {
      await n.connect();
      const pk = n.publicKey ?? PLACEHOLDER_PK;
      setNightlyPk(pk);
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

  const canPlay = nightlyReady && publicKey && selectedNumbers.length >= MIN_PICKS && wager >= MIN_WAGER && !pending;

  const handlePlay = useCallback(async () => {
    if (!canPlay) return;

    const n = getNightly();
    if (!n) {
      setToast({ kind: 'err', msg: 'Nightly not detected' });
      setTimeout(() => setToast(null), 3500);
      return;
    }

    // Refresh public key
    let wallet = n.publicKey ?? publicKey ?? PLACEHOLDER_PK;
    if (isPlaceholder(wallet)) {
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

    setPending(true);

    try {
      // Build wager transaction
      const lamports = Math.floor(wager * 1e9); // COOK has 9 decimals
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet,
          toPubkey: TREASURY_PK,
          lamports,
        }),
        createMemoInstruction(`keno:v1 picks=${selectedNumbers.join(',')}`)
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet;

      // Sign with Nightly
      const signed = await n.signTransaction(tx);

      // Send transaction
      const raw = signed.serialize();
      const signature = await connection.sendRawTransaction(raw, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      // Derive draw from blockhash (provably fair)
      const draw = deriveDraw(blockhash);
      const hits = countHits(selectedNumbers, draw);

      // Progressive jackpot
      const isJackpotRound = Math.random() < JACKPOT_CHANCE;
      const jackpotContribution = wager * JACKPOT_CONTRIBUTION_RATE;
      const newJackpot = jackpot + jackpotContribution;
      const jackpotWin = isJackpotRound && hits > 0;
      const jackpotAmount = jackpotWin ? newJackpot : 0;

      const rawPayout = calculatePayout(selectedNumbers.length, hits) * wager;
      const multiplier = hasCookName ? COOK_NAME_MULTIPLIER : 1;
      const payout = (rawPayout * multiplier) + jackpotAmount;

      // Update jackpot pool
      setJackpot(isJackpotRound ? 0 : newJackpot);
      setJackpotTriggered(isJackpotRound);

      const result: RoundResult = {
        picks: selectedNumbers,
        draw,
        hits,
        payout,
        jackpotWon: jackpotWin,
        jackpotAmount,
        wager,
        signature,
        blockhash,
        timestamp: Date.now(),
      };

      setLastResult(result);
      setRoundHistory((prev) => [result, ...prev].slice(0, 10));

      if (payout > 0) {
        const jackpotMsg = jackpotWin ? ` 🎰 JACKPOT +${jackpotAmount.toFixed(2)}!` : '';
        setToast({ kind: 'win', msg: `Won ${payout.toFixed(2)} COOK!${jackpotMsg} (demo)`, sig: signature });
        // Trigger celebration
        setCelebrationType(jackpotWin ? 'jackpot' : 'win');
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      } else {
        setToast({ kind: 'ok', msg: `Round complete - ${hits} hits`, sig: signature });
      }
      setTimeout(() => setToast(null), 4000);

      // Clear selection for next round
      setSelectedNumbers([]);
      // Reset jackpot triggered after showing
      setTimeout(() => setJackpotTriggered(false), 3000);

    } catch (err: any) {
      const raw = String(err?.message ?? err ?? 'Play failed');
      setToast({ kind: 'err', msg: raw.length > 160 ? raw.slice(0, 157) + '…' : raw });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setPending(false);
    }
  }, [canPlay, publicKey, selectedNumbers, wager, connection]);

  // Console log for testing without wallet
  const handleDebugPlay = useCallback(() => {
    if (selectedNumbers.length < MIN_PICKS) {
      console.log('Select at least', MIN_PICKS, 'numbers');
      return;
    }
    // Simulate a draw (debug mode)
    const fakeBlockhash = Math.random().toString(36).slice(2, 34);
    const draw = deriveDraw(fakeBlockhash);
    const hits = countHits(selectedNumbers, draw);

    // Progressive jackpot (debug mode)
    const isJackpotRound = Math.random() < JACKPOT_CHANCE;
    const jackpotContribution = wager * JACKPOT_CONTRIBUTION_RATE;
    const newJackpot = jackpot + jackpotContribution;
    const jackpotWin = isJackpotRound && hits > 0;
    const jackpotAmount = jackpotWin ? newJackpot : 0;

    const rawPayout = calculatePayout(selectedNumbers.length, hits) * wager;
    const multiplier = hasCookName ? COOK_NAME_MULTIPLIER : 1;
    const payout = (rawPayout * multiplier) + jackpotAmount;

    // Update jackpot
    setJackpot(isJackpotRound ? 0 : newJackpot);
    setJackpotTriggered(isJackpotRound);

    const result: RoundResult = {
      picks: selectedNumbers,
      draw,
      hits,
      payout,
      wager,
      jackpotWon: jackpotWin,
      jackpotAmount,
      blockhash: fakeBlockhash,
      timestamp: Date.now(),
    };

    setLastResult(result);
    setRoundHistory((prev) => [result, ...prev].slice(0, 10));
    setSelectedNumbers([]);
    console.log('Debug play:', result);
  }, [selectedNumbers, wager]);

  return (
    <main className="min-h-screen flex flex-col text-slate-100 overflow-x-hidden">
      <header className="header flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4">
          <img
            src="/images/logo3.jpg"
            alt="Cookie Keno"
            className="w-28 h-28 rounded-xl border-2"
            style={{ objectFit: 'cover', borderColor: 'var(--accent-gold)' }}
          />
          <div>
            <h1 className="text-xl tracking-widest gold-text">COOKIE KENO</h1>
            <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>ON CHAIN • PROVABLY FAIR</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {publicKey && (
            <button
              onClick={() => setHasCookName(!hasCookName)}
              className="transition-opacity hover:opacity-80"
            >
              <MultiplierBadge
                active={hasCookName}
                label=".cook holder"
                multiplier={COOK_NAME_MULTIPLIER}
              />
            </button>
          )}
          <WalletButton
            publicKey={publicKey}
            nightlyReady={nightlyReady}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        </div>
      </header>

      <section className="flex-1 flex flex-col items-start gap-6 px-4 py-6 sm:py-8 max-w-3xl mx-auto w-full">
        {/* Jackpot Display */}
        <JackpotDisplay jackpot={jackpot} triggered={jackpotTriggered} />

        {/* Selection info */}
        <div className="w-full flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Selected: <span className="text-amber-400 font-semibold">{selectedNumbers.length}</span> / {MAX_PICKS}
          </span>
          <button
            onClick={() => setSelectedNumbers([])}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        </div>

        {/* Keno Board */}
        <div className="w-full">
          <KenoBoard
            selected={selectedNumbers}
            onSelect={setSelectedNumbers}
            drawNumbers={lastResult?.draw}
            hitNumbers={lastResult ? lastResult.picks.filter(p => lastResult.draw.includes(p)) : []}
          />
        </div>

        {/* Wager Panel */}
        <div className="w-full">
          <WagerPanel
            wager={wager}
            onWagerChange={setWager}
            onPlay={publicKey ? handlePlay : handleDebugPlay}
            disabled={selectedNumbers.length < MIN_PICKS}
            pending={pending}
          />
        </div>

        {!publicKey && (
          <div className="w-full text-center text-xs text-slate-500 bg-slate-800/40 rounded-lg py-2">
            Connect wallet to play for real COOK — or play debug mode (no tx)
          </div>
        )}

        {/* Last Result */}
        {lastResult && (
          <div className="w-full">
            <ResultsPanel
              picks={lastResult.picks}
              draw={lastResult.draw}
              hits={lastResult.hits}
              payout={lastResult.payout}
              wager={lastResult.wager}
              signature={lastResult.signature}
              blockhash={lastResult.blockhash}
            />
          </div>
        )}

        {/* History */}
        {roundHistory.length > 1 && (
          <div className="w-full">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Recent Rounds</div>
            <div className="space-y-1">
              {roundHistory.slice(1).map((r, i) => (
                <div key={r.timestamp} className="flex items-center justify-between text-xs bg-slate-800/40 rounded px-3 py-2">
                  <span className="text-slate-400">
                    {r.picks.length} picks → {r.hits} hits
                  </span>
                  <span className={r.payout > 0 ? 'text-green-400' : 'text-red-400'}>
                    {r.payout > 0 ? '+' : ''}{r.payout.toFixed(2)} COOK
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Leaderboard - full width below main game */}
      <section className="px-4 pb-6 max-w-3xl mx-auto w-full">
        <Leaderboard />
      </section>

      <Celebration active={showCelebration} type={celebrationType} />

      <footer className="footer text-center text-[11px] py-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span>🎰 Pick 1-10 • 8 drawn • Win based on hits</span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="text-slate-600">Treasury: <code className="text-amber-400/60">5Nhcsv4ip2dF5...</code></span>
        </div>
      </footer>

      {toast && (
        <div
          className={[
            'fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl border max-w-sm',
            toast.kind === 'err'
              ? 'bg-red-950/80 border-red-500/40 text-red-100'
              : toast.kind === 'win'
              ? 'bg-green-500/15 border-green-400/60 text-green-100'
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
