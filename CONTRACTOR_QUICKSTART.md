# Contractor Copilot - Quick Start Guide

## 🚀 What Just Got Built

You now have a **contractor-first business intelligence system** that:

✅ Captures detailed contractor profiles (industry, services, crew, competitors, KPIs)
✅ Validates and scores profile completeness
✅ Filters competitors intelligently (excludes irrelevant industries)
✅ Merges owner data with scraped website data (owner always wins)
✅ Provides actionable suggestions for improvement

## 📁 What Was Created

### Backend (API & Logic)
```
lib/types/contractor.ts                          # TypeScript types
lib/agents/contractor/profile-manager.ts         # Profile validation & merge
lib/agents/contractor/competitor-filter.ts       # Smart competitor filtering

app/api/contractor/profile/route.ts              # CRUD endpoints
app/api/contractor/profile/merge/route.ts        # Merge with scraped data
app/api/contractor/competitors/filter/route.ts   # Filter competitors
```

### Frontend (UI)
```
components/contractor/ContractorOnboardingFlow.tsx  # 6-step form
app/contractor/onboard/page.tsx                     # Onboarding page
app/contractor/dashboard/page.tsx                   # Dashboard
```

### Database
```
supabase/migrations/20250120_add_contractor_profile.sql  # Schema changes
```

### Documentation
```
CONTRACTOR_COPILOT_PHASE1.md   # Full technical docs
CONTRACTOR_QUICKSTART.md        # This file
```

## ⚡ Get Started in 3 Steps

### Step 1: Run Database Migration

Open Supabase SQL Editor and run:

```bash
# Copy-paste contents of:
supabase/migrations/20250120_add_contractor_profile.sql
```

Or use CLI:
```bash
supabase db push
```

### Step 2: Start Dev Server

```bash
npm run dev
```

### Step 3: Test the Flow

1. Go to homepage: `http://localhost:3000`
2. Enter a contractor website (e.g., an HVAC company)
3. After analysis completes, navigate to:
   ```
   http://localhost:3000/contractor/onboard?demo_id={the_demo_id_from_url}
   ```
4. Complete the 6-step onboarding
5. View dashboard:
   ```
   http://localhost:3000/contractor/dashboard?demo_id={same_demo_id}
   ```

## 🎯 Key Features to Test

### 1. Profile Completeness Scoring

Try creating profiles with different levels of detail:
- **Minimal:** Just industry + services → ~30% complete
- **Good:** Add team + competitors → ~60% complete
- **Complete:** Add KPIs + lead sources → ~95% complete

### 2. Competitor Filtering

**Test Case:** Residential HVAC contractor

1. Create profile with:
   - Industry: HVAC
   - Customer types: Residential only
2. Run competitor filter
3. Expected result:
   - ✅ Keeps: Residential HVAC companies
   - ❌ Excludes: Industrial propane, commercial-only HVAC, far-away competitors

### 3. Conflict Detection

**Test Case:** Profile vs. Scraped Data

1. Enter services in profile: "Emergency Repair, Installation"
2. If website shows different services, merge endpoint will flag conflict
3. Profile data takes priority, but conflict is logged for review

## 🔥 Real-World Use Case

**Scenario:** Austin HVAC Contractor Setup

```typescript
// Step 1: Onboard contractor
const profile = {
  primary_industry: 'HVAC',
  service_types: ['Emergency Repair', 'Installation', 'Maintenance', 'Annual Contracts'],
  service_area: {
    cities: ['Austin', 'Round Rock', 'Cedar Park', 'Pflugerville'],
    radius_miles: 30,
    zip_ranges: ['78701-78799']
  },
  customer_types: ['residential', 'commercial'],
  pricing_model: 'flat_rate',
  peak_seasons: ['Summer', 'Winter'],
  off_seasons: ['Spring', 'Fall'],
  crew_size: 18,
  roles: [
    { title: 'Lead Technician', count: 4 },
    { title: 'Installer', count: 8 },
    { title: 'Apprentice', count: 4 },
    { title: 'Dispatcher', count: 2 }
  ],
  competitors: [
    { name: 'ABC Heating & Air', url: 'https://abchvac.com', excluded: false },
    { name: 'XYZ Cooling', url: 'https://xyzcooling.com', excluded: false },
    { name: 'Forklift Propane Co', url: 'https://forklift.com', excluded: true }
  ],
  lead_sources: ['google', 'facebook', 'referrals', 'nextdoor', 'yelp'],
  kpis: {
    leads_per_week: 22,
    close_rate: 0.38,
    avg_ticket: 1250,
    time_to_complete_days: 1,
    customer_lifetime_value: 3500
  }
};

// Step 2: Save profile
await fetch('/api/contractor/profile', {
  method: 'POST',
  body: JSON.stringify({ demo_id, profile })
});

// Step 3: Filter competitors
const filterResult = await fetch('/api/contractor/competitors/filter', {
  method: 'POST',
  body: JSON.stringify({ demo_id })
});

// Result:
// ✅ ABC Heating & Air: 95% match (same industry, overlapping service area)
// ✅ XYZ Cooling: 87% match (same industry, serves residential)
// ❌ Forklift Propane Co: Excluded (manually flagged + industrial fleet focus)
```

## 📊 What's Next?

### Phase 2: Weekly Lead Pulse (Next Sprint)

**Goal:** Predictive lead intelligence + actionable tasks

**Features:**
- Predict leads for upcoming week (range: low/high)
- 3 immediate actions to increase leads:
  1. Ready-to-run Facebook ad (headline, text, CTA, budget)
  2. Social media post templates (3x before/after photos)
  3. Follow-up email campaign (last 50 leads)
- Confidence scores + data sources for each prediction
- Weekly email digest

**Data Sources:**
- Historical lead patterns (last 90 days)
- Google Trends (local search volume for "hvac repair austin")
- Building permits (new construction → future leads)
- Competitor ad activity (Meta Ads Library)
- Seasonal patterns from profile

### Phase 3: Hire & Onboard Kit

Auto-generate:
- Job ads optimized for Indeed/Facebook
- Screening questionnaires (scoreable)
- 7-day onboarding checklists
- Posting schedule recommendations

### Phase 4: QC Photo Checker

- Upload job photos
- AI detects defects (missing flashing, uneven tile, etc.)
- Generate punch lists
- Pass/fail recommendations
- Customer message templates

### Phase 5: Monthly One-Pager

- KPI snapshot (leads, close rate, backlog)
- Top 3 risks + top 3 opportunities
- 5 prioritized action items
- PDF export + email delivery

### Phase 6: Monitoring & Alerts

Real-time alerts for:
- Google ranking drops
- Negative reviews
- New competitors in service area
- Lead volume lag
- Permit spikes (opportunity)

### Phase 7: Integration Layer

Connect to:
- ServiceTitan (jobs, customers, invoices)
- Jobber (quotes, scheduling)
- QuickBooks (financials)
- Google Business Profile (posts, reviews)
- Indeed/Facebook Jobs (hiring)

## 🐛 Troubleshooting

### Migration Fails

**Error:** `relation "demos" does not exist`

**Fix:** Ensure you're running migration on correct Supabase project

### Onboarding Page 404

**Error:** `Cannot GET /contractor/onboard`

**Fix:** Restart dev server after creating new pages

### Profile Not Saving

**Error:** `Demo not found`

**Fix:** Ensure `demo_id` exists in URL and database

### Competitor Filter Returns Empty

**Cause:** No competitors in `intelligence_data`

**Fix:** Run website scraper first to populate competitor data

## 💡 Pro Tips

1. **Start with KPIs:** Filling out KPIs unlocks predictive features in Phase 2
2. **Be honest with competitors:** Accurate competitor list improves filtering
3. **Use ZIP ranges:** Better targeting than just cities
4. **Track lead sources:** Essential for ROI analysis
5. **Complete profile to 90%+:** Unlocks all advanced features

## 📚 Learn More

- **Full technical docs:** [CONTRACTOR_COPILOT_PHASE1.md](CONTRACTOR_COPILOT_PHASE1.md)
- **API examples:** See "API Usage Examples" in full docs
- **Architecture:** See "Key Concepts" section

## 🤝 Need Help?

1. Check inline code comments in:
   - `lib/agents/contractor/profile-manager.ts`
   - `lib/agents/contractor/competitor-filter.ts`
2. Review API endpoint responses (include error details)
3. Check Supabase logs for database issues
4. Test with the examples in this guide

---

**Phase 1 Status:** ✅ Complete
**Next:** Phase 2 - Weekly Lead Pulse
**Timeline:** Ready to build when you are!
