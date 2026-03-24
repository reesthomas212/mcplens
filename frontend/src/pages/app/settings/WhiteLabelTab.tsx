import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../../utils/errors';

interface AgencyBranding {
  logo: string;
  companyName: string;
  accentColor: string;
}

export default function WhiteLabelTab() {
  const [branding, setBranding] = useState<AgencyBranding>({
    logo: '',
    companyName: '',
    accentColor: '#6366f1',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/branding/agency', { credentials: 'include' })
      .then(r => {
        if (r.status === 402) throw new Error('Agency plan required');
        return r.json();
      })
      .then(data => setBranding({
        logo: data.logo || '',
        companyName: data.companyName || '',
        accentColor: data.accentColor || '#6366f1',
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch('/api/branding/agency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(branding),
      });
      if (!response.ok) throw new Error('Failed to save branding');
      toast.success('White-label branding saved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-dark-400 text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-dark-50 mb-1">White-Label Branding</h2>
        <p className="text-sm text-dark-400">Customize how scan reports appear when shared with your clients.</p>
      </div>

      <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-dark-100 mb-2">Company Name</label>
          <input
            type="text"
            value={branding.companyName}
            onChange={e => setBranding(b => ({ ...b, companyName: e.target.value }))}
            placeholder="Your Agency Name"
            className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-100 mb-2">Logo URL</label>
          <input
            type="url"
            value={branding.logo}
            onChange={e => setBranding(b => ({ ...b, logo: e.target.value }))}
            placeholder="https://yoursite.com/logo.png"
            className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors text-sm"
          />
          <p className="text-xs text-dark-500 mt-1">PNG or SVG recommended, max 200px wide</p>
          {branding.logo && (
            <div className="mt-3 p-3 bg-dark-800 rounded-lg">
              <p className="text-xs text-dark-500 mb-2">Preview:</p>
              <img src={branding.logo} alt="Logo preview" className="max-h-12 max-w-[200px]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-100 mb-2">Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={branding.accentColor}
              onChange={e => setBranding(b => ({ ...b, accentColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-dark-700 cursor-pointer"
            />
            <input
              type="text"
              value={branding.accentColor}
              onChange={e => setBranding(b => ({ ...b, accentColor: e.target.value }))}
              placeholder="#6366f1"
              className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors text-sm font-mono"
            />
          </div>
          <p className="text-xs text-dark-500 mt-1">Used for buttons and highlights in branded reports</p>
        </div>
      </div>

      <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-dark-100 mb-3">How it works</h3>
        <ul className="text-xs text-dark-400 space-y-2">
          <li>Download HTML reports from any scan result page — they'll show your company name and logo instead of MCPLens</li>
          <li>Share branded report links by adding <code className="text-dark-300 bg-dark-800 px-1.5 py-0.5 rounded">?branding=true</code> to any report URL</li>
          <li>Example: <code className="text-dark-300 bg-dark-800 px-1.5 py-0.5 rounded text-xs break-all">mcplens.dev/api/scan/SCAN_ID/report?branding=true</code></li>
        </ul>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : 'Save Branding'}
      </button>
    </div>
  );
}
