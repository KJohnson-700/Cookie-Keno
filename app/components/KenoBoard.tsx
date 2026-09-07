'use client';

import { useCallback, useEffect, useState } from 'react';
import { POOL_SIZE, MAX_PICKS } from '@/lib/keno';

interface KenoBoardProps {
  selected: number[];
  onSelect: (nums: number[]) => void;
  drawNumbers?: number[];
  hitNumbers?: number[];
}

export function KenoBoard({ selected, onSelect, drawNumbers = [], hitNumbers = [] }: KenoBoardProps) {
  const [revealed, setRevealed] = useState<number[]>([]);

  useEffect(() => {
    if (drawNumbers.length === 0) {
      setRevealed([]);
      return;
    }

    setRevealed([]);

    drawNumbers.forEach((num, index) => {
      setTimeout(() => {
        setRevealed((prev) => [...prev, num]);
      }, (index + 1) * 300);
    });
  }, [drawNumbers.join(',')]);

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
  const isSelected = (num: number) => selected.includes(num);
  const isRevealed = (num: number) => revealed.includes(num);

  return (
    <div className="w-full overflow-hidden">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: 'repeat(8, 1fr)',
          maxWidth: '100%'
        }}
      >
        {Array.from({ length: POOL_SIZE }, (_, i) => i + 1).map((num) => {
          const selectedNow = isSelected(num);
          const revealedNow = isRevealed(num);
          const hit = isHit(num);
          const isDrawn = drawNumbers.includes(num);

          let bgColor = '#1a1a24';
          let textColor = '#7a7a85';
          let borderColor = '#252530';

          if (selectedNow) {
            bgColor = '#d4a853';
            textColor = '#000000';
          } else if (revealedNow) {
            if (hit) {
              bgColor = '#22c55e';
              textColor = '#ffffff';
            } else {
              bgColor = '#7f1d1d';
              textColor = '#fca5a5';
            }
          }

          return (
            <button
              key={num}
              onClick={() => handleClick(num)}
              disabled={isDrawn && !revealedNow}
              className="aspect-square rounded font-mono text-sm font-bold transition-colors"
              style={{
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                minWidth: 0,
                padding: 0,
                lineHeight: 1,
              }}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}
