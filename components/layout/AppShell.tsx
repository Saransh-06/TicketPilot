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
  Sparkles,
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
    { name: 'Dashboard', href: '/', icon: Compass },
    { name: 'My Trips', href: '/trips', icon: Train },
    { name: 'Compare Trains', href: '/trains', icon: Layers },
    { name: 'Booking Assistance', href: '/booking', icon: CheckSquare },
    { name: 'Booking History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'ThreeUI Showcase', href: '/threeui-preview', icon: Sparkles },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-ink selection:bg-accent-emerald-light selection:text-accent-emerald">
      {/* Accessibility Skip-to-Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-emerald"
      >
        Skip to main content
      </a>

      {/* Demo Status Banner */}
      <DemoBanner />

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 glass-nav border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-accent-emerald rounded-lg p-1"
                aria-label="Tatkal Assistant Home"
              >
                <div className="w-9 h-9 rounded-xl bg-ink text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Train className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-tight text-ink block leading-tight">
                    Tatkal Assistant
                  </span>
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-medium">
                    Railway Prep & Assistant
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Primary Navigation">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-accent-emerald text-white shadow-xs'
                        : 'text-stone-700 hover:text-ink hover:bg-stone-100/80'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{item.name}</span>
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 transition-colors shadow-2xs"
                title="Opens official IRCTC website in new tab for user booking"
              >
                <span>Official IRCTC</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-stone-700 hover:text-ink hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-accent-emerald text-white'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-ink'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-stone-200">
              <a
                href="https://www.irctc.co.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-ink text-white text-xs font-semibold"
              >
                <span>Open IRCTC Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Region */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>

      {/* Shared Footer with Ethics & Responsibility Boundaries */}
      <footer className="border-t border-stone-200/80 bg-white/60 backdrop-blur-md py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <span>
              <strong>Tatkal Assistant</strong> — Personal preparation & readiness tool. Not affiliated with IRCTC or Indian Railways.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>No Automated Captcha/Payment Bypass</span>
            <span>•</span>
            <span>User-Controlled Official Booking</span>
            <span>•</span>
            <Link href="/settings" className="hover:text-stone-800 underline">Privacy & Team Architecture</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
