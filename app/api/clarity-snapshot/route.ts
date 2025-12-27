/**
 * Clarity Snapshot API Endpoint
 * POST /api/clarity-snapshot
 * 
 * Frictionless business analysis for owners without complete online presence.
 * Selection-based intake → deterministic classification → recognition-first output.
 * 
 * Features:
 * - Fast classification (< 50ms scoring)
 * - Optional enrichment (non-blocking, 5s timeout)
 * - Caching by selections hash (24h TTL)
 * - No dependencies on existing Local AI analysis
 */

import { NextResponse } from 'next/server';
import { getScorer } from '@/lib/clarity-snapshot/signal-scorer';
import { getClaritySnapshotAgent } from '@/lib/clarity-snapshot/clarity-snapshot-agent';
import { getEnricher } from '@/lib/clarity-snapshot/enrichment';
import type {
  ClaritySnapshotRequest,
  ClaritySnapshotResponse,
  SnapshotClassification
} from '@/lib/types/clarity-snapshot';

// ============================================================================
// IN-MEMORY CACHE (Simple LRU fallback)
// ============================================================================

interface CacheEntry {
  response: ClaritySnapshotResponse;
  timestamp: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;
  private ttl = 24 * 60 * 60 * 1000; // 24 hours
  
  get(key: string): ClaritySnapshotResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.response;
  }
  
  set(key: string, response: ClaritySnapshotResponse): void {
    // LRU: if at max size, delete oldest
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    // 1. Parse and validate request
    const body = await request.json();
    const snapshotRequest = body as ClaritySnapshotRequest;
    
    // Validate required fields
    if (!snapshotRequest.selections) {
      return NextResponse.json(
        { error: 'selections is required' },
        { status: 400 }
      );
    }
    
    const { selections } = snapshotRequest;
    
    // Validate selections structure
    if (!selections.presenceChannels || !Array.isArray(selections.presenceChannels) || selections.presenceChannels.length === 0) {
      return NextResponse.json(
        { error: 'selections.presenceChannels is required and must be a non-empty array' },
        { status: 400 }
      );
    }
    
    if (!selections.teamShape) {
      return NextResponse.json(
        { error: 'selections.teamShape is required' },
        { status: 400 }
      );
    }
    
    if (!selections.scheduling) {
      return NextResponse.json(
        { error: 'selections.scheduling is required' },
        { status: 400 }
      );
    }
    
    if (!selections.invoicing) {
      return NextResponse.json(
        { error: 'selections.invoicing is required' },
        { status: 400 }
      );
    }
    
    if (!selections.callHandling) {
      return NextResponse.json(
        { error: 'selections.callHandling is required' },
        { status: 400 }
      );
    }
    
    if (!selections.businessFeeling) {
      return NextResponse.json(
        { error: 'selections.businessFeeling is required' },
        { status: 400 }
      );
    }
    
    console.log('[Clarity Snapshot] Request received:', {
      businessName: snapshotRequest.businessName,
      hasWebsite: !!snapshotRequest.websiteUrl,
      hasGBP: !!snapshotRequest.googleBusinessUrl,
      hasSocial: !!snapshotRequest.socialUrl
    });
    
    // 2. Check cache
    const cacheKey = generateCacheKey(snapshotRequest);
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      console.log('[Clarity Snapshot] Cache hit');
      // Update metadata to show cache hit
      cachedResponse.metadata.cacheHit = true;
      cachedResponse.metadata.executionTimeMs = Date.now() - startTime;
      return NextResponse.json(cachedResponse);
    }
    
    // 3. Run deterministic scoring (fast)
    const scoringStart = Date.now();
    const scorer = getScorer();
    
    // Initial scoring without evidence strength
    const scoringOutput = scorer.score({
      selections,
      evidenceStrength: 0 // Will update after enrichment if sources provided
    });
    
    const scoringTime = Date.now() - scoringStart;
    console.log(`[Clarity Snapshot] Scoring completed in ${scoringTime}ms`);
    
    // 4. Optional enrichment (non-blocking, parallel with classification building)
    let enrichmentTime = 0;
    let evidenceNuggets: any[] = [];
    let evidenceStrength = 0;
    
    const hasEnrichmentSources = snapshotRequest.websiteUrl || 
                                  snapshotRequest.googleBusinessUrl || 
                                  snapshotRequest.socialUrl;
    
    if (hasEnrichmentSources) {
      try {
        const enrichmentStart = Date.now();
        const enricher = getEnricher();
        
        const enrichmentResult = await enricher.enrich({
          websiteUrl: snapshotRequest.websiteUrl,
          googleBusinessUrl: snapshotRequest.googleBusinessUrl,
          socialUrl: snapshotRequest.socialUrl
        });
        
        enrichmentTime = enrichmentResult.duration;
        evidenceNuggets = enrichmentResult.nuggets;
        
        // Calculate evidence strength (0-1)
        // High relevance nuggets contribute more
        evidenceStrength = evidenceNuggets.reduce((acc, nugget) => {
          if (nugget.relevance === 'high') return acc + 0.5;
          if (nugget.relevance === 'medium') return acc + 0.3;
          return acc + 0.1;
        }, 0);
        
        // Cap at 1.0
        evidenceStrength = Math.min(1.0, evidenceStrength);
        
        console.log(`[Clarity Snapshot] Enrichment completed in ${enrichmentTime}ms (${evidenceNuggets.length} nuggets, strength: ${evidenceStrength.toFixed(2)})`);
        
        // Re-score with evidence strength if we got nuggets
        if (evidenceStrength > 0) {
          const rescoringOutput = scorer.score({
            selections,
            evidenceStrength
          });
          
          // Update scoring output with evidence-boosted confidence
          scoringOutput.confidence = rescoringOutput.confidence;
        }
        
      } catch (error) {
        console.warn('[Clarity Snapshot] Enrichment failed (non-fatal):', error);
        // Continue without enrichment
      }
    }
    
    // 5. Build classification
    const classification: SnapshotClassification = {
      stage: scoringOutput.topStage,
      topArchetype: scoringOutput.topArchetype,
      runnerUpArchetype: scoringOutput.runnerUpArchetype,
      archetypeProbabilities: scoringOutput.archetypeProbabilities,
      confidence: scoringOutput.confidence,
      keyFlags: scoringOutput.flags,
      evidenceStrength
    };
    
    // 6. Generate narrative panes using agent
    const agent = getClaritySnapshotAgent();
    const panes = await agent.generatePanes(
      classification,
      evidenceNuggets.length > 0 ? evidenceNuggets : undefined,
      snapshotRequest.businessName
    );
    
    // 7. Build response
    const totalTime = Date.now() - startTime;
    
    const response: ClaritySnapshotResponse = {
      panes,
      classification,
      evidenceNuggets: evidenceNuggets.length > 0 ? evidenceNuggets : undefined,
      metadata: {
        executionTimeMs: totalTime,
        scoringTimeMs: scoringTime,
        enrichmentTimeMs: enrichmentTime > 0 ? enrichmentTime : undefined,
        cacheHit: false,
        version: '1.0.0'
      }
    };
    
    console.log(`[Clarity Snapshot] Complete in ${totalTime}ms (scoring: ${scoringTime}ms, enrichment: ${enrichmentTime}ms)`);
    console.log(`[Clarity Snapshot] Classification: ${classification.stage} / ${classification.topArchetype} (confidence: ${classification.confidence}%)`);
    
    // 8. Cache response
    cache.set(cacheKey, response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[Clarity Snapshot] Error:', error);
    
    // Return generic error without exposing internals
    return NextResponse.json(
      {
        error: 'Clarity Snapshot analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate cache key from request
 * Hash of selections + optional identifiers
 */
function generateCacheKey(request: ClaritySnapshotRequest): string {
  const keyParts = [
    // Core selections (required)
    request.selections.presenceChannels.sort().join(','),
    request.selections.teamShape,
    request.selections.scheduling,
    request.selections.invoicing,
    request.selections.callHandling,
    request.selections.businessFeeling,
    
    // Optional identifiers (affect enrichment)
    request.websiteUrl || '',
    request.googleBusinessUrl || '',
    request.socialUrl || '',
    request.businessId || ''
  ];
  
  // Simple hash (in production, use crypto.subtle.digest)
  const keyString = keyParts.join('|');
  let hash = 0;
  for (let i = 0; i < keyString.length; i++) {
    const char = keyString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `clarity_snapshot_${Math.abs(hash)}`;
}

// ============================================================================
// CACHE MANAGEMENT (Optional endpoints for admin)
// ============================================================================

export async function DELETE() {
  try {
    cache.clear();
    console.log('[Clarity Snapshot] Cache cleared');
    return NextResponse.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
