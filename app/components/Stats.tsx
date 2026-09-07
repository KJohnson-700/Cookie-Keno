'use client';

type Props = {
  clicks: number;
  burned: number; // in lamports
  cps: number; // cookies per second
  perClick: number;
  goldenCount: number;
  isGolden?: boolean;
};

function fmt(n: number, decimals = 0) {
  if (!isFinite(n)) return '0';
  if (n >= 1e9) return (n / 1e9).toFixed(decimals) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(decimals) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(decimals) + 'K';
  return n.toFixed(decimals);
}

export function Stats({ clicks, burned, cps, perClick, goldenCount, isGolden }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full max-w-3xl">
      <Card label="Cookies" value={fmt(clicks)} accent />
      <Card label="Per click" value={fmt(perClick, perClick < 10 ? 1 : 0)} />
      <Card label="Per second" value={fmt(cps, 1)} />
      <Card label="COOK burned" value={fmt(burned / 1e9, 6)} suffix="COOK" />
      <Card label="Golden 🍪" value={fmt(goldenCount)} accent={goldenCount > 0} />
    </div>
  );
}

function Card({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={[
        'rounded-xl border p-3 backdrop-blur',
        accent
          ? 'border-amber-500/40 bg-amber-500/5'
          : 'border-slate-800 bg-slate-900/40',
      ].join(' ')}
    >
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div
        className={[
          'text-2xl font-bold tabular-nums',
          accent ? 'text-amber-300' : 'text-slate-100',
        ].join(' ')}
      >
        {value}
        {suffix && <span className="text-sm text-slate-500 ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
