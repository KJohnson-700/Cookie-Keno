'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface CelebrationProps {
  active: boolean;
  type: 'win' | 'jackpot';
}

const GOLD_COLORS = ['#d4a853', '#f5d76e', '#c49943', '#ffd700', '#ffed4a'];

export function Celebration({ active, type }: CelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = [];
    const count = type === 'jackpot' ? 100 : 40;

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1.5 - 0.5,
        life: 1,
        color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
        size: Math.random() * 4 + 2,
      });
    }

    setParticles(newParticles);

    // Animate particles
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.02,
            life: p.life - 0.015,
          }))
          .filter((p) => p.life > 0)
      );

      if (frame > 100) {
        clearInterval(interval);
        setParticles([]);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [active, type]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.life,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}

      {/* Big win text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-6xl md:text-8xl font-bold animate-bounce"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#d4a853',
            textShadow: '0 0 40px rgba(212, 168, 83, 0.8), 0 0 80px rgba(212, 168, 83, 0.4)',
            animation: 'win-text 0.5s ease-out',
          }}
        >
          {type === 'jackpot' ? '🎰 JACKPOT! 🎰' : '🎉 YOU WIN! 🎉'}
        </div>
      </div>

      <style jsx>{`
        @keyframes win-text {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
