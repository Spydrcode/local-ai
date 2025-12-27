'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavigationProps {
  currentPath?: string;
  businessName?: string;
  websiteUrl?: string;
  demoId?: string;
}

export function Navigation({ currentPath, businessName, websiteUrl, demoId }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = demoId ? [
    {
      label: 'Analysis Dashboard',
      href: `/analysis/${demoId}`,
      icon: '📊',
      description: 'Main analysis dashboard'
    },
    {
      label: 'Economic Intelligence',
      href: `/economic/${demoId}`,
      icon: '📈',
      description: 'Economic analysis'
    },
    {
      label: 'Strategic Dashboard',
      href: `/strategic-v2/${demoId}`,
      icon: '🎯',
      description: 'Strategic planning'
    },
    {
      label: 'HBS Intelligence',
      href: `/hbs/${demoId}`,
      icon: '🎓',
      description: 'Harvard Business School framework'
    }
  ] : [];

  return (
    <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-white">2ndmynd</span>
          </Link>

          {/* Business Info */}
          {businessName && (
            <div className="hidden md:flex items-center gap-4">
              <div className="h-6 w-px bg-white/20"></div>
              <div className="text-left">
                <h1 className="text-sm font-semibold text-white">{businessName}</h1>
                {websiteUrl && (
                  <a 
                    href={websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {websiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          {navigationItems.length > 0 && (
            <div className="hidden lg:flex items-center gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    currentPath === item.href
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              New Analysis
            </Link>
            <div className="text-xs text-emerald-300 font-medium tracking-wide">
              WE BUILD APPS
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4">
            <div className="space-y-2">
              {businessName && (
                <div className="px-3 py-2 border-b border-white/10 mb-4">
                  <h2 className="text-sm font-semibold text-white">{businessName}</h2>
                  {websiteUrl && (
                    <a 
                      href={websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-emerald-400"
                    >
                      {websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              )}
              
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === item.href
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div>{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-white/10">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Analysis
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
