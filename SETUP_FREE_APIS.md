# Free APIs Setup (No Credit Card Required)

These APIs enhance your business intelligence without requiring payment methods.

## 1. Google PageSpeed Insights API ✅ RECOMMENDED

**What it does:** Real performance scores, Core Web Vitals, mobile usability

**Free tier:** Unlimited requests, completely free

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project (or use existing)
3. Enable "PageSpeed Insights API"
4. Create API key
5. Restrict key to PageSpeed API only

**Add to `.env.local`:**
```bash
GOOGLE_PAGESPEED_API_KEY=AIzaSy...your-key-here
```

**No credit card required!** ✅

---

## 2. OpenPageRank API ✅ RECOMMENDED

**What it does:** Domain authority scores (free alternative to Moz)

**Free tier:** 1,000 requests/month (resets monthly)

**Setup:**
1. Go to [https://www.domcop.com/openpagerank/](https://www.domcop.com/openpagerank/)
2. Sign up with email (no credit card)
3. Get free API key from dashboard
4. View usage at [https://www.domcop.com/openpagerank/api](https://www.domcop.com/openpagerank/api)

**Add to `.env.local`:**
```bash
OPENPAGERANK_API_KEY=your-key-here
```

**What you get:**
- Domain authority score (0-10)
- Page rank estimate
- No credit card needed!

---

## 3. Clearbit Logo API ✅ RECOMMENDED

**What it does:** Fetches company logos automatically

**Free tier:** Completely free, unlimited

**Setup:**
- **No signup required!**
- Just use: `https://logo.clearbit.com/{domain}`

**Example:**
```bash
# Get Google's logo
https://logo.clearbit.com/google.com

# Get any business logo
https://logo.clearbit.com/example.com
```

**Add to code:** Already included in data collectors!

---

## 4. Hunter.io Email Finder (Optional)

**What it does:** Finds business email addresses

**Free tier:** 50 searches/month (no credit card)

**Setup:**
1. Go to [https://hunter.io/](https://hunter.io/)
2. Sign up with email (no credit card)
3. Get API key from [https://hunter.io/api_keys](https://hunter.io/api_keys)

**Add to `.env.local`:**
```bash
HUNTER_API_KEY=your-key-here
```

**Use case:** Find contact emails for businesses we analyze

---

## 5. IPinfo.io Geolocation (Optional)

**What it does:** IP geolocation, business location verification

**Free tier:** 50,000 requests/month

**Setup:**
1. Go to [https://ipinfo.io/signup](https://ipinfo.io/signup)
2. Sign up with email (no credit card)
3. Get token from dashboard

**Add to `.env.local`:**
```bash
IPINFO_TOKEN=your-token-here
```

---

## Quick Start (Recommended Setup)

**5-Minute Setup:**
```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Set up Google PageSpeed (5 min)
# - Follow Google Cloud setup above
# - Add GOOGLE_PAGESPEED_API_KEY to .env.local

# 3. Set up OpenPageRank (2 min)
# - Sign up at domcop.com
# - Add OPENPAGERANK_API_KEY to .env.local

# 4. Done! Clearbit Logo API works automatically (no setup)
```

**Your `.env.local` should have:**
```bash
# Existing
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# New (all free, no credit card)
GOOGLE_PAGESPEED_API_KEY=AIzaSy...
OPENPAGERANK_API_KEY=...
```

---

## What This Adds to Your Platform

### Before (without these APIs):
```
❌ SEO scores: Estimated based on load time
❌ Domain authority: Not available
❌ Logos: Manual upload only
```

### After (with free APIs):
```
✅ SEO scores: Real Google metrics
✅ Domain authority: OpenPageRank score
✅ Logos: Auto-fetched from Clearbit
✅ Core Web Vitals: Real performance data
✅ Mobile usability: Actual Google assessment
```

---

## Testing Your Setup

```bash
# Test PageSpeed API
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://google.com&key=YOUR_PAGESPEED_KEY"

# Test OpenPageRank API
curl "https://openpagerank.com/api/v1.0/getPageRank?domains[0]=google.com" \
  -H "API-OPR: YOUR_OPR_KEY"

# Test Clearbit Logo (no auth needed)
curl "https://logo.clearbit.com/google.com"
```

Expected results:
- PageSpeed: JSON with lighthouseResult
- OpenPageRank: JSON with page_rank_decimal
- Clearbit: Returns PNG image

---

## Cost Comparison

| API | Free Tier | Credit Card? | Our Usage |
|-----|-----------|--------------|-----------|
| PageSpeed | Unlimited | ❌ No | ~2 req/analysis |
| OpenPageRank | 1,000/month | ❌ No | ~1 req/analysis |
| Clearbit Logo | Unlimited | ❌ No | ~1 req/analysis |
| **Total Cost** | **$0/month** | **❌ No cards needed** | **~1,000 analyses/month FREE** |

Compare to paid alternatives:
- Moz API: $99/month for domain authority
- Google Places: Requires credit card
- Custom logo hosting: $5-20/month

**You're getting $100+/month value for $0!** 🎉

---

## Rate Limiting & Best Practices

Our data collectors already handle:
- ✅ Automatic caching (5 min TTL)
- ✅ Graceful fallbacks if API fails
- ✅ Error handling
- ✅ Retry logic

**You just add the API keys and it works!**

---

## Next Steps

1. Set up PageSpeed API (5 min) - See instructions above
2. Set up OpenPageRank (2 min) - Quick signup
3. Test with: `npm run dev` then call `/api/analyze`
4. Check logs to see real API data flowing in!

Your platform now has **real SEO metrics and domain authority** without paying anything or adding credit cards. 🚀
