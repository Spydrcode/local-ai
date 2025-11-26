/**
 * Weekly Lead Pulse API
 *
 * POST /api/contractor/lead-pulse
 * Generate weekly lead predictions with actionable recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/server/auth';
import { createClient } from '@/lib/supabase/server';
import type { ContractorProfile } from '@/lib/types/contractor';
import type { WeeklyLeadSummary, MarketSignal } from '@/lib/types/contractor-leads';
import { LeadPulseAgent } from '@/lib/agents/contractor/lead-pulse-agent';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await requireUser();
    const body = await request.json();
    const { demo_id, force_refresh } = body;

    if (!demo_id) {
      return NextResponse.json(
        { error: 'demo_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch contractor profile
    const { data: demo, error: demoError } = await supabase
      .from('demos')
      .select('contractor_profile, contractor_mode')
      .eq('id', demo_id)
      .single();

    if (demoError || !demo) {
      return NextResponse.json(
        { error: 'Demo not found' },
        { status: 404 }
      );
    }

    if (!demo.contractor_mode || !demo.contractor_profile) {
      return NextResponse.json(
        { error: 'Not a contractor business. Complete contractor onboarding first.' },
        { status: 400 }
      );
    }

    const profile = demo.contractor_profile as ContractorProfile;

    // Calculate next week's date range
    const today = new Date();
    const next_monday = getNextMonday(today);
    const week_start = next_monday.toISOString().split('T')[0];

    // Check if we already have a prediction for next week (unless force_refresh)
    if (!force_refresh) {
      const { data: existing_prediction } = await supabase
        .from('contractor_lead_predictions')
        .select('*')
        .eq('demo_id', demo_id)
        .eq('week_start', week_start)
        .single();

      if (existing_prediction) {
        // Return existing prediction
        return NextResponse.json({
          success: true,
          pulse: buildPulseFromPrediction(existing_prediction),
          prediction: existing_prediction,
          cached: true
        });
      }
    }

    // Fetch historical leads (last 12 weeks)
    const twelve_weeks_ago = new Date(today);
    twelve_weeks_ago.setDate(twelve_weeks_ago.getDate() - 84); // 12 weeks

    const { data: historical_leads, error: leadsError } = await supabase
      .from('contractor_leads_weekly_summary')
      .select('*')
      .eq('demo_id', demo_id)
      .gte('week_start', twelve_weeks_ago.toISOString().split('T')[0])
      .order('week_start', { ascending: false });

    if (leadsError) {
      console.error('Error fetching historical leads:', leadsError);
      // Continue with empty array - agent will handle it
    }

    // Fetch market signals (last 30 days)
    const thirty_days_ago = new Date(today);
    thirty_days_ago.setDate(thirty_days_ago.getDate() - 30);

    const { data: market_signals, error: signalsError } = await supabase
      .from('contractor_market_signals')
      .select('*')
      .eq('demo_id', demo_id)
      .gte('period_start', thirty_days_ago.toISOString().split('T')[0]);

    if (signalsError) {
      console.error('Error fetching market signals:', signalsError);
      // Continue with empty array
    }

    // Generate weekly pulse
    const pulse_result = await LeadPulseAgent.generateWeeklyPulse({
      profile,
      historical_leads: (historical_leads || []) as WeeklyLeadSummary[],
      market_signals: (market_signals || []) as MarketSignal[],
      current_date: today
    });

    // Save prediction to database
    const { data: saved_prediction, error: saveError } = await supabase
      .from('contractor_lead_predictions')
      .insert({
        ...pulse_result.prediction,
        demo_id
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving prediction:', saveError);
      // Continue - return result even if save fails
    }

    // Log activity
    await supabase.from('activity_log').insert({
      demo_id,
      user_email: email,
      action: 'lead_pulse_generated',
      metadata: {
        predicted_leads: pulse_result.pulse.prediction.expected_leads_midpoint,
        confidence: pulse_result.pulse.prediction.confidence,
        week_start
      }
    });

    return NextResponse.json({
      success: true,
      pulse: {
        ...pulse_result.pulse,
        demo_id
      },
      prediction: saved_prediction || pulse_result.prediction,
      cached: false
    });

  } catch (error: any) {
    console.error('Error generating lead pulse:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate lead pulse' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contractor/lead-pulse?demo_id={demo_id}
 * Get latest lead pulse prediction
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

    // Fetch latest prediction
    const { data: prediction, error } = await supabase
      .from('contractor_lead_predictions')
      .select('*')
      .eq('demo_id', demo_id)
      .order('week_start', { ascending: false })
      .limit(1)
      .single();

    if (error || !prediction) {
      return NextResponse.json(
        {
          success: false,
          message: 'No predictions found. Generate your first weekly pulse.',
          has_prediction: false
        },
        { status: 404 }
      );
    }

    // Build pulse from prediction
    const pulse = buildPulseFromPrediction(prediction);

    return NextResponse.json({
      success: true,
      pulse,
      prediction,
      has_prediction: true
    });

  } catch (error: any) {
    console.error('Error fetching lead pulse:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lead pulse' },
      { status: 500 }
    );
  }
}

// Helper functions

function getNextMonday(from: Date): Date {
  const date = new Date(from);
  const day = date.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function buildPulseFromPrediction(prediction: any): any {
  const confidence_level =
    prediction.confidence >= 0.7 ? 'high' :
    prediction.confidence >= 0.4 ? 'medium' : 'low';

  return {
    demo_id: prediction.demo_id,
    generated_at: prediction.created_at,
    week_start: prediction.week_start,
    week_end: prediction.week_end,
    prediction: {
      expected_leads_low: prediction.predicted_leads_low,
      expected_leads_high: prediction.predicted_leads_high,
      expected_leads_midpoint: prediction.predicted_leads_midpoint,
      confidence: confidence_level,
      confidence_score: prediction.confidence
    },
    top_actions: prediction.recommended_actions,
    historical_context: {
      last_week_leads: 0, // Would need to fetch from leads table
      four_week_average: Math.round(prediction.predicted_leads_midpoint / (prediction.seasonal_factor || 1)),
      trend: 'stable',
      trend_percentage: 0
    },
    market_context: {
      seasonal_factor: prediction.seasonal_factor || 1.0,
      local_demand_score: Math.round((prediction.trend_factor || 1.0) * 100),
      competitor_activity: 'medium',
      notable_signals: []
    },
    data_sources: prediction.data_sources,
    reasoning: prediction.reasoning
  };
}
