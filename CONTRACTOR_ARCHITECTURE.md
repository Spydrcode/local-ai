# Contractor Copilot Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONTRACTOR COPILOT                           │
│                  (Operational AI for Contractors)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │         BUSINESS-PROFILE-FIRST ENGINE       │
        │                                             │
        │  Priority: Profile > Scraped > Inferred    │
        └─────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌────────┐          ┌─────────┐          ┌──────────┐
   │Profile │          │ Scraped │          │ Inferred │
   │ (User) │          │  (Web)  │          │   (AI)   │
   └────────┘          └─────────┘          └──────────┘
   Confidence: 1.0     Confidence: 0.8      Confidence: 0.5
```

## Phase 1: Data Flow

### Onboarding Flow

```
User → Homepage
  │
  ├─ Enter website URL
  │
  ▼
WebScraperAgent
  │
  ├─ Extract: business data, competitors, SEO, reviews
  │
  ▼
Store in demos.intelligence_data (JSONB)
  │
  ▼
Redirect to /contractor/onboard?demo_id=xxx
  │
  ▼
6-Step Form
  │
  ├─ Step 1: Industry + Services
  ├─ Step 2: Service Area + Radius
  ├─ Step 3: Customer Types + Pricing
  ├─ Step 4: Team + Crew
  ├─ Step 5: Competitors
  └─ Step 6: Lead Sources + KPIs
  │
  ▼
POST /api/contractor/profile
  │
  ├─ Validate profile (ContractorProfileManager)
  ├─ Calculate completeness
  ├─ Store in demos.contractor_profile (JSONB)
  └─ Set demos.contractor_mode = true
  │
  ▼
Redirect to /contractor/dashboard
```

### Competitor Filtering Flow

```
User clicks "Run Filter" on Dashboard
  │
  ▼
POST /api/contractor/competitors/filter
  │
  ├─ Fetch contractor_profile
  ├─ Fetch intelligence_data.competitors
  │
  ▼
ContractorCompetitorFilterAgent.filterCompetitors()
  │
  ├─ For each competitor:
  │   │
  │   ├─ Detect industry (HVAC, Plumbing, etc.)
  │   ├─ Detect customer types (residential, commercial, etc.)
  │   ├─ Calculate service overlap (fuzzy matching)
  │   ├─ Check distance (if available)
  │   │
  │   ├─ Score relevance (0-1)
  │   │   │
  │   │   ├─ +0.5 if in profile competitor list
  │   │   ├─ +0.3 if same industry
  │   │   ├─ +0.3 if high service overlap (>50%)
  │   │   ├─ +0.2 if same customer types
  │   │   ├─ +0.2 if in service area
  │   │   │
  │   │   ├─ -0.5 if different industry (excluded)
  │   │   ├─ -0.3 if no service overlap
  │   │   ├─ -0.4 if only excluded customer types
  │   │   └─ -0.3 if too far away
  │   │
  │   └─ Should exclude? (score < 0.3 OR exclusion_reasons > 0)
  │
  ▼
Return filtered list with:
  ├─ Relevant competitors (score ≥ 0.3, sorted by score)
  ├─ Excluded competitors (for review)
  └─ Summary (total, relevant, excluded counts)
  │
  ▼
Display on Dashboard
  ├─ Relevant: Green badge, show relevance reasons
  └─ Excluded: Gray badge, collapsed, show exclusion reasons
```

## Database Schema

### Before Phase 1

```sql
demos table:
├─ id (TEXT)
├─ business_name (TEXT)
├─ website_url (TEXT)
├─ site_summary (TEXT)
├─ industry (TEXT)
├─ intelligence_data (JSONB)  -- WebScraperAgent output
└─ ... (other fields)
```

### After Phase 1

```sql
demos table:
├─ id (TEXT)
├─ business_name (TEXT)
├─ website_url (TEXT)
├─ site_summary (TEXT)
├─ industry (TEXT)
├─ intelligence_data (JSONB)
├─ contractor_profile (JSONB)  ← NEW
│   └─ {
│       primary_industry: "HVAC",
│       service_types: ["Emergency Repair", "Installation"],
│       service_area: { cities: [...], radius_miles: 25 },
│       customer_types: ["residential"],
│       pricing_model: "flat_rate",
│       peak_seasons: ["Summer", "Winter"],
│       crew_size: 12,
│       roles: [{ title: "Installer", count: 5 }],
│       competitors: [{ name: "ABC HVAC", excluded: false }],
│       lead_sources: ["google", "facebook"],
│       kpis: { leads_per_week: 15, close_rate: 0.35 },
│       profile_completeness: 0.85
│     }
└─ contractor_mode (BOOLEAN)  ← NEW
```

## Agent Architecture

### ContractorProfileManager

**Responsibilities:**
1. Validate profile completeness
2. Merge profile with scraped data
3. Detect conflicts
4. Calculate completeness score
5. Generate improvement suggestions

**Methods:**
```typescript
class ContractorProfileManager {
  // Validate profile for completeness and correctness
  static validateProfile(profile): ProfileValidation

  // Merge contractor profile with scraped website data
  // Priority: Profile > Scraped > Inferred
  static mergeWithScrapedData(profile, scraped): MergeResult

  // Calculate profile completeness score (0-1)
  static calculateCompleteness(profile): number

  // Get profile summary for AI agents
  static getProfileSummary(profile): string

  // Suggest missing fields
  static suggestNextSteps(profile): string[]
}
```

**Example Output:**
```json
{
  "valid": true,
  "completeness": 0.85,
  "errors": [],
  "warnings": ["No cities specified in service area"],
  "missing_fields": ["photos"],
  "suggested_improvements": [
    "Add typical leads per week to enable lead forecasting",
    "Upload job photos to enable quality control analysis"
  ]
}
```

### ContractorCompetitorFilterAgent

**Responsibilities:**
1. Filter competitors by industry
2. Calculate relevance scores
3. Detect service overlap
4. Explain filtering decisions

**Methods:**
```typescript
class ContractorCompetitorFilterAgent {
  // Filter competitors based on contractor profile
  static filterCompetitors(profile, raw_competitors): FilteredCompetitor[]

  // Get filtering summary
  static getFilteringSummary(filtered): Summary

  // Private helpers
  private static detectIndustry(competitor): ContractorIndustry
  private static detectCustomerTypes(competitor): CustomerType[]
  private static calculateServiceOverlap(profile_services, competitor_services): number
}
```

**Example Output:**
```json
{
  "filtered_competitors": [
    {
      "name": "ABC HVAC",
      "relevance_score": 0.92,
      "relevance_reasons": [
        "Listed in your profile as a known competitor",
        "Same industry: HVAC",
        "High service overlap (85%)",
        "In your service area (8 miles away)"
      ],
      "should_exclude": false,
      "exclusion_reasons": []
    },
    {
      "name": "Forklift Propane Co",
      "relevance_score": 0.15,
      "relevance_reasons": [],
      "should_exclude": true,
      "exclusion_reasons": [
        "Different industry: Propane (you do HVAC)",
        "Only serves industrial, fleet (you serve residential, commercial)",
        "No overlapping services"
      ]
    }
  ],
  "summary": {
    "total": 15,
    "relevant": 8,
    "excluded": 7
  }
}
```

## Merge Logic Deep Dive

### Priority System

```
┌─────────────────────────────────────────────────┐
│            DATA SOURCE PRIORITY                  │
├─────────────────────────────────────────────────┤
│  1. CONTRACTOR PROFILE (user input)             │
│     ├─ Confidence: 1.0 (100%)                   │
│     ├─ Always trusted                           │
│     └─ Source of truth                          │
│                                                  │
│  2. SCRAPED WEBSITE DATA                        │
│     ├─ Confidence: 0.8 (80%)                    │
│     ├─ Used if no profile data                  │
│     └─ Flags conflicts with profile             │
│                                                  │
│  3. INFERRED (AI-generated)                     │
│     ├─ Confidence: 0.5 (50%)                    │
│     ├─ Used as last resort                      │
│     └─ Always shows low confidence              │
└─────────────────────────────────────────────────┘
```

### Conflict Detection Examples

#### Example 1: Business Name Conflict

```typescript
Profile says:    "ABC Heating & Cooling"
Website says:    "ABC HVAC Services"

Result:
{
  value: "ABC Heating & Cooling",  // Profile wins
  source: "profile",
  confidence: 1.0,
  scraped_value: "ABC HVAC Services",
  conflict: {
    field: "business_name",
    profile_value: "ABC Heating & Cooling",
    scraped_value: "ABC HVAC Services",
    suggestion: "Profile says 'ABC Heating & Cooling' but website shows 'ABC HVAC Services'. Verify which is current."
  }
}
```

#### Example 2: Service Types Partial Match

```typescript
Profile says:    ["Emergency Repair", "Installation"]
Website says:    ["Emergency Repair", "Installation", "Maintenance Contracts"]

Result:
{
  value: ["Emergency Repair", "Installation"],  // Profile wins
  source: "profile",
  confidence: 1.0,
  scraped_value: ["Emergency Repair", "Installation", "Maintenance Contracts"],
  warning: "Website shows additional service: Maintenance Contracts. Consider adding to profile."
}
```

#### Example 3: No Profile Data

```typescript
Profile says:    (empty)
Website says:    "(512) 555-1234"

Result:
{
  value: "(512) 555-1234",  // Scraped data used
  source: "scraped",
  confidence: 0.8,
  scraped_value: "(512) 555-1234",
  warning: "phone taken from website scraping. Consider confirming in profile."
}
```

## Completeness Scoring Formula

```
Completeness = Σ (field_weight × field_present)

Weights:
┌─────────────────────┬────────┬────────────────────────┐
│ Field               │ Weight │ Reasoning              │
├─────────────────────┼────────┼────────────────────────┤
│ primary_industry    │ 0.15   │ Core business identity │
│ service_types       │ 0.15   │ Core offering          │
│ service_area        │ 0.10   │ Geographic targeting   │
│ competitors         │ 0.10   │ Competitive intel      │
│ kpis                │ 0.10   │ Predictive analytics   │
│ customer_types      │ 0.08   │ Market segmentation    │
│ roles               │ 0.08   │ Hiring recommendations │
│ pricing_model       │ 0.07   │ Revenue modeling       │
│ lead_sources        │ 0.07   │ Marketing ROI          │
│ crew_size           │ 0.05   │ Capacity planning      │
│ peak_seasons        │ 0.03   │ Demand forecasting     │
│ photos              │ 0.02   │ Quality control        │
├─────────────────────┼────────┼────────────────────────┤
│ TOTAL               │ 1.00   │                        │
└─────────────────────┴────────┴────────────────────────┘

Example:
- Industry ✓        → 0.15
- Services ✓        → 0.15
- Service Area ✓    → 0.10
- Customer Types ✓  → 0.08
- Pricing ✓         → 0.07
- Lead Sources ✓    → 0.07
- Crew Size ✓       → 0.05
- Missing: KPIs, Competitors, Roles, Seasons, Photos

Completeness = 0.67 (67%)
```

## Future Phases Integration

### Phase 2: Weekly Lead Pulse

```
Contractor Profile
  │
  ├─ peak_seasons       → Seasonal adjustment
  ├─ kpis.leads_per_week → Historical baseline
  ├─ service_area       → Geographic search trends
  └─ lead_sources       → Channel-specific forecasts
  │
  ▼
LeadPulseAgent.predictWeeklyLeads()
  │
  └─ Output: Expected leads (6-10), Top 3 actions
```

### Phase 3: Hire & Onboard Kit

```
Contractor Profile
  │
  ├─ roles              → Job titles to hire
  ├─ crew_size          → Capacity planning
  ├─ service_area       → Job posting location
  └─ pricing_model      → Compensation guidance
  │
  ▼
HiringAgent.generateJobAd()
  │
  └─ Output: Job ad, screening questions, onboarding checklist
```

### Phase 4: QC Photo Checker

```
Contractor Profile
  │
  ├─ primary_industry   → Industry-specific QC checklists
  ├─ service_types      → Service-specific defect detection
  └─ photos             → Historical job photos for training
  │
  ▼
QCAgent.analyzePhotos()
  │
  └─ Output: Punch list, pass/fail, customer message
```

## API Request/Response Flow

### Create Profile Request

```http
POST /api/contractor/profile
Content-Type: application/json

{
  "demo_id": "abc123",
  "profile": {
    "primary_industry": "HVAC",
    "service_types": ["Emergency Repair", "Installation"],
    "service_area": {
      "cities": ["Austin"],
      "radius_miles": 25
    },
    "customer_types": ["residential"],
    "pricing_model": "flat_rate",
    "kpis": {
      "leads_per_week": 15,
      "close_rate": 0.35
    }
  }
}
```

### Create Profile Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "profile": {
    "primary_industry": "HVAC",
    "service_types": ["Emergency Repair", "Installation"],
    ...
    "onboarding_completed_at": "2025-01-20T15:30:00Z",
    "profile_completeness": 0.52
  },
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": [
      "No cities specified in service area"
    ],
    "completeness": 0.52,
    "missing_fields": ["competitors", "roles", "photos"],
    "suggested_improvements": [
      "Add 3-5 known competitors for competitive intelligence",
      "Add crew roles to get hiring recommendations"
    ]
  },
  "completeness": 0.52,
  "suggestions": [
    "Add typical leads per week to enable lead forecasting",
    "Add close rate to calculate revenue projections",
    "Add 3-5 known competitors for competitive intelligence"
  ]
}
```

---

## Summary

**Phase 1 Architecture Highlights:**

1. **Business-Profile-First:** Owner input always wins over automation
2. **Confidence Tracking:** Every data point has source + confidence score
3. **Intelligent Filtering:** Exclude irrelevant competitors automatically
4. **Conflict Detection:** Flag discrepancies between profile and scraped data
5. **Completeness Scoring:** Weighted formula guides profile improvement
6. **Extensible Design:** Profile feeds into all future phases

**Key Design Principles:**

✅ Conservative with inference (ask when uncertain)
✅ Transparent about data sources (show where data came from)
✅ Action-oriented (suggestions, not just analysis)
✅ Contractor-friendly language (no jargon)
✅ Modular agents (each does one thing well)

---

**Next:** Phase 2 builds predictive lead intelligence on top of this foundation.
