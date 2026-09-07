'use client';

interface JackpotDisplayProps {
  jackpot: number;
  triggered: boolean;
}

export function JackpotDisplay({ jackpot, triggered }: JackpotDisplayProps) {
  return (
    <div className={`jackpot-card rounded-xl p-4 transition-all duration-500 ${triggered ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold tracking-widest" style={{ color: 'var(--accent-gold)' }}>JACKPOT</div>
          <div>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent-gold)' }}>Progressive Jackpot</div>
            <div className="text-2xl font-bold font-mono gold-text">
              {jackpot.toFixed(2)} <span className="text-sm" style={{ color: 'var(--accent-gold-dim)' }}>COOK</span>
            </div>
          </div>
        </div>
        {triggered && (
          <div className="text-center">
            <div className="text-2xl font-bold animate-bounce" style={{ color: 'var(--accent-gold)' }}>★ WIN ★</div>
            <div className="text-xs font-bold gold-text tracking-widest">JACKPOT!</div>
          </div>
        )}
      </div>
      <div className="mt-3 text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
        1% of each wager → Pool • 0.1% chance to win
      </div>
    </div>
  );
}
