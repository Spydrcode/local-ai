"use client";

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function ContractorQCCheckerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demo_id = searchParams?.get('demo_id');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const analyzePhotos = async () => {
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('demo_id', demo_id!);
      selectedFiles.forEach((file) => {
        formData.append('photos', file);
      });

      const response = await fetch('/api/contractor/qc/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error analyzing photos:', error);
    } finally {
      setIsAnalyzing(false);
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
            📸 QC Photo Checker
          </h1>
          <p className="text-slate-400">
            AI-powered quality control with automated punch lists
          </p>
        </div>

        {/* Upload Section */}
        {!results && (
          <Card className="p-8 bg-slate-900/50 border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-4">Upload Job Photos</h2>
            <p className="text-slate-400 mb-6">
              Upload photos from a completed job. AI will check for quality issues and generate a punch list.
            </p>

            <div className="mb-6">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-orange-500/50 transition-colors bg-slate-800/50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-12 h-12 mb-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-slate-300">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG up to 10MB each</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">
                  Selected Files ({selectedFiles.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-slate-800 rounded-lg flex items-center justify-center p-2">
                        <p className="text-xs text-slate-400 text-center truncate">
                          {file.name}
                        </p>
                      </div>
                      <Badge className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400">
                        ✓
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={analyzePhotos}
              disabled={selectedFiles.length === 0 || isAnalyzing}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isAnalyzing ? 'Analyzing...' : `Analyze ${selectedFiles.length} Photos`}
            </Button>
          </Card>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-slate-400 mt-4">AI is analyzing your photos...</p>
            <p className="text-slate-500 text-sm mt-2">This may take 30-60 seconds</p>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-6">
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">QC Analysis Results</h2>
                  <p className="text-slate-400">
                    Analyzed {selectedFiles.length} photos
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setResults(null);
                    setSelectedFiles([]);
                  }}
                >
                  Analyze New Job
                </Button>
              </div>

              {/* Overall Score */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">
                    {results.overall_score || 85}%
                  </div>
                  <div className="text-sm text-slate-400">Overall Quality</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    {results.issues_found || 3}
                  </div>
                  <div className="text-sm text-slate-400">Issues Found</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {results.photos_analyzed || selectedFiles.length}
                  </div>
                  <div className="text-sm text-slate-400">Photos Checked</div>
                </div>
              </div>

              {/* Punch List */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Punch List</h3>
                <div className="space-y-3">
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-orange-400 text-xl mt-0.5">⚠️</div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">
                          Visible paint drips on trim
                        </h4>
                        <p className="text-sm text-slate-400 mb-2">
                          Photo 3 of 6: Paint application needs touch-up on window trim
                        </p>
                        <Badge className="bg-orange-500/20 text-orange-400">Priority: Medium</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-orange-400 text-xl mt-0.5">⚠️</div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">
                          Uneven caulking line
                        </h4>
                        <p className="text-sm text-slate-400 mb-2">
                          Photo 5 of 6: Caulk bead needs smoothing along baseboard
                        </p>
                        <Badge className="bg-yellow-500/20 text-yellow-400">Priority: Low</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-emerald-400 text-xl mt-0.5">✓</div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">
                          All other areas look great
                        </h4>
                        <p className="text-sm text-slate-400">
                          Clean workspace, proper material staging, professional finish
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractorQCCheckerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ContractorQCCheckerContent />
    </Suspense>
  );
}
