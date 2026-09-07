'use client';

interface ConnectScreenProps {
  onConnect: () => void;
  onSkip: () => void;
  nightlyReady: boolean;
}

export function ConnectScreen({ onConnect, onSkip, nightlyReady }: ConnectScreenProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90, background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 34px', textAlign: 'center' }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', border: '1px solid #3a2e15', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 25%, #2a2110, #0f0f16)', marginBottom: 26 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: 'var(--accent-gold)', letterSpacing: '.06em', animation: 'glow 3s ease-in-out infinite' }}>CK</span>
      </div>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: '.2em', color: 'var(--text-primary)', lineHeight: 1 }}>COOKIE KENO</span>
      <span style={{ fontSize: 9, letterSpacing: '.24em', color: 'var(--text-muted)', marginTop: 10 }}>ON CHAIN • PROVABLY FAIR</span>
      <span style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)', marginTop: 22, maxWidth: 300 }}>
        Connect a Nightly wallet to wager COOK. Every draw is derived from the transaction blockhash.
      </span>
      <button
        onClick={onConnect}
        style={{ marginTop: 30, alignSelf: 'stretch', textAlign: 'center', padding: '15px 0', borderRadius: 12, background: 'var(--accent-gold)', color: '#0a0a0f', fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: '.2em', cursor: 'pointer', border: 'none', boxShadow: '0 8px 30px rgba(212,168,83,.24)' }}
      >
        {nightlyReady ? 'CONNECT WALLET' : 'OPEN NIGHTLY'}
      </button>
      <button
        onClick={onSkip}
        style={{ marginTop: 14, fontSize: 10, letterSpacing: '.12em', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        BROWSE WITHOUT WALLET
      </button>

      <style jsx>{`
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 18px rgba(212,168,83,.45); }
          50% { text-shadow: 0 0 46px rgba(212,168,83,.9); }
        }
      `}</style>
    </div>
  );
}
