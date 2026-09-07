'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { createMemoInstruction } from '@solana/spl-memo';

import { KenoBoard } from '@/components/KenoBoard';
import { WagerPanel } from '@/components/WagerPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import { Leaderboard } from '@/components/Leaderboard';
import { JackpotDisplay } from '@/components/JackpotDisplay';
import { Celebration } from '@/components/Celebration';
import { ResultPopup } from '@/components/ResultPopup';
import { ConnectScreen } from '@/components/ConnectScreen';
import { HowToPlay } from '@/components/HowToPlay';
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
const COOK_NAME_MULTIPLIER = 1.5;

const PLACEHOLDER_PK = new PublicKey('11111111111111111111111111111111');

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

type TabType = 'leaderboard' | 'history' | 'howto';

export default function Home() {
  const { connection } = useConnection();
  const [nightlyReady, setNightlyReady] = useState(false);
  const [nightlyPk, setNightlyPk] = useState<PublicKey | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [wager, setWager] = useState(0.1);
  const [hasCookName, setHasCookName] = useState(false);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err' | 'win'; msg: string; sig?: string } | null>(null);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [roundHistory, setRoundHistory] = useState<RoundResult[]>([]);
  const [jackpot, setJackpot] = useState(0);
  const [jackpotTriggered, setJackpotTriggered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'win' | 'jackpot'>('win');
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');
  const [balance, setBalance] = useState(0);

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

  // Check for existing wallet connection on mount
  useEffect(() => {
    const n = getNightly();
    if (n?.publicKey && !isPlaceholder(n.publicKey)) {
      setNightlyPk(n.publicKey);
      fetchBalance(n.publicKey);
    }
  }, []);

  const publicKey = nightlyPk;

  const fetchBalance = useCallback(async (pk: PublicKey) => {
    try {
      // Get SOL balance first
      const solBalance = await connection.getBalance(pk, 'confirmed');
      // Convert from lamports to SOL (assuming 1 SOL = 1 COOK for simplicity, or use token balance)
      const balanceInTokens = solBalance / 1e9;
      setBalance(balanceInTokens);
    } catch (e) {
      console.error('Failed to fetch balance:', e);
      setBalance(0);
    }
  }, [connection]);

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
        // Fetch balance after connect
        fetchBalance(pk);
      }
    } catch (e: any) {
      setToast({ kind: 'err', msg: e?.message ?? 'Connect failed' });
      setTimeout(() => setToast(null), 5000);
    }
  }, [fetchBalance]);

  const handleDisconnect = useCallback(async () => {
    const n = getNightly();
    if (n) {
      try {
        await n.disconnect();
      } catch {}
    }
    setNightlyPk(null);
    setBalance(0);
  }, []);

  const canPlay = nightlyReady && publicKey && selectedNumbers.length >= MIN_PICKS && wager >= MIN_WAGER && !pending && balance >= wager;

  const handlePlay = useCallback(async () => {
    if (!canPlay) {
      if (balance < wager && wager > 0) {
        setToast({ kind: 'err', msg: `Insufficient balance. Need ${wager.toFixed(2)} COOK, have ${balance.toFixed(2)}` });
        setTimeout(() => setToast(null), 4000);
      }
      return;
    }

    const n = getNightly();
    if (!n) {
      setToast({ kind: 'err', msg: 'Nightly not detected' });
      setTimeout(() => setToast(null), 3500);
      return;
    }

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
      const lamports = Math.floor(wager * 1e9);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet,
          toPubkey: TREASURY_PK,
          lamports,
        }),
        createMemoInstruction(`keno:v1 picks=${selectedNumbers.join(',')}`)
      );

      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet;

      const signed = await n.signTransaction(tx);
      const raw = signed.serialize();
      const signature = await connection.sendRawTransaction(raw, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      const draw = deriveDraw(blockhash);
      const hits = countHits(selectedNumbers, draw);

      const isJackpotRound = Math.random() < JACKPOT_CHANCE;
      const jackpotContribution = wager * JACKPOT_CONTRIBUTION_RATE;
      const newJackpot = jackpot + jackpotContribution;
      const jackpotWin = isJackpotRound && hits > 0;
      const jackpotAmount = jackpotWin ? newJackpot : 0;

      const rawPayout = calculatePayout(selectedNumbers.length, hits) * wager;
      const multiplier = hasCookName ? COOK_NAME_MULTIPLIER : 1;
      const payout = (rawPayout * multiplier) + jackpotAmount;

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
      setRoundHistory((prev) => [result, ...prev].slice(0, 50));

      if (payout > 0) {
        const jackpotMsg = jackpotWin ? ` JACKPOT +${jackpotAmount.toFixed(2)}!` : '';
        setToast({ kind: 'win', msg: `Won ${payout.toFixed(2)} COOK!${jackpotMsg} (demo)`, sig: signature });
        setCelebrationType(jackpotWin ? 'jackpot' : 'win');
        setShowCelebration(true);
        setShowResultPopup(true);
        setTimeout(() => setShowCelebration(false), 3000);
      } else {
        setShowResultPopup(true);
        setToast({ kind: 'ok', msg: `Round complete - ${hits} hits`, sig: signature });
      }
      setTimeout(() => setToast(null), 4000);

      setSelectedNumbers([]);
      setTimeout(() => setJackpotTriggered(false), 3000);

    } catch (err: any) {
      const raw = String(err?.message ?? err ?? 'Play failed');
      setToast({ kind: 'err', msg: raw.length > 160 ? raw.slice(0, 157) + '…' : raw });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setPending(false);
    }
  }, [canPlay, publicKey, selectedNumbers, wager, connection, jackpot, hasCookName]);

  const handleDebugPlay = useCallback(() => {
    if (selectedNumbers.length < MIN_PICKS) {
      console.log('Select at least', MIN_PICKS, 'numbers');
      return;
    }
    const fakeBlockhash = Math.random().toString(36).slice(2, 34);
    const draw = deriveDraw(fakeBlockhash);
    const hits = countHits(selectedNumbers, draw);

    const isJackpotRound = Math.random() < JACKPOT_CHANCE;
    const jackpotContribution = wager * JACKPOT_CONTRIBUTION_RATE;
    const newJackpot = jackpot + jackpotContribution;
    const jackpotWin = isJackpotRound && hits > 0;
    const jackpotAmount = jackpotWin ? newJackpot : 0;

    const rawPayout = calculatePayout(selectedNumbers.length, hits) * wager;
    const multiplier = hasCookName ? COOK_NAME_MULTIPLIER : 1;
    const payout = (rawPayout * multiplier) + jackpotAmount;

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
    setRoundHistory((prev) => [result, ...prev].slice(0, 50));
    setSelectedNumbers([]);
    console.log('Debug play:', result);
  }, [selectedNumbers, wager, jackpot, hasCookName]);

  if (!publicKey) {
    return (
      <>
        <ConnectScreen onConnect={handleConnect} onSkip={handleDebugPlay} nightlyReady={nightlyReady} />
        {toast && (
          <div className={['fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl border max-w-sm',
            toast.kind === 'err' ? 'bg-red-950/80 border-red-500/40 text-red-100' :
            toast.kind === 'win' ? 'bg-green-500/15 border-green-400/60 text-green-100' :
            'bg-slate-900/80 border-slate-700 text-slate-100'
          ].join(' ')}>
            <div className="text-sm font-medium">{toast.msg}</div>
          </div>
        )}
      </>
    );
  }

  return (
    <main className="min-h-screen flex flex-col text-slate-100 overflow-x-hidden" style={{ background: 'var(--bg-deep)' }}>
      <header className="flex items-center justify-between px-4 py-4" style={{ background: 'var(--bg-deep)' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 25%, #2a2110, #0f0f16)' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, color: 'var(--accent-gold)', letterSpacing: '.06em' }}>CK</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '.18em', color: 'var(--accent-gold)', lineHeight: 1 }}>COOKIE KENO</h1>
            <span style={{ fontSize: 7.5, letterSpacing: '.22em', color: 'var(--text-muted)' }}>ON CHAIN • PROVABLY FAIR</span>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, padding: '7px 10px', border: '1px solid var(--border-subtle)', borderRadius: 9, background: 'var(--bg-card)', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 8, letterSpacing: '.14em', color: 'var(--text-muted)' }}>BALANCE</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-gold)' }}>{balance.toFixed(2)} COOK</span>
        </button>
      </header>

      <section className="flex-1 flex flex-col items-start gap-4 px-4 pb-24 max-w-xl mx-auto w-full">
        <JackpotDisplay jackpot={jackpot} triggered={jackpotTriggered} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveTab('leaderboard')}
            style={{ flex: 1, textAlign: 'center', padding: '9px 0', border: `1px solid ${activeTab === 'leaderboard' ? 'var(--accent-gold)' : 'var(--border-subtle)'}`, borderRadius: 9, background: 'var(--bg-card)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: '.16em', color: activeTab === 'leaderboard' ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer' }}
          >
            LEADERBOARD
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{ flex: 1, textAlign: 'center', padding: '9px 0', border: `1px solid ${activeTab === 'history' ? 'var(--accent-gold)' : 'var(--border-subtle)'}`, borderRadius: 9, background: 'var(--bg-card)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: '.16em', color: activeTab === 'history' ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer' }}
          >
            MY ROUNDS
          </button>
          <button
            onClick={() => setActiveTab('howto')}
            style={{ width: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${activeTab === 'howto' ? 'var(--accent-gold)' : 'var(--border-subtle)'}`, borderRadius: 9, background: 'var(--bg-card)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: activeTab === 'howto' ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer' }}
          >
            ?
          </button>
        </div>

        {activeTab === 'howto' ? (
          <HowToPlay />
        ) : activeTab === 'history' ? (
          <div className="w-full">
            {roundHistory.length === 0 ? (
              <div style={{ padding: 34, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                No rounds yet. Pick numbers and play.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {roundHistory.slice(0, 20).map((r, i) => (
                  <div key={r.timestamp} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', border: '1px solid #1e1e28', borderRadius: 10, background: 'var(--bg-card)' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{r.hits} / 8 HITS</span>
                      <span style={{ fontSize: 8.5, letterSpacing: '.08em', color: 'var(--text-muted)' }}>{r.picks.length} picks • {r.wager.toFixed(1)} COOK</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.payout > 0 ? '#22c55e' : '#ef4444' }}>
                      {r.payout > 0 ? '+' : ''}{r.payout.toFixed(2)} COOK
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Leaderboard />
        )}

        <div className="w-full flex items-center justify-between">
          <span style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--text-secondary)' }}>SELECTED <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{selectedNumbers.length}</span> / {MAX_PICKS}</span>
          <button onClick={() => setSelectedNumbers([])} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: '.16em', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>CLEAR</button>
        </div>

        <div className="w-full">
          <KenoBoard
            selected={selectedNumbers}
            onSelect={setSelectedNumbers}
            drawNumbers={lastResult?.draw}
            hitNumbers={lastResult ? lastResult.picks.filter(p => lastResult.draw.includes(p)) : []}
          />
        </div>

        <div className="w-full">
          <WagerPanel
            wager={wager}
            onWagerChange={setWager}
            onPlay={handlePlay}
            disabled={selectedNumbers.length < MIN_PICKS}
            pending={pending}
          />
        </div>

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

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: '.28em', color: 'var(--accent-gold-dim)' }}>PICK 1-10 • 8 DRAWN</span>
          <span style={{ fontSize: 8, letterSpacing: '.1em', color: 'var(--text-muted)' }}>TREASURY 5Nhc…iDf29</span>
        </div>
      </section>

      <Celebration active={showCelebration} type={celebrationType} />
      {lastResult && (
        <ResultPopup
          hits={lastResult.hits}
          payout={lastResult.payout}
          wager={lastResult.wager}
          blockhash={lastResult.blockhash}
          active={showResultPopup}
          onClose={() => setShowResultPopup(false)}
        />
      )}

      <footer className="text-center py-3" style={{ background: 'var(--bg-deep)' }}>
        <a href="https://x.com/Theecryptopimp" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-gold)', fontSize: 11, letterSpacing: '.1em' }}>@Theecryptopimp</a>
      </footer>

      {toast && (
        <div className={['fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl border max-w-sm z-50',
          toast.kind === 'err' ? 'bg-red-950/80 border-red-500/40 text-red-100' :
          toast.kind === 'win' ? 'bg-green-500/15 border-green-400/60 text-green-100' :
          'bg-slate-900/80 border-slate-700 text-slate-100'
        ].join(' ')}>
          <div className="text-sm font-medium">{toast.msg}</div>
          {toast.sig && (
            <a href={`https://cookiescan.io/tx/${toast.sig}`} target="_blank" rel="noreferrer" className="text-[10px] text-slate-400 hover:text-amber-300 truncate block">
              {toast.sig.slice(0, 20)}…{toast.sig.slice(-10)} ↗
            </a>
          )}
        </div>
      )}
    </main>
  );
}
