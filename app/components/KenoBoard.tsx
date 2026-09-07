'use client';

import { useCallback } from 'react';
import { POOL_SIZE, MIN_PICKS, MAX_PICKS } from '@/lib/keno';

interface KenoBoardProps {
  selected: number[];
  onSelect: (nums: number[]) => void;
  drawNumbers?: number[];
  hitNumbers?: number[];
}

export function KenoBoard({ selected, onSelect, drawNumbers = [], hitNumbers = [] }: KenoBoardProps) {
  const handleClick = useCallback(
    (num: number) => {
      if (selected.includes(num)) {
        // Deselect
        onSelect(selected.filter((n) => n !== num));
      } else if (selected.length < MAX_PICKS) {
        // Select
        onSelect([...selected, num]);
      }
    },
    [selected, onSelect]
  );

  const isHit = (num: number) => hitNumbers.includes(num);
  const isDrawn = (num: number) => drawNumbers.includes(num);
  const isSelected = (num: number) => selected.includes(num);

  return (
    <div className="grid grid-cols-8 gap-2 sm:gap-3">
      {Array.from({ length: POOL_SIZE }, (_, i) => i + 1).map((num) => {
        const selectedNow = isSelected(num);
        const drawn = isDrawn(num);
        const hit = isHit(num);

        return (
          <button
            key={num}
            onClick={() => handleClick(num)}
            className={`
              aspect-square rounded-lg text-sm sm:text-base font-semibold transition-all duration-150
              ${selectedNow && !drawn
                ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30 scale-105'
                : drawn
                ? hit
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/40 animate-pulse'
                  : 'bg-red-500/80 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }
              ${selectedNow ? 'ring-2 ring-amber-400/50' : ''}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
}
