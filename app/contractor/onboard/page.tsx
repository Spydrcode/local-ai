"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ContractorOnboardingFlow } from '@/components/contractor/ContractorOnboardingFlow';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ContractorProfile } from '@/lib/types/contractor';

function ContractorOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demo_id = searchParams?.get('demo_id');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingProfile, setExistingProfile] = useState<Partial<ContractorProfile> | undefined>();

  useEffect(() => {
    if (!demo_id) {
      setError('No demo_id provided. Please start from the homepage.');
      return;
    }

    // Check if profile already exists
    fetchExistingProfile();
  }, [demo_id]);

  const fetchExistingProfile = async () => {
    try {
      const response = await fetch(`/api/contractor/profile?demo_id=${demo_id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setExistingProfile(data.profile);
        }
      }
    } catch (err) {
      console.error('Error fetching existing profile:', err);
      // Continue with empty profile
    }
  };

  const handleComplete = async (profile: ContractorProfile) => {
    if (!demo_id) {
      setError('Missing demo_id');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contractor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demo_id,
          profile
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      // Redirect to contractor dashboard
      router.push(`/contractor/dashboard?demo_id=${demo_id}`);

    } catch (err: any) {
      console.error('Error saving contractor profile:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
      setIsLoading(false);
    }
  };

  if (!demo_id) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Missing Demo ID</h2>
          <p className="text-slate-400 mb-4">
            Please start from the homepage to create a business profile.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome to Contractor Copilot
          </h1>
          <p className="text-lg text-slate-400">
            Let's set up your business profile to unlock operational intelligence
          </p>
        </div>

        {/* Onboarding Flow */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-slate-400 mt-4">Saving your profile...</p>
          </div>
        ) : (
          <ContractorOnboardingFlow
            demoId={demo_id}
            onComplete={handleComplete}
            initialData={existingProfile}
          />
        )}

        {/* Features Preview */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-white font-semibold mb-1">Weekly Lead Pulse</h3>
            <p className="text-sm text-slate-400">
              Predict leads, get 3 actions, ready-to-run ads
            </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="text-2xl mb-2">👷</div>
            <h3 className="text-white font-semibold mb-1">Hire & Onboard Kit</h3>
            <p className="text-sm text-slate-400">
              Auto-generate job ads and onboarding checklists
            </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="text-2xl mb-2">📸</div>
            <h3 className="text-white font-semibold mb-1">QC Photo Checker</h3>
            <p className="text-sm text-slate-400">
              AI-powered quality control with punch lists
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContractorOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ContractorOnboardingContent />
    </Suspense>
  );
}
