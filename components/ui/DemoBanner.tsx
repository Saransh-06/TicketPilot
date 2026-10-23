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
      className="w-full bg-amber-50/90 backdrop-blur-md border-b border-amber-200/80 text-amber-950 px-4 py-2 text-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isDemo ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-200/90 font-semibold text-amber-900 border border-amber-300">
              <Database className="w-3.5 h-3.5" aria-hidden="true" />
              DEMO MODE ACTIVE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-200/90 font-semibold text-emerald-900 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              CONNECTED TO MEMBER 2 BACKEND
            </span>
          )}
          <span className="text-stone-700">
            {isDemo
              ? 'Using client-side transparent demo storage. Official IRCTC booking is user-controlled; no live booking credentials or bank secrets are ever collected.'
              : 'Production API active. Member 2 Express & SQLite endpoints in use.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/settings"
            className="underline hover:text-amber-900 font-medium focus-visible:ring-1 focus-visible:ring-amber-800"
          >
            Review Mode Settings
          </a>
          {isDemo && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-amber-100 text-stone-800 border border-amber-300 transition-colors shadow-xs"
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
