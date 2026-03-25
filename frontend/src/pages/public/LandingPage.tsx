import { useState, type FormEvent, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBranding } from '../../contexts/BrandingContext';
import { useAuth } from '../../contexts/AuthContext';
import ScanDemo from '../../components/ScanDemo';
import Logo from '../../components/Logo';

function setMetaTag(property: string, content: string) {
  const selector = `meta[property="${property}"], meta[name="${property}"]`;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    if (property.startsWith('og:') || property.startsWith('fb:')) {
      el.setAttribute('property', property);
    } else {
      el.setAttribute('name', property);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  const { branding, loaded } = useBranding();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [heroDomain, setHeroDomain] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    const title = branding.appName || 'MCPLens';
    const meta = branding.landingMeta || "MCPLens scans your Shopify store and shows how well AI shopping agents can find, evaluate, and purchase your products.";
    document.title = `${title} — AI Agent Readiness Scanner`;
    setMetaTag('og:title', `${title} — AI Agent Readiness Scanner`);
    if (meta) setMetaTag('og:description', meta);
    setMetaTag('og:image', `${window.location.origin}/og-image.png`);
    setMetaTag('og:type', 'website');
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', `${title} — AI Agent Readiness Scanner`);
    if (meta) setMetaTag('twitter:description', meta);
  }, [loaded, branding]);

  if (!loaded) return null;
  if (branding.landingEnabled === false && isAuthenticated) return <Navigate to="/dashboard" replace />;

  function handleHeroScan(e: FormEvent) {
    e.preventDefault();
    const trimmed = heroDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (trimmed) navigate(`/scan/${trimmed}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* ── Nav ── */}
      <header className="border-b border-slate-200 px-6 py-4 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="small" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6">
            <Link to="/how-it-works" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">How It Works</Link>
            <Link to="/leaderboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Leaderboard</Link>
            <Link to="/report" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Ecosystem Report</Link>
            <Link to="/pricing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
            <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Sign in</Link>
            <Link to="/scan" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full transition-colors">
              Scan Free
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-slate-500 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="sm:hidden mt-4 flex flex-col gap-3 pb-4 border-t border-slate-200 pt-4">
            <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 hover:text-slate-900 py-2">How It Works</Link>
            <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 hover:text-slate-900 py-2">Leaderboard</Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 hover:text-slate-900 py-2">Pricing</Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 hover:text-slate-900 py-2">Sign in</Link>
            <Link to="/scan" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-full text-center">Scan Free</Link>
          </nav>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="px-6 pt-20 pb-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6"
          >
            AI agents are shopping<br />for your customers.
            <span className="text-blue-500"> Is your store ready?</span>
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg text-slate-500 mb-8 max-w-xl mx-auto"
          >
            Shopify gave every store an AI-readable interface. We check if yours works.
          </motion.p>

          {/* Scan input — the primary CTA */}
          <motion.form
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleHeroScan}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input
              type="text"
              value={heroDomain}
              onChange={e => setHeroDomain(e.target.value)}
              placeholder="Enter your Shopify store domain"
              className="flex-1 px-5 py-3.5 bg-white border border-slate-300 rounded-full text-slate-900 text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={!heroDomain.trim()}
              className="px-8 py-3.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold rounded-full text-base transition-colors shadow-sm"
            >
              Scan Free
            </button>
          </motion.form>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-xs text-slate-400 mt-4"
          >
            Free. No account required. Results in 15 seconds.
          </motion.p>
        </div>
      </section>

      {/* ── Live Demo ── */}
      <motion.section
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        className="px-6 py-10"
      >
        <div className="max-w-4xl mx-auto">
          <ScanDemo />
        </div>
      </motion.section>

      {/* ── Value Props ── */}
      <motion.section
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        className="px-6 py-16 border-t border-slate-200"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4 text-xl">📊</div>
            <h3 className="text-base font-bold text-slate-900 mb-2">See your score</h3>
            <p className="text-sm text-slate-500">Instant 0-100 readiness score across 4 categories. Know exactly where AI agents get stuck.</p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-xl">🔧</div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Get exact fixes</h3>
            <p className="text-sm text-slate-500">Prioritized fix instructions with Shopify code snippets. Copy, paste, improve.</p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-4 text-xl">📈</div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Track over time</h3>
            <p className="text-sm text-slate-500">Monitor your store and competitors. Get alerts when scores change. Stay ahead.</p>
          </div>
        </div>
      </motion.section>

      {/* ── Social proof (real data only) ── */}
      <motion.section
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        className="px-6 py-16 border-t border-slate-200 bg-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">See how stores rank</h2>
          <p className="text-slate-500 text-sm mb-8">Real scores from real Shopify stores. Updated continuously.</p>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-full transition-colors text-sm"
          >
            View Leaderboard &rarr;
          </Link>
        </div>
      </motion.section>

      {/* ── Bottom CTA ── */}
      <section className="px-6 py-20 border-t border-slate-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-4">
            Check your store in 15 seconds
          </h2>
          <p className="text-slate-500 mb-8">Free. No account required.</p>
          <form
            onSubmit={handleHeroScan}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input
              type="text"
              value={heroDomain}
              onChange={e => setHeroDomain(e.target.value)}
              placeholder="yourstore.com"
              className="flex-1 px-5 py-3.5 bg-white border border-slate-300 rounded-full text-slate-900 text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={!heroDomain.trim()}
              className="px-8 py-3.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold rounded-full text-base transition-colors shadow-sm"
            >
              Scan Free
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 px-6 py-10 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo size="small" />
          <nav className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500">
            <Link to="/scan" className="hover:text-slate-900 transition-colors">Scan a Store</Link>
            <Link to="/how-it-works" className="hover:text-slate-900 transition-colors">How It Works</Link>
            <Link to="/leaderboard" className="hover:text-slate-900 transition-colors">Leaderboard</Link>
            <Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link to="/report" className="hover:text-slate-900 transition-colors">Ecosystem Report</Link>
            <a href="https://github.com/reesthomas212/mcplens" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">GitHub</a>
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
          </nav>
          <div className="text-sm text-slate-400">&copy; {new Date().getFullYear()} MCPLens</div>
        </div>
      </footer>
    </div>
  );
}
