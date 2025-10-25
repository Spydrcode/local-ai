# Social Media Multi-Agent Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Social Media Generation                      │
│                     Multi-Agent System                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Context Enrichment                                     │
├─────────────────────────────────────────────────────────────────┤
│  • Fetch demo data from Supabase                                │
│  • Vector search for business-specific insights (Top-5)         │
│  • Combine: demo.summary + vector context                       │
│  • Platform specifications lookup                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Parallel Agent Processing (3 Post Types)               │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   Promotional          Engagement            Educational
   Post Type            Post Type             Post Type
        │                     │                     │
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │   Sequential Agent Pipeline          │
        │   (for each post type)               │
        └─────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent 1: Copy Agent                                            │
├─────────────────────────────────────────────────────────────────┤
│  Model: gpt-4o-mini                                             │
│  Temperature: 0.85 (high creativity)                            │
│  Max Tokens: 800                                                │
├─────────────────────────────────────────────────────────────────┤
│  Input:                                                         │
│    • Business context (demo + vector)                           │
│    • Platform specs (tone, length, features)                    │
│    • Post type (promotional/engagement/educational)             │
├─────────────────────────────────────────────────────────────────┤
│  Processing:                                                    │
│    • Generate attention-grabbing hook                           │
│    • Write value-driven body content                            │
│    • Create specific, actionable CTA                            │
│    • Reference actual business offerings                        │
│    • Adapt style per platform                                   │
├─────────────────────────────────────────────────────────────────┤
│  Output:                                                        │
│    • mainCopy: Complete post text                               │
│    • hook: Opening line                                         │
│    • body: Middle content                                       │
│    • cta: Call-to-action                                        │
│    • characterCount: Length                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent 2: Style Agent                                           │
├─────────────────────────────────────────────────────────────────┤
│  Model: gpt-4o-mini                                             │
│  Temperature: 0.7 (balanced strategy)                           │
│  Max Tokens: 600                                                │
├─────────────────────────────────────────────────────────────────┤
│  Input:                                                         │
│    • Business context                                           │
│    • Generated copy from Agent 1                                │
│    • Platform specs (hashtag limit, tone)                       │
├─────────────────────────────────────────────────────────────────┤
│  Processing:                                                    │
│    • Research trending hashtags                                 │
│    • Select niche industry tags                                 │
│    • Add branded/local tags                                     │
│    • Calculate optimal posting time                             │
│    • Generate 3 engagement tactics                              │
├─────────────────────────────────────────────────────────────────┤
│  Output:                                                        │
│    • hashtags: Strategic tag list                               │
│    • formatting: Line breaks, structure                         │
│    • bestTimeToPost: Industry + platform timing                 │
│    • engagementTips: 3 actionable tactics                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Agent 3: Emoji Agent                                           │
├─────────────────────────────────────────────────────────────────┤
│  Model: gpt-4o-mini                                             │
│  Temperature: 0.75 (moderate creativity)                        │
│  Max Tokens: 500                                                │
├─────────────────────────────────────────────────────────────────┤
│  Input:                                                         │
│    • Business context                                           │
│    • Generated copy from Agent 1                                │
│    • Brand tone (professional/casual)                           │
├─────────────────────────────────────────────────────────────────┤
│  Processing:                                                    │
│    • Analyze brand professionalism level                        │
│    • Select platform-appropriate emojis                         │
│    • Determine strategic placement                              │
│    • Consider cultural sensitivity                              │
│    • Balance readability vs personality                         │
├─────────────────────────────────────────────────────────────────┤
│  Output:                                                        │
│    • emojis: List of selected emojis                            │
│    • placement: Inline positions + ending                       │
│    • strategy: Rationale for selections                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Result Combination                                     │
├─────────────────────────────────────────────────────────────────┤
│  Merge outputs from all 3 agents:                               │
│                                                                 │
│  SocialPost = {                                                 │
│    id: unique-id,                                               │
│    platform: Facebook/Instagram/LinkedIn/Twitter,               │
│    content: Copy Agent → mainCopy,                              │
│    hashtags: Style Agent → hashtags,                            │
│    emojis: Emoji Agent → emojis.join(" "),                      │
│    cta: Copy Agent → cta,                                       │
│    characterCount: Copy Agent → characterCount,                 │
│    bestTimeToPost: Style Agent → bestTimeToPost,                │
│    engagementTips: Style Agent → engagementTips                 │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Return Results                                         │
├─────────────────────────────────────────────────────────────────┤
│  • 3 post variations (promotional, engagement, educational)     │
│  • Each with full metadata                                      │
│  • Store in Supabase if regenerate=true                         │
│  • Return to client for display                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Agent Comparison Table

| Aspect               | Copy Agent              | Style Agent            | Emoji Agent           |
| -------------------- | ----------------------- | ---------------------- | --------------------- |
| **Primary Focus**    | Writing compelling copy | Hashtags & engagement  | Emoji strategy        |
| **Temperature**      | 0.85 (highest)          | 0.70 (balanced)        | 0.75 (moderate)       |
| **Max Tokens**       | 800 (longest)           | 600 (medium)           | 500 (shortest)        |
| **Key Output**       | mainCopy, hook, CTA     | hashtags, posting time | emoji list, placement |
| **Creativity Level** | High                    | Strategic              | Moderate              |
| **Business Context** | Deep integration        | Moderate               | Light                 |
| **Platform Rules**   | Tone, length            | Hashtag limits         | Usage norms           |

## Execution Flow

### Timing Breakdown

```
Total Time: ~6-9 seconds for 3 variations

┌─────────────────────────────────────────────────┐
│ Context Enrichment: ~1-2s                       │
│  └─ Vector search + data fetch                  │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ Parallel Processing: ~5-7s                      │
│                                                 │
│  Variation 1 ────┐                              │
│  (Promotional)   │                              │
│    ├─ Copy: 2-3s │                              │
│    ├─ Style: 1-2s│────┐                         │
│    └─ Emoji: 1s  │    │                         │
│                  │    │                         │
│  Variation 2 ────┤    │                         │
│  (Engagement)    │    │ Parallel                │
│    ├─ Copy: 2-3s │────┤ Execution               │
│    ├─ Style: 1-2s│    │ (Promise.all)           │
│    └─ Emoji: 1s  │    │                         │
│                  │    │                         │
│  Variation 3 ────┤    │                         │
│  (Educational)   │    │                         │
│    ├─ Copy: 2-3s │    │                         │
│    ├─ Style: 1-2s│────┘                         │
│    └─ Emoji: 1s  │                              │
└─────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────┐
│ For Each Post Type:                         │
│   try {                                     │
│     ├─ Call Copy Agent                      │
│     ├─ Call Style Agent                     │
│     ├─ Call Emoji Agent                     │
│     └─ Combine → return post                │
│   } catch {                                 │
│     └─ return null                          │
│   }                                         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ Filter Results:                             │
│   results.filter(post => post !== null)     │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ Validation:                                 │
│   if (variations.length === 0) {            │
│     throw Error("No valid posts")           │
│   }                                         │
└─────────────────────────────────────────────┘
```

## Platform-Specific Processing

### Facebook

```
Copy Agent:
  └─ Conversational tone, storytelling
  └─ 80-300 characters

Style Agent:
  └─ 1-3 hashtags max
  └─ Thu-Fri 11am-1pm posting time

Emoji Agent:
  └─ Moderate use (2-4 emojis)
  └─ Community-focused selections
```

### Instagram

```
Copy Agent:
  └─ Visual-first, aspirational
  └─ 125-150 characters optimal

Style Agent:
  └─ 5-10 hashtags (trending + niche)
  └─ Mon-Fri 11am-2pm posting time

Emoji Agent:
  └─ Liberal use (4-8+ emojis)
  └─ Line breaks for visual rhythm
```

### LinkedIn

```
Copy Agent:
  └─ Professional, thought-leadership
  └─ 150-300 characters

Style Agent:
  └─ 3-5 strategic hashtags
  └─ Tue-Thu 7-9am posting time

Emoji Agent:
  └─ Minimal use (0-3 emojis)
  └─ Professional symbols only (✓, →, •)
```

### Twitter/X

```
Copy Agent:
  └─ Concise, timely
  └─ 100-200 characters

Style Agent:
  └─ 1-2 hashtags max
  └─ Mon-Fri 9am-3pm posting time

Emoji Agent:
  └─ Strategic use (1-3 emojis)
  └─ Space-efficient placement
```

## Quality Assurance Checks

```
┌─────────────────────────────────────────────┐
│ After Each Agent:                           │
├─────────────────────────────────────────────┤
│ ✓ Valid JSON response?                      │
│ ✓ Required fields present?                  │
│ ✓ Character limits respected?               │
│ ✓ Platform rules followed?                  │
│ ✓ Business specificity achieved?            │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ Final Validation:                           │
├─────────────────────────────────────────────┤
│ ✓ All 3 agents completed successfully?      │
│ ✓ Content + hashtags + emojis combined?     │
│ ✓ Total character count within limits?      │
│ ✓ CTA present and specific?                 │
│ ✓ No generic/template language?             │
└─────────────────────────────────────────────┘
```

## Benefits of Multi-Agent Architecture

### 1. Separation of Concerns

- Each agent has single responsibility
- Easier to debug and improve
- Can swap/upgrade agents independently

### 2. Higher Quality Output

- Specialized prompts → better results
- Each aspect gets full attention
- No competing priorities in prompts

### 3. Maintainability

- Agents can be tested independently
- Prompts easier to refine
- Clear boundaries and interfaces

### 4. Scalability

- Easy to add new agents (e.g., Image Agent)
- Can parallelize for speed
- Individual agent improvements benefit all

### 5. Flexibility

- Can skip agents if not needed
- Different agent combinations per platform
- A/B test individual agents

---

**Architecture Type:** Multi-Agent Collaborative System
**Execution Model:** Parallel + Sequential Hybrid
**Quality Focus:** Specialized expertise per domain
**Performance:** 6-9 seconds for 3 production-ready variations
