import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { scanApi, type ScanResult, type ScanCategoryResult } from '../../api/client';

function scoreColor(score: number): string {
  if (score >= 80) return '#059669';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

const CATEGORY_LABELS: Record<string, string> = {
  'data-quality': 'Data Quality',
  'product-discovery': 'Product Discovery',
  'checkout-flow': 'Checkout Flow',
  'protocol-compliance': 'Protocol Compliance',
};

function CategoryBar({ cat, maxScore }: { cat: ScanCategoryResult; maxScore: number }) {
  const width = maxScore > 0 ? (cat.cappedScore / maxScore) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-xs text-slate-500 truncate">{CATEGORY_LABELS[cat.category] ?? cat.category}</div>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: scoreColor(cat.cappedScore) }} />
      </div>
      <div className="w-8 text-right text-sm font-bold" style={{ color: scoreColor(cat.cappedScore) }}>{Math.round(cat.cappedScore)}</div>
    </div>
  );
}

function StoreColumn({ result, domain }: { result: ScanResult | null; domain: string }) {
  if (!result) return (
    <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400">
      Enter a domain above
    </div>
  );

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6">
      <Link to={`/scan/${domain}`} className="text-sm font-semibold text-blue-500 hover:underline">{domain}</Link>
      <div className="mt-3 mb-4">
        <div className="text-4xl font-bold" style={{ color: scoreColor(result.compositeScore) }}>
          {result.compositeScore}
        </div>
        <div className="text-xs text-slate-400">/ 100</div>
      </div>
      <div className="space-y-2">
        {result.categories.filter(c => c.tested).map(cat => (
          <CategoryBar key={cat.category} cat={cat} maxScore={100} />
        ))}
      </div>
      <div className="mt-4 text-xs text-slate-400">
        {result.scenarioCount} scenarios &middot; {(result.durationMs / 1000).toFixed(1)}s
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [domainA, setDomainA] = useState('');
  const [domainB, setDomainB] = useState('');
  const [resultA, setResultA] = useState<ScanResult | null>(null);
  const [resultB, setResultB] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCompare(e: FormEvent) {
    e.preventDefault();
    const a = domainA.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const b = domainB.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!a || !b) return;

    setLoading(true);
    setError(null);
    setResultA(null);
    setResultB(null);

    try {
      const [rA, rB] = await Promise.all([
        scanApi.getLatest(a).then(r => r ?? scanApi.trigger(a)),
        scanApi.getLatest(b).then(r => r ?? scanApi.trigger(b)),
      ]);
      setResultA(rA);
      setResultB(rB);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setLoading(false);
    }
  }

  const winner = resultA && resultB
    ? resultA.compositeScore > resultB.compositeScore ? 'A'
    : resultB.compositeScore > resultA.compositeScore ? 'B'
    : 'tie'
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <header className="border-b border-slate-200 px-6 py-4 bg-white/80 backdrop-blur-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">ML</span>
            </div>
            <span className="font-semibold text-slate-900 text-lg">MCPLens</span>
          </Link>
          <Link to="/scan" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Single Scan</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Compare Stores</h1>
          <p className="text-slate-500 text-sm">Enter two Shopify store domains to compare their agent readiness scores side by side.</p>
        </div>

        <form onSubmit={handleCompare} className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={domainA}
              onChange={e => setDomainA(e.target.value)}
              placeholder="Store A (e.g., allbirds.com)"
              className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={domainB}
              onChange={e => setDomainB(e.target.value)}
              placeholder="Store B (e.g., gymshark.com)"
              className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !domainA.trim() || !domainB.trim()}
            className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold rounded-full transition-colors text-sm"
          >
            {loading ? 'Scanning...' : 'Compare'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">{error}</div>
        )}

        {(resultA || resultB) && (
          <>
            {winner && winner !== 'tie' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-center">
                <span className="text-emerald-700 font-semibold">
                  {winner === 'A' ? domainA.trim() : domainB.trim()} leads by {Math.abs((resultA?.compositeScore ?? 0) - (resultB?.compositeScore ?? 0))} points
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <StoreColumn result={resultA} domain={domainA.trim()} />
              <StoreColumn result={resultB} domain={domainB.trim()} />
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 px-6 py-6 mt-12 bg-white">
        <div className="max-w-5xl mx-auto text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} MCPLens
        </div>
      </footer>
    </div>
  );
}
