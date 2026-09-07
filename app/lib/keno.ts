// Keno game logic

export const MIN_PICKS = 1;
export const MAX_PICKS = 10;
export const POOL_SIZE = 40;
export const DRAW_SIZE = 8;
export const MIN_WAGER = 0.01;
export const MAX_WAGER = 10;

// Standard keno payout table (hits → multiplier)
// Based on 8-of-40 draw
export const PAYOUT_TABLE: Record<number, number[]> = {
  1: [0, 2.8],
  2: [0, 0, 9, 50],
  3: [0, 0, 2, 26, 100],
  4: [0, 0, 0, 6, 30, 200, 400],
  5: [0, 0, 0, 3, 12, 70, 300, 800],
  6: [0, 0, 0, 1, 5, 25, 130, 500, 1500],
  7: [0, 0, 0, 0.5, 3, 11, 50, 200, 800, 2500],
  8: [0, 0, 0, 0, 1.5, 5, 20, 80, 400, 1500, 5000],
  9: [0, 0, 0, 0, 0.5, 2, 8, 30, 200, 1000, 4000],
  10: [0, 0, 0, 0, 0, 1, 4, 15, 100, 500, 2500],
};

export function calculatePayout(picks: number, hits: number): number {
  const table = PAYOUT_TABLE[picks];
  if (!table) return 0;
  const multiplier = table[hits] ?? 0;
  return multiplier;
}

export function deriveDraw(blockhash: string): number[] {
  // Take first 32 bytes of blockhash, convert to numbers 1-40
  const bytes = new TextEncoder().encode(blockhash.slice(0, 32));
  const seen = new Set<number>();
  const draw: number[] = [];

  for (let i = 0; i < bytes.length && draw.length < DRAW_SIZE; i++) {
    const num = (bytes[i] % POOL_SIZE) + 1;
    if (!seen.has(num)) {
      seen.add(num);
      draw.push(num);
    }
  }

  return draw;
}

export function countHits(picks: number[], draw: number[]): number {
  const drawSet = new Set(draw);
  return picks.filter(p => drawSet.has(p)).length;
}
