import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';
import RevenueCalculator from '../../components/RevenueCalculator';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function PricingPage() {
  const [billingAnnual, setBillingAnnual] = useState(true);

  useEffect(() => {
    document.title = 'Pricing | MCPLens';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Nav */}
      <header className="border-b border-slate-200 px-6 py-4 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="small" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/how-it-works" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">How It Works</Link>
            <Link to="/leaderboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Leaderboard</Link>
            <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Sign in</Link>
            <Link to="/scan" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full transition-colors">Scan Free</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Founding user banner */}
        <div className="mb-10 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-6 py-5 text-center">
          <p className="text-sm sm:text-base font-semibold text-amber-800">
            Founding User Pricing &mdash; First 100 users get 50% off their first month
          </p>
          <p className="text-xs text-amber-600 mt-1.5">
            Use code{' '}
            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-amber-900 bg-white border border-amber-300 rounded px-2 py-0.5 text-xs select-all">
              FOUNDING50
            </span>
            {' '}at checkout
          </p>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center tracking-tight mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-center text-slate-500 mb-8 max-w-lg mx-auto">
          See the problems free. Pay for the solutions.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium transition-colors ${!billingAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
          <button
            onClick={() => setBillingAnnual(!billingAnnual)}
            className={`relative w-14 h-7 rounded-full transition-colors ${billingAnnual ? 'bg-blue-500' : 'bg-slate-300'}`}
            aria-label="Toggle billing period"
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${billingAnnual ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-medium transition-colors ${billingAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Annual</span>
        </div>

        {/* Pricing cards: Free | Pro | Max */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
        >
          {/* Free */}
          <motion.div variants={fadeInUp} className="rounded-xl p-7 border border-slate-200 bg-white shadow-sm flex flex-col gap-6">
            <div>
              <div className="text-lg font-bold text-slate-900 mb-1">Free</div>
              <div className="text-xs text-slate-500 mb-4">See your score instantly. No account required.</div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-500 mb-1 text-sm">/ forever</span>
              </div>
            </div>
            <ul className="flex flex-col gap-2.5 flex-1">
              {['Instant 0-100 readiness score', '4-category breakdown', '10 automated test scenarios', 'Shareable report URL', 'OG images + README badge', 'Scan any Shopify store', 'Unlimited free scans'].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/scan" className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full font-semibold text-sm transition-colors bg-white text-slate-700 border border-slate-300 hover:bg-slate-50">
              Scan Free &rarr;
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div variants={fadeInUp} className="rounded-xl p-7 border border-slate-200 bg-white shadow-sm flex flex-col gap-6">
            <div>
              <div className="text-lg font-bold text-slate-900 mb-1">Pro</div>
              <div className="text-xs text-slate-500 mb-4">Fix your score with actionable code snippets.</div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-slate-900">${billingAnnual ? '24' : '29'}</span>
                <span className="text-slate-500 mb-1 text-sm">/ mo</span>
              </div>
              <div className="text-xs text-emerald-600 mt-1">{billingAnnual ? '$290/yr (save $58)' : '\u00A0'}</div>
            </div>
            <ul className="flex flex-col gap-2.5 flex-1">
              {['Everything in Free', '3 tracked stores', 'Unlimited AI quality assessments', 'Fix instructions with code snippets', 'Weekly automated rescans', 'Email + Slack alerts', 'CLI tool + CI/CD integration'].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full font-semibold text-sm transition-colors bg-white text-slate-700 border border-slate-300 hover:bg-slate-50">
              Start 30-Day Trial &rarr;
            </Link>
            <p className="text-xs text-slate-500 text-center -mt-3">30-day money-back guarantee</p>
          </motion.div>

          {/* Max — featured */}
          <motion.div variants={fadeInUp} className="rounded-xl p-7 border-2 border-blue-400 bg-blue-50 ring-1 ring-blue-300 flex flex-col gap-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full">Most Popular</div>
            <div>
              <div className="text-lg font-bold text-slate-900 mb-1">Max</div>
              <div className="text-xs text-slate-500 mb-4">See what AI agents actually experience in your store.</div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-slate-900">${billingAnnual ? '66' : '79'}</span>
                <span className="text-slate-500 mb-1 text-sm">/ mo</span>
              </div>
              <div className="text-xs text-emerald-600 mt-1">{billingAnnual ? '$790/yr (save $158)' : '\u00A0'}</div>
            </div>
            <ul className="flex flex-col gap-2.5 flex-1">
              {['Everything in Pro', 'Simulated buyer agent', 'Full shopping transcript', 'Multi-query testing (5 scenarios)', '15 tracked stores', 'Daily automated rescans', 'Side-by-side store comparison'].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                  <svg className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full font-semibold text-sm transition-colors bg-blue-500 hover:bg-blue-600 text-white">
              Start 30-Day Trial &rarr;
            </Link>
            <p className="text-xs text-slate-500 text-center -mt-3">30-day money-back guarantee</p>
          </motion.div>
        </motion.div>

        {/* Agency — standalone */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-8 max-w-3xl mx-auto rounded-xl p-7 border border-slate-700 bg-slate-900 text-white flex flex-col sm:flex-row gap-6"
        >
          <div className="flex-1">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">For Agencies</div>
            <div className="text-lg font-bold mb-1">Agency</div>
            <div className="text-xs text-slate-400 mb-4">White-label reports, API access, and multi-user teams for consultancies managing client stores.</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold">${billingAnnual ? '208' : '249'}</span>
              <span className="text-slate-400 mb-1 text-sm">/ mo</span>
            </div>
            <div className="text-xs text-emerald-400">{billingAnnual ? '$2,490/yr (save $498)' : '\u00A0'}</div>
          </div>
          <div className="flex-1">
            <ul className="flex flex-col gap-2 mb-4">
              {['Everything in Max', '50 tracked stores', 'White-label reports + branded sharing', 'API access + batch scanning', 'Team/multi-user + role-based access', 'Cross-agent compatibility (4 buyer personas)'].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="inline-flex items-center justify-center px-5 py-2.5 rounded-full font-semibold text-sm transition-colors bg-white text-slate-900 hover:bg-slate-100">
              Start 30-Day Trial &rarr;
            </Link>
          </div>
        </motion.div>

        {/* Money-back guarantee */}
        <p className="text-center text-sm text-slate-500 mt-8 max-w-lg mx-auto">
          30-day money-back guarantee on all paid plans. You either improve your agent readiness or you get your money back.
        </p>

        {/* Revenue Calculator */}
        <div className="mt-20 border-t border-slate-200 pt-16">
          <RevenueCalculator />
        </div>
      </main>

      <footer className="border-t border-slate-200 px-6 py-6 mt-12 bg-white">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} MCPLens
        </div>
      </footer>
    </div>
  );
}
