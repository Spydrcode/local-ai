# Clarity Snapshot

**Frictionless business analysis for owners without complete online presence**

Clarity Snapshot is a selection-based analysis path that produces recognition-first insights for businesses with:
- No website
- Incomplete or outdated website
- Only social media presence
- Only Google Business Profile
- Minimal online visibility

## Features

✅ **No long forms** - Selection-based intake only  
✅ **Fast response** - < 100ms classification, < 2s total with AI panes  
✅ **Works offline** - No website required  
✅ **Recognition-first** - "What's happening" before "what to do"  
✅ **Non-breaking** - Additive module, doesn't touch existing Local AI flows  

## Architecture

```
POST /api/clarity-snapshot
  │
  ├─> SignalScorer (deterministic, <50ms)
  │   ├─> Weight tables for each selection
  │   ├─> Stage classification (operator/transitional/managed)
  │   ├─> Archetype probabilities (8 archetypes)
  │   └─> Confidence score (0-100)
  │
  ├─> Optional Enrichment (non-blocking, 5s timeout)
  │   ├─> Website snippet extraction
  │   ├─> Google Business Profile snippet
  │   └─> Social media presence detection
  │
  └─> ClaritySnapshotAgent (LLM)
      ├─> Pane A: What's Actually Happening (3 bullets)
      ├─> Pane B: What This Is Costing (2-3 bullets)
      ├─> Pane C: What to Fix First (1-2 actions)
      └─> Optional: Correction Prompt (if confidence < 65%)
```

## API Usage

### Request Format

```typescript
POST /api/clarity-snapshot
Content-Type: application/json

{
  "selections": {
    // Step 1: Where customers find you (multi-select)
    "presenceChannels": ["website", "google_reviews", "social", "word_of_mouth", "messy_unsure"],
    
    // Step 2: Team structure
    "teamShape": "solo_or_one_helper" | "small_crew_2_5" | "growing_6_15" | "office_plus_field" | "fluctuates",
    
    // Step 3: How you handle operations
    "scheduling": "head_notebook" | "texts_calls" | "calendar_app" | "job_software" | "someone_else",
    "invoicing": "paper_verbal" | "quickbooks_invoicing_app" | "job_software" | "inconsistent",
    "callHandling": "personal_phone" | "business_phone" | "missed_calls_often" | "someone_screens",
    
    // Step 4: What's most true lately
    "businessFeeling": "busy_no_progress" | "stuck_in_day_to_day" | "dont_trust_numbers" | "reactive_all_the_time" | "something_off_cant_name"
  },
  
  // Optional: for enrichment
  "businessName": "Acme Plumbing",
  "websiteUrl": "https://example.com",
  "googleBusinessUrl": "https://g.page/...",
  "socialUrl": "https://facebook.com/...",
  
  // Optional: for caching
  "businessId": "biz_123"
}
```

### Response Format

```typescript
{
  "panes": {
    "whatsHappening": [
      "All decisions and calls go through you",
      "Working harder but revenue stays flat",
      "Can't take time off without business stopping"
    ],
    "whatItCosts": [
      "Revenue ceiling around what one person can do",
      "No time for growth activities (marketing, sales calls)"
    ],
    "whatToFixFirst": [
      "Start tracking where your time actually goes for one week"
    ],
    // Only if confidence < 65%
    "correctionPrompt": {
      "question": "Which describes your situation better?",
      "optionA": "All decisions go through you and you're always reactive",
      "optionB": "You have a team but don't see what's happening in the business"
    }
  },
  
  "classification": {
    "stage": "operator",
    "topArchetype": "reactive_solo_operator",
    "runnerUpArchetype": "growing_without_systems",
    "archetypeProbabilities": {
      "reactive_solo_operator": 0.52,
      "growing_without_systems": 0.18,
      "tool_heavy_insight_light": 0.09,
      // ... all 8 archetypes
    },
    "confidence": 72,
    "keyFlags": [
      "solo_operator",
      "no_system",
      "manual_invoicing",
      "owner_bottleneck"
    ],
    "evidenceStrength": 0.8
  },
  
  "evidenceNuggets": [
    {
      "source": "website",
      "snippet": "Family-owned plumbing since 1998 - 24/7 emergency service",
      "relevance": "high"
    }
  ],
  
  "metadata": {
    "executionTimeMs": 1847,
    "scoringTimeMs": 23,
    "enrichmentTimeMs": 1204,
    "cacheHit": false,
    "version": "1.0.0"
  }
}
```

## Example Requests

### Solo Operator, Reactive Mode

```bash
curl -X POST http://localhost:3000/api/clarity-snapshot \
  -H "Content-Type: application/json" \
  -d '{
    "selections": {
      "presenceChannels": ["word_of_mouth"],
      "teamShape": "solo_or_one_helper",
      "scheduling": "head_notebook",
      "invoicing": "paper_verbal",
      "callHandling": "personal_phone",
      "businessFeeling": "reactive_all_the_time"
    }
  }'
```

**Expected Classification:** `reactive_solo_operator`, operator stage, high confidence

---

### Growing Team, No Systems

```bash
curl -X POST http://localhost:3000/api/clarity-snapshot \
  -H "Content-Type: application/json" \
  -d '{
    "selections": {
      "presenceChannels": ["website", "word_of_mouth"],
      "teamShape": "small_crew_2_5",
      "scheduling": "texts_calls",
      "invoicing": "inconsistent",
      "callHandling": "business_phone",
      "businessFeeling": "stuck_in_day_to_day"
    },
    "businessName": "ABC Construction",
    "websiteUrl": "https://example.com"
  }'
```

**Expected Classification:** `growing_without_systems`, transitional stage

---

### Tools But No Insight

```bash
curl -X POST http://localhost:3000/api/clarity-snapshot \
  -H "Content-Type: application/json" \
  -d '{
    "selections": {
      "presenceChannels": ["website", "google_reviews"],
      "teamShape": "growing_6_15",
      "scheduling": "job_software",
      "invoicing": "job_software",
      "callHandling": "someone_screens",
      "businessFeeling": "dont_trust_numbers"
    }
  }'
```

**Expected Classification:** `tool_heavy_insight_light`, transitional/managed stage

---

### Marketing Works, Ops Don't

```bash
curl -X POST http://localhost:3000/api/clarity-snapshot \
  -H "Content-Type: application/json" \
  -d '{
    "selections": {
      "presenceChannels": ["website", "social", "google_reviews"],
      "teamShape": "small_crew_2_5",
      "scheduling": "calendar_app",
      "invoicing": "quickbooks_invoicing_app",
      "callHandling": "missed_calls_often",
      "businessFeeling": "reactive_all_the_time"
    }
  }'
```

**Expected Classification:** `marketing_led_chaos`, transitional stage

## Archetypes

The system classifies businesses into 8 operational archetypes:

1. **Reactive Solo Operator** - One person doing everything, always in reactive mode
2. **Growing Without Systems** - Adding team/work but no consistent processes
3. **Tool Heavy, Insight Light** - Using software but not tracking/acting on data
4. **Delegation Without Visibility** - Team handles operations but owner is blind
5. **Marketing Led Chaos** - Leads coming in but can't handle them well
6. **Busy Professionalized But Blind** - Structured team but no clear business health picture
7. **Inconsistent Process, Inconsistent Cash** - Feast-or-famine revenue cycles
8. **Stable But Stagnant** - Comfortable but flat growth for 2+ years

## Stages

Three operational stages:

- **Operator** - Owner does most work, decisions flow through them
- **Transitional** - Building team/systems, partially delegated
- **Managed** - Team runs operations, owner has visibility and leverage

## Performance

- **Scoring:** < 50ms (deterministic weight tables)
- **Enrichment:** < 5s (non-blocking, optional)
- **Agent panes:** 1-2s (LLM call)
- **Total:** ~2s end-to-end without enrichment, ~7s with enrichment
- **Caching:** 24h TTL, LRU with 100 entry limit

## Integration with Existing Local AI

Clarity Snapshot is **completely additive** and does not modify existing Local AI flows:

- ✅ Existing `/api/analyze` endpoint unchanged
- ✅ Existing agents (StrategicGrowthAgent, MarketingContentAgent) unchanged
- ✅ Existing AnalysisResult schema unchanged
- ✅ New route `/api/clarity-snapshot` runs independently
- ✅ Can be used before or after full Local AI analysis
- ✅ Can be cached separately

## Testing

Run tests:

```bash
npm test tests/clarity-snapshot.test.ts
```

Tests cover:
- Archetype classification accuracy
- Stage identification
- Confidence calculation
- Evidence strength boosting
- Performance (<50ms scoring)
- Edge cases (minimal selections, all channels, etc.)

## File Structure

```
lib/
├── types/
│   └── clarity-snapshot.ts          # All TypeScript interfaces
├── clarity-snapshot/
│   ├── index.ts                      # Module exports
│   ├── signal-scorer.ts              # Deterministic classifier
│   ├── clarity-snapshot-agent.ts     # LLM pane generation
│   └── enrichment.ts                 # Optional evidence extraction
app/
└── api/
    └── clarity-snapshot/
        └── route.ts                  # API endpoint
tests/
└── clarity-snapshot.test.ts          # Test suite
```

## Caching

Responses are cached by a hash of:
- All selection answers
- Optional URLs (website, GBP, social)
- Business ID (if provided)

Cache can be cleared:

```bash
curl -X DELETE http://localhost:3000/api/clarity-snapshot
```

## Future Enhancements

- [ ] Support for correction loop (user selects optionA/B, re-score)
- [ ] Multi-language support for panes
- [ ] A/B testing different archetype profiles
- [ ] Integration with existing demo/client records
- [ ] Export to PDF with archetype visualization
- [ ] Time-series tracking (how classifications change over time)
- [ ] Benchmarking against similar businesses

## Support

For questions or issues with Clarity Snapshot, check:

1. API logs: `console.log('[Clarity Snapshot]')`
2. Test suite: `npm test tests/clarity-snapshot.test.ts`
3. Source code comments in each module

## License

Same as Local AI project.
