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
        onSelect(selected.filter((n) => n !== num));
      } else if (selected.length < MAX_PICKS) {
        onSelect([...selected, num]);
      }
    },
    [selected, onSelect]
  );

  const isHit = (num: number) => hitNumbers.includes(num);
  const isDrawn = (num: number) => drawNumbers.includes(num);
  const isSelected = (num: number) => selected.includes(num);

  return (
    <div className="keno-grid">
      {Array.from({ length: POOL_SIZE }, (_, i) => i + 1).map((num) => {
        const selectedNow = isSelected(num);
        const drawn = isDrawn(num);
        const hit = isHit(num);

        let classes = 'keno-number';
        if (selectedNow && !drawn) classes += ' selected';
        else if (drawn) classes += hit ? ' hit' : ' drawn';

        return (
          <button
            key={num}
            onClick={() => handleClick(num)}
            className={classes}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
}
