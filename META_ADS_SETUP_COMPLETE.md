# Meta Ads Library Setup Complete ✅

## Your Token Has Been Configured

The Meta Ads Library API token has been added to your `.env.local` file and is ready to use.

---

## Quick Verification

### Option 1: Test API Endpoint (Recommended)

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Visit the test endpoint in your browser:
   ```
   http://localhost:3000/api/test/meta-ads
   ```

3. You should see a success message with sample ads if the token is working correctly.

### Option 2: Test in Business Context Flow

1. Navigate to: http://localhost:3000/business-context

2. Fill out the business context form with:
   - Industry (e.g., "Restaurant")
   - Add 2-3 competitors (with their Facebook page names)

3. Save the context

4. Make a request to the competitive intelligence endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/meta-ads/competitive-intel \
     -H "Content-Type: application/json" \
     -d '{
       "competitors": [
         {"name": "Starbucks"},
         {"name": "Dunkin"}
       ],
       "industry": "Coffee Shop"
     }'
   ```

---

## What's Now Available

### 1. Competitive Ad Intelligence
- See what ads your competitors are running on Facebook/Instagram
- Analyze their messaging, CTAs, and targeting
- Identify gaps in their advertising strategy

### 2. Enhanced Data Collection
```typescript
POST /api/data-collection/enhanced
{
  "url": "https://your-business.com",
  "businessContext": {
    "competitors": [
      { "name": "Competitor A", "pageId": "optional-fb-page-id" }
    ]
  }
}
```

### 3. Ad Search by Keyword
```
GET /api/meta-ads/competitive-intel?keyword=coffee&countries=US
```

### 4. Industry Insights
- Common advertising platforms in your industry
- Popular CTAs and messaging themes
- Average number of active ads
- Opportunities to differentiate

---

## Token Information

**Token Status:** ✅ Configured  
**Location:** `.env.local`  
**Variable:** `META_ADS_LIBRARY_TOKEN`

**Token Details:**
- Starts with: `EAAD1ZCRoFk7w...`
- Length: 192 characters
- Configured: November 12, 2025

---

## Important Notes

### Token Expiration
Meta access tokens typically expire after 60 days. If you start getting authentication errors:

1. Visit: https://developers.facebook.com/tools/accesstoken/
2. Generate a new token with Ads Library permissions
3. Update `META_ADS_LIBRARY_TOKEN` in `.env.local`
4. Restart your dev server

### Rate Limits
The Meta Ads Library API has rate limits:
- The collector automatically adds 1-second delays between competitor requests
- Recommended: Limit to 3-5 competitors per request for optimal performance

### Privacy & Compliance
- Meta Ads Library data is public information
- Only active/recently active ads are available
- Ad creative and targeting info is aggregated, not user-specific

---

## Next Steps

1. ✅ **Test the integration** using the test endpoint above

2. 📝 **Set up business context**
   - Go to: `/business-context`
   - Fill out your business details
   - Add your main competitors

3. 🔍 **Try competitive analysis**
   ```typescript
   // In your code
   import { useBusinessContext } from '@/lib/hooks/useBusinessContext';
   
   const { context } = useBusinessContext();
   
   // Get competitor ad insights
   const response = await fetch('/api/meta-ads/competitive-intel', {
     method: 'POST',
     body: JSON.stringify({
       competitors: context.competitors,
       industry: context.industry
     })
   });
   ```

4. 🚀 **Use in your marketing workflows**
   - Enhanced data collection will automatically include Meta Ads data
   - All framework orchestrators can access competitive intelligence
   - Use insights to improve your own advertising strategy

---

## Troubleshooting

**Error: "Meta Ads Library token not configured"**
- Make sure you've restarted your dev server after adding the token
- Check the token is in `.env.local` (not `.env.example`)

**Error: "Invalid OAuth access token"**
- Token may have expired - generate a new one
- Ensure token has Ads Library API permissions

**No ads found for competitor**
- Verify the competitor has a Facebook page
- Check they're running active ads
- Try searching by their exact Facebook page name

**Data collection is slow**
- Normal - Meta Ads adds 1-2 seconds per competitor
- Reduce number of competitors to 3-5 for faster results

---

## Resources

- **Meta Ads Library:** https://www.facebook.com/ads/library
- **Get API Token:** https://developers.facebook.com/tools/accesstoken/
- **API Documentation:** https://www.facebook.com/ads/library/api

For more information, see: `ENHANCED_DATA_COLLECTION.md`
