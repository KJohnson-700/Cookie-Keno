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
    <div className="card p-4 space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
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
            className="flex-1 px-4 py-3 rounded text-lg"
            style={{ background: '#0a0a0f', border: '1px solid var(--border-subtle)' }}
          />
          <div className="flex gap-1">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => onWagerChange(amt)}
                className="px-3 py-2 text-xs rounded transition-colors"
                style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
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
        className="btn-primary w-full py-3 rounded"
      >
        {pending ? 'PLAYING...' : 'PLAY ROUND'}
      </button>
    </div>
  );
}
