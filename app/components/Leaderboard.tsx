'use client';

import { useEffect, useState } from 'react';
import { fetchLeaderboard, LeaderboardEntry } from '@/lib/leaderboard';
import { RefreshCw } from 'lucide-react';

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await fetchLeaderboard(10);
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRankColor = (i: number) => {
    if (i === 0) return '#d4a853';
    if (i === 1) return '#a8a8a8';
    if (i === 2) return '#cd7f32';
    return 'var(--text-secondary)';
  };

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Leaderboard</div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded transition-colors"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
          No games yet. Be the first to play!
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry, i) => (
            <div
              key={entry.signature}
              className="flex items-center justify-between p-2 rounded"
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold font-mono" style={{ color: getRankColor(i) }}>
                  #{i + 1}
                </span>
                <div className="text-xs">
                  <div className="font-mono" style={{ color: 'var(--text-primary)' }}>{entry.address}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{entry.hits} hits · {entry.picks.length} picks</div>
                </div>
              </div>
              <div
                className="text-sm font-mono font-bold"
                style={{ color: entry.payout > entry.wager ? '#22c55e' : '#ef4444' }}
              >
                {entry.payout > 0 ? '+' : ''}{(entry.payout - entry.wager).toFixed(2)} COOK
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
