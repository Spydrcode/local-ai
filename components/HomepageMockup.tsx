'use client';

import type { DemoHomepageMock, DemoInsights } from '@/types/demo';
import Image from 'next/image';

interface HomepageMockupProps {
  homepage: DemoHomepageMock;
  insights: DemoInsights;
  businessName: string;
  brandColor: string;
}

export default function HomepageMockup({ homepage, insights, businessName, brandColor }: HomepageMockupProps) {
  const { hero, sections, style } = homepage;
  
  // Use the AI-generated color palette from the homepage style
  const colors = {
    primary: style.primaryColor,
    secondary: style.secondaryColor,
    accent: style.accentColor,
  };
  
  // Generate placeholder images using picsum with safe ID range (1-100 are guaranteed to exist)
  const getPlaceholderImage = (seed: string, width = 1200, height = 600) => {
    // Create a simple hash from the seed string to get a consistent number
    const hash = seed.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const imageId = (Math.abs(hash) % 100) + 1; // Use a number between 1-100 (safe range)
    return `https://picsum.photos/id/${imageId}/${width}/${height}`;
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl md:rounded-3xl">
      {/* Hero Section */}
      <div 
        className="relative flex min-h-[300px] items-center justify-center overflow-hidden px-4 py-12 text-white md:min-h-[500px] md:px-8 md:py-20"
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
        }}
      >
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${getPlaceholderImage(businessName + '-hero', 1920, 800)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 max-w-4xl text-center">
          <h1 className="text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>
          <p className="mt-4 text-base font-light opacity-90 md:mt-6 md:text-xl lg:text-2xl">
            {hero.subheadline}
          </p>
          <button
            className="mt-6 rounded-full px-6 py-3 text-base font-semibold shadow-lg transition-transform hover:scale-105 md:mt-8 md:px-10 md:py-4 md:text-lg"
            style={{ backgroundColor: colors.accent, color: colors.primary }}
          >
            {hero.ctaLabel}
          </button>
          <p className="mt-3 text-xs opacity-75 md:mt-4 md:text-sm">{hero.backgroundIdea}</p>
        </div>
      </div>

      {/* Profit IQ Insights Bar */}
      <div 
        className="border-b px-4 py-4 text-white md:px-8 md:py-6"
        style={{ backgroundColor: colors.secondary }}
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80 md:text-sm">
            AI-Powered Profit IQ Analysis
          </p>
          <p className="mt-2 text-sm leading-relaxed md:text-lg">
            {insights.profitIq}
          </p>
        </div>
      </div>

      {/* Features/Services Grid */}
      <div className="px-4 py-8 md:px-8 md:py-16" style={{ backgroundColor: '#f8fafc' }}>
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-center text-2xl font-bold md:mb-12 md:text-4xl" style={{ color: colors.primary }}>
            What We Offer
          </h2>
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {sections.slice(0, 6).map((section, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow hover:shadow-xl md:rounded-2xl"
              >
                <div className="relative h-40 w-full md:h-48">
                  <Image
                    src={getPlaceholderImage(businessName + section.title + idx, 600, 400)}
                    alt={section.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="text-lg font-semibold md:text-xl" style={{ color: colors.primary }}>
                    {section.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 md:mt-3 md:text-base">
                    {section.body}
                  </p>
                  {section.ctaLabel && (
                    <button
                      className="mt-3 rounded-full px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 md:mt-4 md:px-6 md:text-sm"
                      style={{ backgroundColor: colors.accent }}
                    >
                      {section.ctaLabel}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Items Section */}
      <div className="px-4 py-8 md:px-8 md:py-16" style={{ backgroundColor: colors.secondary }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-white md:mb-8 md:text-3xl">
            Recommended Actions to Boost Revenue
          </h2>
          <div className="space-y-3 md:space-y-4">
            {insights.actions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm md:gap-4 md:rounded-2xl md:p-6"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white md:h-10 md:w-10 md:text-base"
                  style={{ backgroundColor: colors.accent }}
                >
                  {idx + 1}
                </div>
                <p className="text-sm leading-relaxed text-white md:text-lg">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div 
        className="px-4 py-10 text-center text-white md:px-8 md:py-16"
        style={{ backgroundColor: colors.primary }}
      >
        <h2 className="text-2xl font-bold md:text-3xl">Ready to Get Started?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm opacity-90 md:mt-4 md:text-lg">
          Experience the power of AI-driven marketing designed specifically for local businesses like yours.
        </p>
        <div className="mt-6 flex flex-col gap-3 md:mt-8 md:flex-row md:flex-wrap md:justify-center md:gap-4">
          <button
            className="rounded-full px-6 py-3 text-base font-semibold shadow-lg transition-transform hover:scale-105 md:px-8 md:py-4 md:text-lg"
            style={{ backgroundColor: 'white', color: colors.primary }}
          >
            Schedule Demo
          </button>
          <button
            className="rounded-full border-2 border-white px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10 md:px-8 md:py-4 md:text-lg"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Style Guide Badge */}
      <div className="border-t bg-gray-50 px-4 py-4 md:px-8 md:py-6">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 md:mb-3">
            AI-Generated Style Guide
          </p>
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div>
              <p className="text-xs text-gray-500">Primary</p>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-full border-2 border-gray-300 md:h-8 md:w-8"
                  style={{ backgroundColor: colors.primary }}
                />
                <code className="text-xs text-gray-700">{colors.primary}</code>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Secondary</p>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-full border-2 border-gray-300 md:h-8 md:w-8"
                  style={{ backgroundColor: colors.secondary }}
                />
                <code className="text-xs text-gray-700">{colors.secondary}</code>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Accent</p>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-full border-2 border-gray-300 md:h-8 md:w-8"
                  style={{ backgroundColor: colors.accent }}
                />
                <code className="text-xs text-gray-700">{colors.accent}</code>
              </div>
            </div>
            <div className="w-full md:ml-auto md:w-auto">
              <p className="text-xs text-gray-500">Brand Tone</p>
              <p className="mt-1 text-sm font-medium text-gray-700 md:text-base">{style.tone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
