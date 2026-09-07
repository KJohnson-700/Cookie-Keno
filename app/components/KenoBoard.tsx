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

  // Trigger reveal animation when drawNumbers change
  useEffect(() => {
    if (drawNumbers.length === 0) {
      setRevealed([]);
      return;
    }

    // Initialize all as not revealed
    const initial: RevealedNumber[] = drawNumbers.map((num) => ({
      num,
      hit: hitNumbers.includes(num),
      revealed: false,
    }));
    setRevealed(initial);

    // Reveal one by one
    drawNumbers.forEach((num, index) => {
      setTimeout(() => {
        setRevealed((prev) =>
          prev.map((r) => (r.num === num ? { ...r, revealed: true } : r))
        );
        // Show confetti for hits
        if (hitNumbers.includes(num)) {
          setShowConfetti((prev) => [...prev, num]);
          setTimeout(() => {
            setShowConfetti((prev) => prev.filter((n) => n !== num));
          }, 1000);
        }
      }, (index + 1) * 400); // 400ms delay between each reveal
    });
  }, [drawNumbers, hitNumbers]);

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
    <div className="keno-grid relative">
      {Array.from({ length: POOL_SIZE }, (_, i) => i + 1).map((num) => {
        const selectedNow = isSelected(num);
        const revealedNow = isRevealed(num);
        const hit = isHit(num);
        const isDrawn = drawNumbers.includes(num);
        const confetti = showConfetti.includes(num);

        let classes = 'keno-number';
        if (selectedNow) classes += ' selected';
        else if (revealedNow) {
          classes += hit ? ' hit' : ' drawn';
        }

        return (
          <div key={num} className="relative">
            <button
              onClick={() => handleClick(num)}
              disabled={isDrawn && !revealedNow}
              className={`${classes} ${revealedNow ? 'animate-reveal' : ''}`}
            >
              {num}
            </button>

            {/* Confetti for hits */}
            {confetti && (
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: ['#d4a853', '#f5d76e', '#ffd700', '#ffed4a'][i % 4],
                      left: '50%',
                      top: '50%',
                      animation: `confetti-${i} 0.8s ease-out forwards`,
                    }}
                  />
                ))}
              </div>
            )}

            <style jsx>{`
              @keyframes confetti-0 {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-200%, -200%) scale(1); opacity: 0; }
              }
              @keyframes confetti-1 {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(200%, -150%) scale(1); opacity: 0; }
              }
              @keyframes confetti-2 {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-150%, 200%) scale(1); opacity: 0; }
              }
              @keyframes confetti-3 {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(150%, 200%) scale(1); opacity: 0; }
              }
              @keyframes confetti-4 {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-250%, -50%) scale(1); opacity: 0; }
              }
              @keyframes confetti-5 {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(250%, -50%) scale(1); opacity: 0; }
              }
              @keyframes confetti-6 {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-100%, -300%) scale(1); opacity: 0; }
              }
              @keyframes confetti-7 {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(100%, -300%) scale(1); opacity: 0; }
              }
              @keyframes confetti-8 {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-300%, 0%) scale(1); opacity: 0; }
              }
              @keyframes confetti-9 {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(300%, 0%) scale(1); opacity: 0; }
              }
              @keyframes confetti-10 {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-200%, 200%) scale(1); opacity: 0; }
              }
              @keyframes confetti-11 {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(200%, 200%) scale(1); opacity: 0; }
              }
              div:nth-child(12n+0) { animation-name: confetti-0; }
              div:nth-child(12n+1) { animation-name: confetti-1; }
              div:nth-child(12n+2) { animation-name: confetti-2; }
              div:nth-child(12n+3) { animation-name: confetti-3; }
              div:nth-child(12n+4) { animation-name: confetti-4; }
              div:nth-child(12n+5) { animation-name: confetti-5; }
              div:nth-child(12n+6) { animation-name: confetti-6; }
              div:nth-child(12n+7) { animation-name: confetti-7; }
              div:nth-child(12n+8) { animation-name: confetti-8; }
              div:nth-child(12n+9) { animation-name: confetti-9; }
              div:nth-child(12n+10) { animation-name: confetti-10; }
              div:nth-child(12n+11) { animation-name: confetti-11; }

              .animate-reveal {
                animation: reveal-pop 0.3s ease-out forwards;
              }

              @keyframes reveal-pop {
                0% { transform: scale(0.5); opacity: 0; }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
          </div>
        );
      })}
    </div>
  );
}
