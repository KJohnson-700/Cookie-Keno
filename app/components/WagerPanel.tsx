'use client';

import { useState, useCallback } from 'react';
import { MIN_WAGER, MAX_WAGER } from '@/lib/keno';

interface WagerPanelProps {
  wager: number;
  onWagerChange: (wager: number) => void;
  onPlay: () => void;
  disabled: boolean;
  pending: boolean;
}

export function WagerPanel({ wager, onWagerChange, onPlay, disabled, pending }: WagerPanelProps) {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        onWagerChange(Math.min(MAX_WAGER, Math.max(MIN_WAGER, val)));
      }
    },
    [onWagerChange]
  );

  const presetAmounts = [0.1, 0.5, 1, 5];

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">
          Wager (COOK)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min={MIN_WAGER}
            max={MAX_WAGER}
            value={wager}
            onChange={handleInputChange}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <div className="flex gap-1">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => onWagerChange(amt)}
                className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
              >
                {amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onPlay}
        disabled={disabled || pending}
        className={`
          w-full py-3 rounded-lg font-semibold text-lg transition-all duration-200
          ${disabled || pending
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40'
          }
        `}
      >
        {pending ? 'Playing...' : 'Play Round'}
      </button>
    </div>
  );
}
