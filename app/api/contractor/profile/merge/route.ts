/**
 * Contractor Profile Merge API
 *
 * POST /api/contractor/profile/merge
 * Merge contractor profile with scraped website data
 * Returns merged data + conflicts for user confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/server/auth';
import { createClient } from '@/lib/supabase/server';
import type { ContractorProfile } from '@/lib/types/contractor';
import { ContractorProfileManager } from '@/lib/agents/contractor/profile-manager';

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

    // Merge profile with scraped data
    const merge_result = ContractorProfileManager.mergeWithScrapedData(
      profile,
      intelligence_data
    );

    // Log activity
    await supabase.from('activity_log').insert({
      demo_id,
      user_email: email,
      action: 'contractor_profile_merged',
      metadata: {
        conflicts_count: merge_result.conflicts.length,
        warnings_count: merge_result.warnings.length
      }
    });

    return NextResponse.json({
      success: true,
      merged_data: merge_result.merged_data,
      conflicts: merge_result.conflicts,
      warnings: merge_result.warnings,
      requires_confirmation: merge_result.conflicts.length > 0
    });

  } catch (error: any) {
    console.error('Error merging contractor profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to merge profile' },
      { status: 500 }
    );
  }
}
