'use client';

const RULES = [
  { n: '1', title: 'PICK NUMBERS', body: 'Select 1-10 numbers from the 40-number grid' },
  { n: '2', title: 'PLACE WAGER', body: 'Choose your bet amount in COOK tokens' },
  { n: '3', title: 'DRAW NUMBERS', body: '8 numbers are drawn randomly from the blockhash' },
  { n: '4', title: 'WIN PRIZES', body: 'Win based on how many picks match the draw' },
];

export function HowToPlay() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 4px' }}>
      {RULES.map((r) => (
        <div key={r.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, color: 'var(--accent-gold-dim)', letterSpacing: '.1em', minWidth: 20 }}>{r.n}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: '.14em', color: 'var(--text-primary)' }}>{r.title}</span>
            <span style={{ fontSize: 10.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{r.body}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
