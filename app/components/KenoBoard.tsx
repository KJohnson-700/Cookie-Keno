'use client';

import { useCallback, useEffect, useState } from 'react';
import { POOL_SIZE, MAX_PICKS } from '@/lib/keno';

interface KenoBoardProps {
  selected: number[];
  onSelect: (nums: number[]) => void;
  drawNumbers?: number[];
  hitNumbers?: number[];
}

interface RevealedNumber {
  num: number;
  hit: boolean;
  revealed: boolean;
}

export function KenoBoard({ selected, onSelect, drawNumbers = [], hitNumbers = [] }: KenoBoardProps) {
  const [revealed, setRevealed] = useState<RevealedNumber[]>([]);
  const [showConfetti, setShowConfetti] = useState<number[]>([]);

  useEffect(() => {
    if (drawNumbers.length === 0) {
      setRevealed([]);
      return;
    }

    const initial: RevealedNumber[] = drawNumbers.map((num) => ({
      num,
      hit: hitNumbers.includes(num),
      revealed: false,
    }));
    setRevealed(initial);

    drawNumbers.forEach((num, index) => {
      setTimeout(() => {
        setRevealed((prev) =>
          prev.map((r) => (r.num === num ? { ...r, revealed: true } : r))
        );
        if (hitNumbers.includes(num)) {
          setShowConfetti((prev) => [...prev, num]);
          setTimeout(() => {
            setShowConfetti((prev) => prev.filter((n) => n !== num));
          }, 1000);
        }
      }, (index + 1) * 400);
    });
  }, [drawNumbers.join(','), hitNumbers.join(',')]);

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
  const isRevealed = (num: number) => revealed.find((r) => r.num === num)?.revealed;

  return (
    <div className="w-full">
      <div className="grid grid-cols-8 gap-1 sm:gap-2">
        {Array.from({ length: POOL_SIZE }, (_, i) => i + 1).map((num) => {
          const selectedNow = isSelected(num);
          const revealedNow = isRevealed(num);
          const hit = isHit(num);
          const isDrawn = drawNumbers.includes(num);
          const confetti = showConfetti.includes(num);

          return (
            <div key={num} className="relative aspect-square">
              <button
                onClick={() => handleClick(num)}
                disabled={isDrawn && !revealedNow}
                className={`
                  w-full h-full rounded text-sm sm:text-base md:text-lg font-bold font-mono
                  transition-all duration-200 flex items-center justify-center
                  ${selectedNow
                    ? 'bg-[#d4a853] text-black shadow-lg shadow-[#d4a853]/30 scale-105'
                    : revealedNow
                      ? hit
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/40'
                        : 'bg-red-900/60 text-red-300'
                      : 'bg-[#1a1a24] text-[#7a7a85] hover:bg-[#252530] border border-[#252530]'
                  }
                  ${revealedNow ? 'animate-pop' : ''}
                `}
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {num}
              </button>

              {confetti && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: ['#d4a853', '#f5d76e', '#ffd700', '#ffed4a'][i % 4],
                        left: '50%',
                        top: '50%',
                        animation: `confetti-fly-${i} 0.8s ease-out forwards`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop 0.3s ease-out forwards;
        }
        @keyframes confetti-fly-0 { to { transform: translate(-150%, -150%); opacity: 0; } }
        @keyframes confetti-fly-1 { to { transform: translate(150%, -150%); opacity: 0; } }
        @keyframes confetti-fly-2 { to { transform: translate(-150%, 150%); opacity: 0; } }
        @keyframes confetti-fly-3 { to { transform: translate(150%, 150%); opacity: 0; } }
        @keyframes confetti-fly-4 { to { transform: translate(-200%, -50%); opacity: 0; } }
        @keyframes confetti-fly-5 { to { transform: translate(200%, -50%); opacity: 0; } }
        @keyframes confetti-fly-6 { to { transform: translate(-200%, 50%); opacity: 0; } }
        @keyframes confetti-fly-7 { to { transform: translate(200%, 50%); opacity: 0; } }
        div:nth-child(8n+0) { animation: confetti-fly-0 0.8s ease-out forwards; }
        div:nth-child(8n+1) { animation: confetti-fly-1 0.8s ease-out forwards; }
        div:nth-child(8n+2) { animation: confetti-fly-2 0.8s ease-out forwards; }
        div:nth-child(8n+3) { animation: confetti-fly-3 0.8s ease-out forwards; }
        div:nth-child(8n+4) { animation: confetti-fly-4 0.8s ease-out forwards; }
        div:nth-child(8n+5) { animation: confetti-fly-5 0.8s ease-out forwards; }
        div:nth-child(8n+6) { animation: confetti-fly-6 0.8s ease-out forwards; }
        div:nth-child(8n+7) { animation: confetti-fly-7 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}
