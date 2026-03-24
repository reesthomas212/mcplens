import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: reduce)').matches;

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function DiagramStep({ number, title, visual, description }: { number: string; title: string; visual: React.ReactNode; description: string }) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex flex-col items-center text-center"
    >
      <div className="w-10 h-10 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center mb-4">{number}</div>
      <div className="mb-4">{visual}</div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{description}</p>
    </motion.div>
  );
}

function CategoryCard({ name, icon, description, examples }: { name: string; icon: string; description: string; examples: string[] }) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-base font-bold text-slate-900 mb-2">{name}</h3>
      <p className="text-sm text-slate-500 mb-3">{description}</p>
      <ul className="text-xs text-slate-400 space-y-1">
        {examples.map(e => (
          <li key={e} className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
            {e}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function HowItWorksPage() {
  useEffect(() => {
    document.title = 'How It Works | MCPLens';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Nav */}
      <header className="border-b border-slate-200 px-6 py-4 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="small" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/pricing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
            <Link to="/leaderboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Leaderboard</Link>
            <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Sign in</Link>
            <Link to="/scan" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full transition-colors">Scan Free</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Your store already talks to AI agents
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Shopify gave every store a machine-readable interface &mdash; the door AI uses to browse
            your products, compare prices, and start checkout. MCPLens checks if your door works.
          </p>
        </div>

        {/* Visual flow: Store → Interface → AI Agent */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white border border-slate-200 rounded-2xl p-8 mb-16"
        >
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl">🏪</div>
              <div className="text-sm font-semibold text-slate-900">Your Store</div>
              <div className="text-xs text-slate-400">Products, prices, inventory</div>
            </div>
            <div className="hidden sm:flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl">🚪</div>
              <div className="text-sm font-semibold text-slate-900">AI Interface</div>
              <div className="text-xs text-slate-400">Your store's MCP endpoint</div>
            </div>
            <div className="hidden sm:flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-2xl">🤖</div>
              <div className="text-sm font-semibold text-slate-900">AI Agents</div>
              <div className="text-xs text-slate-400">ChatGPT, Google, Perplexity</div>
            </div>
          </div>
          <p className="text-center text-sm text-slate-500 mt-6 max-w-xl mx-auto">
            When someone asks an AI agent to "find me running shoes under $150," the agent walks through
            your store's AI interface. If it finds missing data, broken checkout, or slow responses &mdash;
            it leaves and shops somewhere else.
          </p>
        </motion.div>

        {/* How MCPLens works — 3 steps */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">What MCPLens does</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <DiagramStep
              number="1"
              title="Scans your interface"
              visual={
                <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                </div>
              }
              description="We run 10 automated scenarios against your store's AI interface — the same checks a real AI shopping agent would perform."
            />
            <DiagramStep
              number="2"
              title="Scores your readiness"
              visual={
                <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <span className="text-3xl font-bold text-emerald-500">78</span>
                </div>
              }
              description="You get a 0-100 score with a breakdown across 4 categories. See exactly where AI agents get stuck."
            />
            <DiagramStep
              number="3"
              title="Shows you how to fix it"
              visual={
                <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L11.42 4.97m-5.1 5.1H20" /></svg>
                </div>
              }
              description="Prioritized fix instructions with Shopify code snippets. Fix the highest-impact issues first, rescan to verify."
            />
          </div>
        </div>

        {/* 4 categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">What we check</h2>
          <p className="text-center text-slate-500 mb-10 max-w-lg mx-auto">
            Every scan evaluates your store across 4 categories that matter to AI shopping agents.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CategoryCard
              name="Data Quality"
              icon="📊"
              description="Can AI agents find accurate product information?"
              examples={['Prices present on all products', 'Descriptions are complete', 'Images load correctly', 'Structured attributes (size, color, material)']}
            />
            <CategoryCard
              name="Product Discovery"
              icon="🔍"
              description="Can AI agents search and filter your catalog effectively?"
              examples={['Search returns relevant results', 'Category filtering works', 'Product recommendations available', 'Handles natural language queries']}
            />
            <CategoryCard
              name="Checkout Flow"
              icon="🛒"
              description="Can AI agents add to cart and start checkout?"
              examples={['Add-to-cart succeeds', 'Cart operations work correctly', 'Checkout initiation responds', 'Variant selection functions']}
            />
            <CategoryCard
              name="Technical Health"
              icon="⚡"
              description="Does your interface respond reliably and follow standards?"
              examples={['Response times under 2 seconds', 'Endpoint returns valid data', 'Required fields present', 'Error handling works correctly']}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Check your store in 15 seconds</h2>
          <p className="text-slate-500 mb-6">No account required. Enter your domain and see your score instantly.</p>
          <Link to="/scan" className="inline-block px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-colors">
            Scan Your Store Free &rarr;
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 px-6 py-6 mt-12 bg-white">
        <div className="max-w-5xl mx-auto text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} MCPLens
        </div>
      </footer>
    </div>
  );
}
