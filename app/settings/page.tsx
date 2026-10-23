'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { UserSettings, TravelClass, PreferenceChoice } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Settings, Shield, Bell, Eye, Trash2, CheckCircle, RotateCcw, AlertTriangle, Info } from 'lucide-react';

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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-accent-emerald border-t-transparent mb-2" />
        <p className="text-sm font-medium text-ink">Loading application settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-stone-200/60">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-accent-emerald" />
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Application Preferences & Privacy</h1>
        </div>
        <p className="text-xs sm:text-sm text-ink-muted">
          Configure default travel filters, display options, and review system privacy boundaries.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Preferences updated and saved to client storage.</span>
        </div>
      )}

      {resetMessage && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-amber-600 animate-spin" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* 1. Travel Class Preferences */}
      <GlassCard depth={1}>
        <h2 className="font-bold text-base text-ink mb-1">Preferred Travel Classes</h2>
        <p className="text-xs text-ink-muted mb-4">
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
                className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-accent-emerald text-white border-accent-emerald shadow-2xs'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                <span className="font-bold block">{cls.code}</span>
                <span className="text-[11px] opacity-80 block truncate">{cls.label.split('-')[1]?.trim()}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* 2. Default Comparison Strategy */}
      <GlassCard depth={1}>
        <h2 className="font-bold text-base text-ink mb-1">Default Timetable Preference</h2>
        <p className="text-xs text-ink-muted mb-4">
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
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-50 border-accent-emerald text-emerald-950 ring-1 ring-accent-emerald'
                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                }`}
              >
                <strong className="block text-xs font-bold capitalize text-ink mb-0.5">{pref}</strong>
                <span className="text-[11px] text-stone-500 block">
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
        <h2 className="font-bold text-base text-ink mb-1">Display & Scheduler Integration</h2>
        <p className="text-xs text-ink-muted mb-4">
          Control visual precision and notification readiness.
        </p>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-stone-200 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-ink block">High-Precision Countdown Seconds</span>
              <span className="text-[11px] text-stone-500 block">
                Renders ticking second digits in the countdown widget.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.enableCountdownSeconds}
              onChange={(e) => setSettings({ ...settings, enableCountdownSeconds: e.target.checked })}
              className="w-4 h-4 text-accent-emerald rounded focus:ring-accent-emerald"
            />
          </label>

          {/* Scheduler push notifications with clear Member 3 ownership explanation */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-stone-500" />
                <span className="font-bold text-ink">Scheduler Notification Daemon</span>
              </div>
              <StatusBadge label="Pending Member 3 Daemon" variant="warning" />
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Authoritative desktop push notifications and missed-reminder recovery are governed by the Member 3 background scheduler module. Once Member 3 deploys the notification service worker, alerts will trigger at T-15m, T-5m, and T-1m.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* 4. Privacy & Data Deletion */}
      <GlassCard depth={1} className="border-rose-100 bg-rose-50/20">
        <div className="flex items-center gap-2 text-rose-900 font-bold mb-1">
          <Shield className="w-4 h-4" />
          <h2>Privacy Principles & Data Controls</h2>
        </div>
        <p className="text-xs text-stone-600 mb-4 leading-relaxed">
          Tatkal Assistant stores journey profiles and manual booking logs exclusively in local client memory and SQLite (when connected to Member 2). We never transmit passenger IDs, banking details, or IRCTC passwords.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200/60">
          <div>
            <span className="text-xs font-bold text-ink block">Reset Client Demo Data</span>
            <span className="text-[11px] text-stone-500 block">
              Clears all local storage trips, booking history logs, and restores default seed data.
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-semibold transition-colors"
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
          className="px-6 py-2.5 rounded-xl bg-accent-emerald hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-all focus:ring-2 focus:ring-accent-emerald disabled:opacity-50"
        >
          {isSaving ? 'Saving Preferences...' : 'Save All Preferences'}
        </button>
      </div>
    </div>
  );
}
