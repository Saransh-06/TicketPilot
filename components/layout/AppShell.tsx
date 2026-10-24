'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Train,
  Clock,
  CheckSquare,
  History,
  Settings,
  Menu,
  X,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { DemoBanner } from '../ui/DemoBanner';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Compass, idx: '01' },
    { name: 'My Trips', href: '/trips', icon: Train, idx: '02' },
    { name: 'Compare Trains', href: '/trains', icon: Layers, idx: '03' },
    { name: 'Booking Assistance', href: '/booking', icon: CheckSquare, idx: '04' },
    { name: 'Booking History', href: '/history', icon: History, idx: '05' },
    { name: 'Settings', href: '/settings', icon: Settings, idx: '06' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-ink selection:bg-accent-coral/20 selection:text-ink">
      {/* Accessibility Skip-to-Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-coral focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-coral"
      >
        Skip to main content
      </a>

      {/* Demo Status Banner */}
      <DemoBanner />

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-accent-coral rounded-lg p-1"
                aria-label="Tatkal Assistant Home"
              >
                <div className="w-8 h-8 rounded-lg bg-accent-coral/10 border border-accent-coral/25 flex items-center justify-center group-hover:bg-accent-coral/20 transition-colors">
                  <Train className="w-4 h-4 text-accent-coral" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-sm tracking-tight text-ink block leading-tight">
                    Tatkal Assistant
                  </span>
                  <span className="text-[0.5625rem] text-ink-subtle font-mono uppercase tracking-[0.15em] block">
                    Railway Command Interface
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links — Compact editorial style with numbered items */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary Navigation">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-medium transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral ${
                      active
                        ? 'bg-white/10 text-ink border border-white/15 shadow-xs'
                        : 'text-ink-muted hover:text-ink hover:bg-white/5 border border-transparent'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className={`font-mono text-[0.5625rem] font-semibold ${active ? 'text-accent-coral' : 'text-ink-subtle'}`}>
                      {item.idx}
                    </span>
                    <span>{item.name}</span>
                    {active && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-accent-coral rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Official IRCTC Quick Button */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="https://www.irctc.co.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[0.6875rem] font-medium text-ink-muted hover:text-ink transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral"
                title="Opens official IRCTC website in new tab for user booking"
              >
                <span>Official IRCTC</span>
                <ExternalLink className="w-3 h-3 text-ink-subtle" aria-hidden="true" />
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent-coral"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/5 bg-background/98 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral ${
                    active
                      ? 'bg-accent-coral/10 text-accent-coral border border-accent-coral/25'
                      : 'text-ink-muted hover:bg-white/5 hover:text-ink border border-transparent'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="font-mono text-xs text-ink-subtle w-5">{item.idx}</span>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/5">
              <a
                href="https://www.irctc.co.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent-coral/10 hover:bg-accent-coral/15 border border-accent-coral/25 text-accent-coral text-xs font-mono font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral"
              >
                <span>Open IRCTC Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Region */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">
        {children}
      </main>

      {/* Shared Footer with Ethics & Responsibility Boundaries */}
      <footer className="border-t border-white/5 bg-background/80 backdrop-blur-md py-6 text-xs text-ink-subtle relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent-emerald" aria-hidden="true" />
            <span>
              <strong className="text-ink">Tatkal Assistant</strong> — Personal preparation & readiness tool. Not affiliated with IRCTC or Indian Railways.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[0.6875rem] font-mono text-ink-faint">
            <span>No Automated Captcha/Payment Bypass</span>
            <span className="text-white/15">•</span>
            <span>User-Controlled Official Booking</span>
            <span className="text-white/15">•</span>
            <Link href="/settings" className="hover:text-ink underline decoration-white/20 hover:decoration-white/40 transition-colors">Privacy & Team Architecture</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
