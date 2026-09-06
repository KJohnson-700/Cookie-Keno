'use client';

import { Cookie as CookieIcon, MousePointer2, Wheat, Factory, Zap, Landmark, FlaskConical, Sparkles } from 'lucide-react';

export type UpgradeDef = {
  id: string;
  name: string;
  baseCost: number;
  cps: number; // cookies per second added
  perClick: number; // added cookies per click
  icon: 'cookie' | 'cursor' | 'grandma' | 'farm' | 'mine' | 'factory' | 'bank' | 'temple' | 'wizard';
  desc: string;
};

export const UPGRADES: UpgradeDef[] = [
  { id: 'cursor',   name: 'Cursor',     baseCost: 15,    cps: 0,    perClick: 0.1, icon: 'cursor',   desc: '+0.1 per click' },
  { id: 'grandma',  name: 'Grandma',    baseCost: 100,   cps: 1,    perClick: 0,   icon: 'grandma',  desc: '+1 cps' },
  { id: 'farm',     name: 'Farm',       baseCost: 1100,  cps: 8,    perClick: 0,   icon: 'farm',     desc: '+8 cps' },
  { id: 'mine',     name: 'Mine',       baseCost: 12_000, cps: 47,   perClick: 0,   icon: 'mine',     desc: '+47 cps' },
  { id: 'factory',  name: 'Factory',    baseCost: 130_000, cps: 260, perClick: 0,   icon: 'factory',  desc: '+260 cps' },
  { id: 'bank',     name: 'Bank',       baseCost: 1_400_000, cps: 1400, perClick: 0, icon: 'bank',  desc: '+1,400 cps' },
  { id: 'temple',   name: 'Temple',     baseCost: 20_000_000, cps: 7800, perClick: 0, icon: 'temple', desc: '+7,800 cps' },
  { id: 'wizard',   name: 'Wizard tower', baseCost: 330_000_000, cps: 44_000, perClick: 0, icon: 'wizard', desc: '+44,000 cps' },
];

type Props = {
  owned: Record<string, number>;
  cookies: number;
  onBuy: (id: string) => void;
};

function costFor(def: UpgradeDef, owned: number) {
  return Math.ceil(def.baseCost * Math.pow(1.15, owned));
}

function Icon({ name, className }: { name: UpgradeDef['icon']; className?: string }) {
  const c = className ?? 'w-5 h-5';
  switch (name) {
    case 'cookie':   return <CookieIcon className={c} />;
    case 'cursor':   return <MousePointer2 className={c} />;
    case 'grandma':  return <Sparkles className={c} />;
    case 'farm':     return <Wheat className={c} />;
    case 'mine':     return <FlaskConical className={c} />;
    case 'factory':  return <Factory className={c} />;
    case 'bank':     return <Landmark className={c} />;
    case 'temple':   return <Sparkles className={c} />;
    case 'wizard':   return <Zap className={c} />;
  }
}

export function UpgradeShop({ owned, cookies, onBuy }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
      {UPGRADES.map((u) => {
        const count = owned[u.id] ?? 0;
        const cost = costFor(u, count);
        const canAfford = cookies >= cost;
        return (
          <button
            key={u.id}
            onClick={() => onBuy(u.id)}
            disabled={!canAfford}
            className={[
              'flex items-center gap-3 rounded-xl border p-3 text-left transition',
              canAfford
                ? 'border-amber-500/30 bg-slate-900/60 hover:border-amber-400/60 hover:bg-amber-500/5'
                : 'border-slate-800 bg-slate-900/30 opacity-60 cursor-not-allowed',
            ].join(' ')}
          >
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-300 shrink-0">
              <Icon name={u.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-slate-100 text-sm">{u.name}</div>
                <div className="text-xs text-slate-400 tabular-nums">x{count}</div>
              </div>
              <div className="text-[11px] text-slate-500">{u.desc}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-amber-300 tabular-nums font-semibold">
                {cost >= 1e6 ? (cost / 1e6).toFixed(1) + 'M' : cost >= 1e3 ? (cost / 1e3).toFixed(1) + 'K' : cost}
              </div>
              <div className="text-[10px] text-slate-500">cookies</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export { costFor };
