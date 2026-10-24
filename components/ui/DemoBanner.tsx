'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AlertCircle, RotateCcw, ShieldCheck, Database } from 'lucide-react';

export function DemoBanner() {
  const [isDemo, setIsDemo] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setIsDemo(api.isDemoActive());
  }, []);

  const handleReset = () => {
    setResetting(true);
    api.resetDemoData();
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div
      role="region"
      aria-label="Application mode banner"
      className="w-full bg-amber-500/8 backdrop-blur-md border-b border-amber-500/15 text-amber-200 px-4 py-2 text-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isDemo ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 font-mono font-semibold text-amber-300 border border-amber-500/25 text-[0.625rem] tracking-wider">
              <Database className="w-3.5 h-3.5" aria-hidden="true" />
              DEMO MODE ACTIVE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/15 font-mono font-semibold text-emerald-300 border border-emerald-500/25 text-[0.625rem] tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              CONNECTED TO MEMBER 2 BACKEND
            </span>
          )}
          <span className="text-ink-muted">
            {isDemo
              ? 'Using client-side transparent demo storage. Official IRCTC booking is user-controlled; no live booking credentials or bank secrets are ever collected.'
              : 'Production API active. Member 2 Express & SQLite endpoints in use.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/settings"
            className="underline hover:text-amber-300 font-medium focus-visible:ring-1 focus-visible:ring-amber-500 text-amber-400"
          >
            Review Mode Settings
          </a>
          {isDemo && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-ink-muted border border-white/10 transition-colors text-[0.6875rem] font-mono"
              title="Reset all demo trips and history back to factory seed"
            >
              <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
