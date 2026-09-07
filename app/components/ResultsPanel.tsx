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
    <div className="card p-4 space-y-4 animate-fade-in">
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Results</div>
        <div className="text-4xl font-bold gold-text">
          {hits} <span style={{ color: 'var(--text-secondary)' }}>/ {draw.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 text-center" style={{ background: 'var(--bg-card)' }}>
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Wager</div>
          <div className="text-lg font-mono">{wager.toFixed(2)} COOK</div>
        </div>
        <div className="p-3 text-center" style={{ background: 'var(--bg-card)' }}>
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Payout</div>
          <div className="text-lg font-mono" style={{ color: payout > 0 ? '#22c55e' : '#ef4444' }}>
            {payout.toFixed(2)} COOK
          </div>
        </div>
      </div>

      {payout > 0 && (
        <div className="text-center p-2" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <div style={{ color: '#22c55e' }}>+{profit.toFixed(2)} COOK profit</div>
        </div>
      )}

      {blockhash && (
        <div className="border-t pt-4 space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Provably Fair</div>
          <div className="text-xs font-mono break-all p-2" style={{ background: '#0a0a0f' }}>
            {blockhash.slice(0, 20)}...{blockhash.slice(-10)}
          </div>
          <a
            href={`https://cookiescan.io/block/${blockhash}`}
            target="_blank"
            rel="noreferrer"
            className="block text-center text-xs gold-text"
          >
            VIEW ON COOKIESCAN ↗
          </a>
        </div>
      )}

      {signature && (
        <a
          href={`https://cookiescan.io/tx/${signature}`}
          target="_blank"
          rel="noreferrer"
          className="block text-center text-xs gold-text truncate"
        >
          {signature.slice(0, 12)}…{signature.slice(-6)} ↗
        </a>
      )}
    </div>
  );
}
