'use client';

interface ResultPopupProps {
  hits: number;
  payout: number;
  wager: number;
  blockhash?: string;
  active: boolean;
  onClose: () => void;
}

export function ResultPopup({ hits, payout, wager, blockhash, active, onClose }: ResultPopupProps) {
  if (!active) return null;

  const isWin = payout > 0;
  const isBigWin = payout >= wager * 5;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(4,4,8,.78)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 26px' }}>
      <div style={{ width: '100%', maxWidth: 320, background: isWin ? (isBigWin ? 'linear-gradient(160deg, #b45309 0%, #0f0f16 100%)' : 'linear-gradient(160deg, #14532d 0%, #0f0f16 100%)') : 'linear-gradient(160deg, #7f1d1d 0%, #0f0f16 100%)', borderRadius: 20, padding: '24px 20px', textAlign: 'center', boxShadow: isWin ? '0 0 60px rgba(212,168,83,.4)' : '0 0 40px rgba(220,38,38,.4)', animation: 'pop 0.3s ease-out' }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isBigWin ? 36 : 32, letterSpacing: '.14em', color: isWin ? (isBigWin ? '#d4a853' : '#fff') : '#fca5a5', display: 'block', marginBottom: 4 }}>
          {isBigWin ? 'BIG WIN!' : isWin ? 'YOU WIN!' : 'NO WIN'}
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', marginTop: 6 }}>
          <span style={{ fontSize: 12, letterSpacing: '.12em', opacity: 0.75, color: isWin ? '#fff' : '#fca5a5' }}>{hits} / 8 HITS</span>
        </div>

        <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: isWin ? '#d4a853' : '#fff', display: 'block', marginTop: 8 }}>
          {payout.toFixed(2)} COOK
        </span>

        {isWin && (
          <span style={{ fontSize: 11, letterSpacing: '.08em', opacity: 0.7, color: '#d4a853', display: 'block', marginTop: 2 }}>
            +{(payout - wager).toFixed(2)} profit
          </span>
        )}

        <div style={{ width: '100%', height: 1, background: 'rgba(0,0,0,.18)', margin: '14px 0 12px' }}></div>

        {blockhash && (
          <span style={{ fontSize: 8.5, letterSpacing: '.06em', opacity: 0.65, color: 'var(--text-muted)', display: 'block' }}>
            Block: {blockhash?.slice(0, 12)}…{blockhash?.slice(-8)}
          </span>
        )}

        <button
          onClick={onClose}
          style={{ width: '100%', marginTop: 16, padding: '13px 0', borderRadius: 11, background: isWin ? '#d4a853' : '#fff', color: isWin ? '#0a0a0f' : '#000', fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, letterSpacing: '.2em', border: 'none', cursor: 'pointer' }}
        >
          CONTINUE
        </button>
      </div>

      <style jsx>{`
        @keyframes pop {
          0% { transform: scale(.5); opacity: 0; }
          60% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
