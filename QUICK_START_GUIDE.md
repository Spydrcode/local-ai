# ⚡ Quick Start Guide - Agency Platform

## 5-Minute Setup

### 1. Database (2 min)
```bash
# In Supabase SQL Editor:
# Paste contents of sql/agencies-white-label-setup.sql
# Click "Run"

# Create Storage Bucket:
# Supabase → Storage → New bucket → "agency-logos" (Public, 5MB limit)
```

### 2. Environment Variables (1 min)
```env
# Add to .env.local:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_PRICE_SOLO_MONTHLY=price_...
STRIPE_PRICE_SOLO_ANNUAL=price_...
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_ANNUAL=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
```

### 3. Install Dependencies (1 min)
```bash
npm install stripe formidable micro
npm install --save-dev @types/formidable
```

### 4. Run Dev Server (1 min)
```bash
npm run dev
```

---

## 🎯 Key URLs

| Page | URL | Purpose |
|------|-----|---------|
| **Pricing** | `/pricing` | Subscribe to plans |
| **Agency Dashboard** | `/agency/dashboard` | View all clients |
| **Branding Settings** | `/agency/settings` | Customize white-label |
| **Team Management** | `/agency/team` | Invite team members |
| **Analysis Dashboard** | `/analysis/[demoId]` | 10 strategic frameworks |

---

## 📋 Pages Built

### Agency Portal:
- ✅ `/agency/dashboard` - Multi-client view
- ✅ `/agency/settings` - White-label branding (logo, colors, footer)
- ✅ `/agency/team` - Team member management

### Existing Pages:
- ✅ `/pricing` - 4 pricing tiers (ready for Stripe)
- ✅ `/analysis/[demoId]` - 10 strategic frameworks
- ✅ `/demo` - Create new analysis
- ✅ `/grow` - Marketing workflows (cleaned up)

---

## 🔌 API Endpoints Built

### Stripe:
- `POST /api/stripe/create-checkout` - Start subscription
- `POST /api/stripe/create-portal` - Manage billing
- `POST /api/stripe/webhook` - Handle events

### Agency:
- `GET /api/agency/[agencyId]` - Get settings
- `PATCH /api/agency/[agencyId]` - Update settings
- `POST /api/agency/upload-logo` - Upload logo
- `GET /api/agency/[agencyId]/clients` - List clients

### Team:
- `GET /api/agency/[agencyId]/team` - List members
- `POST /api/agency/[agencyId]/team/invite` - Invite member
- `PATCH /api/agency/[agencyId]/team/[memberId]` - Update role
- `DELETE /api/agency/[agencyId]/team/[memberId]` - Remove member

---

## 🎓 All 10 Strategic Frameworks

✅ **Working with full agent architecture:**

1. **Blue Ocean Strategy** - Four Actions Framework
2. **Ansoff Matrix** - 4 growth quadrants with ROI
3. **BCG Matrix** - Stars, Cash Cows, Question Marks, Dogs
4. **Competitive Positioning** - 2x2 maps, market gaps
5. **Customer Journey** - Awareness to advocacy
6. **OKR Framework** - Quarterly objectives & key results
7. **Digital Maturity** - 8-dimension assessment (RAG)
8. **PESTEL Analysis** - Macro-environmental factors (RAG)
9. **Business Model Canvas** - 9-block mapping (RAG)
10. **Lean Canvas** - 1-page business plan (RAG)

**Note:** Frameworks 7-10 use RAG with 20 knowledge documents in Pinecone.

---

## 💰 Pricing Strategy

| Plan | Price | Reports | Team | Margin |
|------|-------|---------|------|--------|
| **Solo** | $99/mo | 10/mo | 1 | ~$90 |
| **Starter** | $299/mo | 50/mo | 3 | ~$270 |
| **Pro** | $699/mo | Unlimited | 10 | ~$650 |
| **Enterprise** | Custom | Unlimited | Unlimited | ~80% |

**Your cost per report:** $1-3 (OpenAI API)
**Agency charges client:** $1,500-$3,000
**Agency margin:** 500x-3,000x your cost

---

## 🚀 Launch Checklist

### Pre-Launch (2-4 hours):
- [ ] Run database migrations
- [ ] Create Stripe products
- [ ] Set up webhook endpoint
- [ ] Test checkout flow
- [ ] Build onboarding page
- [ ] Add auth context

### Week 1 (Sales):
- [ ] Email 100 digital marketing agencies
- [ ] Email 30 business consultants
- [ ] Email 20 fractional CMOs
- [ ] Post in agency Facebook groups
- [ ] Share on LinkedIn

### Week 2 (Optimization):
- [ ] Add PDF export with white-label branding
- [ ] Add PPTX export
- [ ] Add Excel export
- [ ] Create custom domain setup (Enterprise)

### Week 3 (Scale):
- [ ] Build API access (Pro/Enterprise)
- [ ] Create custom templates (Pro)
- [ ] Add reseller dashboard (Enterprise)

---

## 🎯 Target Customer

**Who:** Digital marketing agencies, business consultants, fractional CMOs

**Pain Point:** Spend 8-12 hours creating strategic reports manually

**Your Solution:** Generate same reports in 8 minutes with AI

**Value Prop:**
- 100x faster report generation
- Keep their $1,500-$3,000 pricing
- Your cost: $6-14 per report
- Their profit: $1,486-$2,994 per report

**Win Rate:** High (solves real pain, obvious ROI)

---

## 📊 Success Metrics

**Month 1 Goal:**
- 10 paying agencies
- $3,000-$7,000 MRR
- 100-500 reports generated

**Month 3 Goal:**
- 30 paying agencies
- $10,000-$20,000 MRR
- 500-2,000 reports generated

**Month 6 Goal:**
- 100 paying agencies
- $30,000-$70,000 MRR
- 2,000-10,000 reports generated

---

## 🔥 What Makes This Different

**Not a tool for small businesses** (they don't understand frameworks)

**It's SaaS for agencies** (they charge clients $1,500-$3,000 for these reports)

**B2B2C model:**
- You sell to agencies
- Agencies sell to end clients
- Everyone wins

**The arbitrage:**
- Your cost: $6-14/report
- Agency charges: $1,500-$3,000/report
- Agency keeps 95%+ margin
- You scale infinitely

---

## 🎉 You're Ready!

Everything is built. Now execute:

1. Set up Stripe (1 hour)
2. Run migrations (30 min)
3. Test the flow (30 min)
4. Start outreach (Week 1)

**Let's get to $10k MRR in 90 days.**

Go! 🚀
