"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PorterData {
  demoId: string;
  businessName: string;
  websiteUrl: string;
  fiveForces?: {
    force: string;
    summary: string;
    rating: number;
  }[];
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  businessModelCanvas?: Record<string, string[]>;
  gtmStrategy?: string[];
}

type PorterStatus = {
  [key: string]: 'not-run' | 'running' | 'completed' | 'error';
};

export default function PorterPage() {
  const params = useParams();
  const demoId = (params?.demoId as string) || '';
  const [porterData, setPorterData] = useState<PorterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<PorterStatus>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/porter-intelligence/${demoId}`);
        if (!res.ok) throw new Error('Failed to load Porter Intelligence data');
        const data = await res.json();
        setPorterData(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    if (demoId) fetchData();
  }, [demoId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <h1 className="text-4xl font-bold text-white mb-2">Porter Intelligence Stack</h1>
        <p className="text-slate-400 mb-8 text-lg">Complete strategic analysis: Five Forces, SWOT, Business Model Canvas, GTM Strategy</p>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500/30 border-t-emerald-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading Porter Intelligence...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-center">
            {error}
          </div>
        ) : porterData ? (
          <div className="space-y-10">
            {/* Five Forces */}
            {porterData.fiveForces && (
              <div>
                <h2 className="text-2xl font-bold text-emerald-400 mb-4">Porter's Five Forces</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {porterData.fiveForces.map((force, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-2">{force.force}</h3>
                      <p className="text-slate-300 mb-2">{force.summary}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-emerald-400 font-bold">Rating:</span>
                        <span className="text-white">{force.rating}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* SWOT */}
            {porterData.swot && (
              <div>
                <h2 className="text-2xl font-bold text-purple-400 mb-4">SWOT Analysis</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">Strengths</h3>
                    <ul className="list-disc list-inside text-slate-300">
                      {porterData.swot.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Weaknesses</h3>
                    <ul className="list-disc list-inside text-slate-300">
                      {porterData.swot.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Opportunities</h3>
                    <ul className="list-disc list-inside text-slate-300">
                      {porterData.swot.opportunities.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">Threats</h3>
                    <ul className="list-disc list-inside text-slate-300">
                      {porterData.swot.threats.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {/* Business Model Canvas */}
            {porterData.businessModelCanvas && (
              <div>
                <h2 className="text-2xl font-bold text-blue-400 mb-4">Business Model Canvas</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {Object.entries(porterData.businessModelCanvas).map(([section, items]) => (
                    <div key={section} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-white mb-2">{section}</h3>
                      <ul className="list-disc list-inside text-slate-300">
                        {items.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* GTM Strategy */}
            {porterData.gtmStrategy && (
              <div>
                <h2 className="text-2xl font-bold text-emerald-400 mb-4">Go-to-Market Strategy</h2>
                <ul className="list-disc list-inside text-slate-300">
                  {porterData.gtmStrategy.map((step, i) => <li key={i}>{step}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-400">No Porter Intelligence data found for this demo.</div>
        )}
      </div>
    </div>
  );
}
