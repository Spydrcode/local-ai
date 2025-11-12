/**
 * Test Meta Ads Library Integration
 * 
 * Quick test to verify the Meta Ads Library token is configured correctly
 * and can fetch data from the API.
 */

import { searchCompetitorAds, getCompetitorAdsIntelligence } from '@/lib/data-collectors';

export async function testMetaAdsIntegration() {
  console.log('🔍 Testing Meta Ads Library Integration...\n');

  try {
    // Test 1: Simple search
    console.log('Test 1: Searching for "restaurant" ads...');
    const searchResults = await searchCompetitorAds({
      keyword: 'restaurant',
      countries: ['US'],
      limit: 5,
      accessToken: process.env.META_ADS_LIBRARY_TOKEN,
    });

    console.log(`✅ Found ${searchResults.length} ads`);
    if (searchResults.length > 0) {
      console.log('Sample ad:', {
        pageName: searchResults[0].pageName,
        platforms: searchResults[0].platforms,
        headline: searchResults[0].creative.headline,
      });
    }

    // Test 2: Competitive intelligence
    console.log('\nTest 2: Collecting competitive intelligence...');
    const intelligence = await getCompetitorAdsIntelligence({
      competitors: [
        { name: 'McDonalds' },
        { name: 'Burger King' },
      ],
      industry: 'Fast Food',
      accessToken: process.env.META_ADS_LIBRARY_TOKEN,
    });

    console.log(`✅ Analyzed ${intelligence.competitors.length} competitors`);
    console.log(`Total ads: ${intelligence.industryInsights.totalAdsAnalyzed}`);
    console.log('Opportunities:', intelligence.opportunities.slice(0, 2));

    console.log('\n🎉 Meta Ads Library integration is working!\n');
    return true;
  } catch (error) {
    console.error('❌ Meta Ads Library test failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Verify META_ADS_LIBRARY_TOKEN is set in .env.local');
    console.error('2. Check token has not expired at https://developers.facebook.com');
    console.error('3. Ensure token has Ads Library API permissions');
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  testMetaAdsIntegration();
}
