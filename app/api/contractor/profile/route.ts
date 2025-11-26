/**
 * Contractor Profile API
 *
 * CRUD operations for contractor business profiles
 * GET - Retrieve profile
 * POST - Create/update profile
 * PATCH - Partial update
 * DELETE - Clear profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/server/auth';
import { createClient } from '@/lib/supabase/server';
import type { ContractorProfile } from '@/lib/types/contractor';
import { ContractorProfileManager } from '@/lib/agents/contractor/profile-manager';
import { initializeAlertConfigs } from '@/lib/utils/contractor-alerts-init';

/**
 * GET /api/contractor/profile?demo_id={demo_id}
 * Retrieve contractor profile for a demo
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, email } = await requireUser();
    const { searchParams } = new URL(request.url);
    const demo_id = searchParams.get('demo_id');

    if (!demo_id) {
      return NextResponse.json(
        { error: 'demo_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch demo with contractor profile
    const { data: demo, error } = await supabase
      .from('demos')
      .select('contractor_profile, contractor_mode, business_name, intelligence_data')
      .eq('id', demo_id)
      .single();

    if (error || !demo) {
      return NextResponse.json(
        { error: 'Demo not found' },
        { status: 404 }
      );
    }

    const profile = demo.contractor_profile as ContractorProfile | null;

    // Calculate completeness if profile exists
    let validation = null;
    let completeness = 0;
    let suggestions: string[] = [];

    if (profile) {
      validation = ContractorProfileManager.validateProfile(profile);
      completeness = ContractorProfileManager.calculateCompleteness(profile);
      suggestions = ContractorProfileManager.suggestNextSteps(profile);
    }

    return NextResponse.json({
      demo_id,
      contractor_mode: demo.contractor_mode || false,
      profile,
      validation,
      completeness,
      suggestions,
      business_name: demo.business_name
    });

  } catch (error: any) {
    console.error('Error fetching contractor profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contractor/profile
 * Create or update contractor profile
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await requireUser();
    const body = await request.json();
    const { demo_id, profile } = body;

    if (!demo_id || !profile) {
      return NextResponse.json(
        { error: 'demo_id and profile are required' },
        { status: 400 }
      );
    }

    // Validate profile
    const validation = ContractorProfileManager.validateProfile(profile);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Profile validation failed',
          validation
        },
        { status: 400 }
      );
    }

    // Calculate completeness
    const completeness = ContractorProfileManager.calculateCompleteness(profile);

    // Add metadata
    const full_profile: ContractorProfile = {
      ...profile,
      onboarding_completed_at: new Date().toISOString(),
      profile_completeness: completeness
    };

    const supabase = await createClient();

    // Update demo with contractor profile
    const { data, error } = await supabase
      .from('demos')
      .update({
        contractor_profile: full_profile,
        contractor_mode: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', demo_id)
      .select()
      .single();

    if (error) {
      console.error('Error saving contractor profile:', error);
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      demo_id,
      user_email: email,
      action: 'contractor_profile_created',
      metadata: {
        completeness,
        industry: profile.primary_industry
      }
    });

    // Initialize alert configurations
    try {
      await initializeAlertConfigs(demo_id);
    } catch (alertError: any) {
      console.error('Error initializing alert configs:', alertError);
      // Non-fatal: continue even if alert init fails
    }

    const suggestions = ContractorProfileManager.suggestNextSteps(full_profile);

    return NextResponse.json({
      success: true,
      profile: full_profile,
      validation,
      completeness,
      suggestions
    });

  } catch (error: any) {
    console.error('Error creating contractor profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/contractor/profile
 * Partial update of contractor profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId, email } = await requireUser();
    const body = await request.json();
    const { demo_id, updates } = body;

    if (!demo_id || !updates) {
      return NextResponse.json(
        { error: 'demo_id and updates are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch existing profile
    const { data: demo, error: fetchError } = await supabase
      .from('demos')
      .select('contractor_profile')
      .eq('id', demo_id)
      .single();

    if (fetchError || !demo) {
      return NextResponse.json(
        { error: 'Demo not found' },
        { status: 404 }
      );
    }

    // Merge updates with existing profile
    const existing_profile = (demo.contractor_profile as ContractorProfile) || {};
    const updated_profile: ContractorProfile = {
      ...existing_profile,
      ...updates
    };

    // Recalculate completeness
    updated_profile.profile_completeness = ContractorProfileManager.calculateCompleteness(updated_profile);

    // Validate
    const validation = ContractorProfileManager.validateProfile(updated_profile);

    // Update in database
    const { error: updateError } = await supabase
      .from('demos')
      .update({
        contractor_profile: updated_profile,
        updated_at: new Date().toISOString()
      })
      .eq('id', demo_id);

    if (updateError) {
      console.error('Error updating contractor profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      demo_id,
      user_email: email,
      action: 'contractor_profile_updated',
      metadata: {
        updated_fields: Object.keys(updates),
        completeness: updated_profile.profile_completeness
      }
    });

    const suggestions = ContractorProfileManager.suggestNextSteps(updated_profile);

    return NextResponse.json({
      success: true,
      profile: updated_profile,
      validation,
      completeness: updated_profile.profile_completeness,
      suggestions
    });

  } catch (error: any) {
    console.error('Error updating contractor profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contractor/profile?demo_id={demo_id}
 * Clear contractor profile (disable contractor mode)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId, email } = await requireUser();
    const { searchParams } = new URL(request.url);
    const demo_id = searchParams.get('demo_id');

    if (!demo_id) {
      return NextResponse.json(
        { error: 'demo_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('demos')
      .update({
        contractor_profile: null,
        contractor_mode: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', demo_id);

    if (error) {
      console.error('Error deleting contractor profile:', error);
      return NextResponse.json(
        { error: 'Failed to delete profile' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      demo_id,
      user_email: email,
      action: 'contractor_profile_deleted'
    });

    return NextResponse.json({
      success: true,
      message: 'Contractor profile cleared'
    });

  } catch (error: any) {
    console.error('Error deleting contractor profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete profile' },
      { status: 500 }
    );
  }
}
