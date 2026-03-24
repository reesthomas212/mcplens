import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface BenchmarkData {
  totalStoresScanned: number;
  percentiles: number[]; // p10, p25, p50, p75, p90
  averageScore: number;
  medianScore: number;
  updatedAt: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return '#059669';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

function StatCard({ label, value, suffix, color }: { label: string; value: number | string; suffix?: string; color?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
      <div className="text-3xl font-bold mb-1" style={{ color: color || '#0f172a' }}>
        {value}{suffix}
      </div>
      <div className="text-xs text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function DistributionBar({ percentiles }: { percentiles: number[] }) {
  const labels = ['10th', '25th', '50th', '75th', '90th'];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Score Distribution</h3>
      <div className="flex items-end justify-between gap-2 h-32">
        {percentiles.map((score, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="text-sm font-bold" style={{ color: scoreColor(score) }}>{score}</div>
            <div
              className="w-full rounded-t-lg transition-all"
              style={{
                height: `${score}%`,
                backgroundColor: scoreColor(score),
                opacity: 0.7 + (i * 0.075),
              }}
            />
            <div className="text-xs text-slate-400">{labels[i]}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3 text-center">
        Percentile markers: the 50th percentile (median) represents the typical Shopify store.
      </p>
    </div>
  );
}

export default function EcosystemReportPage() {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Shopify Agent Readiness Report | MCPLens';
    fetch('/api/benchmarks')
      .then(r => r.json())
      .then(d => { if (d.totalStoresScanned > 0) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
            <Link to="/leaderboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Leaderboard</Link>
            <Link to="/scan" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Scan a Store</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">{month}</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Shopify Agent Readiness Report</h1>
          <p className="text-slate-500 max-w-2xl">
            How ready are Shopify stores for AI shopping agents? This report aggregates real scan data
            from MCPLens to show the current state of the ecosystem.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-slate-400">
            Not enough data yet. <Link to="/scan" className="text-blue-500 hover:underline">Scan some stores</Link> to populate this report.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Stores Scanned" value={data.totalStoresScanned.toLocaleString()} />
              <StatCard label="Average Score" value={data.averageScore} suffix="/100" color={scoreColor(data.averageScore)} />
              <StatCard label="Median Score" value={data.medianScore} suffix="/100" color={scoreColor(data.medianScore)} />
              <StatCard
                label="Agent-Ready (80+)"
                value={data.percentiles[4] >= 80 ? '>10%' : '<10%'}
                color="#059669"
              />
            </div>

            {/* Distribution */}
            {data.percentiles.length === 5 && (
              <DistributionBar percentiles={data.percentiles} />
            )}

            {/* Insights */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Key Insights</h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="shrink-0">1.</span>
                  <span>
                    The average Shopify store scores <strong>{data.averageScore}/100</strong> for agent readiness.
                    {data.averageScore < 60
                      ? ' Most stores are not ready for AI shopping agents.'
                      : data.averageScore < 80
                      ? ' The ecosystem is improving but most stores still have work to do.'
                      : ' The ecosystem is maturing — most stores can handle agent queries.'}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">2.</span>
                  <span>
                    The gap between the 25th percentile ({data.percentiles[1]}) and 75th percentile ({data.percentiles[3]})
                    is <strong>{data.percentiles[3] - data.percentiles[1]} points</strong>.
                    {data.percentiles[3] - data.percentiles[1] > 30
                      ? ' This wide gap means early movers have a significant advantage.'
                      : ' The field is tightening — stores are converging in readiness.'}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">3.</span>
                  <span>
                    Top-performing stores (90th percentile) score <strong>{data.percentiles[4]}/100</strong>.
                    These stores are fully ready for AI agents to browse, compare, and purchase.
                  </span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Where does your store rank?</h3>
              <p className="text-slate-500 text-sm mb-5">
                Scan your store now to see your score, percentile ranking, and specific fixes.
              </p>
              <Link
                to="/scan"
                className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-colors text-sm"
              >
                Scan Your Store Free
              </Link>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Data updated {data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : 'continuously'}.
              Based on {data.totalStoresScanned.toLocaleString()} unique Shopify stores scanned on MCPLens.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 px-6 py-6 mt-12 bg-white">
        <div className="max-w-4xl mx-auto text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} MCPLens
        </div>
      </footer>
    </div>
  );
}
