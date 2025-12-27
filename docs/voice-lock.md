# Voice & Tone Guardrails

**Last Updated:** December 27, 2024  
**Purpose:** Maintain consistent, authentic voice across all user-facing surfaces

---

## Core Principle: "Quiet Founder" Tone

We speak to serious small business owners who are tired of hype and want straightforward tools that actually help.

### What This Means

**Confident, not cocky**
- ✅ "See exactly what's working and what to fix"
- ❌ "Get INSTANT insights that will EXPLODE your business!"

**Helpful, not pushy**
- ✅ "Optional: Add your website for deeper analysis"
- ❌ "Enter your website NOW to unlock premium insights!"

**Direct, not vague**
- ✅ "Your Google listing is missing 3 key business details"
- ❌ "There are some issues we discovered with your online presence"

---

## Product Framing

### Primary Product: Clarity Snapshot

**What it is:** A free business analysis tool that scans Google Business listings and websites to surface actionable priorities.

**How we describe it:**
- ✅ "Free Clarity Snapshot"
- ✅ "See exactly what's working, what's not, and what to fix first"
- ✅ "No signup required"
- ✅ "Get your priorities in 60 seconds"

**What we NEVER say:**
- ❌ "Free audit" (sounds like bait)
- ❌ "Instant report" (creates false urgency)
- ❌ "Unlock insights" (implies gating)
- ❌ "Free trial" (implies it becomes paid)

### Secondary Product: Agency Tools

**What it is:** A white-label platform for agencies to deliver branded analyses to their clients.

**How we describe it:**
- ✅ "Free tools for agencies managing small business clients"
- ✅ "Deliver branded reports under your agency name"
- ✅ "No per-seat pricing"

**What we avoid:**
- ❌ "Plans starting at..."
- ❌ "Upgrade to pro"
- ❌ "Limited time offer"

---

## Prohibited Patterns

### 🚫 Forced Email Capture

**NEVER require an email to see results.**

Why: Trust erosion. Users came for a tool, not a newsletter signup form disguised as value.

**Bad Example:**
```
"Enter your email to get your free report!"
```

**Good Alternative:**
```
[Show results immediately]

At bottom: "Want these insights via email? (Optional)"
```

### 🚫 Fake Urgency

**NEVER use time pressure or scarcity tactics.**

Why: We're building trust with deliberate business owners, not exploiting FOMO.

**Bad Examples:**
- "Only 3 spots left!"
- "Offer expires in 24 hours!"
- "Limited beta access!"
- "Join 10,000+ founders!" (social proof as urgency)

**Good Alternative:**
```
"Start your free analysis" (no timer, no countdown)
```

### 🚫 Bait-and-Switch "Audits"

**NEVER offer a "free audit" that's really a sales call.**

Why: Undermines credibility. If we say "free analysis," we mean a real analysis, not a consultation booking form.

**Bad Pattern:**
```
"Get your free website audit!" 
→ [Form to book a call]
```

**Good Pattern:**
```
"Free Clarity Snapshot"
→ [Actual analysis results immediately]
→ [Optional: "Need help implementing? Book a call" at bottom]
```

### 🚫 Hustle Language

**NEVER use aggressive growth-hacking terminology.**

Why: Our audience is building real businesses, not chasing hacks.

**Avoid:**
- "Crushing it"
- "10x your revenue"
- "Growth hacks"
- "Game-changing"
- "Revolutionary"
- "Disruptive"

**Use Instead:**
- "Making progress"
- "Increase revenue"
- "Practical improvements"
- "Helpful"
- "Straightforward"
- "Clear"

### 🚫 Vague Value Props

**NEVER be unclear about what the user gets.**

Why: Clarity builds trust. Vagueness creates suspicion.

**Bad Example:**
```
"Discover powerful insights about your business"
```

**Good Example:**
```
"See 3-5 specific priorities ranked by impact:
- Missing contact details on your listing
- Website loads slowly on mobile
- No customer reviews in 6 months"
```

---

## Voice Checklist

Before publishing ANY user-facing copy, verify:

- [ ] **No forced email capture** - Results shown immediately, email optional
- [ ] **No urgency tactics** - No timers, countdowns, or "limited spots"
- [ ] **No bait language** - "Free audit" is banned unless it's a real, instant analysis
- [ ] **No hustle phrases** - Scan for "crushing it", "10x", "game-changing"
- [ ] **Specific, not vague** - Clear examples, not abstract promises
- [ ] **Helpful, not pushy** - Suggest, don't demand
- [ ] **Confident, not arrogant** - State facts, skip superlatives

---

## Examples in Practice

### ✅ Good: Landing Page Header

```
Clarity Snapshot

See exactly what's working, what's not, and what to fix first.

Free analysis • No signup required • Results in 60 seconds

[Business name] [City] [Start Analysis →]
```

**Why it works:**
- Direct value prop
- No gates or captures
- Specific timeframe (60 seconds)
- Calm, confident tone

### ❌ Bad: Landing Page Header

```
🚀 Get Your FREE Business Audit! 🚀

Discover the SECRET insights that could 10x your revenue!
Join 10,000+ founders crushing it with data-driven decisions!

⏰ LIMITED SPOTS - CLAIM YOURS NOW! ⏰

[Enter Email to Unlock Your Audit]
```

**What's wrong:**
- Emojis create false urgency
- "Secret insights" is vague
- "10x revenue" is hype
- Email capture before value
- Fake scarcity ("limited spots")

### ✅ Good: Results Page CTA

```
[Analysis results displayed in full]

---

Need help implementing these changes?

[Book a Strategy Call]

30 minutes • No pressure • Just helpful advice
```

**Why it works:**
- Results shown first, CTA at bottom
- Transparent about what the call is
- "No pressure" reduces friction
- Optional, not forced

### ❌ Bad: Results Page CTA

```
🔒 UNLOCK FULL ANALYSIS

You've seen 20% of your insights. Enter your email to unlock the complete report and discover the game-changing opportunities we found!

[Enter Email to Continue]

⏰ Offer expires in 15 minutes
```

**What's wrong:**
- Gates the actual value
- "Game-changing" is hype
- Fake time pressure
- Bait-and-switch (promised free analysis)

---

## API/Backend Copy

Even error messages and system responses follow these principles:

### ✅ Good Error Messages

```
"Could not find a Google Maps listing for that business. 
Try checking the spelling or searching on Google Maps first."
```

**Why:** Helpful, specific guidance

### ❌ Bad Error Messages

```
"Oops! Something went wrong. 😅"
```

**Why:** Unhelpful, uses emoji to mask poor UX

---

## Loading States

**Good:**
```
Finding your listing...
Scanning website...
Analyzing business details...
Generating priorities...
```

**Why:** Shows real progress, builds trust

**Bad:**
```
Working our magic... ✨
Crunching the numbers... 🔢
Almost there... ⏳
```

**Why:** Cutesy language, emoji overuse, vague progress

---

## Enforcement

1. **Code Reviews:** Reject PRs with prohibited patterns
2. **Design Reviews:** Flag mockups with urgency/gate tactics
3. **Copywriting:** Run all user-facing text through this checklist
4. **Testing:** User test for "bait-and-switch" perception

---

## When in Doubt

Ask: **"Would I trust this if I saw it on a competitor's site?"**

If it feels like:
- A trick to get my email
- Fake urgency to pressure a decision
- Vague promises without specifics
- Hustle-bro energy

Then rewrite it.

---

## Voice Examples by Component

### Button Labels

✅ Good:
- "Start Analysis"
- "See Results"
- "Book a Call"
- "Analyze Another Business"

❌ Bad:
- "Unlock Insights!"
- "Claim Your Spot!"
- "Get Started NOW!"
- "Crush It →"

### Form Field Labels

✅ Good:
- "Business name"
- "City or state"
- "Website (optional)"

❌ Bad:
- "Company name*" (asterisk creates anxiety)
- "Location (Required to unlock)"
- "Email address for your FREE report"

### Progress Indicators

✅ Good:
- "Step 1 of 3"
- "Finding listing..."
- "Analysis complete"

❌ Bad:
- "🎉 Almost there!"
- "You're on fire! One more step!"
- "Loading your INCREDIBLE insights..."

---

## Revision History

- **Dec 27, 2024:** Initial voice lock document created
- Lock applies to: Clarity Snapshot, Agency Portal, all marketing surfaces

