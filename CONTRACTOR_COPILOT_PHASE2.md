# Contractor Copilot - Phase 2: Weekly Lead Pulse

## Overview

Phase 2 transforms contractor intelligence into **actionable weekly predictions**. Instead of just analyzing the past, the system now predicts future lead volume and provides 3 immediate actions to increase leads.

## What's Included

### ✅ Completed Features

1. **Lead Tracking Database**
   - `contractor_leads` table - Historical lead tracking
   - `contractor_lead_predictions` table - AI predictions with confidence scores
   - `contractor_market_signals` table - External market data (permits, trends)
   - `contractor_leads_weekly_summary` materialized view - Fast analytics

2. **LeadPulseAgent** - Sophisticated prediction engine
   - Historical pattern analysis (last 12 weeks)
   - Seasonal adjustments (industry-specific + profile seasons)
   - Market signal integration (Google Trends, building permits)
   - Confidence scoring based on data quality
   - Top 3 action recommendations with ready-to-run content

3. **Ready-to-Run Facebook Ads**
   - Industry-specific ad copy (HVAC, Plumbing, Roofing, etc.)
   - Targeting recommendations (location, radius, age, interests)
   - Budget suggestions based on desired lead increase
   - Multiple ad copy variants for A/B testing

4. **Social Media Post Generator**
   - Before/after photo post templates
   - Platform-specific optimization (Facebook, Instagram, Nextdoor)
   - Hashtag recommendations
   - Posting schedule suggestions

5. **Email Campaign Generator**
   - Follow-up campaigns for lost leads
   - Nurture campaigns with seasonal tips
   - Subject lines, preview text, body copy
   - Expected response rates

6. **Pricing Test Recommendations**
   - A/B test suggestions (free diagnostic vs. paid)
   - Success metrics defined
   - Test duration recommendations

7. **Weekly Pulse UI**
   - Prediction range display (low/expected/high)
   - Confidence badges
   - Historical context (last week, trend, 4-week average)
   - Market context (seasonal factor, demand score, competitor activity)
   - Expandable action details
   - Copy-to-clipboard for all actions
   - Reasoning transparency

8. **API Endpoints**
   - `POST /api/contractor/lead-pulse` - Generate weekly pulse
   - `GET /api/contractor/lead-pulse` - Get latest pulse
   - Prediction caching (avoid regenerating same week)
   - Force refresh option

## File Structure

```
lib/
├── types/
│   └── contractor-leads.ts                    # Lead tracking types
├── agents/
│   └── contractor/
│       └── lead-pulse-agent.ts                # Prediction engine (600+ LOC)

app/
├── api/
│   └── contractor/
│       └── lead-pulse/
│           └── route.ts                       # API endpoints

components/
└── contractor/
    └── WeeklyPulseWidget.tsx                  # UI component (400+ LOC)

supabase/
└── migrations/
    └── 20250121_add_lead_tracking.sql         # Database schema
```

## Setup Instructions

### 1. Run Database Migration

```bash
# Copy contents of supabase/migrations/20250121_add_lead_tracking.sql
# and run in Supabase SQL Editor

# OR use CLI:
supabase db push
```

### 2. Test Weekly Pulse

1. Ensure you have a contractor profile (Phase 1)
2. Go to contractor dashboard:
   ```
   http://localhost:3000/contractor/dashboard?demo_id={your_demo_id}
   ```
3. Click **"Generate This Week's Pulse"**
4. View prediction + top 3 actions

## How It Works

### Prediction Algorithm

```
Base Prediction = 4-week average of historical leads

Adjusted Prediction = Base × Seasonal Factor × Market Multiplier

Prediction Range:
  Low  = Adjusted × 0.8
  Mid  = Adjusted × 1.0
  High = Adjusted × 1.2
```

### Seasonal Factors

**Industry-Specific:**
- HVAC: 1.25x in Summer/Winter (peak), 1.0x Spring/Fall
- Landscaping: 1.30x Spring/Summer, 0.70x Winter
- Roofing: 0.80x Winter, 1.15x other seasons
- Plumbing: 1.20x Winter (frozen pipes)

**Profile-Based:**
- Peak seasons (from profile): 1.20x
- Off seasons (from profile): 0.90x

### Market Signals (Future Enhancement)

**Phase 2 includes database schema for:**
- Google Trends (local search volume)
- Building permits (new construction → future leads)
- Competitor ad volume (Meta Ads Library)
- Weather events
- Economic indicators

**Note:** Actual data collection for these signals will be implemented in future sprints. The agent currently works without them.

### Confidence Scoring

```
Base Confidence: 0.5

+ 0.25  if 12+ weeks of historical data
+ 0.15  if 8-11 weeks of historical data
+ 0.05  if 4-7 weeks of historical data
+ 0.10  if profile KPIs filled out
+ 0.10  if 3+ market signals available
+ 0.05  if 1-2 market signals available
+ 0.05  if seasonal data in profile

Max: 1.0 (100%)

Confidence Levels:
  High:   ≥0.7
  Medium: 0.4-0.69
  Low:    <0.4
```

## Example Output

### Sample Weekly Pulse

**Austin HVAC Contractor - Week of Jan 22-28, 2025**

**Expected Leads:** 18-27 (midpoint: 22)
**Confidence:** High (85%)

**Top 3 Actions:**

**1. Run Facebook Ad** (Priority 1)
- **Headline:** Emergency Heater Repair — Same-Day Service in Austin
- **Text:** Local family-owned HVAC. Free diagnosis. 24/7 emergency service. Book your appointment today.
- **CTA:** Book Now
- **Budget:** $525/week
- **Targeting:** Austin, 25mi radius, ages 30-65, interests: Home improvement, Homeowner
- **Estimated Impact:** +3-5 leads

**2. Post 3 before/after photos** (Priority 2)
- **Platforms:** Facebook, Nextdoor
- **Schedule:** Monday, Wednesday, Friday at 6pm
- **Estimated Impact:** +2-4 leads

**3. Send follow-up to last 50 leads** (Priority 3)
- **Subject:** Still need HVAC service? Special offer inside
- **Preview:** We haven't heard back — here's 10% off to get started
- **Expected Response Rate:** 8%
- **Estimated Impact:** +2-5 leads

**Reasoning:**
- 20 avg leads over last 4 weeks
- Upward trend (+12%)
- Seasonal adjustment: +20% (Winter HVAC peak)

---

## API Usage

### Generate Weekly Pulse

```typescript
const response = await fetch('/api/contractor/lead-pulse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    demo_id: 'your_demo_id',
    force_refresh: false // set to true to regenerate
  })
});

const data = await response.json();

console.log('Expected leads:', data.pulse.prediction.expected_leads_midpoint);
console.log('Top action:', data.pulse.top_actions[0].title);
```

### Get Latest Pulse

```typescript
const response = await fetch(`/api/contractor/lead-pulse?demo_id=${demo_id}`);
const data = await response.json();

if (data.has_prediction) {
  console.log('Latest prediction:', data.pulse);
} else {
  console.log('No predictions yet. Generate first pulse.');
}
```

## Data Requirements

### Minimum Data for Predictions

**With NO historical data:**
- Uses profile KPI (`leads_per_week`) as baseline
- Applies seasonal factors
- Confidence: Low (30-40%)

**With 4+ weeks historical data:**
- Uses 4-week average as baseline
- Applies trend analysis
- Confidence: Medium (50-60%)

**With 12+ weeks historical data + profile KPIs:**
- Uses robust historical average
- Seasonal pattern detection
- Market signal integration
- Confidence: High (70-85%)

### Adding Historical Leads (Manual)

```sql
-- Insert sample leads for testing
INSERT INTO contractor_leads (demo_id, source, status, estimated_value, service_type, created_at)
VALUES
  ('your_demo_id', 'google', 'won', 1200, 'Emergency Repair', '2025-01-06'),
  ('your_demo_id', 'facebook', 'quoted', 850, 'Installation', '2025-01-08'),
  ('your_demo_id', 'referral', 'won', 1500, 'Maintenance', '2025-01-10'),
  ... (add 50-100 leads over 12 weeks for best results)
```

Then refresh the weekly summary view:

```sql
SELECT refresh_contractor_leads_weekly_summary();
```

## Testing Without Historical Data

The system works even with zero historical data:

1. **Fallback to Profile KPIs:**
   - Uses `profile.kpis.leads_per_week` as baseline
   - Applies seasonal factors
   - Lower confidence but still actionable

2. **Test Scenario:**
   ```
   Profile: HVAC, Peak Seasons: [Summer, Winter]
   Current Date: January 20 (Winter)
   Profile KPI: 15 leads/week

   Prediction:
   - Base: 15 leads
   - Seasonal: 15 × 1.25 = 19 leads
   - Range: 15-23 (midpoint: 19)
   - Confidence: Medium (45%)
   ```

## Action Generation Logic

### Always Included: Facebook Ad

**Generated for every pulse with:**
- Industry-specific headlines and copy
- Location from profile
- Budget calculated as: `desired_leads × $35 (avg cost/lead)`
- Targeting interests based on industry

### Action 2: Social Posts

**Included if:**
- Profile has photos (future) OR
- Profile uses social lead sources (facebook, instagram, nextdoor)

### Action 3: Context-Dependent

**If trend is down (-5% or more):**
- Generate follow-up email campaign to lost leads

**If competitor activity is high:**
- Generate pricing test recommendation

**Default:**
- Generate nurture email with seasonal tips

## Performance & Caching

**Prediction Caching:**
- Each week's prediction is cached in `contractor_lead_predictions` table
- Subsequent requests for same week return cached result
- Use `force_refresh: true` to regenerate

**Materialized View:**
- `contractor_leads_weekly_summary` pre-aggregates lead stats
- Refresh weekly via cron job (future) or manually
- Much faster than querying raw leads table

## Future Enhancements (Phase 2.1)

### Market Signal Collection

**Google Trends Integration:**
```typescript
// lib/data-collectors/google-trends.ts
// Fetch search volume for industry keywords in service area
// Store in contractor_market_signals table
```

**Building Permit Feeds:**
```typescript
// lib/data-collectors/permit-feeds.ts
// Scrape city permit data
// Correlate permits with future lead volume
```

**Competitor Ad Monitoring:**
```typescript
// lib/data-collectors/competitor-ads.ts
// Use Meta Ads Library API
// Track competitor ad volume and messaging
```

### Email Automation

- SendGrid integration for automated weekly digest
- Email templates with pulse summary
- Scheduled delivery (Monday mornings)

### Lead Import

- CSV import for historical leads from ServiceTitan/Jobber
- Auto-sync via API integration (Phase 7)

## Known Limitations

1. **No actual market signals yet** - Database schema ready, collection pending
2. **No distance calculation for permits** - Requires geocoding API
3. **No automatic email delivery** - Manual copy-paste for now
4. **No lead import UI** - Manual SQL insertion only
5. **No A/B test tracking** - Recommendations provided but not tracked

## Troubleshooting

### Pulse Generation Fails

**Error:** `Not a contractor business`
**Fix:** Complete Phase 1 onboarding first

**Error:** `No predictions found`
**Fix:** Click "Generate This Week's Pulse" to create first prediction

### Low Confidence Predictions

**Cause:** Insufficient historical data
**Fix:**
- Add `leads_per_week` to profile KPIs
- Import historical leads (50+ leads recommended)
- Wait 4-8 weeks for data to accumulate

### Inaccurate Predictions

**Cause:** Seasonal factors not matching reality
**Fix:**
- Update `peak_seasons` and `off_seasons` in profile
- After 12 weeks, system will auto-detect patterns

## Success Metrics

**Prediction Accuracy** (after 8 weeks):
- Target: 70% of predictions should contain actual lead count
- Calculation: `actual_leads BETWEEN predicted_low AND predicted_high`

**User Engagement:**
- Pulse generation rate: >80% of contractors generate weekly pulse
- Action completion rate: >50% complete at least 1 of 3 actions
- Retention: <6% monthly churn

**Lead Impact:**
- Contractors using pulse see +15-25% lead increase vs. baseline
- Measured via before/after analysis over 12 weeks

## Next Steps

**Phase 3: Hire & Onboard Kit** will add:
- Auto-generated job ads for Indeed/Facebook
- Screening questionnaires
- 7-day onboarding checklists
- Time-to-hire predictions
- Applicant quality scoring

---

**Phase 2 Status:** ✅ Complete
**Ready for Production:** Yes (with manual lead input)
**Next:** Phase 3 - Hire & Onboard Kit
