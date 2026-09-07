'use client';

interface ResultPopupProps {
  hits: number;
  payout: number;
  wager: number;
  active: boolean;
  onClose: () => void;
}

export function ResultPopup({ hits, payout, wager, active, onClose }: ResultPopupProps) {
  if (!active) return null;

  const isWin = payout > 0;
  const isBigWin = payout >= wager * 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className={`relative p-8 rounded-2xl text-center animate-scale-in ${
          isWin
            ? isBigWin
              ? 'bg-gradient-to-br from-amber-600 to-yellow-500'
              : 'bg-gradient-to-br from-green-700 to-green-600'
            : 'bg-gradient-to-br from-red-800 to-red-900'
        }`}
        style={{
          boxShadow: isWin
            ? '0 0 60px rgba(212, 168, 83, 0.6), 0 0 120px rgba(212, 168, 83, 0.3)'
            : '0 0 40px rgba(220, 38, 38, 0.4)',
          animation: 'scale-in 0.3s ease-out',
        }}
      >
        {/* Result text */}
        <div
          className="text-5xl font-bold mb-2"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: isWin ? '#000' : '#fff',
            textShadow: isWin ? 'none' : '0 0 20px rgba(255,255,255,0.3)',
          }}
        >
          {isBigWin ? '⭐ BIG WIN! ⭐' : isWin ? 'YOU WIN!' : 'NO WIN'}
        </div>

        {/* Hits */}
        <div
          className="text-2xl mb-4"
          style={{ color: isWin ? '#000' : '#fca5a5' }}
        >
          {hits} / 8 HITS
        </div>

        {/* Payout */}
        <div
          className="text-4xl font-bold font-mono"
          style={{ color: isWin ? '#000' : '#fff' }}
        >
          {payout.toFixed(2)} COOK
        </div>

        {/* Profit/Loss */}
        {isWin && (
          <div
            className="text-lg font-mono mt-2"
            style={{ color: '#000' }}
          >
            +{(payout - wager).toFixed(2)} profit
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-6 px-8 py-2 rounded-full text-sm font-bold"
          style={{
            backgroundColor: isWin ? '#000' : '#fff',
            color: isWin ? '#d4a853' : '#000',
          }}
        >
          CONTINUE
        </button>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
