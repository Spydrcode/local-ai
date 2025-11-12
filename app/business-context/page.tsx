"use client";

import { BusinessContextForm } from "@/components/BusinessContextForm";
import type { BusinessContext } from "@/lib/data-collectors";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BusinessContextPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [savedContext, setSavedContext] = useState<BusinessContext | undefined>();
  const [successMessage, setSuccessMessage] = useState("");

  // Load saved context from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("businessContext");
      if (saved) {
        try {
          setSavedContext(JSON.parse(saved));
        } catch (error) {
          console.error("Failed to load saved business context:", error);
        }
      }
    }
  }, []);

  const handleSubmit = async (context: BusinessContext) => {
    setIsLoading(true);
    setSuccessMessage("");

    try {
      // Save to localStorage for persistence
      localStorage.setItem("businessContext", JSON.stringify(context));
      setSavedContext(context);

      // Show success message
      setSuccessMessage("Business context saved successfully!");

      // Optionally save to backend API
      // await fetch("/api/business-context", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(context),
      // });

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save business context:", error);
      alert("Failed to save business context. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all business context data?")) {
      localStorage.removeItem("businessContext");
      setSavedContext(undefined);
      setSuccessMessage("Business context cleared.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Business Context
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Provide detailed information about your business to get more personalized
            insights, competitive intelligence, and marketing recommendations.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-center animate-fade-in">
            {successMessage}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-white mb-1">Better Targeting</h3>
            <p className="text-sm text-slate-400">
              Get recommendations tailored to your specific audience and goals
            </p>
          </div>

          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-white mb-1">Competitive Intel</h3>
            <p className="text-sm text-slate-400">
              Analyze competitor ads and strategies with Meta Ads Library
            </p>
          </div>

          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-semibold text-white mb-1">Faster Results</h3>
            <p className="text-sm text-slate-400">
              Pre-filled context speeds up all future analyses
            </p>
          </div>
        </div>

        {/* Form */}
        <BusinessContextForm
          onSubmit={handleSubmit}
          initialData={savedContext}
          isLoading={isLoading}
        />

        {/* Clear Data Button */}
        {savedContext && (
          <div className="mt-6 text-center">
            <button
              onClick={handleClear}
              className="text-sm text-slate-400 hover:text-slate-300 underline"
            >
              Clear all business context data
            </button>
          </div>
        )}

        {/* What happens next */}
        <div className="mt-12 p-6 bg-slate-900/30 border border-slate-800 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-3">
            What happens with this data?
          </h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span>
                Stored locally in your browser for quick access across all tools
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span>
                Used to personalize AI-generated content, insights, and strategies
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span>
                Powers competitive analysis through Meta Ads Library integration
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span>
                Automatically fills in business details when using marketing frameworks
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
