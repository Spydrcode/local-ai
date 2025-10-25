'use client';

import type { WebsiteDesign } from '@/pages/api/website/generate';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface WebsiteDesignGalleryProps {
  demoId: string;
}

const styleIcons = {
  modern: '🚀',
  classic: '🏛️',
  bold: '⚡',
  minimal: '✨',
  luxury: '👑',
};

const styleDescriptions = {
  modern: 'Tech-forward with smooth animations',
  classic: 'Timeless and trust-building',
  bold: 'High-contrast and attention-grabbing',
  minimal: 'Ultra-clean with elegant whitespace',
  luxury: 'Sophisticated premium experience',
};

export default function WebsiteDesignGallery({ demoId }: WebsiteDesignGalleryProps) {
  const [designs, setDesigns] = useState<WebsiteDesign[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<WebsiteDesign | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Generate designs
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/website/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId }),
      });

      if (!response.ok) throw new Error('Failed to generate designs');

      const data = await response.json();
      setDesigns(data.designs || []);
      if (data.designs && data.designs.length > 0) {
        setSelectedDesign(data.designs[0]);
      }
    } catch (error) {
      console.error('Error generating designs:', error);
      alert('Failed to generate website designs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Copy design code
  const handleCopyCode = async (section: string) => {
    if (!selectedDesign) return;

    const code = generateReactCode(selectedDesign, section);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  // Generate React component code
  const generateReactCode = (design: WebsiteDesign, section: string) => {
    if (section === 'full') {
      return `'use client';

import { motion } from 'framer-motion';

export default function ${design.style.charAt(0).toUpperCase() + design.style.slice(1)}Website() {
  return (
    <div style={{ fontFamily: '${design.typography.bodyFont}' }}>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          background: 'linear-gradient(135deg, ${design.colors.primary} 0%, ${design.colors.secondary} 100%)',
          color: '${design.colors.background}',
          padding: '8rem 2rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', fontFamily: '${design.typography.headingFont}', marginBottom: '1rem' }}>
          ${design.sections.hero.headline}
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
          ${design.sections.hero.subheadline}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            backgroundColor: '${design.colors.accent}',
            color: '${design.colors.text}',
            padding: '1rem 3rem',
            fontSize: '1.25rem',
            fontWeight: '600',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ${design.sections.hero.ctaLabel}
        </motion.button>
      </motion.section>

      {/* Features Section */}
      <section style={{ backgroundColor: '${design.colors.background}', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            ${design.sections.features.map((feature, idx) => `
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: ${idx * 0.1}, duration: 0.6 }}
              viewport={{ once: true }}
              style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>${feature.icon}</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', fontFamily: '${design.typography.headingFont}', color: '${design.colors.primary}' }}>
                ${feature.title}
              </h3>
              <p style={{ color: '${design.colors.text}' }}>${feature.description}</p>
            </motion.div>`).join('\n            ')}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        style={{
          backgroundColor: '${design.colors.primary}',
          color: '${design.colors.background}',
          padding: '6rem 2rem',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', fontFamily: '${design.typography.headingFont}' }}>
          ${design.sections.cta.headline}
        </h2>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          ${design.sections.cta.description}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            backgroundColor: '${design.colors.accent}',
            color: '${design.colors.text}',
            padding: '1rem 3rem',
            fontSize: '1.25rem',
            fontWeight: '600',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ${design.sections.cta.ctaLabel}
        </motion.button>
      </motion.section>
    </div>
  );
}`;
    } else if (section === 'hero') {
      return `<motion.section
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  style={{
    background: 'linear-gradient(135deg, ${design.colors.primary} 0%, ${design.colors.secondary} 100%)',
    color: '${design.colors.background}',
    padding: '8rem 2rem',
    textAlign: 'center',
  }}
>
  <h1 style={{ fontSize: '4rem', fontWeight: 'bold', fontFamily: '${design.typography.headingFont}' }}>
    ${design.sections.hero.headline}
  </h1>
  <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
    ${design.sections.hero.subheadline}
  </p>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    ${design.sections.hero.ctaLabel}
  </motion.button>
</motion.section>`;
    }
    return '';
  };

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-slate-950/50 p-8 backdrop-blur-sm">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Website Design Gallery</h2>
        <p className="mt-2 text-slate-400">Professional templates with Framer Motion animations</p>
      </div>

      {/* Generate Button */}
      {designs.length === 0 && (
        <div className="mb-8">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full rounded-2xl py-6 text-lg font-semibold text-white transition-all ${
              loading
                ? 'cursor-not-allowed bg-slate-700'
                : 'bg-linear-to-r from-purple-600 to-blue-600 hover:shadow-2xl hover:scale-[1.02]'
            }`}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Generating AI-Powered Designs...
              </>
            ) : (
              <>🎨 Generate Website Designs</>
            )}
          </button>
        </div>
      )}

      {/* Design Grid */}
      {designs.length > 0 && (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {designs.map((design) => (
              <motion.button
                key={design.id}
                onClick={() => setSelectedDesign(design)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`rounded-2xl border-2 p-6 text-left transition-all ${
                  selectedDesign?.id === design.id
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                    : 'border-white/10 bg-slate-900/50 hover:border-white/30'
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-4xl">{styleIcons[design.style]}</span>
                  <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                    {design.suitability.score}% Match
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{design.name}</h3>
                <p className="mb-4 text-sm text-slate-400">{styleDescriptions[design.style]}</p>
                <div className="flex gap-2">
                  {Object.values(design.colors).slice(0, 3).map((color, idx) => (
                    <div
                      key={idx}
                      className="h-8 w-8 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Regenerate Button */}
          <div className="mb-8 text-center">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-full bg-slate-800 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-700"
            >
              {loading ? 'Generating...' : '🔄 Generate New Designs'}
            </button>
          </div>
        </>
      )}

      {/* Selected Design Preview */}
      <AnimatePresence mode="wait">
        {selectedDesign && (
          <motion.div
            key={selectedDesign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Design Info */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedDesign.name}</h3>
                  <p className="mt-1 text-slate-400">{selectedDesign.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyCode('full')}
                    className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-600"
                  >
                    {copiedSection === 'full' ? '✓ Copied!' : '📋 Copy Code'}
                  </button>
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-600"
                  >
                    {showCode ? '👁️ Hide Code' : '💻 Show Code'}
                  </button>
                </div>
              </div>

              {/* Suitability */}
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                <h4 className="mb-2 text-sm font-semibold text-emerald-300">
                  Why This Design Works ({selectedDesign.suitability.score}% Match):
                </h4>
                <ul className="space-y-1">
                  {selectedDesign.suitability.reasons.map((reason, idx) => (
                    <li key={idx} className="text-sm text-emerald-200">
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Live Preview */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
              {/* Hero Preview */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: `linear-gradient(135deg, ${selectedDesign.colors.primary} 0%, ${selectedDesign.colors.secondary} 100%)`,
                  color: selectedDesign.colors.background,
                  padding: '4rem 2rem',
                  textAlign: 'center',
                }}
              >
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    fontFamily: selectedDesign.typography.headingFont,
                    marginBottom: '1rem',
                  }}
                >
                  {selectedDesign.sections.hero.headline}
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.9 }}
                >
                  {selectedDesign.sections.hero.subheadline}
                </motion.p>
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ delay: 0.6 }}
                  style={{
                    backgroundColor: selectedDesign.colors.accent,
                    color: selectedDesign.colors.text,
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {selectedDesign.sections.hero.ctaLabel}
                </motion.button>
              </motion.div>

              {/* Features Preview */}
              <div style={{ backgroundColor: selectedDesign.colors.background, padding: '3rem 2rem' }}>
                <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {selectedDesign.sections.features.slice(0, 4).map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feature.icon}</div>
                      <h3
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem',
                          fontFamily: selectedDesign.typography.headingFont,
                          color: selectedDesign.colors.primary,
                        }}
                      >
                        {feature.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: selectedDesign.colors.text }}>
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Code View */}
            {showCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900"
              >
                <div className="border-b border-white/10 p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyCode('full')}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      {copiedSection === 'full' ? '✓' : 'Copy Full Component'}
                    </button>
                    <button
                      onClick={() => handleCopyCode('hero')}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      {copiedSection === 'hero' ? '✓' : 'Copy Hero Only'}
                    </button>
                  </div>
                </div>
                <pre className="overflow-x-auto p-6 text-xs leading-relaxed">
                  <code className="text-emerald-400">{generateReactCode(selectedDesign, 'full')}</code>
                </pre>
              </motion.div>
            )}

            {/* Typography & Colors */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
                <h4 className="mb-4 text-lg font-semibold text-white">Typography</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-400">Heading Font</p>
                    <p className="text-lg font-semibold text-white" style={{ fontFamily: selectedDesign.typography.headingFont }}>
                      {selectedDesign.typography.headingFont}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Body Font</p>
                    <p className="text-base text-white" style={{ fontFamily: selectedDesign.typography.bodyFont }}>
                      {selectedDesign.typography.bodyFont}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
                <h4 className="mb-4 text-lg font-semibold text-white">Color Palette</h4>
                <div className="space-y-2">
                  {Object.entries(selectedDesign.colors).map(([name, color]) => (
                    <div key={name} className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg border-2 border-white/20"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <p className="text-xs capitalize text-slate-400">{name}</p>
                        <code className="text-sm text-white">{color}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
