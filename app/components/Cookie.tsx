'use client';

import { useState, useCallback } from 'react';

type Props = {
  disabled?: boolean;
  onClick: () => Promise<void> | void;
};

export function Cookie({ disabled, onClick }: Props) {
  const [pressed, setPressed] = useState(false);
  const [shake, setShake] = useState(false);

  const handleClick = useCallback(async () => {
    if (disabled) return;
    setPressed(true);
    setShake(true);
    try {
      await onClick();
    } finally {
      setTimeout(() => setPressed(false), 120);
      setTimeout(() => setShake(false), 250);
    }
  }, [disabled, onClick]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={[
        'relative select-none outline-none',
        'transition-transform duration-100 ease-out',
        pressed ? 'scale-95' : 'scale-100 hover:scale-[1.03]',
        shake ? 'animate-[wiggle_0.25s_ease-in-out]' : '',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      ].join(' ')}
      aria-label="Click the cookie"
    >
      <svg
        viewBox="0 0 200 200"
        className="w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 drop-shadow-[0_10px_30px_rgba(245,165,36,0.4)]"
      >
        <defs>
          <radialGradient id="cookieShine" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFD68A" />
            <stop offset="55%" stopColor="#E89A2A" />
            <stop offset="100%" stopColor="#7A4A0F" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="url(#cookieShine)" />
        <circle cx="70" cy="75" r="9" fill="#3a1d05" />
        <circle cx="120" cy="65" r="6" fill="#3a1d05" />
        <circle cx="135" cy="105" r="10" fill="#3a1d05" />
        <circle cx="80" cy="125" r="7" fill="#3a1d05" />
        <circle cx="105" cy="135" r="8" fill="#3a1d05" />
        <circle cx="60" cy="105" r="5" fill="#3a1d05" />
        <ellipse cx="68" cy="58" rx="14" ry="8" fill="#FFE6B5" opacity="0.35" />
      </svg>
    </button>
  );
}
