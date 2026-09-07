'use client';

interface MultiplierBadgeProps {
  active: boolean;
  label: string;
  multiplier: number;
}

export function MultiplierBadge({ active, label, multiplier }: MultiplierBadgeProps) {
  if (!active) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium">
      <span>🍪</span>
      <span>{label}</span>
      <span className="font-bold">+{((multiplier - 1) * 100).toFixed(0)}%</span>
    </div>
  );
}
