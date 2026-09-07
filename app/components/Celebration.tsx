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
  rotation: number;
}

interface CelebrationProps {
  active: boolean;
  type: 'win' | 'jackpot';
}

const GOLD_COLORS = ['#d4a853', '#f5d76e', '#c49943', '#ffd700', '#ffed4a', '#ffaa00', '#e6c200'];

export function Celebration({ active, type }: CelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      setShake(false);
      return;
    }

    const isJackpot = type === 'jackpot';
    const count = isJackpot ? 200 : 40;
    const newParticles: Particle[] = [];

    // Create particles
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: isJackpot ? Math.random() * 100 : 50 + (Math.random() - 0.5) * 20,
        y: isJackpot ? -10 : 50,
        vx: (Math.random() - 0.5) * (isJackpot ? 3 : 2),
        vy: Math.random() * (isJackpot ? 2 : 1.5) + 0.5,
        life: 1,
        color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
        size: isJackpot ? Math.random() * 6 + 3 : Math.random() * 4 + 2,
        rotation: Math.random() * 360,
      });
    }

    setParticles(newParticles);

    // Screen shake for jackpot
    if (isJackpot) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }, 300);
    }

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
            life: p.life - 0.008,
            rotation: p.rotation + 5,
          }))
          .filter((p) => p.life > 0)
      );

      if (frame > 150) {
        clearInterval(interval);
        setParticles([]);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [active, type]);

  if (!active || particles.length === 0) return null;

  const isJackpot = type === 'jackpot';

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 overflow-hidden ${shake ? 'animate-shake' : ''}`}
    >
      {/* Gold rain background */}
      {isJackpot && (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-transparent" />
      )}

      {/* Particles */}
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
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}

      {/* Big win text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`text-center ${isJackpot ? 'animate-jackpot' : 'animate-win'}`}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#d4a853',
            textShadow: isJackpot
              ? '0 0 60px rgba(212, 168, 83, 1), 0 0 120px rgba(212, 168, 83, 0.8), 0 0 200px rgba(212, 168, 83, 0.4)'
              : '0 0 40px rgba(212, 168, 83, 0.8), 0 0 80px rgba(212, 168, 83, 0.4)',
          }}
        >
          <div className={`${isJackpot ? 'text-7xl md:text-9xl lg:text-[10rem]' : 'text-5xl md:text-7xl'} font-bold`}>
            {isJackpot ? '🎰 JACKPOT! 🎰' : '🎉 YOU WIN! 🎉'}
          </div>
          {isJackpot && (
            <div className="text-3xl md:text-5xl mt-2 animate-pulse">
              ★ SUPER WIN ★
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes jackpot-text {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          25% { transform: scale(1.3) rotate(5deg); }
          50% { transform: scale(0.9) rotate(-3deg); }
          75% { transform: scale(1.1) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes win-text {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-10px, -10px); }
          20% { transform: translate(10px, 10px); }
          30% { transform: translate(-10px, 10px); }
          40% { transform: translate(10px, -10px); }
          50% { transform: translate(-5px, -5px); }
          60% { transform: translate(5px, 5px); }
          70% { transform: translate(-5px, 5px); }
          80% { transform: translate(5px, -5px); }
          90% { transform: translate(-2px, -2px); }
        }
        .animate-jackpot {
          animation: jackpot-text 0.8s ease-out forwards;
        }
        .animate-win {
          animation: win-text 0.5s ease-out forwards;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
