/**
 * Contractor Competitor Filter API
 *
 * POST /api/contractor/competitors/filter
 * Filter discovered competitors using contractor profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/server/auth';
import { createClient } from '@/lib/supabase/server';
import type { ContractorProfile } from '@/lib/types/contractor';
import { ContractorCompetitorFilterAgent } from '@/lib/agents/contractor/competitor-filter';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await requireUser();
    const body = await request.json();
    const { demo_id } = body;

    if (!demo_id) {
      return NextResponse.json(
        { error: 'demo_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch demo with contractor profile and intelligence data
    const { data: demo, error } = await supabase
      .from('demos')
      .select('contractor_profile, intelligence_data')
      .eq('id', demo_id)
      .single();

    if (error || !demo) {
      return NextResponse.json(
        { error: 'Demo not found' },
        { status: 404 }
      );
    }

    const profile = demo.contractor_profile as ContractorProfile | null;
    const intelligence_data = demo.intelligence_data || {};

    if (!profile) {
      return NextResponse.json(
        { error: 'No contractor profile found. Create profile first.' },
        { status: 400 }
      );
    }

    // Extract raw competitors from intelligence data
    const raw_competitors = intelligence_data.competitors || [];

    if (raw_competitors.length === 0) {
      return NextResponse.json({
        success: true,
        filtered_competitors: [],
        summary: {
          total: 0,
          relevant: 0,
          excluded: 0,
          top_exclusion_reasons: []
        },
        message: 'No competitors found in scraped data. Run website scraper first.'
      });
    }

    // Filter competitors using profile
    const filtered_competitors = ContractorCompetitorFilterAgent.filterCompetitors(
      profile,
      raw_competitors
    );

    // Get filtering summary
    const summary = ContractorCompetitorFilterAgent.getFilteringSummary(filtered_competitors);

    // Log activity
    await supabase.from('activity_log').insert({
      demo_id,
      user_email: email,
      action: 'competitors_filtered',
      metadata: {
        total: summary.total,
        relevant: summary.relevant,
        excluded: summary.excluded
      }
    });

    return NextResponse.json({
      success: true,
      filtered_competitors: filtered_competitors.sort((a, b) => b.relevance_score - a.relevance_score),
      summary,
      profile_summary: {
        industry: profile.primary_industry,
        customer_types: profile.customer_types,
        service_area_miles: profile.service_area.radius_miles
      }
    });

  } catch (error: any) {
    console.error('Error filtering competitors:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to filter competitors' },
      { status: 500 }
    );
  }
}
