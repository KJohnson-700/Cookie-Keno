import { Connection, PublicKey } from '@solana/web3.js';

const COOKIE_CHAIN_RPC = 'https://rpc.cookiescan.io';
const TREASURY_PK = new PublicKey('5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29');

const connection = new Connection(COOKIE_CHAIN_RPC, 'confirmed');

export interface LeaderboardEntry {
  address: string;
  picks: number[];
  hits: number;
  wager: number;
  payout: number;
  signature: string;
  timestamp: number;
}

export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  try {
    const sigs = await connection.getSignaturesForAddress(TREASURY_PK, {
      limit: 50,
    });

    const entries: LeaderboardEntry[] = [];

    for (const sig of sigs) {
      if (!sig.memo) continue;

      // Parse keno:v1 memo
      // Format: keno:v1 picks=4,7,12,23,31 or keno:v1 payout=2.5000 hits=3
      const kenoMatch = sig.memo.match(/keno:v1\s+(.+)/);
      if (!kenoMatch) continue;

      const parts = kenoMatch[1].split(/\s+/);
      const data: Record<string, string> = {};
      for (const part of parts) {
        const [key, val] = part.split('=');
        if (key && val) data[key] = val;
      }

      if (data.picks && data.hits && data.wager && data.payout) {
        entries.push({
          address: sig.signature.slice(0, 10) + '...', // Anonymized
          picks: data.picks.split(',').map(Number),
          hits: parseInt(data.hits),
          wager: parseFloat(data.wager),
          payout: parseFloat(data.payout),
          signature: sig.signature,
          timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
        });
      }
    }

    // Sort by payout (highest first) and take top N
    return entries.sort((a, b) => b.payout - a.payout).slice(0, limit);
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return [];
  }
}

export async function fetchUserStats(address: string): Promise<{ rounds: number; totalWagered: number; totalPayout: number }> {
  // For now, return mock data - would need to parse all txs
  return { rounds: 0, totalWagered: 0, totalPayout: 0 };
}
