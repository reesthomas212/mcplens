import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { getErrorMessage } from '../../../utils/errors';
import type { NotificationPrefs } from '../../../types';

export default function NotificationsTab() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    scoreDrops: true,
    scoreGains: true,
    weeklyDigest: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.notificationPrefs) {
      const p = user.notificationPrefs;
      // If all false (new user, zero-value), default to all enabled
      const allFalse = !p.scoreDrops && !p.scoreGains && !p.weeklyDigest;
      setPrefs(allFalse ? { scoreDrops: true, scoreGains: true, weeklyDigest: true } : p);
    }
  }, [user]);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch('/api/auth/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationPrefs: prefs }),
      });
      if (!response.ok) throw new Error('Failed to save preferences');
      toast.success('Notification preferences saved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
    return (
      <div className="flex items-start justify-between py-4 border-b border-dark-800/50 last:border-b-0">
        <div className="flex-1 pr-4">
          <div className="text-sm font-medium text-dark-100">{label}</div>
          <div className="text-xs text-dark-400 mt-0.5">{description}</div>
        </div>
        <button
          onClick={() => onChange(!checked)}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-primary-500' : 'bg-dark-700'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`}
            style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-dark-50 mb-1">Email Notifications</h2>
        <p className="text-sm text-dark-400">Choose which emails you receive about your tracked stores.</p>
      </div>

      <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
        <Toggle
          checked={prefs.scoreDrops}
          onChange={(v) => setPrefs(p => ({ ...p, scoreDrops: v }))}
          label="Score drop alerts"
          description="Get notified when a tracked store's score drops 5+ points"
        />
        <Toggle
          checked={prefs.scoreGains}
          onChange={(v) => setPrefs(p => ({ ...p, scoreGains: v }))}
          label="Score improvement alerts"
          description="Get notified when a tracked store's score improves 5+ points"
        />
        <Toggle
          checked={prefs.weeklyDigest}
          onChange={(v) => setPrefs(p => ({ ...p, weeklyDigest: v }))}
          label="Weekly digest"
          description="Receive a weekly summary of all tracked store scores and trends"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
