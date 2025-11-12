/**
 * Business Context Utilities
 *
 * Hooks and utilities for managing business context across the application
 */

import type { BusinessContext } from "@/lib/data-collectors";
import { useEffect, useState } from "react";

const STORAGE_KEY = "businessContext";

/**
 * Hook to access and manage business context
 */
export function useBusinessContext() {
  const [context, setContext] = useState<BusinessContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load context from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setContext(JSON.parse(saved));
        } catch (error) {
          console.error("Failed to load business context:", error);
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Save context to localStorage
  const saveContext = (newContext: BusinessContext) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newContext));
      setContext(newContext);
    }
  };

  // Clear context
  const clearContext = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      setContext(null);
    }
  };

  // Update partial context
  const updateContext = (partial: Partial<BusinessContext>) => {
    const updated = { ...context, ...partial } as BusinessContext;
    saveContext(updated);
  };

  return {
    context,
    isLoading,
    saveContext,
    clearContext,
    updateContext,
    hasContext: !!context,
  };
}

/**
 * Get business context synchronously from localStorage
 */
export function getStoredBusinessContext(): BusinessContext | null {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to parse stored business context:", error);
    return null;
  }
}

/**
 * Check if business context exists
 */
export function hasBusinessContext(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(STORAGE_KEY);
}

/**
 * Get auto-filled marketing context from business context
 */
export function getMarketingContextFromBusinessContext(): {
  industry?: string;
  targetAudience?: string;
  goals?: string[];
  currentChallenges?: string[];
} | null {
  const businessContext = getStoredBusinessContext();
  if (!businessContext) return null;

  return {
    industry: businessContext.industry,
    targetAudience: businessContext.targetAudience,
    goals: businessContext.marketingGoals,
    currentChallenges: businessContext.currentChallenges,
  };
}
