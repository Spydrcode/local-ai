# Contractor Copilot - Phase 1: Business Profile System

## Overview

Phase 1 transforms 2ndmynd into an operational AI copilot for contractors by implementing a **business-profile-first** approach. This foundation enables all future contractor-specific features.

## What's Included

### ✅ Completed Features

1. **Database Schema**
   - Added `contractor_profile` JSONB column to `demos` table
   - Added `contractor_mode` boolean flag
   - Indexes for fast contractor queries

2. **TypeScript Types**
   - Full type definitions for contractor profiles
   - Data-sourced fields with confidence tracking
   - Industry enums and validation types

3. **Profile Management Agent**
   - Profile validation with completeness scoring
   - Business-profile-first merge logic (Profile > Scraped > Inferred)
   - Conflict detection between profile and scraped data
   - Smart suggestions for missing fields

4. **Competitor Filter Agent**
   - Industry-aware filtering (e.g., exclude industrial propane for residential HVAC)
   - Customer type matching
   - Service overlap calculation
   - Relevance scoring with explanations

5. **API Endpoints**
   - `GET /api/contractor/profile` - Retrieve profile
   - `POST /api/contractor/profile` - Create/update profile
   - `PATCH /api/contractor/profile` - Partial update
   - `DELETE /api/contractor/profile` - Clear profile
   - `POST /api/contractor/profile/merge` - Merge with scraped data
   - `POST /api/contractor/competitors/filter` - Filter competitors

6. **Multi-Step Onboarding UI**
   - 6-step form with progress tracking
   - Step 1: Business basics (industry, services)
   - Step 2: Service area (cities, radius)
   - Step 3: Customers & pricing
   - Step 4: Team & crew
   - Step 5: Competitors
   - Step 6: Lead sources & KPIs

7. **Contractor Dashboard**
   - Profile completeness visualization
   - Improvement suggestions
   - Filtered competitor intelligence
   - Quick actions for future features

## File Structure

```
lib/
├── types/
│   └── contractor.ts                          # TypeScript types
├── agents/
│   └── contractor/
│       ├── profile-manager.ts                  # Profile validation & merge logic
│       └── competitor-filter.ts                # Competitor filtering agent

app/
├── api/
│   └── contractor/
│       ├── profile/
│       │   ├── route.ts                       # CRUD endpoints
│       │   └── merge/
│       │       └── route.ts                   # Merge endpoint
│       └── competitors/
│           └── filter/
│               └── route.ts                   # Competitor filter endpoint
└── contractor/
    ├── onboard/
    │   └── page.tsx                           # Onboarding flow page
    └── dashboard/
        └── page.tsx                           # Contractor dashboard

components/
└── contractor/
    └── ContractorOnboardingFlow.tsx           # Multi-step form component

supabase/
└── migrations/
    └── 20250120_add_contractor_profile.sql    # Database schema
```

## Setup Instructions

### 1. Run Database Migration

Execute the SQL migration in Supabase SQL Editor:

```bash
# Copy contents of supabase/migrations/20250120_add_contractor_profile.sql
# and run in Supabase SQL Editor
```

Or use Supabase CLI:

```bash
supabase db push
```

### 2. No Environment Variables Needed

Phase 1 uses existing infrastructure. No new env vars required.

### 3. Test the Onboarding Flow

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to homepage and create a business analysis

3. After analysis, go to:
   ```
   http://localhost:3000/contractor/onboard?demo_id={your_demo_id}
   ```

4. Complete the 6-step onboarding flow

5. View your contractor dashboard:
   ```
   http://localhost:3000/contractor/dashboard?demo_id={your_demo_id}
   ```

## Key Concepts

### Business-Profile-First Merge Logic

**Priority:** Contractor Profile > Scraped Website Data > Inferred

```typescript
// Example: Business name
Profile says: "ABC Heating & Cooling"
Website says: "ABC HVAC Services"
→ Uses profile value, flags conflict for confirmation
```

This ensures the owner's input is always trusted over automated scraping.

### Competitor Filtering

The filter agent uses the contractor profile to exclude irrelevant competitors:

**Example 1: Residential HVAC**
```
Profile: Residential HVAC in Austin
Scraped Competitors:
  - XYZ HVAC (residential) ✅ Keep
  - Forklift Propane Co (industrial fleet) ❌ Exclude
  - ABC Plumbing (residential) ✅ Keep (related)
```

**Example 2: Commercial Roofing**
```
Profile: Commercial Roofing, 50-mile radius
Scraped Competitors:
  - Residential Roofers Inc ❌ Exclude (residential only)
  - Commercial Roofing Co ✅ Keep
  - XYZ 80 miles away ❌ Exclude (too far)
```

### Profile Completeness Scoring

Weighted scoring based on field importance:

| Field | Weight | Why Important |
|-------|--------|---------------|
| Industry | 15% | Core identity |
| Services | 15% | Core offering |
| Service Area | 10% | Geographic targeting |
| Competitors | 10% | Competitive intelligence |
| KPIs | 10% | Predictive analytics |
| Customer Types | 8% | Market segmentation |
| Roles | 8% | Hiring recommendations |
| Pricing Model | 7% | Revenue modeling |
| Lead Sources | 7% | Marketing ROI |
| Crew Size | 5% | Capacity planning |
| Peak Seasons | 3% | Demand forecasting |
| Photos | 2% | Quality control |

**Total: 100%**

## API Usage Examples

### Create Contractor Profile

```typescript
const response = await fetch('/api/contractor/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    demo_id: 'your_demo_id',
    profile: {
      primary_industry: 'HVAC',
      service_types: ['Emergency Repair', 'Installation', 'Maintenance'],
      service_area: {
        cities: ['Austin', 'Round Rock'],
        radius_miles: 25,
        zip_ranges: ['78701-78799']
      },
      customer_types: ['residential', 'commercial'],
      pricing_model: 'flat_rate',
      peak_seasons: ['Summer', 'Winter'],
      crew_size: 12,
      roles: [
        { title: 'Installer', count: 5 },
        { title: 'Technician', count: 4 },
        { title: 'Foreman', count: 2 }
      ],
      competitors: [
        { name: 'ABC HVAC', url: 'https://abchvac.com', excluded: false }
      ],
      lead_sources: ['google', 'facebook', 'referrals'],
      kpis: {
        leads_per_week: 15,
        close_rate: 0.35,
        avg_ticket: 850,
        time_to_complete_days: 2
      }
    }
  })
});

const data = await response.json();
console.log('Profile saved with', data.completeness * 100, '% completeness');
```

### Filter Competitors

```typescript
const response = await fetch('/api/contractor/competitors/filter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ demo_id: 'your_demo_id' })
});

const data = await response.json();

console.log(`Found ${data.summary.total} competitors`);
console.log(`${data.summary.relevant} relevant, ${data.summary.excluded} excluded`);

data.filtered_competitors.forEach(comp => {
  if (!comp.should_exclude) {
    console.log(`✓ ${comp.name} (${Math.round(comp.relevance_score * 100)}% match)`);
    comp.relevance_reasons.forEach(reason => console.log(`  - ${reason}`));
  }
});
```

### Merge Profile with Scraped Data

```typescript
const response = await fetch('/api/contractor/profile/merge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ demo_id: 'your_demo_id' })
});

const data = await response.json();

if (data.conflicts.length > 0) {
  console.log('Conflicts detected:');
  data.conflicts.forEach(conflict => {
    console.log(`${conflict.field}:`);
    console.log(`  Profile: ${conflict.profile_value}`);
    console.log(`  Website: ${conflict.scraped_value}`);
    console.log(`  Suggestion: ${conflict.suggestion}`);
  });
}
```

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Onboarding flow loads without errors
- [ ] All 6 steps can be completed
- [ ] Profile saves to database
- [ ] Dashboard shows completeness score
- [ ] Competitor filter excludes irrelevant businesses
- [ ] Profile validation catches missing required fields
- [ ] Suggestions appear for incomplete profiles
- [ ] Edit profile updates existing data
- [ ] API endpoints return proper error messages

## Known Limitations (Phase 1)

1. **No automatic competitor discovery** - Relies on scraped data from website intelligence
2. **No distance calculation** - Distance filtering requires geocoding (future enhancement)
3. **Manual competitor list** - User must add known competitors during onboarding
4. **No photo storage** - Photo URLs stored but no upload functionality yet (Phase 4)
5. **No KPI validation** - Accepts any numeric values without range checking

## Next Steps (Phase 2: Weekly Lead Pulse)

Phase 2 will build on this foundation to add:

1. **Lead Tracking Schema** - Store historical lead data
2. **Lead Prediction Agent** - Forecast weekly leads using:
   - Historical patterns
   - Seasonal trends
   - Local market signals (permits, search trends)
   - Competitor activity
3. **Action Recommendations** - 3 immediate actions including:
   - Ready-to-run Facebook ad (headline, text, CTA, budget)
   - Social media post templates
   - Follow-up email campaigns
4. **Weekly Pulse UI** - Dashboard widget + email digest

## Acceptance Criteria - Phase 1 ✅

- [x] Business profile intake with 6-step flow
- [x] Profile validation with completeness scoring
- [x] Business-profile-first merge logic
- [x] Competitor filtering with relevance scoring
- [x] API endpoints for CRUD operations
- [x] Contractor dashboard with profile overview
- [x] Database schema with proper indexes
- [x] TypeScript types for all contractor data
- [x] Conflict detection between profile and scraped data
- [x] Suggestions for profile improvements

## Support

For questions or issues with Phase 1:

1. Check this README
2. Review the inline code comments in:
   - `lib/agents/contractor/profile-manager.ts`
   - `lib/agents/contractor/competitor-filter.ts`
3. Test API endpoints with the examples above
4. Check Supabase logs for database errors

---

**Status:** Phase 1 Complete ✅
**Next:** Phase 2 - Weekly Lead Pulse
