'use client';

interface ResultsPanelProps {
  picks: number[];
  draw: number[];
  hits: number;
  payout: number;
  wager: number;
  signature?: string;
  blockhash?: string;
}

export function ResultsPanel({ picks, draw, hits, payout, wager, signature, blockhash }: ResultsPanelProps) {
  const profit = payout - wager;

  return (
    <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 space-y-4">
      <div className="text-center">
        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Results</div>
        <div className="text-3xl font-bold text-white">
          {hits} / {draw.length} <span className="text-slate-500 text-lg">hits</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-slate-800/60 rounded-lg p-3">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Wager</div>
          <div className="text-lg font-mono text-slate-300">{wager.toFixed(2)} COOK</div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Payout</div>
          <div className={`text-lg font-mono ${payout > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {payout.toFixed(2)} COOK
          </div>
        </div>
      </div>

      {payout > 0 && (
        <div className="text-center bg-green-500/10 border border-green-500/30 rounded-lg py-2">
          <div className="text-sm text-green-400">+{profit.toFixed(2)} COOK profit</div>
        </div>
      )}

      {/* Provably Fair Section */}
      {blockhash && (
        <div className="border-t border-slate-700/60 pt-4 space-y-2">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Provably Fair</div>
          <div className="text-xs font-mono text-slate-400 break-all bg-slate-800/60 rounded p-2">
            Blockhash: {blockhash.slice(0, 20)}...{blockhash.slice(-10)}
          </div>
          <div className="text-[10px] text-slate-500">
            Draw derived from blockhash bytes → mod 40 → 8 unique numbers
          </div>
          <a
            href={`https://cookiescan.io/block/${blockhash}`}
            target="_blank"
            rel="noreferrer"
            className="block text-center text-xs text-amber-500 hover:text-amber-400"
          >
            View block on CookieScan ↗
          </a>
        </div>
      )}

      {signature && (
        <a
          href={`https://cookiescan.io/tx/${signature}`}
          target="_blank"
          rel="noreferrer"
          className="block text-center text-xs text-amber-400 hover:text-amber-300 truncate"
        >
          {signature.slice(0, 12)}…{signature.slice(-6)} ↗
        </a>
      )}
    </div>
  );
}
