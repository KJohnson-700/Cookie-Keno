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
    const interval = setInterval(load, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400 uppercase tracking-wider">Leaderboard</div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center text-slate-500 text-sm py-4">
          No games yet. Be the first to play!
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div key={entry.signature} className="flex items-center justify-between bg-slate-800/40 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                  #{i + 1}
                </span>
                <div className="text-xs">
                  <div className="text-slate-400 font-mono">{entry.address}</div>
                  <div className="text-slate-500">{entry.hits} hits · {entry.picks.length} picks</div>
                </div>
              </div>
              <div className={`text-sm font-mono font-semibold ${entry.payout > entry.wager ? 'text-green-400' : 'text-red-400'}`}>
                {entry.payout > 0 ? '+' : ''}{(entry.payout - entry.wager).toFixed(2)} COOK
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
