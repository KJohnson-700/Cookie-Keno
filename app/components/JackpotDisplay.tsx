'use client';

interface JackpotDisplayProps {
  jackpot: number;
  triggered: boolean;
}

export function JackpotDisplay({ jackpot, triggered }: JackpotDisplayProps) {
  return (
    <div className={`bg-gradient-to-r from-amber-900/40 via-purple-900/40 to-amber-900/40 border border-amber-500/30 rounded-xl p-4 transition-all duration-500 ${triggered ? 'animate-pulse shadow-lg shadow-amber-500/30' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎰</span>
          <div>
            <div className="text-xs text-amber-400/80 uppercase tracking-wider">Progressive Jackpot</div>
            <div className="text-xl font-bold text-white font-mono">
              {jackpot.toFixed(2)} <span className="text-sm text-amber-400/60">COOK</span>
            </div>
          </div>
        </div>
        {triggered && (
          <div className="text-center">
            <div className="text-3xl animate-bounce">🎉</div>
            <div className="text-xs text-amber-400 font-bold">JACKPOT!</div>
          </div>
        )}
      </div>
      <div className="mt-2 text-[10px] text-slate-500 text-center">
        1% of each wager → Jackpot pool • 0.1% chance to win • Win to collect!
      </div>
    </div>
  );
}
