import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface LeaderboardEntry {
  domain: string;
  score: number;
  scannedAt: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return '#059669';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-sm text-slate-400 font-mono w-6 text-center">{rank}</span>;
}

export default function LeaderboardPage() {
  const [stores, setStores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Agent Readiness Leaderboard | MCPLens';
    fetch('/api/leaderboard?limit=50')
      .then(r => r.json())
      .then(data => setStores(data.stores || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <header className="border-b border-slate-200 px-6 py-4 bg-white/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">ML</span>
            </div>
            <span className="font-semibold text-slate-900 text-lg">MCPLens</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/scan" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Scan a Store
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Agent Readiness Leaderboard</h1>
          <p className="text-slate-500">
            Top Shopify stores ranked by AI agent readiness score. Updated continuously from {stores.length > 0 ? stores.length.toLocaleString() : '...'} scanned stores.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No stores scanned yet. <Link to="/scan" className="text-blue-500 hover:underline">Be the first!</Link>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-widest">
              <div>Rank</div>
              <div>Store</div>
              <div className="text-right">Score</div>
              <div className="text-right hidden sm:block">Last Scanned</div>
            </div>
            {stores.map((store, i) => (
              <Link
                key={store.domain}
                to={`/scan/${store.domain}`}
                className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
              >
                <Medal rank={i + 1} />
                <div className="text-sm font-medium text-slate-900 truncate">{store.domain}</div>
                <div className="text-right">
                  <span className="text-lg font-bold" style={{ color: scoreColor(store.score) }}>
                    {store.score}
                  </span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
                <div className="text-right text-xs text-slate-400 hidden sm:block">
                  {new Date(store.scannedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400 mb-4">
            Don't see your store? Scan it now and claim your spot.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/scan"
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-colors text-sm"
            >
              Scan Your Store
            </Link>
            <Link
              to="/report"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              View Ecosystem Report
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 px-6 py-6 mt-12 bg-white">
        <div className="max-w-4xl mx-auto text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} MCPLens
        </div>
      </footer>
    </div>
  );
}
