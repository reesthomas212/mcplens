import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const offers = [
  {
    name: 'Free Scan',
    eyebrow: 'Top-of-funnel',
    price: '$0',
    period: 'forever',
    description: 'Run the automated scanner and get a shareable 0-100 agent-commerce QA score.',
    cta: 'Scan Free',
    href: '/scan',
    featured: false,
    features: [
      'Automated Shopify scan',
      '4-category score breakdown',
      'Shareable report URL',
      'Benchmark context',
      'No account required',
    ],
  },
  {
    name: 'Human Audit',
    eyebrow: 'Best validation offer',
    price: '$199',
    period: 'one time',
    description: 'A human-reviewed fix report for one store, written so a merchant or agency client can act on it.',
    cta: 'Request Audit',
    href: '/scan',
    featured: true,
    features: [
      'Everything in Free Scan',
      'Human-reviewed findings',
      'Prioritized fix roadmap',
      'Business-impact summary',
      'Agency-friendly PDF/report copy',
    ],
  },
  {
    name: 'Pro Tracking',
    eyebrow: 'For serious stores',
    price: '$79',
    period: 'per month',
    description: 'Daily tracking and deeper simulations for teams that already care about AI-shopping visibility.',
    cta: 'Start Trial',
    href: '/signup',
    featured: false,
    features: [
      '15 tracked stores',
      'Daily automated rescans',
      'AI quality assessment',
      'Buyer simulation transcript',
      'Email alerts and CI checks',
    ],
  },
  {
    name: 'Agency',
    eyebrow: 'Most plausible SaaS tier',
    price: '$600',
    period: 'per month',
    description: 'White-label and batch reporting for Shopify agencies selling ecommerce QA, CRO, SEO, or technical audits.',
    cta: 'Talk to Sales',
    href: '/signup?plan=agency',
    featured: false,
    features: [
      '100 tracked stores',
      'White-label client reports',
      'Batch scanning',
      'API access',
      'Team access',
      'Reusable agency audit templates',
    ],
  },
];

export default function PricingPage() {
  useEffect(() => {
    document.title = 'Pricing | MCPLens';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <header className="border-b border-slate-200 px-6 py-4 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="small" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/how-it-works" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">How It Works</Link>
            <Link to="/leaderboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Benchmarks</Link>
            <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Sign in</Link>
            <Link to="/scan" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full transition-colors">Scan Free</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
            Agency-first pricing
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Free scans first. Paid proof when the report needs to sell the work.
          </h1>
          <p className="text-slate-500">
            MCPLens is being validated as a side-bet SaaS. The strongest paid motions are one-off human audits and white-label agency reports, not broad low-price merchant subscriptions.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {offers.map((offer) => (
            <motion.div
              key={offer.name}
              variants={fadeInUp}
              className={`rounded-xl p-6 border bg-white shadow-sm flex flex-col gap-5 ${
                offer.featured ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                  {offer.eyebrow}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">{offer.name}</h2>
                <p className="text-sm text-slate-500 min-h-16">{offer.description}</p>
              </div>

              <div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-slate-900">{offer.price}</span>
                  <span className="text-sm text-slate-500 mb-1">{offer.period}</span>
                </div>
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {offer.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to={offer.href}
                className={`mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full font-semibold text-sm transition-colors ${
                  offer.featured
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {offer.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <section className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-bold text-slate-900 mb-2">Why no cheap $29 plan?</h2>
            <p className="text-sm text-slate-500">
              Early buyers need trusted, actionable reports more than another dashboard. Low-price self-serve comes later if merchants prove recurring demand.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-bold text-slate-900 mb-2">Why agencies first?</h2>
            <p className="text-sm text-slate-500">
              Agencies can turn scans into billable audits, CRO retainers, SEO work, and technical QA. They also need batch and white-label workflows.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-bold text-slate-900 mb-2">Validation bar</h2>
            <p className="text-sm text-slate-500">
              The next milestone is paid audits and repeated agency interest. If scans are interesting but nobody pays, the product should stay a side bet.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-6 py-6 mt-12 bg-white">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} MCPLens
        </div>
      </footer>
    </div>
  );
}
