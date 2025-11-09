# Google APIs Setup Guide

This guide will help you set up the free Google APIs needed for real business intelligence data collection.

## Overview

We use these Google APIs (all have generous FREE tiers):
- **Google Places API** - Competitor discovery, reviews, business data
- **Google PageSpeed Insights API** - SEO performance metrics
- **Google My Business API** - Auto-posting to GMB (Phase 4)

## Important: Do You Need a Credit Card?

**Short Answer: Only if you want Places API (competitor discovery + reviews)**

### Two Setup Options:

**Option A: No Credit Card (Recommended to Start)**
- ✅ PageSpeed Insights API - Free, no billing required
- ✅ Your agent infrastructure works fully
- ✅ Website scraping and SEO analysis
- ❌ No Google Places (competitor discovery, reviews)
- **Setup time: 5 minutes**

**Option B: With Credit Card (For Full Features)**
- ✅ Everything in Option A
- ✅ Google Places API (competitor data + reviews)
- ⚠️ Requires payment method (won't charge unless you exceed free tier)
- **Setup time: 10 minutes + billing setup**

### Which Should You Choose?

**Start with Option A if:**
- You want to test the system first
- You don't want to add a credit card
- You're okay with basic competitor analysis (web scraping only)

**Upgrade to Option B when:**
- You've tested and like the platform
- You want real Google reviews data
- You want better competitor discovery
- You're comfortable setting billing alerts

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing:
   - Click project dropdown → "New Project"
   - Name: "Local AI - Business Intelligence"
   - Click "Create"

## Step 2: Enable APIs (Choose Your Option)

1. Go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Enable these APIs:

### Option A: PageSpeed Only (No Credit Card)
**PageSpeed Insights API**
- Search for "PageSpeed Insights API"
- Click "Enable"
- **Free tier**: Unlimited, completely free
- **Billing required**: NO ✅

### Option B: Full Features (Credit Card Required)
**Places API** (in addition to PageSpeed)
- Search for "Places API"
- Click "Enable"
- **Free tier**: $200/month (~11,765 requests)
- **Billing required**: YES ⚠️
- You'll be prompted to set up billing before using

## Step 3: Create API Key

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API Key"
3. **IMPORTANT**: Restrict your API key for security

### Restrict API Key:
1. Click "Edit API key" (pencil icon)
2. Under "API restrictions":
   - Select "Restrict key"
   - Check:
     - ✅ Places API
     - ✅ PageSpeed Insights API
3. Under "Application restrictions":
   - Select "HTTP referrers" for web apps
   - OR "IP addresses" for server-side only
   - Add your domain(s) or server IPs
4. Click "Save"

## Step 4: Add to Environment Variables

Copy your API key and add to `.env.local`:

```bash
# Google Places API
GOOGLE_PLACES_API_KEY=AIzaSy...your-key-here

# Google PageSpeed API (can use same key)
GOOGLE_PAGESPEED_API_KEY=AIzaSy...your-key-here
```

## Step 5: Test API Access

Run this test to verify your APIs are working:

```bash
# Test Places API
curl "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=starbucks&inputtype=textquery&fields=place_id,name&key=YOUR_API_KEY"

# Test PageSpeed API
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com&key=YOUR_API_KEY"
```

Expected responses:
- Places API: JSON with candidates array
- PageSpeed API: JSON with lighthouseResult

## Cost Monitoring (March 2025 Update)

### Free Tier Limits (NEW as of March 2025):
- **Places API**: **$200/month FREE** (instead of monthly credit)
  - = ~11,765 free requests/month ($17 per 1,000 requests)
  - Each business analysis uses ~3-5 requests
  - **Supports ~2,300-3,900 analyses/month FREE**

- **PageSpeed API**: **100% FREE** - Unlimited requests
  - No cost whatsoever
  - Each analysis uses 2 requests (mobile + desktop)

### How to NEVER Be Charged:

**Option 1: Don't Enable Billing (Recommended for MVP)**
1. In Google Cloud Console, go to [Billing](https://console.cloud.google.com/billing)
2. **Do NOT add a payment method**
3. Result: APIs stop working after free tier (no surprise charges)

**Option 2: Enable Billing with Hard Cap**
1. Add payment method (required for free tier as of March 2025)
2. Set up budget alerts **with automatic shutoff**:
   - Go to [Billing > Budgets & alerts](https://console.cloud.google.com/billing/budgets)
   - Create budget: $5/month (very conservative)
   - Alert at: 50%, 90%, 100%
   - **Enable "Stop billing when budget exceeded"** (if available in your region)

**Option 3: Request Quotas to Match Free Tier**
1. Go to [APIs & Services > Quotas](https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas)
2. Find "Requests per month"
3. Click "Edit Quotas"
4. Set limit to **11,765 requests/month** (= $200 worth)
5. This creates a hard stop at free tier limit

### Cost Optimization Tips:
- Enable caching (already implemented - 5 min TTL)
- Use competitor discovery sparingly (most expensive operation)
- Batch requests when possible
- Monitor usage in [APIs & Services > Dashboard](https://console.cloud.google.com/apis/dashboard)

## Troubleshooting

### Error: "API key not valid"
- Check API is enabled in Google Cloud Console
- Verify API key restrictions allow your app/IP
- Make sure billing is enabled (required even for free tier)

### Error: "Quota exceeded"
- Check [Quotas page](https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas)
- Request quota increase (usually approved immediately)
- Implement rate limiting in your app

### Error: "PERMISSION_DENIED"
- API key restrictions too strict
- Add your domain/IP to allowed list
- Check billing account is active

## Phase 4: Google My Business API (Future)

For automated GMB posting, you'll need OAuth2 setup:

1. Create OAuth 2.0 Client ID in Google Cloud Console
2. Configure consent screen
3. Add scopes: `https://www.googleapis.com/auth/business.manage`
4. Implement OAuth flow in your app
5. Store refresh tokens securely

This is more complex - see [GMB API docs](https://developers.google.com/my-business/content/overview) when ready.

## Security Best Practices

1. **Never commit API keys to Git**
   - Use `.env.local` (already in .gitignore)
   - Rotate keys if accidentally exposed

2. **Restrict API keys properly**
   - By API (only what you need)
   - By referrer/IP
   - By quota

3. **Monitor usage**
   - Set up billing alerts
   - Review API dashboard weekly
   - Log unusual patterns

4. **Use environment-specific keys**
   - Development key (restricted to localhost)
   - Production key (restricted to production domain)

## What Data We Collect

### Google Places API:
- Business name, address, phone
- Reviews (text, rating, date, author)
- Photos
- Hours of operation
- Competitor listings

### PageSpeed Insights API:
- Performance score (0-100)
- Mobile usability
- Core Web Vitals
- Optimization suggestions

**No personal data is collected or stored beyond what's publicly available.**

## Next Steps

After setup:
1. Test the `/api/analyze` endpoint with a real business URL
2. Check console logs for API calls and caching
3. Monitor API usage in Google Cloud Console
4. Optimize based on your usage patterns

## Support

- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service/overview)
- [PageSpeed Insights API Docs](https://developers.google.com/speed/docs/insights/v5/get-started)
- [Google Cloud Support](https://cloud.google.com/support)
