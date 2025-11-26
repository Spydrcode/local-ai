"use client";

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ContractorHiringContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demo_id = searchParams?.get('demo_id');

  const [selectedTool, setSelectedTool] = useState<'job-ad' | 'onboarding' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Job Ad Form
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  // Onboarding Form
  const [onboardingRole, setOnboardingRole] = useState('');

  const generateJobAd = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/contractor/hiring/job-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demo_id,
          job_title: jobTitle,
          role,
          experience_level: experienceLevel
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error generating job ad:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateOnboarding = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/contractor/hiring/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demo_id,
          role: onboardingRole
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error generating onboarding checklist:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!demo_id) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Missing Demo ID</h2>
          <p className="text-slate-400 mb-4">Please start from the contractor dashboard.</p>
          <Button onClick={() => router.push('/')}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="secondary"
            onClick={() => router.push(`/contractor/dashboard?demo_id=${demo_id}`)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">
            👷 Hire & Onboard Kit
          </h1>
          <p className="text-slate-400">
            Generate job ads and onboarding checklists for your crew
          </p>
        </div>

        {/* Tool Selection */}
        {!selectedTool && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="p-8 bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedTool('job-ad')}
            >
              <div className="text-5xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-white mb-3">Job Ad Generator</h2>
              <p className="text-slate-400 mb-4">
                Create Indeed/Facebook job posts optimized for your industry and role
              </p>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Generate in 30 seconds
              </Badge>
            </Card>

            <Card
              className="p-8 bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedTool('onboarding')}
            >
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-white mb-3">Onboarding Checklist</h2>
              <p className="text-slate-400 mb-4">
                Role-specific checklists for Week 1, Week 2-4, and Month 2-3
              </p>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Generate in 30 seconds
              </Badge>
            </Card>
          </div>
        )}

        {/* Job Ad Generator */}
        {selectedTool === 'job-ad' && !result && (
          <Card className="p-8 bg-slate-900/50 border-slate-800">
            <Button
              variant="secondary"
              onClick={() => setSelectedTool(null)}
              className="mb-6"
            >
              ← Back to Selection
            </Button>

            <h2 className="text-2xl font-bold text-white mb-6">Generate Job Ad</h2>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., HVAC Installer, Plumbing Apprentice"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="role">Role Type</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-2 w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-white"
                >
                  <option value="">Select role...</option>
                  <option value="installer">Installer/Technician</option>
                  <option value="helper">Helper/Apprentice</option>
                  <option value="crew_lead">Crew Lead</option>
                  <option value="office">Office Staff</option>
                </select>
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <select
                  id="experience"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="mt-2 w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-white"
                >
                  <option value="">Select level...</option>
                  <option value="entry">Entry Level (0-1 years)</option>
                  <option value="mid">Mid Level (2-5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
              </div>
            </div>

            <Button
              onClick={generateJobAd}
              disabled={!jobTitle || !role || !experienceLevel || isGenerating}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isGenerating ? 'Generating...' : 'Generate Job Ad'}
            </Button>
          </Card>
        )}

        {/* Onboarding Generator */}
        {selectedTool === 'onboarding' && !result && (
          <Card className="p-8 bg-slate-900/50 border-slate-800">
            <Button
              variant="secondary"
              onClick={() => setSelectedTool(null)}
              className="mb-6"
            >
              ← Back to Selection
            </Button>

            <h2 className="text-2xl font-bold text-white mb-6">Generate Onboarding Checklist</h2>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="onboardingRole">Role</Label>
                <Input
                  id="onboardingRole"
                  value={onboardingRole}
                  onChange={(e) => setOnboardingRole(e.target.value)}
                  placeholder="e.g., HVAC Installer, Roofing Crew Lead"
                  className="mt-2"
                />
              </div>
            </div>

            <Button
              onClick={generateOnboarding}
              disabled={!onboardingRole || isGenerating}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isGenerating ? 'Generating...' : 'Generate Checklist'}
            </Button>
          </Card>
        )}

        {/* Results Display */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-slate-400 mt-4">Generating with AI...</p>
          </div>
        )}

        {result && (
          <Card className="p-8 bg-slate-900/50 border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Your {selectedTool === 'job-ad' ? 'Job Ad' : 'Onboarding Checklist'}</h2>
              <Button
                variant="secondary"
                onClick={() => {
                  setResult(null);
                  setSelectedTool(null);
                }}
              >
                Generate Another
              </Button>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 text-slate-200 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ContractorHiringPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ContractorHiringContent />
    </Suspense>
  );
}
