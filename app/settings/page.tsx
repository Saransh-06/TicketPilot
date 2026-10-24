'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { UserSettings, TravelClass, PreferenceChoice } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Settings, Shield, Bell, Eye, Trash2, CheckCircle, RotateCcw, AlertTriangle, Info, Sliders } from 'lucide-react';

const ALL_CLASSES: { code: TravelClass; label: string }[] = [
  { code: '1A', label: '1A - First AC' },
  { code: '2A', label: '2A - 2 Tier AC' },
  { code: '3A', label: '3A - 3 Tier AC' },
  { code: '3E', label: '3E - 3 AC Economy' },
  { code: 'CC', label: 'CC - AC Chair Car' },
  { code: 'EC', label: 'EC - Executive CC' },
  { code: 'SL', label: 'SL - Sleeper Class' },
  { code: '2S', label: '2S - Second Sitting' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const res = await api.getSettings();
      if (res.data) {
        setSettings(res.data);
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleClassToggle = (code: TravelClass) => {
    if (!settings) return;
    const exists = settings.preferredClasses.includes(code);
    const updated = exists
      ? settings.preferredClasses.filter(c => c !== code)
      : [...settings.preferredClasses, code];
    setSettings({ ...settings, preferredClasses: updated });
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const res = await api.updateSettings(settings);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all demo trips and outcome records back to default?')) {
      api.resetDemoData();
      setResetMessage('Demo data reset successfully. Reloading workspace...');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-accent-coral border-t-transparent mb-2" />
        <p className="text-sm font-mono text-ink">Loading application settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-white/8">
        <div className="flex items-center gap-2 mb-1">
          <span className="section-idx">[06 // CONFIG.SYS]</span>
          <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider">
            PARAMETERS & PRIVACY
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Application Preferences & Privacy</h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
          Configure default travel filters, display options, and review system privacy boundaries.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-accent-emerald" />
          <span>Preferences updated and saved to client storage.</span>
        </div>
      )}

      {resetMessage && (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* 1. Travel Class Preferences */}
      <GlassCard depth={1}>
        <div className="flex items-center gap-2 mb-1">
          <span className="section-idx">[06.1 // CLASSES]</span>
          <h2 className="font-bold text-sm sm:text-base text-ink">Preferred Travel Classes</h2>
        </div>
        <p className="text-xs text-ink-muted mb-4 font-mono">
          Select classes to prioritize on the comparison and train recommendation dashboard.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ALL_CLASSES.map(cls => {
            const isSelected = settings.preferredClasses.includes(cls.code);
            return (
              <button
                key={cls.code}
                type="button"
                onClick={() => handleClassToggle(cls.code)}
                className={`p-3 rounded-xl border text-left text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? 'bg-accent-coral/20 text-accent-coral border-accent-coral/40 shadow-glow-orange'
                    : 'bg-surface-elevated text-ink-muted hover:text-ink hover:bg-surface-elevated/80 border-white/8'
                }`}
              >
                <span className="font-bold block text-sm">{cls.code}</span>
                <span className="text-[11px] opacity-75 block truncate">{cls.label.split('-')[1]?.trim()}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* 2. Default Comparison Strategy */}
      <GlassCard depth={1}>
        <div className="flex items-center gap-2 mb-1">
          <span className="section-idx">[06.2 // STRATEGY]</span>
          <h2 className="font-bold text-sm sm:text-base text-ink">Default Timetable Preference</h2>
        </div>
        <p className="text-xs text-ink-muted mb-4 font-mono">
          Determines initial sorting and highlight focus when comparing trains.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['balanced', 'fastest', 'cheapest'] as PreferenceChoice[]).map((pref) => {
            const isSelected = settings.defaultPreference === pref;
            return (
              <button
                key={pref}
                type="button"
                onClick={() => setSettings({ ...settings, defaultPreference: pref })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-accent-coral/15 border-accent-coral/40 text-ink shadow-glow-orange'
                    : 'bg-surface-elevated border-white/8 text-ink-muted hover:text-ink'
                }`}
              >
                <strong className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-coral mb-1">{pref}</strong>
                <span className="text-[11px] text-ink-subtle block font-mono leading-relaxed">
                  {pref === 'balanced' && 'Equal weighting between travel duration and total fare.'}
                  {pref === 'fastest' && 'Sort strictly by shortest journey run time.'}
                  {pref === 'cheapest' && 'Sort strictly by lowest total Tatkal fare.'}
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* 3. Display & Notification Preferences */}
      <GlassCard depth={1}>
        <div className="flex items-center gap-2 mb-1">
          <span className="section-idx">[06.3 // DISPLAY]</span>
          <h2 className="font-bold text-sm sm:text-base text-ink">Display & Scheduler Integration</h2>
        </div>
        <p className="text-xs text-ink-muted mb-4 font-mono">
          Control visual precision and notification readiness.
        </p>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-elevated/60 border border-white/8 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-ink block font-mono">High-Precision Countdown Seconds</span>
              <span className="text-[11px] text-ink-subtle block font-mono">
                Renders ticking second digits in the countdown widget.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.enableCountdownSeconds}
              onChange={(e) => setSettings({ ...settings, enableCountdownSeconds: e.target.checked })}
              className="w-4 h-4 text-accent-coral rounded focus:ring-accent-coral accent-orange-500"
            />
          </label>

          {/* Scheduler push notifications with clear Member 3 ownership explanation */}
          <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-white/8 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent-coral" />
                <span className="font-bold text-ink font-mono">Scheduler Notification Daemon</span>
              </div>
              <StatusBadge label="Pending Member 3 Daemon" variant="warning" />
            </div>
            <p className="text-ink-subtle text-[11px] font-mono leading-relaxed">
              Authoritative desktop push notifications and missed-reminder recovery are governed by the Member 3 background scheduler module. Once Member 3 deploys the notification service worker, alerts will trigger at T-15m, T-5m, and T-1m.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* 4. Privacy & Data Deletion */}
      <GlassCard depth={1} className="border-red-500/20 bg-red-950/15">
        <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
          <Shield className="w-4 h-4" />
          <h2 className="text-sm sm:text-base font-mono">Privacy Principles & Data Controls</h2>
        </div>
        <p className="text-xs text-ink-muted mb-4 leading-relaxed font-mono">
          Tatkal Assistant stores journey profiles and manual booking logs exclusively in local client memory and SQLite (when connected to Member 2). We never transmit passenger IDs, banking details, or IRCTC passwords.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/8">
          <div>
            <span className="text-xs font-bold text-ink block font-mono">Reset Client Demo Data</span>
            <span className="text-[11px] text-ink-subtle block font-mono">
              Clears all local storage trips, booking history logs, and restores default seed data.
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-mono font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Storage</span>
          </button>
        </div>
      </GlassCard>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-accent-coral hover:bg-orange-600 text-white font-mono font-bold text-xs shadow-glow-orange transition-all focus:ring-2 focus:ring-accent-coral disabled:opacity-50"
        >
          {isSaving ? 'Saving Preferences...' : 'Save All Preferences'}
        </button>
      </div>
    </div>
  );
}
